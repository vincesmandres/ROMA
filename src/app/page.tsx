"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, BarChart3, CheckSquare, ChevronRight, Download, Edit3,
  FileText, Filter, Map, Menu, Radio, Search, ShieldCheck, X,
} from "lucide-react";
import { reports as demoReports } from "@/lib/demo-data";
import { useReports } from "@/lib/reports/use-reports";
import { updateReportStatus } from "@/lib/reports/service";
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

function DetailPanel({ report, busy, onClose, onReview, onBrief }: { report: Report; busy: boolean; onClose: () => void; onReview: () => void; onBrief: () => void }) {
  const confidence = Math.round((report.confidence ?? 0.5) * 100);
  return <aside className="detail-panel">
    <div className="detail-panel-head"><div><span className="section-label">SELECTED SIGNAL</span><h2>#{report.id.replace("ROMA-", "RM-")}</h2></div><button className="terminal-icon" onClick={onClose} aria-label="Cerrar detalle"><X size={17} /></button></div>
    <div className="detail-panel-body"><div className="detail-status"><StatusTag className={priorityStyles[report.priority]}>{report.priority.toUpperCase()}</StatusTag><StatusTag className={statusStyles[report.status]}>{report.status.toUpperCase()}</StatusTag></div><h3>{report.title}</h3><p className="detail-location"><Map size={14} /> {report.zone} · {report.source}</p><div className="detail-section"><span className="section-label">AI SUMMARY</span><p>{report.summary}</p></div><div className="detail-section"><span className="section-label">RISK DETECTED</span><p className="risk-copy">{report.risk}</p></div><div className="detail-section confidence-row"><span className="section-label">CONFIDENCE</span><strong>{confidence}%</strong><div className="terminal-progress"><i style={{ width: `${confidence}%` }} /></div></div><button className="terminal-action primary" disabled={busy || report.status === "En revisión"} onClick={onReview}><CheckSquare size={15} /> {busy ? "SAVING..." : report.status === "En revisión" ? "UNDER REVIEW" : "REVIEW SIGNAL"}</button><button className="terminal-action" onClick={onBrief}><FileText size={15} /> OPEN ACTION BRIEF</button></div>
  </aside>;
}

export default function Home() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [live, setLive] = useState(true);
  const { data, error, isLoading, mutate } = useReports(live);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, ReportStatus>>({});
  const sourceReports = data?.reports?.length ? data.reports : demoReports;
  const reports = sourceReports.map((report) => statusOverrides[report.id] ? { ...report, status: statusOverrides[report.id] } : report);
  const [selectedId, setSelectedId] = useState<string>();
  const selected = reports.find((report) => report.id === selectedId) ?? reports[0];
  const setSelected = (report?: Report) => setSelectedId(report?.id);
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<ReportPriority | "Todas">("Todas");
  const [filterOpen, setFilterOpen] = useState(false);
  const [view, setView] = useState<"dashboard" | "reports" | "map">("dashboard");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const filtered = useMemo(() => reports.filter((report) => `${report.id} ${report.title} ${report.zone} ${report.category}`.toLowerCase().includes(query.toLowerCase()) && (priority === "Todas" || report.priority === priority)), [priority, query, reports]);
  const urgent = reports.filter((report) => report.priority === "Crítica" || report.priority === "Alta").length;
  const progress = reports.filter((report) => report.status === "En revisión" || report.status === "Escalado").length;
  const resolved = reports.filter((report) => report.status === "Resuelto").length;

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function openView(next: "dashboard" | "reports" | "map") {
    setView(next); setMobileNav(false); setFilterOpen(false);
    if (next === "map") setSelected(undefined);
    if (next === "reports") window.setTimeout(() => searchRef.current?.focus(), 0);
  }

  async function reviewSelected() {
    if (!selected) return;
    const previous = statusOverrides[selected.id];
    setStatusOverrides((current) => ({ ...current, [selected.id]: "En revisión" })); setBusy(true);
    try {
      await updateReportStatus(selected.id, "En revisión");
      if (data) await mutate({ ...data, reports: data.reports.map((item) => item.id === selected.id ? { ...item, status: "En revisión" } : item) }, { revalidate: false });
      setNotice(`${selected.id} está en revisión.`);
    } catch {
      setStatusOverrides((current) => { const next = { ...current }; if (previous) next[selected.id] = previous; else delete next[selected.id]; return next; });
      setNotice("No se pudo guardar el cambio. Intenta nuevamente.");
    } finally { setBusy(false); }
  }

  function exportReports() {
    const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = [["ID", "Título", "Zona", "Categoría", "Prioridad", "Estado"], ...filtered.map((item) => [item.id, item.title, item.zone, item.category, item.priority, item.status])];
    const blob = new Blob(["\uFEFF" + rows.map((row) => row.map(quote).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `roma-reportes-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
    setNotice(`${filtered.length} reportes exportados.`);
  }

  return <div className="terminal-app">
    <header className="terminal-topbar"><div className="topbar-brand"><strong>ROMA</strong><span className="topbar-mobile-label">/ OPS</span></div><nav className="topbar-nav"><button className={view === "dashboard" ? "active" : ""} onClick={() => openView("dashboard")}>DASHBOARD</button><button className={view === "reports" ? "active" : ""} onClick={() => openView("reports")}>REPORTS</button><button className={view === "map" ? "active" : ""} onClick={() => openView("map")}>MAP</button></nav><div className="topbar-actions"><span className="online-dot" /><span className="topbar-system">{error ? "DEMO FALLBACK" : isLoading ? "SYNCING" : live ? "LIVE DATA" : "SYNC PAUSED"}</span><button className="terminal-icon" onClick={() => setNotice("Privacidad activa: solo se muestran datos redactados y ubicación aproximada.")} aria-label="Ver estado de privacidad"><ShieldCheck size={18} /></button><button className={`terminal-icon ${live ? "is-live" : ""}`} onClick={() => { setLive((current) => !current); setNotice(live ? "Actualización automática pausada." : "Actualización automática activada."); }} aria-label="Alternar señales en tiempo real"><Radio size={18} /></button><div className="moderator-avatar">MV</div></div><button className="terminal-icon mobile-menu" onClick={() => setMobileNav(true)} aria-label="Abrir menú"><Menu size={19} /></button></header>
    <aside className={`terminal-sidebar ${mobileNav ? "open" : ""}`}><div className="sidebar-head"><strong>ROMA OPS</strong><span>v1.1 / MVP</span><button className="terminal-icon mobile-close" onClick={() => setMobileNav(false)} aria-label="Cerrar menú"><X size={17} /></button></div><nav className="sidebar-nav"><button className={view === "dashboard" ? "active" : ""} onClick={() => openView("dashboard")}><Activity size={18} /><span>DASHBOARD</span></button><button className={view === "reports" ? "active" : ""} onClick={() => openView("reports")}><BarChart3 size={18} /><span>REPORTS</span><em>{reports.length}</em></button><button className={view === "map" ? "active" : ""} onClick={() => openView("map")}><Map size={18} /><span>TERRITORY</span></button><button onClick={() => router.push("/seguimiento")}><CheckSquare size={18} /><span>FOLLOW-UP</span><em>{progress}</em></button></nav><div className="sidebar-bottom"><div className="system-ready"><i /> TELEGRAM ACTIVE</div><div className="sidebar-version">MANTA NODE / SUPABASE</div></div></aside>
    <main className="terminal-main">
      <MapSurface reports={filtered} selected={selected} onSelect={setSelected} />
      <div className="privacy-badge"><ShieldCheck size={18} /><div><span>ANONYMOUS-ROMA</span><strong>ACTIVE SESSION</strong></div></div>
      <section className="metrics-module"><div className="module-header"><span>SYSTEM METRICS</span><BarChart3 size={15} /></div><div className="metric-cells"><div><span>RECEIVED</span><strong>{reports.length}</strong></div><div className="urgent"><span>URGENT</span><strong>{urgent}</strong></div><div><span>IN PROGRESS</span><strong>{progress}</strong></div><div><span>RESOLVED</span><strong>{resolved}</strong></div></div></section>
      <div className="territory-log"><span><i /> LIVE_SIGNAL_STREAM</span><p>&gt; SUPABASE CONNECTION... OK<br />&gt; TELEGRAM BOT... ACTIVE<br />&gt; TRACKING {reports.length} CIVIC SIGNALS<br />&gt; AUTO-REFRESH: {live ? "5 SEC" : "PAUSED"}<br /><b>_</b></p></div>
      <section className="signal-feed">
        <div className="module-header"><span>REAL-TIME SIGNAL FEED</span><Radio size={15} /></div>
        <div className="feed-toolbar"><div className="feed-search"><Search size={14} /><input ref={searchRef} aria-label="Buscar reportes" placeholder="FILTER SIGNALS" value={query} onChange={(event) => setQuery(event.target.value)} /></div><button className={`terminal-icon ${priority !== "Todas" ? "active-filter" : ""}`} onClick={() => setFilterOpen((current) => !current)} aria-label="Filtrar señales" aria-expanded={filterOpen}><Filter size={15} /></button></div>
        {filterOpen && <div className="feed-filter"><label htmlFor="priority-filter">PRIORITY</label><select id="priority-filter" value={priority} onChange={(event) => setPriority(event.target.value as ReportPriority | "Todas")}><option>Todas</option><option>Crítica</option><option>Alta</option><option>Media</option><option>Baja</option></select><button onClick={() => { setPriority("Todas"); setQuery(""); }}>CLEAR</button></div>}
        <div className="feed-list">{filtered.map((report) => <FeedCard key={report.id} report={report} selected={selected?.id === report.id} onSelect={() => setSelected(report)} />)}{filtered.length === 0 && <div className="feed-empty">NO SIGNALS MATCH FILTER</div>}</div>
        <div className="feed-actions"><button className="terminal-action" onClick={() => router.push("/reportar")}><Edit3 size={15} /> MANUAL LOG ENTRY</button><button className="terminal-action" onClick={exportReports}><Download size={15} /> EXPORT TERRITORY DATA</button></div>
      </section>
      <footer className="terminal-footer">AI CLASSIFICATION IS A HUMAN-REVIEW SUGGESTION · ROMA DOES NOT ISSUE OFFICIAL ALERTS</footer>
    </main>
    {selected && <DetailPanel report={selected} busy={busy} onClose={() => setSelected(undefined)} onReview={reviewSelected} onBrief={() => router.push(`/reporte/${encodeURIComponent(selected.id)}#brief`)} />}
    {notice && <div className="terminal-toast" role="status">{notice}</div>}
  </div>;
}
