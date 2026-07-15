"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Bot,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Filter,
  Layers3,
  Map,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { reports, type Report, type ReportPriority, type ReportStatus } from "@/lib/demo-data";

const priorityStyles: Record<ReportPriority, string> = {
  Crítica: "priority-critical",
  Alta: "priority-high",
  Media: "priority-medium",
  Baja: "priority-low",
};

const statusStyles: Record<ReportStatus, string> = {
  Pendiente: "status-pending",
  "En revisión": "status-review",
  Escalado: "status-escalated",
  Resuelto: "status-resolved",
};

const navItems = [
  { label: "Resumen", icon: Activity, active: true },
  { label: "Reportes", icon: FileText, count: "24" },
  { label: "Mapa territorial", icon: Map },
  { label: "Seguimiento", icon: ClipboardCheck, count: "8" },
];

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`pill ${className}`}>{children}</span>;
}

function MetricCard({ label, value, detail, tone, icon: Icon }: { label: string; value: string; detail: string; tone: string; icon: typeof Activity }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}><Icon size={18} strokeWidth={2} /></div>
      <div className="metric-copy">
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
      <ArrowUpRight className="metric-arrow" size={16} />
    </article>
  );
}

function MapPanel({ selected, onSelect }: { selected: Report | undefined; onSelect: (report: Report) => void }) {
  return (
    <section className="panel map-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">SEÑALES EN TERRITORIO</p>
          <h2>Actividad reciente en Manta</h2>
        </div>
        <button className="icon-button" aria-label="Abrir mapa completo" title="Abrir mapa completo"><ExternalLink size={16} /></button>
      </div>
      <div className="map-toolbar">
        <div className="map-legend"><span className="legend-dot critical" /> Crítica <span className="legend-dot high" /> Alta <span className="legend-dot medium" /> Media</div>
        <button className="map-filter"><Layers3 size={14} /> Todas las categorías <ChevronDown size={14} /></button>
      </div>
      <div className="map-canvas" aria-label="Mapa demostrativo de reportes en Manta">
        <div className="map-water" />
        <div className="map-road road-a" /><div className="map-road road-b" /><div className="map-road road-c" /><div className="map-road road-d" />
        <div className="map-label label-murcielago">Playa Murciélago</div>
        <div className="map-label label-centro">Centro</div>
        <div className="map-label label-tarqui">Tarqui</div>
        {reports.map((report) => (
          <button
            className={`map-pin ${priorityStyles[report.priority]} ${selected?.id === report.id ? "selected" : ""}`}
            key={report.id}
            style={{ left: `${report.coordinates.x}%`, top: `${report.coordinates.y}%` }}
            onClick={() => onSelect(report)}
            aria-label={`Ver ${report.title}`}
            title={report.title}
          ><span /></button>
        ))}
        <div className="map-attribution">© OpenStreetMap contributors · Vista demostrativa</div>
      </div>
    </section>
  );
}

function ReportDetail({ report, onClose }: { report: Report; onClose: () => void }) {
  return (
    <aside className="detail-drawer">
      <div className="drawer-heading">
        <div><p className="eyebrow">DETALLE DEL REPORTE</p><h2>{report.id}</h2></div>
        <button className="icon-button" onClick={onClose} aria-label="Cerrar detalle" title="Cerrar detalle"><X size={17} /></button>
      </div>
      <div className="drawer-body">
        <div className="detail-title-row"><h3>{report.title}</h3><Pill className={priorityStyles[report.priority]}>{report.priority}</Pill></div>
        <p className="detail-zone"><Map size={14} /> {report.zone} <span>·</span> {report.age}</p>
        <div className="detail-block"><span className="detail-label">Resumen de IA</span><p>{report.summary}</p></div>
        <div className="detail-grid"><div><span className="detail-label">Categoría</span><strong>{report.category}</strong></div><div><span className="detail-label">Origen</span><strong>{report.source}</strong></div></div>
        <div className="risk-callout"><ShieldCheck size={17} /><div><span className="detail-label">Riesgo identificado</span><p>{report.risk}</p></div></div>
        <div className="confidence"><div><span>Confianza del análisis</span><strong>87%</strong></div><div className="progress"><i style={{ width: "87%" }} /></div></div>
        <div className="drawer-actions"><button className="primary-button"><ClipboardCheck size={16} /> Revisar reporte</button><button className="secondary-button"><MessageSquareText size={16} /> Generar brief</button></div>
      </div>
    </aside>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos los estados");
  const [selected, setSelected] = useState<Report | undefined>(reports[0]);
  const [mobileNav, setMobileNav] = useState(false);
  const filteredReports = useMemo(() => reports.filter((report) => {
    const matchesQuery = `${report.id} ${report.title} ${report.zone} ${report.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "Todos los estados" || report.status === status;
    return matchesQuery && matchesStatus;
  }), [query, status]);

  return (
    <div className="roma-shell">
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="brand"><div className="brand-mark">R</div><div><strong>ROMA</strong><span>inteligencia cívica</span></div><button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Cerrar menú"><X size={17} /></button></div>
        <div className="workspace-switch"><div className="workspace-avatar">M</div><div><strong>Operación Manta</strong><span>Espacio de trabajo</span></div><ChevronDown size={15} /></div>
        <nav className="main-nav" aria-label="Navegación principal"><p className="nav-label">OPERACIÓN</p>{navItems.map(({ label, icon: Icon, active, count }) => <button className={`nav-item ${active ? "active" : ""}`} key={label}><Icon size={17} /><span>{label}</span>{count && <em>{count}</em>}</button>)}<p className="nav-label nav-spacer">GESTIÓN</p><button className="nav-item"><Users size={17} /><span>Comunidades</span></button><button className="nav-item"><Bot size={17} /><span>Automatizaciones</span><span className="soon">Pronto</span></button></nav>
        <div className="sidebar-bottom"><div className="privacy-note"><ShieldCheck size={17} /><div><strong>Privacidad activa</strong><span>Sin datos personales expuestos</span></div></div><button className="nav-item"><CircleHelp size={17} /><span>Centro de ayuda</span></button><div className="profile"><div className="profile-avatar">MV</div><div><strong>María V.</strong><span>Moderadora</span></div><MoreHorizontal size={17} /></div></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Abrir menú"><Menu size={19} /></button><div className="breadcrumb"><span>Operación Manta</span><span>/</span><strong>Resumen</strong></div><div className="top-actions"><span className="live-status"><i /> Sistema operativo</span><button className="icon-button" aria-label="Actualizar datos" title="Actualizar datos"><RefreshCw size={17} /></button><button className="icon-button notification" aria-label="Notificaciones" title="Notificaciones"><Bell size={17} /><i /></button></div></header>
        <div className="content-wrap">
          <section className="page-intro"><div><p className="eyebrow">MIÉRCOLES, 15 DE JULIO DE 2026</p><h1>Centro de observación</h1><p className="intro-copy">Una vista clara de las señales ciudadanas que requieren atención en Manta.</p></div><button className="secondary-button"><FileText size={16} /> Exportar informe</button></section>
          <section className="metric-grid"><MetricCard label="Reportes recibidos" value="24" detail="+6 esta semana" tone="blue" icon={FileText} /><MetricCard label="Requieren atención" value="8" detail="2 críticos" tone="red" icon={Bell} /><MetricCard label="En seguimiento" value="11" detail="46% del total" tone="amber" icon={ClipboardCheck} /><MetricCard label="Resueltos" value="5" detail="+2 esta semana" tone="green" icon={ShieldCheck} /></section>
          <section className="workspace-grid"><MapPanel selected={selected} onSelect={setSelected} /><section className="panel insight-panel"><div className="panel-heading"><div><p className="eyebrow">LECTURA DEL SISTEMA</p><h2>Señales destacadas</h2></div><Sparkles size={18} className="sparkle" /></div><div className="insight-main"><div className="insight-number">4<span> zonas</span></div><p>con concentración de reportes en las últimas 24 horas</p></div><div className="zone-list"><div><span className="zone-color red" /><strong>Centro de Manta</strong><span>8 reportes</span></div><div><span className="zone-color orange" /><strong>Playa Murciélago</strong><span>6 reportes</span></div><div><span className="zone-color yellow" /><strong>Tarqui</strong><span>4 reportes</span></div></div><button className="text-button">Ver análisis territorial <ArrowUpRight size={15} /></button></section></section>
          <section className="panel reports-panel"><div className="panel-heading reports-heading"><div><p className="eyebrow">BANDEJA DE MODERACIÓN</p><h2>Reportes recientes <span>24</span></h2></div><button className="secondary-button compact"><Filter size={15} /> Filtros <span className="filter-count">2</span></button></div><div className="table-toolbar"><div className="search-box"><Search size={16} /><input placeholder="Buscar por ID, zona o categoría" value={query} onChange={(event) => setQuery(event.target.value)} /></div><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por estado"><option>Todos los estados</option><option>Pendiente</option><option>En revisión</option><option>Escalado</option><option>Resuelto</option></select></div><div className="table-wrap"><table><thead><tr><th>Reporte</th><th>Zona</th><th>Categoría</th><th>Prioridad</th><th>Estado</th><th>Recibido</th><th /></tr></thead><tbody>{filteredReports.map((report) => <tr key={report.id} className={selected?.id === report.id ? "row-selected" : ""} onClick={() => setSelected(report)}><td><div className="report-cell"><strong>{report.id}</strong><span>{report.title}</span></div></td><td>{report.zone}</td><td>{report.category}</td><td><Pill className={priorityStyles[report.priority]}>{report.priority}</Pill></td><td><Pill className={statusStyles[report.status]}><i />{report.status}</Pill></td><td>{report.age}</td><td><button className="row-menu" aria-label={`Opciones de ${report.id}`}><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table></div>{filteredReports.length === 0 && <div className="empty-state">No hay reportes que coincidan con los filtros.</div>}<div className="table-footer"><span>Mostrando {filteredReports.length} de 24 reportes</span><button className="text-button">Ver todos <ArrowUpRight size={15} /></button></div></section>
          <footer className="footer-note"><ShieldCheck size={14} /> Las clasificaciones de IA son sugerencias para revisión humana. ROMA no emite alertas oficiales.</footer>
        </div>
      </main>
      {selected && <ReportDetail report={selected} onClose={() => setSelected(undefined)} />}
    </div>
  );
}
