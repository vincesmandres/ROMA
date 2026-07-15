import { NextResponse } from "next/server";

import {
  isRomaCategory,
  isRomaPriority,
  ROMA_SOURCES,
  type ReportAnalysisInput,
} from "@/lib/roma-contracts";
import { createReportHash } from "@/lib/report-hash";

const MAX_ZONE_LENGTH = 120;
const MAX_TEXT_LENGTH = 5000;

type CreateReportBody = Partial<ReportAnalysisInput>;

type PersistedReport = {
  id: string;
  source: ReportAnalysisInput["source"];
  zone: string;
  text_redacted: string;
  category: ReportAnalysisInput["reportedCategory"] | null;
  priority: ReportAnalysisInput["perceivedUrgency"] | null;
  status: "pending";
  report_hash: string;
  created_at: string;
};

function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, string>,
) {
  return NextResponse.json(
    {
      ok: false,
      error: { code, message, ...(details ? { details } : {}) },
    },
    { status },
  );
}

function redactSensitiveText(value: string): string {
  return value
    .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/gi, "[correo oculto]")
    .replace(/(?:\+?593|0)?9\d{8}\b/g, "[teléfono oculto]")
    .replace(/\b\d{10}\b/g, "[identificador oculto]")
    .replace(/\b(?:c\.c\.?|cedula|cédula|dni|id)\s*[:#-]?\s*[\d.-]{6,}\b/gi, "[identificador oculto]");
}

function validateBody(body: unknown):
  | { ok: true; value: { zone: string; text: string; source: ReportAnalysisInput["source"]; reportedCategory?: ReportAnalysisInput["reportedCategory"]; perceivedUrgency?: ReportAnalysisInput["perceivedUrgency"] } }
  | { ok: false; response: ReturnType<typeof errorResponse> } {
  if (!body || typeof body !== "object") {
    return { ok: false, response: errorResponse("INVALID_JSON", "El cuerpo debe ser un objeto JSON.", 400) };
  }

  const input = body as CreateReportBody;
  const zone = typeof input.zone === "string" ? input.zone.trim() : "";
  const text = typeof input.text === "string" ? input.text.trim() : "";
  const source = input.source ?? "web_form";

  if (!zone || zone.length > MAX_ZONE_LENGTH) {
    return { ok: false, response: errorResponse("INVALID_ZONE", `La zona es obligatoria y debe tener hasta ${MAX_ZONE_LENGTH} caracteres.`, 422) };
  }

  if (!text || text.length > MAX_TEXT_LENGTH) {
    return { ok: false, response: errorResponse("INVALID_TEXT", `El reporte es obligatorio y debe tener hasta ${MAX_TEXT_LENGTH} caracteres.`, 422) };
  }

  if (!ROMA_SOURCES.includes(source as (typeof ROMA_SOURCES)[number])) {
    return { ok: false, response: errorResponse("INVALID_SOURCE", "La fuente debe ser web_form o whatsapp.", 422) };
  }

  if (input.reportedCategory !== undefined && !isRomaCategory(input.reportedCategory)) {
    return { ok: false, response: errorResponse("INVALID_CATEGORY", "La categoría indicada no pertenece al vocabulario de ROMA.", 422) };
  }

  if (input.perceivedUrgency !== undefined && !isRomaPriority(input.perceivedUrgency)) {
    return { ok: false, response: errorResponse("INVALID_URGENCY", "La urgencia indicada no pertenece al vocabulario de ROMA.", 422) };
  }

  return {
    ok: true,
    value: {
      zone,
      text,
      source: source as ReportAnalysisInput["source"],
      ...(input.reportedCategory ? { reportedCategory: input.reportedCategory } : {}),
      ...(input.perceivedUrgency ? { perceivedUrgency: input.perceivedUrgency } : {}),
    },
  };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_JSON", "El cuerpo debe ser JSON válido.", 400);
  }

  const validation = validateBody(body);
  if (!validation.ok) return validation.response;

  const input = validation.value;
  const redactedText = redactSensitiveText(input.text);
  const createdAt = new Date().toISOString();
  const reportHash = await createReportHash({
    redactedText,
    zone: input.zone,
    category: input.reportedCategory ?? null,
    createdAt,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return errorResponse(
      "SUPABASE_NOT_CONFIGURED",
      "El reporte fue validado y protegido, pero Supabase no está configurado para persistirlo.",
      503,
      {
        missing: !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : "SUPABASE_SERVICE_ROLE_KEY o SUPABASE_SECRET_KEY",
        next: "Configura las variables del servidor y reintenta; no envíes claves secretas desde el navegador.",
      },
    );
  }

  const row = {
    source: "web",
    title: `${input.reportedCategory ?? "Reporte ciudadano"} - ${input.zone}`.slice(0, 160),
    description: redactedText,
    zone: input.zone,
    text_redacted: redactedText,
    category: input.reportedCategory ?? null,
    priority: input.perceivedUrgency ?? null,
    status: "pending",
    report_hash: reportHash,
    created_at: createdAt,
    updated_at: createdAt,
  };

  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/rest/v1/reports?select=id,source,zone,text_redacted,category,priority,status,report_hash,created_at`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(row),
      cache: "no-store",
    });
  } catch {
    return errorResponse("SUPABASE_UNREACHABLE", "No fue posible conectar con Supabase. Intenta nuevamente.", 502);
  }

  if (!response.ok) {
    const providerMessage = (await response.text()).slice(0, 500);
    return errorResponse("REPORT_PERSISTENCE_FAILED", "El reporte no pudo guardarse en Supabase.", 502, { provider: providerMessage });
  }

  const persisted = (await response.json()) as PersistedReport[];
  const report = persisted[0];
  if (!report?.id) {
    return errorResponse("REPORT_PERSISTENCE_FAILED", "Supabase no devolvió el reporte creado.", 502);
  }

  return NextResponse.json(
    {
      ok: true,
      report: {
        id: report.id,
        zone: report.zone,
        source: report.source,
        category: report.category,
        priority: report.priority,
        status: report.status,
        report_hash: report.report_hash,
        created_at: report.created_at,
      },
      privacy: { redacted: true, raw_text_persisted: false },
    },
    { status: 201 },
  );
}

