/** Controlled vocabulary shared by ROMA analysis, persistence, and review flows. */

export const ROMA_CATEGORIES = [
  "residuos_contaminacion",
  "fuga_agua",
  "infraestructura_danada",
  "accesibilidad",
  "riesgo_comunitario",
  "servicios_publicos",
  "ambiente_playas",
  "otro",
] as const;

export type RomaCategory = (typeof ROMA_CATEGORIES)[number];

export const ROMA_PRIORITIES = ["baja", "media", "alta", "critica"] as const;

export type RomaPriority = (typeof ROMA_PRIORITIES)[number];

export const ROMA_STATUSES = ["pending", "in_review", "escalated", "resolved"] as const;

export type RomaStatus = (typeof ROMA_STATUSES)[number];

export const ROMA_SOURCES = ["web_form", "whatsapp"] as const;

export type RomaSource = (typeof ROMA_SOURCES)[number];

export type ReportAnalysisInput = {
  zone: string;
  text: string;
  source: RomaSource;
  reportedCategory?: RomaCategory;
  perceivedUrgency?: RomaPriority;
};

export type ReportAnalysisOutput = {
  category: RomaCategory;
  priority: RomaPriority;
  summary: string;
  risks: string[];
  recommended_action: string;
  whatsapp_message: string;
  confidence: number;
};

export type ReportHashInput = {
  redactedText: string;
  zone: string;
  category: RomaCategory | null;
  createdAt: string;
};

export function isRomaCategory(value: unknown): value is RomaCategory {
  return typeof value === "string" && ROMA_CATEGORIES.includes(value as RomaCategory);
}

export function isRomaPriority(value: unknown): value is RomaPriority {
  return typeof value === "string" && ROMA_PRIORITIES.includes(value as RomaPriority);
}

export function isRomaStatus(value: unknown): value is RomaStatus {
  return typeof value === "string" && ROMA_STATUSES.includes(value as RomaStatus);
}

export function isReportAnalysisOutput(value: unknown): value is ReportAnalysisOutput {
  if (!value || typeof value !== "object") return false;

  const output = value as Partial<ReportAnalysisOutput>;
  return (
    isRomaCategory(output.category) &&
    isRomaPriority(output.priority) &&
    typeof output.summary === "string" &&
    Array.isArray(output.risks) &&
    output.risks.every((risk) => typeof risk === "string") &&
    typeof output.recommended_action === "string" &&
    typeof output.whatsapp_message === "string" &&
    typeof output.confidence === "number" &&
    Number.isFinite(output.confidence) &&
    output.confidence >= 0 &&
    output.confidence <= 1
  );
}
