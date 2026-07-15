import { reports as demoReports } from "@/lib/demo-data";
import { createClient, hasSupabaseEnvironment } from "@/lib/supabase/client";
import type { Report, ReportPriority, ReportRow, ReportsPayload, ReportStatus } from "./types";

const priorities: Record<ReportRow["priority"], ReportPriority> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

const statuses: Record<ReportRow["status"], ReportStatus> = {
  pending: "Pendiente",
  in_review: "En revisión",
  escalated: "Escalado",
  resolved: "Resuelto",
};

const categories: Record<string, string> = {
  waste_pollution: "Residuos y contaminación",
  water_leak: "Fuga de agua",
  accessibility: "Accesibilidad",
  damaged_infrastructure: "Infraestructura dañada",
  environment_beaches: "Ambiente y playas",
  public_safety: "Seguridad pública",
  other: "Otro",
};

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

function mapReport(row: ReportRow): Report {
  const analysis = row.report_analysis?.[0];
  return {
    id: row.reference_code,
    title: row.title,
    zone: row.zone,
    category: categories[row.category] ?? row.category,
    priority: priorities[row.priority],
    status: statuses[row.status],
    createdAt: new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.created_at)),
    age: ageLabel(row.created_at),
    summary: analysis?.summary ?? "Pendiente de análisis y revisión humana.",
    risk: analysis?.risks ?? "Riesgo pendiente de clasificación.",
    source: row.source === "whatsapp" ? "WhatsApp" : "Web",
    confidence: analysis?.confidence ?? null,
    coordinates: mapCoordinates(row.latitude, row.longitude),
  };
}

export async function getReports(): Promise<ReportsPayload> {
  if (!hasSupabaseEnvironment()) {
    if (process.env.NODE_ENV === "development") return { reports: demoReports, mode: "demo" };
    return { reports: [], mode: "supabase" };
  }

  const { data, error } = await createClient()
    .from("reports")
    .select("id, reference_code, title, category, priority, status, zone, latitude, longitude, source, created_at, report_analysis(summary, risks, confidence)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    if (error.code === "42501") return { reports: [], mode: "supabase" };
    throw new Error("No fue posible cargar los reportes.");
  }

  return { reports: (data as ReportRow[]).map(mapReport), mode: "supabase" };
}
