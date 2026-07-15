import { NextResponse } from "next/server";

import {
  interpretTelegramMessage,
  parseTelegramReport,
  persistTelegramReport,
  sendTelegramConfirmation,
  telegramConfirmation,
  telegramHelpMessage,
  type TelegramUpdate,
} from "@/lib/telegram";

export const dynamic = "force-dynamic";

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

export async function POST(request: Request) {
  const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (configuredSecret && request.headers.get("x-telegram-bot-api-secret-token") !== configuredSecret) {
    return jsonError("INVALID_TELEGRAM_SECRET", "El secreto del webhook de Telegram no es válido.", 401);
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return jsonError("INVALID_JSON", "El update de Telegram debe ser JSON válido.", 400);
  }

  if (typeof update.message?.text !== "string") return NextResponse.json({ ok: true, ignored: true });

  const messageText = update.message.text.trim();
  const isHelp = /^\/(?:start|help)(?:@\w+)?$/i.test(messageText);
  const report = isHelp ? null : (parseTelegramReport(update) ?? await interpretTelegramMessage(update));
  if (!report) {
    if (!process.env.TELEGRAM_BOT_TOKEN?.trim()) {
      return jsonError("TELEGRAM_NOT_CONFIGURED", "TELEGRAM_BOT_TOKEN no está configurado en el servidor.", 503);
    }
    const chatId = update.message.chat?.id;
    if (typeof chatId === "string" || typeof chatId === "number") {
      try {
        const message = isHelp
          ? telegramHelpMessage()
          : "Necesito saber qué ocurre y en qué zona de Manta. Escríbelo como un mensaje normal, por ejemplo: Hay una fuga de agua en Tarqui desde esta mañana.";
        await sendTelegramConfirmation(String(chatId), message);
        return NextResponse.json({ ok: true, guided: true });
      } catch {
        return jsonError("TELEGRAM_SEND_FAILED", "Telegram no pudo enviar la ayuda del bot.", 502);
      }
    }
    return NextResponse.json({ ok: true, ignored: true });
  }

  let persisted: Awaited<ReturnType<typeof persistTelegramReport>>;
  try {
    persisted = await persistTelegramReport(report);
  } catch (error) {
    if (error instanceof Error && error.message === "SUPABASE_NOT_CONFIGURED") {
      return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase no está configurado para persistir reportes de Telegram.", 503);
    }
    console.error("Telegram report persistence failed");
    try {
      await sendTelegramConfirmation(report.chatId, "No pude registrar ese mensaje. Intenta nuevamente indicando qué ocurre y en qué zona de Manta.");
    } catch {
      // Telegram will receive 200 to prevent an incompatible update from blocking the queue.
    }
    return NextResponse.json({ ok: true, guided: true, report_error: true });
  }

  try {
    await sendTelegramConfirmation(report.chatId, telegramConfirmation(report, persisted.id));
  } catch {
    return NextResponse.json({ ok: true, report_id: persisted.id, report_hash: persisted.reportHash, confirmation_sent: false });
  }

  return NextResponse.json({ ok: true, report_id: persisted.id, report_hash: persisted.reportHash, confirmation_sent: true });
}
