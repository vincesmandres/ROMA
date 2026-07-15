import { NextResponse } from "next/server";

import {
  isRomaCategory,
  isRomaPriority,
  isReportAnalysisOutput,
  ROMA_SOURCES,
  type ReportAnalysisInput,
} from "@/lib/roma-contracts";
import { createReportHash } from "@/lib/report-hash";
import { analyzeReport, OpenAIAnalysisError } from "@/lib/openai-analysis";

export const runtime = "nodejs";

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

function validateInput(body: unknown): ReportAnalysisInput | null {
  if (!body || typeof body !== "object") return null;
  const value = body as Partial<ReportAnalysisInput>;
  const source = value.source ?? "web_form";
  if (typeof value.zone !== "string" || typeof value.text !== "string") return null;
  if (!ROMA_SOURCES.includes(source as (typeof ROMA_SOURCES)[number])) return null;
  if (value.reportedCategory !== undefined && !isRomaCategory(value.reportedCategory)) return null;
  if (value.perceivedUrgency !== undefined && !isRomaPriority(value.perceivedUrgency)) return null;
  return {
    zone: value.zone,
    text: value.text,
    source: source as ReportAnalysisInput["source"],
    ...(value.reportedCategory ? { reportedCategory: value.reportedCategory } : {}),
    ...(value.perceivedUrgency ? { perceivedUrgency: value.perceivedUrgency } : {}),
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_JSON", "El cuerpo debe ser JSON válido.", 400);
  }

  const input = validateInput(body);
  if (!input) {
    return errorResponse("INVALID_INPUT", "Zona, texto, fuente y opciones deben cumplir el contrato de ROMA.", 422);
  }

  try {
    const result = await analyzeReport(input);
    if (!isReportAnalysisOutput(result.analysis)) {
      return errorResponse("INVALID_ANALYSIS", "El análisis no cumplió el contrato de ROMA.", 502);
    }

    const reportHash = await createReportHash({
      redactedText: result.prepared.redactedText,
      zone: result.prepared.input.zone,
      category: result.analysis.category,
      createdAt: result.prepared.createdAt,
    });

    return NextResponse.json({
      ok: true,
      analysis: result.analysis,
      traceability: { report_hash: reportHash, created_at: result.prepared.createdAt },
      privacy: { redacted: true, raw_text_persisted: false },
    });
  } catch (error) {
    if (error instanceof OpenAIAnalysisError) {
      return errorResponse(error.code.toUpperCase(), error.message, error.status);
    }
    return errorResponse("ANALYSIS_FAILED", "No fue posible analizar el reporte.", 502);
  }
}
