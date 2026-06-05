import { Body, Controller, Get, Header, Put } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  getAdminPage() {
    return this.renderAdminPage();
  }

  @Get('settings')
  getSettings() {
    return this.adminService.getSettings();
  }

  @Put('settings')
  updateSettings(@Body() payload: UpdateSystemSettingsDto) {
    return this.adminService.updateSettings(payload);
  }

  @Get('system-status')
  getSystemStatus() {
    return this.adminService.getSystemStatus();
  }

  private renderAdminPage() {
    return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Admin Sistem</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f5f7fa;
      --surface: #ffffff;
      --surface-soft: #eef3f7;
      --line: #d9e2ec;
      --text: #17212b;
      --muted: #64748b;
      --blue: #1d4ed8;
      --blue-soft: #e8f0ff;
      --green: #047857;
      --red: #b42318;
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
      padding: 22px clamp(16px, 4vw, 44px);
    }

    .header-inner,
    main {
      margin: 0 auto;
      max-width: 1120px;
    }

    .header-inner {
      align-items: center;
      display: flex;
      gap: 16px;
      justify-content: space-between;
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
      padding: 22px clamp(16px, 4vw, 44px) 48px;
    }

    .status {
      color: var(--muted);
      font-size: 14px;
      min-height: 20px;
    }

    .summary {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
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
      font-size: clamp(18px, 2.2vw, 24px);
      font-weight: 800;
      overflow-wrap: anywhere;
    }

    .layout {
      align-items: start;
      display: grid;
      gap: 18px;
      grid-template-columns: minmax(280px, 1fr) minmax(280px, 420px);
    }

    .panel-header {
      border-bottom: 1px solid var(--line);
      padding: 14px 16px;
    }

    h2 {
      font-size: 16px;
      margin: 0;
    }

    form {
      display: grid;
      gap: 14px;
      padding: 16px;
    }

    label {
      color: var(--muted);
      display: grid;
      font-size: 13px;
      font-weight: 700;
      gap: 7px;
    }

    input,
    select {
      background: white;
      border: 1px solid var(--line);
      border-radius: 8px;
      color: var(--text);
      font: inherit;
      min-height: 42px;
      padding: 10px 12px;
      width: 100%;
    }

    .switch-row {
      align-items: center;
      border: 1px solid var(--line);
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      padding: 12px;
    }

    .switch-row span {
      color: var(--text);
      font-weight: 800;
    }

    .switch-row input {
      min-height: auto;
      width: 22px;
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

    .system-list {
      display: grid;
      gap: 10px;
      padding: 16px;
    }

    .system-item {
      background: var(--surface-soft);
      border-radius: 8px;
      display: grid;
      gap: 4px;
      padding: 12px;
    }

    .system-label {
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .system-value {
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    .pill {
      border-radius: 999px;
      display: inline-flex;
      font-size: 12px;
      font-weight: 800;
      padding: 5px 9px;
      width: fit-content;
    }

    .pill.on {
      background: #dff7ef;
      color: var(--green);
    }

    .pill.off {
      background: #ffe4e0;
      color: var(--red);
    }

    @media (max-width: 860px) {
      .header-inner {
        align-items: flex-start;
        flex-direction: column;
      }

      .summary,
      .layout {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <div>
        <h1>Admin Sistem</h1>
        <p class="subtitle">Pengaturan aplikasi, provider WhatsApp, webhook, dan konfigurasi operasional.</p>
      </div>
      <button class="secondary" id="refreshButton" type="button">Refresh</button>
    </div>
  </header>

  <main>
    <div class="status" id="status">Memuat pengaturan sistem...</div>

    <div class="summary">
      <div class="metric">
        <div class="metric-label">Provider WhatsApp</div>
        <div class="metric-value" id="providerMetric">-</div>
      </div>
      <div class="metric">
        <div class="metric-label">Webhook</div>
        <div class="metric-value" id="webhookMetric">-</div>
      </div>
      <div class="metric">
        <div class="metric-label">Environment</div>
        <div class="metric-value" id="environmentMetric">-</div>
      </div>
    </div>

    <div class="layout">
      <section class="panel">
        <div class="panel-header">
          <h2>Pengaturan Sistem</h2>
        </div>
        <form id="settingsForm">
          <label>
            Nama Aplikasi
            <input id="appName" required type="text">
          </label>

          <label>
            Provider WhatsApp
            <select id="whatsappProvider" required>
              <option value="whatsapp-cloud-api">WhatsApp Cloud API</option>
              <option value="twilio">Twilio</option>
              <option value="wablas">Wablas</option>
              <option value="fonnte">Fonnte</option>
              <option value="other">Lainnya</option>
            </select>
          </label>

          <label class="switch-row">
            <span>Webhook WhatsApp aktif</span>
            <input id="whatsappWebhookEnabled" type="checkbox">
          </label>

          <label>
            Backend Base URL
            <input id="backendBaseUrl" required type="url">
          </label>

          <label>
            Kontak Admin
            <input id="adminContact" required type="text">
          </label>

          <label>
            Timezone
            <input id="timezone" required type="text">
          </label>

          <label>
            Tanggal Tutup Buku
            <input id="reportClosingDay" max="31" min="1" required type="number">
          </label>

          <button id="saveButton" type="submit">Simpan Pengaturan</button>
        </form>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h2>Status Sistem</h2>
        </div>
        <div class="system-list">
          <div class="system-item">
            <div class="system-label">Service</div>
            <div class="system-value" id="serviceValue">-</div>
          </div>
          <div class="system-item">
            <div class="system-label">Backend URL</div>
            <div class="system-value" id="backendValue">-</div>
          </div>
          <div class="system-item">
            <div class="system-label">Webhook</div>
            <div class="system-value" id="webhookValue">-</div>
          </div>
          <div class="system-item">
            <div class="system-label">Server Time</div>
            <div class="system-value" id="serverTimeValue">-</div>
          </div>
        </div>
      </section>
    </div>
  </main>

  <script>
    const statusEl = document.getElementById('status');
    const refreshButton = document.getElementById('refreshButton');
    const saveButton = document.getElementById('saveButton');
    const form = document.getElementById('settingsForm');

    function setStatus(message, isError) {
      statusEl.textContent = message;
      statusEl.style.color = isError ? '#b42318' : '#64748b';
    }

    function setLoading(isLoading) {
      refreshButton.disabled = isLoading;
      saveButton.disabled = isLoading;
    }

    function webhookPill(isEnabled) {
      return '<span class="pill ' + (isEnabled ? 'on' : 'off') + '">' + (isEnabled ? 'Aktif' : 'Nonaktif') + '</span>';
    }

    function fillSettings(settings) {
      document.getElementById('appName').value = settings.appName || '';
      document.getElementById('whatsappProvider').value = settings.whatsappProvider || 'other';
      document.getElementById('whatsappWebhookEnabled').checked = Boolean(settings.whatsappWebhookEnabled);
      document.getElementById('backendBaseUrl').value = settings.backendBaseUrl || '';
      document.getElementById('adminContact').value = settings.adminContact || '';
      document.getElementById('timezone').value = settings.timezone || '';
      document.getElementById('reportClosingDay').value = settings.reportClosingDay || 31;
    }

    function renderStatus(status) {
      document.getElementById('providerMetric').textContent = status.whatsappProvider || '-';
      document.getElementById('webhookMetric').innerHTML = webhookPill(status.whatsappWebhookEnabled);
      document.getElementById('environmentMetric').textContent = status.environment || '-';
      document.getElementById('serviceValue').textContent = status.service || '-';
      document.getElementById('backendValue').textContent = status.backendBaseUrl || '-';
      document.getElementById('webhookValue').innerHTML = webhookPill(status.whatsappWebhookEnabled);
      document.getElementById('serverTimeValue').textContent = status.serverTime
        ? new Date(status.serverTime).toLocaleString('id-ID')
        : '-';
    }

    async function loadAdmin() {
      setLoading(true);
      try {
        const settingsResponse = await fetch('/admin/settings');
        const statusResponse = await fetch('/admin/system-status');

        if (!settingsResponse.ok || !statusResponse.ok) {
          throw new Error('Gagal memuat pengaturan sistem.');
        }

        fillSettings(await settingsResponse.json());
        renderStatus(await statusResponse.json());
        setStatus('Pengaturan sistem terbaru sudah dimuat.', false);
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
        const payload = {
          appName: document.getElementById('appName').value.trim(),
          whatsappProvider: document.getElementById('whatsappProvider').value,
          whatsappWebhookEnabled: document.getElementById('whatsappWebhookEnabled').checked,
          backendBaseUrl: document.getElementById('backendBaseUrl').value.trim(),
          adminContact: document.getElementById('adminContact').value.trim(),
          timezone: document.getElementById('timezone').value.trim(),
          reportClosingDay: Number(document.getElementById('reportClosingDay').value)
        };

        const response = await fetch('/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Pengaturan gagal disimpan.');
        }

        setStatus(data.message, false);
        await loadAdmin();
      } catch (error) {
        setStatus(error.message, true);
      } finally {
        setLoading(false);
      }
    });

    refreshButton.addEventListener('click', loadAdmin);
    loadAdmin();
  </script>
</body>
</html>`;
  }
}
