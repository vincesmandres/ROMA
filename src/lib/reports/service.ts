import type { ReportStatus, ReportsPayload } from "./types";

export async function getReports(): Promise<ReportsPayload> {
  const response = await fetch("/api/reports", { cache: "no-store" });
  if (!response.ok) throw new Error("No fue posible cargar los reportes.");
  return response.json() as Promise<ReportsPayload>;
}

export async function updateReportStatus(id: string, status: ReportStatus) {
  const response = await fetch(`/api/reports/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("No fue posible actualizar el reporte.");
  return response.json() as Promise<{ ok: true; mode: "supabase" | "demo" }>;
}
