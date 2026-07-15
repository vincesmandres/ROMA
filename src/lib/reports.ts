import { reports as demoReports, type Report } from "@/lib/demo-data";
import { isRomaCategory, isRomaPriority, isRomaStatus, type RomaCategory, type RomaPriority, type RomaSource, type RomaStatus } from "@/lib/roma-contracts";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ReportRow = {
  id: string;
  zone: string;
  source: RomaSource;
  text_redacted: string;
  category: RomaCategory | null;
  priority: RomaPriority | null;
  status: RomaStatus;
  summary: string | null;
  risks: string[];
  confidence: number | null;
  created_at: string;
};

const categoryLabels: Record<RomaCategory, string> = {
  residuos_contaminacion: "Residuos y contaminación",
  fuga_agua: "Fuga de agua",
  infraestructura_danada: "Infraestructura dañada",
  accesibilidad: "Accesibilidad",
  riesgo_comunitario: "Riesgo comunitario",
  servicios_publicos: "Servicios públicos",
  ambiente_playas: "Ambiente y playas",
  otro: "Otro",
};

const priorityLabels: Record<RomaPriority, Report["priority"]> = { baja: "Baja", media: "Media", alta: "Alta", critica: "Crítica" };
const statusLabels: Record<RomaStatus, Report["status"]> = { pending: "Pendiente", in_review: "En revisión", escalated: "Escalado", resolved: "Resuelto" };

function toReport(row: ReportRow): Report {
  const category = isRomaCategory(row.category) ? categoryLabels[row.category] : "Otro";
  const priority = isRomaPriority(row.priority) ? priorityLabels[row.priority] : "Media";
  const status = isRomaStatus(row.status) ? statusLabels[row.status] : "Pendiente";
  return {
    id: row.id,
    title: row.summary ?? "Reporte ciudadano",
    zone: row.zone,
    category,
    priority,
    status,
    createdAt: new Date(row.created_at).toLocaleString("es-EC"),
    age: "reciente",
    summary: row.text_redacted,
    risk: row.risks?.join(" y ") || "Por revisar",
    confidence: row.confidence ?? null,
    source: row.source === "whatsapp" ? "WhatsApp" : "Web",
    coordinates: { x: 50, y: 50 },
  };
}

export async function listReports(): Promise<Report[]> {
  const client = createServerSupabaseClient();
  if (!client.isConfigured) return demoReports;
  const result = await client.from<ReportRow>("reports").select({ order: "created_at.desc", limit: 100 });
  return result.data ? result.data.map(toReport) : demoReports;
}

export async function getReportById(id: string): Promise<Report | null> {
  const localReport = demoReports.find((report) => report.id === id);
  const client = createServerSupabaseClient();
  if (!client.isConfigured) return localReport ?? null;
  const result = await client.from<ReportRow>("reports").select({ filters: { id }, limit: 1 });
  return result.data?.[0] ? toReport(result.data[0]) : localReport ?? null;
}

export async function createReport(input: {
  zone: string;
  textRedacted: string;
  source: RomaSource;
  category?: RomaCategory;
  priority?: RomaPriority;
  summary?: string;
  risks?: string[];
}): Promise<ReportRow | null> {
  const client = createServerSupabaseClient();
  if (!client.isConfigured) return null;
  const result = await client.from<ReportRow>("reports").insert({
    zone: input.zone,
    text_redacted: input.textRedacted,
    source: input.source,
    category: input.category ?? null,
    priority: input.priority ?? null,
    summary: input.summary ?? null,
    risks: input.risks ?? [],
  });
  return result.data?.[0] ?? null;
}
