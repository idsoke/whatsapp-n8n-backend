import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: {
          name: payload.name,
          email: payload.email,
          whatsappNumber: this.normalizePhoneNumber(payload.whatsappNumber),
          isWhatsappVerified: payload.isWhatsappVerified ?? false,
        },
        include: { organization: true },
      });
    } catch (error) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  findAll() {
    return this.prisma.user.findMany({
      include: { organization: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async findByWhatsappNumber(whatsappNumber: string) {
    return this.prisma.user.findUnique({
      where: { whatsappNumber: this.normalizePhoneNumber(whatsappNumber) },
      include: { organization: true },
    });
  }

  async update(id: string, payload: UpdateUserDto) {
    await this.findOne(id);

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...payload,
          whatsappNumber: payload.whatsappNumber ? this.normalizePhoneNumber(payload.whatsappNumber) : undefined,
        },
        include: { organization: true },
      });
    } catch (error) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  normalizePhoneNumber(phoneNumber: string) {
    return phoneNumber.replace(/[^\d]/g, '');
  }

  private handleUniqueError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Email or WhatsApp number already exists.');
    }
  }
}
