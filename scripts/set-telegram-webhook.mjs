const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
const baseUrl = (process.env.ROMA_PUBLIC_URL || "https://roma-ten-zeta.vercel.app").replace(/\/$/, "");

if (!token || !secret) {
  console.error("Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_WEBHOOK_SECRET en .env.local");
  process.exit(1);
}

const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: `${baseUrl}/api/telegram/webhook`, secret_token: secret, allowed_updates: ["message"] }),
});

const payload = await response.json();
if (!response.ok || !payload.ok) {
  console.error("Telegram rechazo la configuracion del webhook.");
  process.exit(1);
}

console.log(`Webhook configurado: ${baseUrl}/api/telegram/webhook`);
