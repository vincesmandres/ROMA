import {
  isRomaCategory,
  isRomaPriority,
  isReportAnalysisOutput,
  type ReportAnalysisInput,
  type ReportAnalysisOutput,
} from "@/lib/roma-contracts";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const MAX_ZONE_LENGTH = 120;
const MAX_TEXT_LENGTH = 5000;

export class OpenAIAnalysisError extends Error {
  readonly code: "missing_api_key" | "provider_error" | "invalid_output";
  readonly status: number;

  constructor(
    code: OpenAIAnalysisError["code"],
    message: string,
    status: number,
  ) {
    super(message);
    this.name = "OpenAIAnalysisError";
    this.code = code;
    this.status = status;
  }
}

export type PreparedReport = {
  input: ReportAnalysisInput;
  redactedText: string;
  createdAt: string;
};

export type OpenAIAnalysisResult = {
  analysis: ReportAnalysisOutput;
  prepared: PreparedReport;
};

/** Redacts common personal identifiers before any third-party model call. */
export function redactReportText(value: string): string {
  return value
    .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/gi, "[correo oculto]")
    .replace(/(?:\+?593|0)?9\d{8}\b/g, "[telefono oculto]")
    .replace(/\b\d{10}\b/g, "[identificador oculto]")
    .replace(/\b(?:c\.?\s*c\.?|cedula|dni|id)\s*[:#-]?\s*[\d.-]{6,}\b/gi, "[identificador oculto]");
}

export function prepareReport(input: ReportAnalysisInput): PreparedReport {
  const zone = input.zone.trim();
  const text = input.text.trim();

  if (!zone || zone.length > MAX_ZONE_LENGTH) {
    throw new OpenAIAnalysisError("provider_error", "La zona es obligatoria y debe ser válida.", 422);
  }

  if (!text || text.length > MAX_TEXT_LENGTH) {
    throw new OpenAIAnalysisError("provider_error", "El reporte es obligatorio y debe ser válido.", 422);
  }

  return {
    input: { ...input, zone, text: redactReportText(text) },
    redactedText: redactReportText(text),
    createdAt: new Date().toISOString(),
  };
}

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    category: { type: "string", enum: ["residuos_contaminacion", "fuga_agua", "infraestructura_danada", "accesibilidad", "riesgo_comunitario", "servicios_publicos", "ambiente_playas", "otro"] },
    priority: { type: "string", enum: ["baja", "media", "alta", "critica"] },
    summary: { type: "string" },
    risks: { type: "array", items: { type: "string" } },
    recommended_action: { type: "string" },
    whatsapp_message: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: ["category", "priority", "summary", "risks", "recommended_action", "whatsapp_message", "confidence"],
} as const;

function systemPrompt(): string {
  return [
    "You are ROMA, a civic report analysis agent for Manta, Ecuador.",
    "Transform the redacted citizen signal into practical, privacy-aware local intelligence.",
    "Do not claim the report is verified truth. Do not infer or expose identity.",
    "Use only the controlled category and priority vocabularies in the schema.",
    "Prioritize practical action, local relevance, and human review.",
  ].join(" ");
}

function readOutputText(payload: unknown): string | null {
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

function parseAnalysis(value: string): ReportAnalysisOutput | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isReportAnalysisOutput(parsed)) return null;
    if (!isRomaCategory(parsed.category) || !isRomaPriority(parsed.priority)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function analyzeReport(input: ReportAnalysisInput): Promise<OpenAIAnalysisResult> {
  const prepared = prepareReport(input);
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new OpenAIAnalysisError("missing_api_key", "OPENAI_API_KEY no está configurada en el servidor.", 503);
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5.6";
  let response: Response;

  try {
    response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          { role: "system", content: [{ type: "input_text", text: systemPrompt() }] },
          { role: "user", content: [{ type: "input_text", text: JSON.stringify({ zone: prepared.input.zone, text: prepared.redactedText, source: prepared.input.source, reportedCategory: prepared.input.reportedCategory, perceivedUrgency: prepared.input.perceivedUrgency }) }] },
        ],
        text: { format: { type: "json_schema", name: "roma_report_analysis", strict: true, schema: analysisSchema } },
      }),
      cache: "no-store",
    });
  } catch {
    throw new OpenAIAnalysisError("provider_error", "No fue posible conectar con el servicio de análisis.", 502);
  }

  if (!response.ok) {
    throw new OpenAIAnalysisError("provider_error", "El servicio de análisis no pudo procesar el reporte.", response.status === 429 ? 429 : 502);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new OpenAIAnalysisError("invalid_output", "El servicio de análisis devolvió una respuesta inválida.", 502);
  }

  const outputText = readOutputText(payload);
  const analysis = outputText ? parseAnalysis(outputText) : null;
  if (!analysis) {
    throw new OpenAIAnalysisError("invalid_output", "El análisis no cumplió el contrato estructurado de ROMA.", 502);
  }

  return { analysis, prepared };
}
