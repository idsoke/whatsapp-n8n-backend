import { Body, Controller, Get, Header, Post } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateBendaharaTransactionDto } from './dto/create-bendahara-transaction.dto';

@Controller('bendahara')
export class BendaharaController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  getPage() {
    return this.renderPage();
  }

  @Get('summary')
  getSummary() {
    return this.transactionsService.getDashboardSummary();
  }

  @Get('transactions')
  getTransactions() {
    return this.transactionsService.getTransactions();
  }

  @Post('transactions')
  createTransaction(@Body() payload: CreateBendaharaTransactionDto) {
    return this.transactionsService.createManualTransaction(payload);
  }

  private renderPage() {
    return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Web Bendahara</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f4f6f8;
      --surface: #ffffff;
      --line: #d9e1e8;
      --text: #14212d;
      --muted: #667789;
      --green: #0f766e;
      --green-bg: #dff7ef;
      --red: #b42318;
      --red-bg: #ffe4e0;
      --blue: #1d4ed8;
      --blue-soft: #e7efff;
      --dark: #111827;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      letter-spacing: 0;
    }

    header {
      background: var(--dark);
      color: #ffffff;
      padding: 20px clamp(16px, 4vw, 40px);
    }

    .header-inner {
      align-items: center;
      display: flex;
      gap: 16px;
      justify-content: space-between;
      margin: 0 auto;
      max-width: 1120px;
    }

    h1 {
      font-size: clamp(22px, 3vw, 30px);
      line-height: 1.1;
      margin: 0;
    }

    .subtitle {
      color: #c4ced8;
      font-size: 14px;
      margin: 8px 0 0;
    }

    main {
      display: grid;
      gap: 18px;
      margin: 0 auto;
      max-width: 1120px;
      padding: 22px clamp(16px, 4vw, 40px) 44px;
    }

    .summary {
      display: grid;
      gap: 12px;
      grid-template-columns: 1.4fr 1fr 1fr;
    }

    .metric,
    .panel {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 8px;
    }

    .metric {
      padding: 16px;
    }

    .metric-label {
      color: var(--muted);
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .metric-value {
      font-size: clamp(22px, 3vw, 32px);
      font-weight: 800;
      overflow-wrap: anywhere;
    }

    .workbench {
      align-items: start;
      display: grid;
      gap: 18px;
      grid-template-columns: minmax(280px, 390px) minmax(0, 1fr);
    }

    .panel-header {
      align-items: center;
      border-bottom: 1px solid var(--line);
      display: flex;
      justify-content: space-between;
      padding: 14px 16px;
    }

    h2 {
      font-size: 16px;
      margin: 0;
    }

    .status {
      color: var(--muted);
      font-size: 14px;
      min-height: 20px;
    }

    form {
      display: grid;
      gap: 14px;
      padding: 16px;
    }

    .type-toggle {
      display: grid;
      gap: 8px;
      grid-template-columns: 1fr 1fr;
    }

    .type-toggle input {
      display: none;
    }

    .type-toggle label {
      align-items: center;
      border: 1px solid var(--line);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      font-weight: 800;
      justify-content: center;
      min-height: 42px;
      padding: 10px;
    }

    #typeMasuk:checked + label {
      background: var(--green-bg);
      border-color: var(--green);
      color: var(--green);
    }

    #typeKeluar:checked + label {
      background: var(--red-bg);
      border-color: var(--red);
      color: var(--red);
    }

    .field {
      color: var(--muted);
      display: grid;
      font-size: 13px;
      font-weight: 700;
      gap: 7px;
    }

    input {
      background: white;
      border: 1px solid var(--line);
      border-radius: 8px;
      color: var(--text);
      font: inherit;
      min-height: 44px;
      padding: 10px 12px;
      width: 100%;
    }

    .actions {
      display: grid;
      gap: 10px;
      grid-template-columns: 1fr 1fr;
    }

    button {
      align-items: center;
      background: var(--blue);
      border: 0;
      border-radius: 8px;
      color: white;
      cursor: pointer;
      display: inline-flex;
      font: inherit;
      font-weight: 800;
      justify-content: center;
      min-height: 42px;
      padding: 10px 14px;
    }

    button.secondary {
      background: var(--blue-soft);
      color: var(--blue);
    }

    button:disabled {
      cursor: wait;
      opacity: .65;
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      border-collapse: collapse;
      min-width: 640px;
      width: 100%;
    }

    th,
    td {
      border-bottom: 1px solid var(--line);
      padding: 13px 16px;
      text-align: left;
      vertical-align: middle;
    }

    th {
      background: #eef3f7;
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
    }

    .badge {
      border-radius: 999px;
      display: inline-flex;
      font-size: 12px;
      font-weight: 800;
      padding: 5px 9px;
    }

    .badge.masuk {
      background: var(--green-bg);
      color: var(--green);
    }

    .badge.keluar {
      background: var(--red-bg);
      color: var(--red);
    }

    .amount,
    .date {
      white-space: nowrap;
    }

    .empty {
      color: var(--muted);
      padding: 24px 16px;
    }

    @media (max-width: 860px) {
      .header-inner {
        align-items: flex-start;
        flex-direction: column;
      }

      .summary,
      .workbench {
        grid-template-columns: 1fr;
      }

      .actions {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <div>
        <h1>Web Bendahara</h1>
        <p class="subtitle">Input transaksi manual tanpa WhatsApp, langsung tersimpan di backend yang sama.</p>
      </div>
      <button class="secondary" id="refreshButton" type="button">Refresh</button>
    </div>
  </header>

  <main>
    <div class="status" id="status">Memuat data bendahara...</div>

    <div class="summary">
      <div class="metric">
        <div class="metric-label">Saldo saat ini</div>
        <div class="metric-value" id="currentBalance">Rp0</div>
      </div>
      <div class="metric">
        <div class="metric-label">Bulan ini masuk</div>
        <div class="metric-value" id="monthIncome">Rp0</div>
      </div>
      <div class="metric">
        <div class="metric-label">Bulan ini keluar</div>
        <div class="metric-value" id="monthExpense">Rp0</div>
      </div>
    </div>

    <div class="workbench">
      <section class="panel">
        <div class="panel-header">
          <h2>Transaksi Baru</h2>
        </div>
        <form id="transactionForm">
          <div class="type-toggle">
            <input id="typeMasuk" name="type" type="radio" value="masuk" checked>
            <label for="typeMasuk">Pemasukan</label>
            <input id="typeKeluar" name="type" type="radio" value="keluar">
            <label for="typeKeluar">Pengeluaran</label>
          </div>

          <label class="field">
            Nominal
            <input id="amount" min="1" placeholder="50000" required type="number">
          </label>

          <label class="field">
            Keterangan
            <input id="description" placeholder="iuran kelas" type="text">
          </label>

          <div class="actions">
            <button id="submitButton" type="submit">Simpan</button>
            <button class="secondary" id="resetButton" type="reset">Reset</button>
          </div>
        </form>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h2>Transaksi Terbaru</h2>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipe</th>
                <th>Nominal</th>
                <th>Keterangan</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody id="transactionRows"></tbody>
          </table>
          <div class="empty" id="emptyState">Belum ada transaksi.</div>
        </div>
      </section>
    </div>
  </main>

  <script>
    const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' });
    const form = document.getElementById('transactionForm');
    const statusEl = document.getElementById('status');
    const refreshButton = document.getElementById('refreshButton');
    const submitButton = document.getElementById('submitButton');
    const rows = document.getElementById('transactionRows');
    const emptyState = document.getElementById('emptyState');

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function setStatus(message, isError) {
      statusEl.textContent = message;
      statusEl.style.color = isError ? '#b42318' : '#667789';
    }

    function setLoading(isLoading) {
      refreshButton.disabled = isLoading;
      submitButton.disabled = isLoading;
    }

    function renderSummary(summary) {
      document.getElementById('currentBalance').textContent = formatter.format(summary.currentBalance || 0);
      document.getElementById('monthIncome').textContent = formatter.format(summary.currentMonth?.income || 0);
      document.getElementById('monthExpense').textContent = formatter.format(summary.currentMonth?.expense || 0);
    }

    function renderTransactions(transactions) {
      rows.innerHTML = '';
      emptyState.style.display = transactions.length ? 'none' : 'block';

      transactions.slice(0, 15).forEach(function(transaction) {
        const row = document.createElement('tr');
        row.innerHTML =
          '<td>' + transaction.id + '</td>' +
          '<td><span class="badge ' + transaction.type + '">' + transaction.type + '</span></td>' +
          '<td class="amount">' + formatter.format(transaction.amount) + '</td>' +
          '<td>' + escapeHtml(transaction.description) + '</td>' +
          '<td class="date">' + new Date(transaction.createdAt).toLocaleString('id-ID') + '</td>';
        rows.appendChild(row);
      });
    }

    async function loadData() {
      setLoading(true);
      try {
        const summaryResponse = await fetch('/bendahara/summary');
        const transactionsResponse = await fetch('/bendahara/transactions');

        if (!summaryResponse.ok || !transactionsResponse.ok) {
          throw new Error('Gagal memuat data bendahara.');
        }

        renderSummary(await summaryResponse.json());
        renderTransactions(await transactionsResponse.json());
        setStatus('Data bendahara terbaru sudah dimuat.', false);
      } catch (error) {
        setStatus(error.message, true);
      } finally {
        setLoading(false);
      }
    }

    form.addEventListener('submit', async function(event) {
      event.preventDefault();
      setLoading(true);

      try {
        const type = document.querySelector('input[name="type"]:checked').value;
        const amount = Number(document.getElementById('amount').value);
        const description = document.getElementById('description').value.trim();

        const response = await fetch('/bendahara/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, amount, description })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Transaksi gagal disimpan.');
        }

        form.reset();
        document.getElementById('typeMasuk').checked = true;
        setStatus(data.message + ' Saldo: ' + formatter.format(data.currentBalance || 0), false);
        await loadData();
      } catch (error) {
        setStatus(error.message, true);
      } finally {
        setLoading(false);
      }
    });

    refreshButton.addEventListener('click', loadData);
    loadData();
  </script>
</body>
</html>`;
  }
}
