import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TransactionSource, TransactionType as PrismaTransactionType } from '@prisma/client';
import { N8nService } from '../n8n/n8n.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateBendaharaTransactionDto } from '../bendahara/dto/create-bendahara-transaction.dto';
import { CreateWaTransactionDto } from './dto/create-wa-transaction.dto';
import { CreateWhatsappTransactionDto } from './dto/create-whatsapp-transaction.dto';

export type TransactionType = 'masuk' | 'keluar';
type WaCommand = TransactionType | 'saldo' | 'laporan bulan ini' | 'pengeluaran bulan ini' | 'pemasukan bulan ini';

interface ParsedWaPayload {
  command: WaCommand;
  amount?: number;
  description: string;
}

interface VerifiedTreasurerContext {
  userId: string;
  whatsappNumber: string;
  organizationId: string;
  organizationName: string;
}

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly n8nService: N8nService,
  ) {}

  async getDashboardSummary() {
    const [transactions, totalTransactions] = await Promise.all([
      this.prisma.transaction.findMany(),
      this.prisma.transaction.count(),
    ]);

    const totalIncome = this.sumByType(transactions, PrismaTransactionType.INCOME);
    const totalExpense = this.sumByType(transactions, PrismaTransactionType.EXPENSE);
    const currentMonth = this.getCurrentMonthReportFromTransactions(transactions);

    return {
      currentBalance: totalIncome - totalExpense,
      totalTransactions,
      totalIncome,
      totalExpense,
      currentMonth,
    };
  }

  getTransactions() {
    return this.prisma.transaction.findMany({
      include: {
        organization: true,
        createdByUser: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createManualTransaction(payload: CreateBendaharaTransactionDto) {
    const treasurer = await this.getVerifiedTreasurerContext(payload.phoneNumber);

    return this.createTransaction({
      treasurer,
      type: payload.type,
      amount: payload.amount,
      description: payload.description?.trim() || this.getDefaultDescription(payload.type),
      source: TransactionSource.WEB,
    });
  }

  async handleApiWhatsappTransaction(payload: CreateWhatsappTransactionDto) {
    const treasurer = await this.getVerifiedTreasurerContext(payload.phoneNumber);
    const parsed = this.parseMessageText(payload.message.trim());

    if (!parsed) {
      throw new BadRequestException(
        'Invalid WhatsApp message. Use "masuk 50000 iuran kelas", "keluar 25000 beli konsumsi", or "saldo".',
      );
    }

    if (!this.isTransactionCommand(parsed.command)) {
      return this.handleFutureCommand(treasurer.organizationId, parsed.command);
    }

    if (!parsed.amount) {
      throw new BadRequestException('Transaction amount is required.');
    }

    return this.createTransaction({
      treasurer,
      type: parsed.command,
      amount: parsed.amount,
      description: parsed.description || this.getDefaultDescription(parsed.command),
      source: TransactionSource.WHATSAPP,
      providerMessageId: payload.providerMessageId,
    });
  }

  async handleWhatsAppPayload(payload: CreateWaTransactionDto) {
    if (!payload.phoneNumber) {
      throw new BadRequestException('phoneNumber is required for WhatsApp transaction entry.');
    }

    const message =
      payload.message ||
      [payload.command, payload.amount, payload.description].filter((value) => value !== undefined).join(' ');

    return this.handleApiWhatsappTransaction({
      phoneNumber: payload.phoneNumber,
      message,
      providerMessageId: payload.providerMessageId,
    });
  }

  private async createTransaction(payload: {
    treasurer: VerifiedTreasurerContext;
    type: TransactionType;
    amount: number;
    description: string;
    source: TransactionSource;
    providerMessageId?: string;
  }) {
    if (!Number.isInteger(payload.amount) || payload.amount <= 0) {
      throw new BadRequestException('Transaction amount must be a positive integer.');
    }

    const prismaType = this.toPrismaTransactionType(payload.type);

    const result = await this.prisma.$transaction(async (tx) => {
      const currentBalance = await this.getOrganizationBalance(payload.treasurer.organizationId, tx);
      const signedAmount = prismaType === PrismaTransactionType.INCOME ? payload.amount : -payload.amount;
      const balanceAfter = currentBalance + signedAmount;

      const transaction = await tx.transaction.create({
        data: {
          organizationId: payload.treasurer.organizationId,
          createdByUserId: payload.treasurer.userId,
          type: prismaType,
          amount: payload.amount,
          description: payload.description,
          source: payload.source,
          balanceAfter,
          providerMessageId: payload.providerMessageId,
        },
        include: {
          organization: true,
          createdByUser: true,
        },
      });

      return { transaction, currentBalance: balanceAfter };
    });

    await this.n8nService.sendTransactionNotification({
      transactionId: result.transaction.id,
      treasurerWhatsappNumber: payload.treasurer.whatsappNumber,
      organizationName: payload.treasurer.organizationName,
      type: prismaType === PrismaTransactionType.INCOME ? 'Income' : 'Expense',
      amount: payload.amount,
      description: payload.description,
      currentBalance: result.currentBalance,
      message: this.buildNotificationMessage(
        prismaType === PrismaTransactionType.INCOME ? 'Income' : 'Expense',
        payload.amount,
        payload.description,
        result.currentBalance,
      ),
    });

    return {
      success: true,
      message: 'Transaction created',
      currentBalance: result.currentBalance,
      transaction: result.transaction,
    };
  }

  private async getVerifiedTreasurerContext(phoneNumber: string): Promise<VerifiedTreasurerContext> {
    const user = await this.usersService.findByWhatsappNumber(phoneNumber);

    if (!user) {
      throw new NotFoundException('Treasurer WhatsApp number is not registered.');
    }

    if (!user.isWhatsappVerified) {
      throw new ForbiddenException('WhatsApp number is not verified.');
    }

    if (!user.organization) {
      throw new BadRequestException('Treasurer does not own an organization.');
    }

    return {
      userId: user.id,
      whatsappNumber: user.whatsappNumber,
      organizationId: user.organization.id,
      organizationName: user.organization.name,
    };
  }

  private async handleFutureCommand(organizationId: string, command: WaCommand) {
    const transactions = await this.prisma.transaction.findMany({
      where: { organizationId },
    });

    const balance = this.sumByType(transactions, PrismaTransactionType.INCOME) - this.sumByType(transactions, PrismaTransactionType.EXPENSE);
    const currentMonth = this.getCurrentMonthReportFromTransactions(transactions);

    if (command === 'saldo') {
      return {
        success: true,
        message: `Saldo saat ini: ${this.formatCurrency(balance)}`,
        currentBalance: balance,
      };
    }

    if (command === 'laporan bulan ini') {
      return {
        success: true,
        message: `Laporan bulan ini: masuk ${this.formatCurrency(currentMonth.income)}, keluar ${this.formatCurrency(
          currentMonth.expense,
        )}, saldo bersih ${this.formatCurrency(currentMonth.net)}.`,
        currentBalance: balance,
      };
    }

    if (command === 'pengeluaran bulan ini') {
      return {
        success: true,
        message: `Pengeluaran bulan ini: ${this.formatCurrency(currentMonth.expense)}.`,
        currentBalance: balance,
      };
    }

    return {
      success: true,
      message: `Pemasukan bulan ini: ${this.formatCurrency(currentMonth.income)}.`,
      currentBalance: balance,
    };
  }

  private async getOrganizationBalance(organizationId: string, tx: Prisma.TransactionClient) {
    const [income, expense] = await Promise.all([
      tx.transaction.aggregate({
        where: { organizationId, type: PrismaTransactionType.INCOME },
        _sum: { amount: true },
      }),
      tx.transaction.aggregate({
        where: { organizationId, type: PrismaTransactionType.EXPENSE },
        _sum: { amount: true },
      }),
    ]);

    return (income._sum.amount || 0) - (expense._sum.amount || 0);
  }

  private parseMessageText(text: string): ParsedWaPayload | null {
    const transactionRegex = /^(masuk|keluar)\s+([\d.]+)\s*(.*)$/i;
    const commandOnlyRegex = /^(saldo|laporan bulan ini|pengeluaran bulan ini|pemasukan bulan ini)$/i;

    const commandMatch = text.match(commandOnlyRegex);
    if (commandMatch) {
      return {
        command: commandMatch[1].toLowerCase() as WaCommand,
        description: '',
      };
    }

    const match = text.match(transactionRegex);
    if (!match) {
      return null;
    }

    const [, command, amountValue, description] = match;
    const amount = Number(amountValue.replace(/\./g, ''));

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException('Transaction amount must be a positive integer.');
    }

    return {
      command: command.toLowerCase() as TransactionType,
      amount,
      description: description.trim(),
    };
  }

  private getCurrentMonthReportFromTransactions(transactions: Array<{ type: PrismaTransactionType; amount: number; createdAt: Date }>) {
    const now = new Date();
    const currentMonthTransactions = transactions.filter(
      (transaction) =>
        transaction.createdAt.getFullYear() === now.getFullYear() &&
        transaction.createdAt.getMonth() === now.getMonth(),
    );

    const income = this.sumByType(currentMonthTransactions, PrismaTransactionType.INCOME);
    const expense = this.sumByType(currentMonthTransactions, PrismaTransactionType.EXPENSE);

    return {
      income,
      expense,
      net: income - expense,
    };
  }

  private sumByType(transactions: Array<{ type: PrismaTransactionType; amount: number }>, type: PrismaTransactionType) {
    return transactions
      .filter((transaction) => transaction.type === type)
      .reduce((total, transaction) => total + transaction.amount, 0);
  }

  private toPrismaTransactionType(type: TransactionType) {
    return type === 'masuk' ? PrismaTransactionType.INCOME : PrismaTransactionType.EXPENSE;
  }

  private getDefaultDescription(command: TransactionType) {
    return command === 'masuk' ? 'pemasukan' : 'pengeluaran';
  }

  private isTransactionCommand(command: WaCommand): command is TransactionType {
    return command === 'masuk' || command === 'keluar';
  }

  private buildNotificationMessage(type: 'Income' | 'Expense', amount: number, description: string, currentBalance: number) {
    return [
      'Transaction Recorded',
      '',
      `Type: ${type}`,
      `Amount: ${this.formatCurrency(amount)}`,
      `Description: ${description}`,
      '',
      `Current Balance: ${this.formatCurrency(currentBalance)}`,
    ].join('\n');
  }

  private formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
  }
}
