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
  coordinates: { x: number; y: number };
};

export const reports: Report[] = [
  {
    id: "ROMA-0248",
    title: "Acumulación de residuos junto al acceso principal",
    zone: "Playa Murciélago",
    category: "Residuos y contaminación",
    priority: "Alta",
    status: "En revisión",
    createdAt: "15 jul 2026, 09:42",
    age: "hace 18 min",
    summary: "Se reportan bolsas y residuos acumulados desde ayer cerca del acceso principal de la playa.",
    risk: "Salud pública y afectación al turismo",
    source: "WhatsApp",
    coordinates: { x: 70, y: 39 },
  },
  {
    id: "ROMA-0247",
    title: "Fuga visible en calle 13",
    zone: "Centro de Manta",
    category: "Fuga de agua",
    priority: "Crítica",
    status: "Escalado",
    createdAt: "15 jul 2026, 08:58",
    age: "hace 1 h",
    summary: "Pérdida constante de agua sobre la calzada, con riesgo de deterioro de la vía.",
    risk: "Desperdicio de agua y daño de infraestructura",
    source: "Web",
    coordinates: { x: 48, y: 49 },
  },
  {
    id: "ROMA-0246",
    title: "Rampa bloqueada por vehículos",
    zone: "Tarqui",
    category: "Accesibilidad",
    priority: "Media",
    status: "Pendiente",
    createdAt: "15 jul 2026, 08:16",
    age: "hace 2 h",
    summary: "La rampa de acceso permanece bloqueada y no permite el paso de sillas de ruedas.",
    risk: "Barreras de movilidad y acceso desigual",
    source: "WhatsApp",
    coordinates: { x: 35, y: 56 },
  },
  {
    id: "ROMA-0245",
    title: "Bache profundo en vía secundaria",
    zone: "Los Esteros",
    category: "Infraestructura dañada",
    priority: "Alta",
    status: "En revisión",
    createdAt: "15 jul 2026, 07:51",
    age: "hace 2 h",
    summary: "Bache de gran tamaño en una vía de alto tránsito local, reportado por varios vecinos.",
    risk: "Accidentes y daño vehicular",
    source: "Web",
    coordinates: { x: 24, y: 71 },
  },
  {
    id: "ROMA-0244",
    title: "Olor fuerte cerca del estero",
    zone: "San Mateo",
    category: "Ambiente y playas",
    priority: "Media",
    status: "Resuelto",
    createdAt: "14 jul 2026, 17:20",
    age: "ayer",
    summary: "Se identificó un olor inusual en un punto cercano al estero durante la tarde.",
    risk: "Posible afectación ambiental",
    source: "WhatsApp",
    coordinates: { x: 83, y: 68 },
  },
];

export const mapPoints = reports.map(({ id, priority, status, coordinates }) => ({ id, priority, status, ...coordinates }));
