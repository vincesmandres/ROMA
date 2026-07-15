import type { Report, ReportPriority, ReportRow, ReportStatus } from "./types";

const priorities: Record<ReportRow["priority"], ReportPriority> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

const statuses: Record<ReportRow["status"], ReportStatus> = {
  pending: "Pendiente",
  in_review: "En revisión",
  escalated: "Escalado",
  resolved: "Resuelto",
};

const categories: Record<string, string> = {
  residuos_contaminacion: "Residuos y contaminación",
  fuga_agua: "Fuga de agua",
  infraestructura_danada: "Infraestructura dañada",
  accesibilidad: "Accesibilidad",
  riesgo_comunitario: "Riesgo comunitario",
  servicios_publicos: "Servicios públicos",
  ambiente_playas: "Ambiente y playas",
  otro: "Otro",
};

function riskLabel(value: unknown) {
  if (!value) return "Riesgo pendiente de clasificación.";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string").join(" · ") || "Riesgo pendiente de clasificación.";
  }
  return JSON.stringify(value);
}

function ageLabel(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `hace ${minutes} min`;
  if (minutes < 1440) return `hace ${Math.floor(minutes / 60)} h`;
  if (minutes < 2880) return "ayer";
  return `hace ${Math.floor(minutes / 1440)} días`;
}

function mapCoordinates(latitude: number | null, longitude: number | null) {
  if (latitude === null || longitude === null) return { x: 50, y: 50 };
  const x = Math.min(92, Math.max(8, ((longitude + 80.85) / 0.25) * 84 + 8));
  const y = Math.min(92, Math.max(8, ((-0.9 - latitude) / 0.3) * 84 + 8));
  return { x, y };
}

export function mapReport(row: ReportRow): Report {
  const analysis = row.report_analysis?.[0];
  const source = row.source === "telegram" ? "Telegram" : row.source === "whatsapp" ? "WhatsApp" : "Web";
  return {
    id: row.reference_code,
    title: row.title,
    zone: row.zone,
    category: categories[row.category] ?? row.category,
    priority: priorities[row.priority],
    status: statuses[row.status],
    createdAt: new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.created_at)),
    age: ageLabel(row.created_at),
    summary: row.summary ?? analysis?.summary ?? "Pendiente de análisis y revisión humana.",
    risk: riskLabel(row.risks ?? analysis?.risks),
    source,
    confidence: row.confidence ?? analysis?.confidence ?? null,
    coordinates: mapCoordinates(row.latitude, row.longitude),
  };
}
