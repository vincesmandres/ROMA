import { createReportHash } from "@/lib/report-hash";

const MAX_ZONE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 5000;
const TELEGRAM_API_BASE = "https://api.telegram.org";
const ALLOWED_URGENCY = new Set(["baja", "media", "alta", "critica"]);

export type TelegramMessage = {
  text?: unknown;
  chat?: { id?: unknown };
};

export type TelegramUpdate = {
  message?: TelegramMessage;
};

export type TelegramReport = {
  zone: string;
  description: string;
  urgency?: string;
  category?: string;
  confidence?: number;
  chatId: string;
};

export type TelegramPersistenceResult = {
  id: string | null;
  reportHash: string;
};

function isTelegramUpdate(value: unknown): value is TelegramUpdate {
  return Boolean(value && typeof value === "object");
}

/** Parses `/reportar zona | descripcion | urgencia` without retaining Telegram identity. */
export function parseTelegramReport(update: unknown): TelegramReport | null {
  if (!isTelegramUpdate(update) || !update.message || typeof update.message.text !== "string") return null;

  const text = update.message.text.trim();
  const match = text.match(/^\/reportar(?:@[\w_]+)?\s+(.+)$/i);
  const chatId = update.message.chat?.id;
  if (!match || (typeof chatId !== "string" && typeof chatId !== "number")) return null;

  const parts = match[1].split("|").map((part) => part.trim());
  const [zone, description, requestedUrgency] = parts;
  const urgency = requestedUrgency?.toLowerCase();

  if (
    parts.length < 2 ||
    !zone ||
    zone.length > MAX_ZONE_LENGTH ||
    !description ||
    description.length > MAX_DESCRIPTION_LENGTH ||
    (urgency && !ALLOWED_URGENCY.has(urgency))
  ) return null;

  return {
    zone,
    description,
    ...(urgency ? { urgency } : {}),
    chatId: String(chatId),
  };
}

export function redactTelegramReport(value: string): string {
  return value
    .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/gi, "[correo oculto]")
    .replace(/(?:\+?593|0)?9\d{8}\b/g, "[telefono oculto]")
    .replace(/\b\d{10}\b/g, "[identificador oculto]")
    .replace(/\b(?:c\.?\s*c\.?|cedula|c[eé]dula|dni|id)\s*[:#-]?\s*[\d.-]{6,}\b/gi, "[identificador oculto]");
}

function readResponseText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const response = payload as { output_text?: unknown; output?: unknown };
  if (typeof response.output_text === "string") return response.output_text;
  if (!Array.isArray(response.output)) return null;

  for (const item of response.output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string") {
        return (part as { text: string }).text;
      }
    }
  }
  return null;
}

export async function interpretTelegramMessage(update: TelegramUpdate): Promise<TelegramReport | null> {
  const text = typeof update.message?.text === "string" ? update.message.text.trim() : "";
  const chatId = update.message?.chat?.id;
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!text || !apiKey || (typeof chatId !== "string" && typeof chatId !== "number")) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: [{
            type: "input_text",
            text: "Extrae una señal ciudadana para Manta. No inventes ubicación. Si no hay problema observable o no hay zona reconocible, is_report debe ser false. No incluyas identidad personal.",
          }],
        },
        { role: "user", content: [{ type: "input_text", text: redactTelegramReport(text) }] },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "roma_telegram_signal",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              is_report: { type: "boolean" },
              zone: { type: "string" },
              description: { type: "string" },
              urgency: { type: "string", enum: ["baja", "media", "alta", "critica"] },
              category: { type: "string", enum: ["residuos_contaminacion", "fuga_agua", "infraestructura_danada", "accesibilidad", "riesgo_comunitario", "servicios_publicos", "ambiente_playas", "otro"] },
              confidence: { type: "number", minimum: 0, maximum: 1 },
            },
            required: ["is_report", "zone", "description", "urgency", "category", "confidence"],
          },
        },
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) return null;
  const output = readResponseText(await response.json());
  if (!output) return null;

  try {
    const value = JSON.parse(output) as Record<string, unknown>;
    if (value.is_report !== true || typeof value.zone !== "string" || !value.zone.trim() || typeof value.description !== "string" || !value.description.trim()) return null;
    if (typeof value.urgency !== "string" || !ALLOWED_URGENCY.has(value.urgency)) return null;
    return {
      zone: value.zone.trim().slice(0, MAX_ZONE_LENGTH),
      description: value.description.trim().slice(0, MAX_DESCRIPTION_LENGTH),
      urgency: value.urgency,
      ...(typeof value.category === "string" ? { category: value.category } : {}),
      ...(typeof value.confidence === "number" ? { confidence: value.confidence } : {}),
      chatId: String(chatId),
    };
  } catch {
    return null;
  }
}

function supabaseConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY)?.trim();
  return url && key ? { url, key } : null;
}

export async function persistTelegramReport(report: TelegramReport): Promise<TelegramPersistenceResult> {
  const config = supabaseConfig();
  if (!config) throw new Error("SUPABASE_NOT_CONFIGURED");

  const redactedText = redactTelegramReport(report.description);
  const createdAt = new Date().toISOString();
  const reportHash = await createReportHash({
    redactedText,
    zone: report.zone,
    category: null,
    createdAt,
  });

  const response = await fetch(`${config.url}/rest/v1/reports?select=id`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      source: "web",
      title: report.description.slice(0, 160),
      description: redactedText,
      zone: report.zone,
      text_redacted: redactedText,
      category: report.category ?? null,
      priority: report.urgency ?? null,
      status: "pending",
      summary: redactedText.slice(0, 500),
      confidence: report.confidence ?? null,
      report_hash: reportHash,
      created_at: createdAt,
      updated_at: createdAt,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("REPORT_PERSISTENCE_FAILED");
  const persisted = (await response.json()) as Array<{ id?: string }>;
  return { id: persisted[0]?.id ?? null, reportHash };
}

export async function sendTelegramConfirmation(chatId: string, message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return;

  const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("TELEGRAM_SEND_FAILED");
}

export function telegramConfirmation(report: TelegramReport, id: string | null): string {
  return [
    "ROMA recibió tu reporte.",
    `Zona: ${report.zone}`,
    "Se protegieron los datos sensibles y quedó pendiente de revisión humana.",
    id ? `Código: ${id}` : "Código: generado",
  ].join("\n");
}

export function telegramHelpMessage(): string {
  return [
    "Bienvenido a ROMA.",
    "Reporta una situacion de Manta sin compartir datos personales.",
    "",
    "Usa este formato:",
    "/reportar zona | descripcion | urgencia",
    "",
    "Ejemplo:",
    "/reportar Tarqui | Fuga de agua en la calle principal | alta",
    "",
    "Urgencias: baja, media, alta o critica.",
  ].join("\n");
}
