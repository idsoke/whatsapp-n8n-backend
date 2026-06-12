# n8n Workflow Design for WhatsApp Automation

## Workflow

Recommended nodes:

1. Webhook: receives WhatsApp provider callbacks.
2. Code: extracts message text and parses command fields.
3. HTTP Request: sends parsed JSON to NestJS.
4. Respond to Webhook: returns backend response to the webhook caller.
5. Optional provider reply: sends `message` back to the WhatsApp user.

## Node 1 - Webhook

- Method: `POST`
- Path: `whatsapp`
- Response mode: `Using Respond to Webhook node`
- Production URL example: `https://n8n.example.com/webhook/whatsapp`

Expected provider fields vary. The Code node below checks common locations such as `Body`, `message`, `text`, and WhatsApp Cloud API's `entry[0].changes[0].value.messages[0].text.body`.

## Node 2 - Code: Parse WhatsApp Message

Use this JavaScript in an n8n Code node:

```javascript
const input = $json.body || $json;

const cloudMessage =
  input.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

const rawText =
  input.Body ||
  input.message ||
  input.text ||
  input.text?.body ||
  cloudMessage?.text?.body ||
  '';

const normalized = String(rawText).trim();
const transactionRegex = /^(masuk|keluar)\s+([\d.]+)\s*(.*)$/i;
const commandOnlyRegex = /^(saldo|laporan bulan ini|pengeluaran bulan ini)$/i;

let command;
let amount;
let description = '';

const commandMatch = normalized.match(commandOnlyRegex);
const transactionMatch = normalized.match(transactionRegex);

if (commandMatch) {
  command = commandMatch[1].toLowerCase();
} else if (transactionMatch) {
  command = transactionMatch[1].toLowerCase();
  amount = Number(transactionMatch[2].replace(/\./g, ''));
  description = (transactionMatch[3] || '').trim();
}

return [
  {
    json: {
      message: normalized,
      command,
      amount,
      description,
      from:
        input.From ||
        input.from ||
        cloudMessage?.from ||
        input.sender,
      providerMessageId:
        input.MessageSid ||
        input.messageId ||
        cloudMessage?.id,
      receivedAt: new Date().toISOString(),
    },
  },
];
```

## Node 3 - HTTP Request: Send to NestJS

- Method: `POST`
- URL: `http://localhost:3000/transactions/wa`
- Send headers: enabled
  - `x-n8n-api-key`: must match the backend's `N8N_WEBHOOK_SECRET` env var. Requests without this header (or with the wrong value) get `401 Unauthorized`.
- Send body: `JSON`
- Body:

```json
{
  "phoneNumber": "={{ $json.from }}",
  "message": "={{ $json.message }}",
  "command": "={{ $json.command }}",
  "amount": "={{ $json.amount }}",
  "description": "={{ $json.description }}",
  "providerMessageId": "={{ $json.providerMessageId }}"
}
```

`phoneNumber` must be the sender's WhatsApp number (already registered and verified as a treasurer), and `providerMessageId` enables idempotency on retried webhook deliveries.

> Tip: store the API key in an n8n credential or environment variable instead of hardcoding it in the workflow JSON.

## Node 4 - Respond to Webhook

Return the HTTP Request node result:

```json
{
  "success": "={{ $json.success }}",
  "message": "={{ $json.message }}",
  "currentBalance": "={{ $json.currentBalance }}"
}
```

## Optional Node 5 - WhatsApp Reply

Use the provider API to send:

```text
{{ $json.message }}
Saldo: {{ $json.currentBalance }}
```

For WhatsApp Cloud API, this is usually an HTTP Request node:

- Method: `POST`
- URL: `https://graph.facebook.com/vXX.X/{{ phone_number_id }}/messages`
- Authentication: bearer token
- Body type: JSON
- Recipient: parsed sender phone number from the webhook payload

## Example Messages

Incoming income:

```text
masuk 50000 iuran kelas
```

Body sent to NestJS:

```json
{
  "message": "masuk 50000 iuran kelas",
  "command": "masuk",
  "amount": 50000,
  "description": "iuran kelas"
}
```

Incoming expense:

```text
keluar 25000 beli konsumsi
```

Body sent to NestJS:

```json
{
  "message": "keluar 25000 beli konsumsi",
  "command": "keluar",
  "amount": 25000,
  "description": "beli konsumsi"
}
```

Future commands:

```text
saldo
laporan bulan ini
pengeluaran bulan ini
```

## Importable Workflow

An importable workflow skeleton is available in `n8n-whatsapp-workflow.json`. Update the backend URL and WhatsApp provider reply node for your environment.
