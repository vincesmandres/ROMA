"use client";

import { useMemo, useState } from "react";
import {
  Activity, BarChart3, CheckSquare, ChevronRight, Download, Edit3,
  FileText, Filter, Map, Menu, Radio, Search, ShieldCheck, X,
} from "lucide-react";
import { reports as demoReports } from "@/lib/demo-data";
import { useReports } from "@/lib/reports/use-reports";
import type { Report, ReportPriority, ReportStatus } from "@/lib/reports/types";

const priorityStyles: Record<ReportPriority, string> = {
  "Crítica": "priority-critical",
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

function MapSurface({ reports, selected, onSelect }: { reports: Report[]; selected?: Report; onSelect: (report: Report) => void }) {
  const areas = [
    { name: "TARQUI", x: "27%", y: "54%", tone: "critical" },
    { name: "LOS ESTEROS", x: "62%", y: "21%", tone: "primary" },
    { name: "CENTRO", x: "45%", y: "38%", tone: "medium" },
  ];

  return <section className="map-surface" aria-label="Mapa territorial de señales en Manta">
    <div className="map-grid" /><div className="map-coast" />
    <div className="map-line line-1" /><div className="map-line line-2" /><div className="map-line line-3" /><div className="map-line line-4" /><div className="map-line line-5" />
    <div className="map-meta">DASHBOARD OPERATIVO / SEÑALES EN VIVO — MANTA, ECUADOR</div>
    <div className="map-coordinates">SUPABASE SYNC · 5 SEC</div>
    {areas.map((area) => {
      const zoneReports = reports.filter((report) => report.zone.toUpperCase().includes(area.name.split(" ")[0]));
      return <button className={`area-marker ${area.tone}`} key={area.name} style={{ left: area.x, top: area.y }} onClick={() => onSelect(zoneReports[0] ?? reports[0])}>
        <span>{area.name}</span><strong>{String(zoneReports.length).padStart(2, "0")} ACTIVE</strong><i />
      </button>;
    })}
    {reports.map((report) => <button key={report.id} className={`signal-pin ${priorityStyles[report.priority]} ${selected?.id === report.id ? "selected" : ""}`} style={{ left: `${report.coordinates.x}%`, top: `${report.coordinates.y}%` }} onClick={() => onSelect(report)} aria-label={`Abrir ${report.id}`} title={report.title}><i /></button>)}
    <div className="map-north">N<br /><span>↑</span></div>
    <div className="map-attribution">© OpenStreetMap contributors · Vista operativa</div>
  </section>;
}

function FeedCard({ report, selected, onSelect }: { report: Report; selected?: boolean; onSelect: () => void }) {
  return <button className={`signal-card ${selected ? "selected" : ""}`} onClick={onSelect}>
    <div className="signal-card-top"><span className="signal-id">#{report.id.replace("ROMA-", "RM-")}</span><StatusTag className={priorityStyles[report.priority]}>{report.priority === "Crítica" ? "URGENTE" : report.priority.toUpperCase()}</StatusTag></div>
    <p>{report.title}</p>
    <div className="signal-card-meta"><span>{report.zone.toUpperCase()} · {report.age.toUpperCase()}</span><ChevronRight size={15} /></div>
  </button>;
}

function DetailPanel({ report, onClose }: { report: Report; onClose: () => void }) {
  const confidence = Math.round((report.confidence ?? 0.5) * 100);
  return <aside className="detail-panel">
    <div className="detail-panel-head"><div><span className="section-label">SELECTED SIGNAL</span><h2>#{report.id.replace("ROMA-", "RM-")}</h2></div><button className="terminal-icon" onClick={onClose} aria-label="Cerrar detalle"><X size={17} /></button></div>
    <div className="detail-panel-body"><div className="detail-status"><StatusTag className={priorityStyles[report.priority]}>{report.priority.toUpperCase()}</StatusTag><StatusTag className={statusStyles[report.status]}>{report.status.toUpperCase()}</StatusTag></div><h3>{report.title}</h3><p className="detail-location"><Map size={14} /> {report.zone} · {report.source}</p><div className="detail-section"><span className="section-label">AI SUMMARY</span><p>{report.summary}</p></div><div className="detail-section"><span className="section-label">RISK DETECTED</span><p className="risk-copy">{report.risk}</p></div><div className="detail-section confidence-row"><span className="section-label">CONFIDENCE</span><strong>{confidence}%</strong><div className="terminal-progress"><i style={{ width: `${confidence}%` }} /></div></div><button className="terminal-action primary"><CheckSquare size={15} /> REVIEW SIGNAL</button><button className="terminal-action"><FileText size={15} /> GENERATE BRIEF</button></div>
  </aside>;
}

export default function Home() {
  const { data, error, isLoading } = useReports(true);
  const reports = data?.reports?.length ? data.reports : demoReports;
  const [selectedId, setSelectedId] = useState<string>();
  const selected = reports.find((report) => report.id === selectedId) ?? reports[0];
  const setSelected = (report?: Report) => setSelectedId(report?.id);
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const filtered = useMemo(() => reports.filter((report) => `${report.id} ${report.title} ${report.zone}`.toLowerCase().includes(query.toLowerCase())), [query, reports]);
  const urgent = reports.filter((report) => report.priority === "Crítica" || report.priority === "Alta").length;
  const progress = reports.filter((report) => report.status === "En revisión" || report.status === "Escalado").length;
  const resolved = reports.filter((report) => report.status === "Resuelto").length;

  return <div className="terminal-app">
    <header className="terminal-topbar"><div className="topbar-brand"><strong>ROMA</strong><span className="topbar-mobile-label">/ OPS</span></div><nav className="topbar-nav"><button className="active">DASHBOARD</button><button>REPORTS</button><button>MAP</button></nav><div className="topbar-actions"><span className="online-dot" /><span className="topbar-system">{error ? "DEMO FALLBACK" : isLoading ? "SYNCING" : "LIVE DATA"}</span><button className="terminal-icon" aria-label="Privacidad activa"><ShieldCheck size={18} /></button><button className="terminal-icon" aria-label="Señales en tiempo real"><Radio size={18} /></button><div className="moderator-avatar">MV</div></div><button className="terminal-icon mobile-menu" onClick={() => setMobileNav(true)} aria-label="Abrir menú"><Menu size={19} /></button></header>
    <aside className={`terminal-sidebar ${mobileNav ? "open" : ""}`}><div className="sidebar-head"><strong>ROMA OPS</strong><span>v1.1 / LIVE</span><button className="terminal-icon mobile-close" onClick={() => setMobileNav(false)} aria-label="Cerrar menú"><X size={17} /></button></div><nav className="sidebar-nav"><button className="active"><Activity size={18} /><span>DASHBOARD</span></button><button><BarChart3 size={18} /><span>REPORTS</span><em>{reports.length}</em></button><button><Map size={18} /><span>TERRITORY</span></button><button><CheckSquare size={18} /><span>FOLLOW-UP</span><em>{progress}</em></button></nav><div className="sidebar-bottom"><div className="system-ready"><i /> TELEGRAM ACTIVE</div><div className="sidebar-version">MANTA NODE / SUPABASE</div></div></aside>
    <main className="terminal-main"><MapSurface reports={reports} selected={selected} onSelect={setSelected} /><div className="privacy-badge"><ShieldCheck size={18} /><div><span>ANONYMOUS-ROMA</span><strong>ACTIVE SESSION</strong></div></div><section className="metrics-module"><div className="module-header"><span>SYSTEM METRICS</span><BarChart3 size={15} /></div><div className="metric-cells"><div><span>RECEIVED</span><strong>{reports.length}</strong></div><div className="urgent"><span>URGENT</span><strong>{urgent}</strong></div><div><span>IN PROGRESS</span><strong>{progress}</strong></div><div><span>RESOLVED</span><strong>{resolved}</strong></div></div></section><div className="territory-log"><span><i /> LIVE_SIGNAL_STREAM</span><p>&gt; SUPABASE CONNECTION... OK<br />&gt; TELEGRAM BOT... ACTIVE<br />&gt; TRACKING {reports.length} CIVIC SIGNALS<br />&gt; AUTO-REFRESH: 5 SEC<br /><b>_</b></p></div><section className="signal-feed"><div className="module-header"><span>REAL-TIME SIGNAL FEED</span><Radio size={15} /></div><div className="feed-toolbar"><div className="feed-search"><Search size={14} /><input placeholder="FILTER SIGNALS" value={query} onChange={(event) => setQuery(event.target.value)} /></div><button className="terminal-icon" aria-label="Filtrar señales"><Filter size={15} /></button></div><div className="feed-list">{filtered.map((report) => <FeedCard key={report.id} report={report} selected={selected?.id === report.id} onSelect={() => setSelected(report)} />)}{filtered.length === 0 && <div className="feed-empty">NO SIGNALS MATCH FILTER</div>}</div><div className="feed-actions"><button className="terminal-action"><Edit3 size={15} /> MANUAL LOG ENTRY</button><button className="terminal-action"><Download size={15} /> EXPORT TERRITORY DATA</button></div></section><footer className="terminal-footer">AI CLASSIFICATION IS A HUMAN-REVIEW SUGGESTION · ROMA DOES NOT ISSUE OFFICIAL ALERTS</footer></main>
    {selected && <DetailPanel report={selected} onClose={() => setSelected(undefined)} />}
  </div>;
}
