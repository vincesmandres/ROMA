"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckSquare,
  ChevronRight,
  Download,
  Edit3,
  FileText,
  Filter,
  Map,
  Menu,
  Radio,
  Search,
  ShieldCheck,
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

function StatusTag({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`terminal-tag ${className}`}>{children}</span>;
}

function MapSurface({ selected, onSelect }: { selected?: Report; onSelect: (report: Report) => void }) {
  const areas = [
    { name: "TARQUI", count: "08", x: "27%", y: "54%", tone: "critical" },
    { name: "LOS ESTEROS", count: "12", x: "62%", y: "21%", tone: "primary" },
    { name: "CENTRO", count: "24", x: "45%", y: "38%", tone: "medium" },
  ];

  return (
    <section className="map-surface" aria-label="Mapa territorial demostrativo de Manta">
      <div className="map-grid" />
      <div className="map-coast" />
      <div className="map-line line-1" /><div className="map-line line-2" /><div className="map-line line-3" /><div className="map-line line-4" /><div className="map-line line-5" />
      <div className="map-meta">DASHBOARD OPERATIVO / PRIORIDAD MAPA — MANTA, ECUADOR</div>
      <div className="map-coordinates">COORDENADAS: 0.95° S, 80.70° W</div>
      {areas.map((area) => (
        <button className={`area-marker ${area.tone}`} key={area.name} style={{ left: area.x, top: area.y }} onClick={() => onSelect(reports.find((report) => report.zone.toUpperCase().includes(area.name.split(" ")[0])) ?? reports[0])}>
          <span>{area.name}</span><strong>{area.count} ACTIVE</strong><i />
        </button>
      ))}
      {reports.map((report) => <button key={report.id} className={`signal-pin ${priorityStyles[report.priority]} ${selected?.id === report.id ? "selected" : ""}`} style={{ left: `${report.coordinates.x}%`, top: `${report.coordinates.y}%` }} onClick={() => onSelect(report)} aria-label={`Abrir ${report.id}`} title={report.title}><i /></button>)}
      <div className="map-north">N<br /><span>↑</span></div>
      <div className="map-attribution">© OpenStreetMap contributors · Vista demo</div>
    </section>
  );
}

function FeedCard({ report, selected, onSelect }: { report: Report; selected?: boolean; onSelect: () => void }) {
  return <button className={`signal-card ${selected ? "selected" : ""}`} onClick={onSelect}>
    <div className="signal-card-top"><span className="signal-id">#{report.id.replace("ROMA-", "RM-")}</span><StatusTag className={priorityStyles[report.priority]}>{report.priority === "Crítica" ? "URGENTE" : report.priority.toUpperCase()}</StatusTag></div>
    <p>{report.title}.</p>
    <div className="signal-card-meta"><span>{report.zone.toUpperCase()} · {report.age.toUpperCase()}</span><ChevronRight size={15} /></div>
  </button>;
}

function DetailPanel({ report, onClose }: { report: Report; onClose: () => void }) {
  return <aside className="detail-panel">
    <div className="detail-panel-head"><div><span className="section-label">SELECTED SIGNAL</span><h2>#{report.id.replace("ROMA-", "RM-")}</h2></div><button className="terminal-icon" onClick={onClose} aria-label="Cerrar detalle"><X size={17} /></button></div>
    <div className="detail-panel-body"><div className="detail-status"><StatusTag className={priorityStyles[report.priority]}>{report.priority.toUpperCase()}</StatusTag><StatusTag className={statusStyles[report.status]}>{report.status.toUpperCase()}</StatusTag></div><h3>{report.title}</h3><p className="detail-location"><Map size={14} /> {report.zone} · {report.source}</p><div className="detail-section"><span className="section-label">AI SUMMARY</span><p>{report.summary}</p></div><div className="detail-section"><span className="section-label">RISK DETECTED</span><p className="risk-copy">{report.risk}</p></div><div className="detail-section confidence-row"><span className="section-label">CONFIDENCE</span><strong>87%</strong><div className="terminal-progress"><i /></div></div><button className="terminal-action primary"><CheckSquare size={15} /> REVIEW SIGNAL</button><button className="terminal-action"><FileText size={15} /> GENERATE BRIEF</button></div>
  </aside>;
}

export default function Home() {
  const [selected, setSelected] = useState<Report | undefined>(reports[0]);
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const filtered = useMemo(() => reports.filter((report) => `${report.id} ${report.title} ${report.zone}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return <div className="terminal-app">
    <header className="terminal-topbar"><div className="topbar-brand"><strong>ROMA</strong><span className="topbar-mobile-label">/ OPS</span></div><nav className="topbar-nav"><button className="active">DASHBOARD</button><button>REPORTS</button><button>MAP</button></nav><div className="topbar-actions"><span className="online-dot" /> <span className="topbar-system">SYSTEM READY</span><button className="terminal-icon" aria-label="Privacidad activa" title="Privacidad activa"><ShieldCheck size={18} /></button><button className="terminal-icon" aria-label="Señales en tiempo real" title="Señales en tiempo real"><Radio size={18} /></button><div className="moderator-avatar">MV</div></div><button className="terminal-icon mobile-menu" onClick={() => setMobileNav(true)} aria-label="Abrir menú"><Menu size={19} /></button></header>
    <aside className={`terminal-sidebar ${mobileNav ? "open" : ""}`}><div className="sidebar-head"><strong>ROMA OPS</strong><span>v1.0.4 / STABLE</span><button className="terminal-icon mobile-close" onClick={() => setMobileNav(false)} aria-label="Cerrar menú"><X size={17} /></button></div><nav className="sidebar-nav" aria-label="Navegación operativa"><button className="active"><Activity size={18} /> <span>DASHBOARD</span></button><button><BarChart3 size={18} /> <span>REPORTS</span><em>24</em></button><button><Map size={18} /> <span>TERRITORY</span></button><button><CheckSquare size={18} /> <span>FOLLOW-UP</span><em>8</em></button></nav><div className="sidebar-bottom"><div className="system-ready"><i /> SYSTEM READY</div><div className="sidebar-version">MANTA NODE / LOCAL OPERATION</div></div></aside>
    <main className="terminal-main"><MapSurface selected={selected} onSelect={setSelected} /><div className="privacy-badge"><ShieldCheck size={18} /><div><span>ANONYMOUS-ROMA</span><strong>ACTIVE SESSION</strong></div></div><section className="metrics-module"><div className="module-header"><span>SYSTEM METRICS</span><BarChart3 size={15} /></div><div className="metric-cells"><div><span>RECEIVED</span><strong>1,204</strong></div><div className="urgent"><span>URGENT</span><strong>12</strong></div><div><span>IN PROGRESS</span><strong>42</strong></div><div><span>RESOLVED</span><strong>856</strong></div></div></section><div className="territory-log"><span><i /> LOG_SESSION_STREAMING</span><p>&gt; PINGING ROMA_NODES... OK<br />&gt; ENCRYPTING FEED_0x442... OK<br />&gt; LOCALIZING 42 ACTIVE TASKS...<br />&gt; MODERATOR_ID: 9942 ACTIVE<br /><b>_</b></p></div><section className="signal-feed"><div className="module-header"><span>REAL-TIME SIGNAL FEED</span><Radio size={15} /></div><div className="feed-toolbar"><div className="feed-search"><Search size={14} /><input placeholder="FILTER SIGNALS" value={query} onChange={(event) => setQuery(event.target.value)} /></div><button className="terminal-icon" aria-label="Filtrar señales" title="Filtrar señales"><Filter size={15} /></button></div><div className="feed-list">{filtered.map((report) => <FeedCard key={report.id} report={report} selected={selected?.id === report.id} onSelect={() => setSelected(report)} />)}{filtered.length === 0 && <div className="feed-empty">NO SIGNALS MATCH FILTER</div>}</div><div className="feed-actions"><button className="terminal-action"><Edit3 size={15} /> MANUAL LOG ENTRY</button><button className="terminal-action"><Download size={15} /> EXPORT TERRITORY DATA</button></div></section><footer className="terminal-footer">AI CLASSIFICATION IS A HUMAN-REVIEW SUGGESTION · ROMA DOES NOT ISSUE OFFICIAL ALERTS</footer></main>
    {selected && <DetailPanel report={selected} onClose={() => setSelected(undefined)} />}
  </div>;
}
