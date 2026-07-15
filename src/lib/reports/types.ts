export type ReportStatus = "Pendiente" | "En revisión" | "Escalado" | "Resuelto";
export type ReportPriority = "Crítica" | "Alta" | "Media" | "Baja";

export type Report = {
  id: string;
  title: string;
  zone: string;
  category: string;
  priority: ReportPriority;
  status: ReportStatus;
  createdAt: string;
  age: string;
  summary: string;
  risk: string;
  source: "Web" | "WhatsApp";
  confidence: number | null;
  coordinates: { x: number; y: number };
};

export type ReportRow = {
  id: string;
  reference_code: string;
  title: string;
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "pending" | "in_review" | "escalated" | "resolved";
  zone: string;
  latitude: number | null;
  longitude: number | null;
  source: "web" | "whatsapp";
  created_at: string;
  report_analysis: Array<{
    summary: string | null;
    risks: string | null;
    confidence: number | null;
  }> | null;
};

export type ReportsPayload = {
  reports: Report[];
  mode: "supabase" | "demo";
};
