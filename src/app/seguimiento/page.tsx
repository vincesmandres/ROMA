"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import styles from "./seguimiento.module.css";

type FollowUpStatus = "PENDIENTE" | "EN CURSO" | "BLOQUEADO" | "COMPLETADO";

type FollowUpItem = {
  id: string;
  reportId: string;
  action: string;
  zone: string;
  owner: string;
  status: FollowUpStatus;
  due: string;
  dueLabel: string;
  priority: "CRITICA" | "ALTA" | "MEDIA";
  note: string;
};

const followUps: FollowUpItem[] = [
  {
    id: "ACT-0084",
    reportId: "ROMA-0247",
    action: "Verificar fuga y coordinar cierre de valvula",
    zone: "Centro de Manta",
    owner: "M. Velez",
    status: "EN CURSO",
    due: "2026-07-15",
    dueLabel: "HOY / 14:00",
    priority: "CRITICA",
    note: "Confirmar afectacion de calzada y registrar evidencia de visita.",
  },
  {
    id: "ACT-0083",
    reportId: "ROMA-0248",
    action: "Coordinar limpieza del acceso principal",
    zone: "Playa Murcielago",
    owner: "A. Cedeño",
    status: "PENDIENTE",
    due: "2026-07-15",
    dueLabel: "HOY / 16:30",
    priority: "ALTA",
    note: "Validar volumen de residuos antes de escalar a servicios publicos.",
  },
  {
    id: "ACT-0082",
    reportId: "ROMA-0245",
    action: "Inspeccionar bache y definir prioridad de reparacion",
    zone: "Los Esteros",
    owner: "J. Mendoza",
    status: "BLOQUEADO",
    due: "2026-07-16",
    dueLabel: "MAÑANA / 09:00",
    priority: "ALTA",
    note: "Pendiente confirmar responsable territorial para visita en sitio.",
  },
  {
    id: "ACT-0081",
    reportId: "ROMA-0246",
    action: "Documentar bloqueo de rampa y contactar movilidad",
    zone: "Tarqui",
    owner: "S. Zambrano",
    status: "PENDIENTE",
    due: "2026-07-17",
    dueLabel: "17 JUL / 11:00",
    priority: "MEDIA",
    note: "Solicitar fotografia del punto sin capturar rostros ni placas.",
  },
  {
    id: "ACT-0080",
    reportId: "ROMA-0244",
    action: "Cerrar seguimiento de olor cerca del estero",
    zone: "San Mateo",
    owner: "M. Velez",
    status: "COMPLETADO",
    due: "2026-07-14",
    dueLabel: "14 JUL / CERRADO",
    priority: "MEDIA",
    note: "Revision comunitaria completada; sin nuevos reportes en la zona.",
  },
];

const statusClass: Record<FollowUpStatus, string> = {
  PENDIENTE: styles.pending,
  "EN CURSO": styles.inProgress,
  BLOQUEADO: styles.blocked,
  COMPLETADO: styles.completed,
};

const priorityClass: Record<FollowUpItem["priority"], string> = {
  CRITICA: styles.critical,
  ALTA: styles.high,
  MEDIA: styles.medium,
};

export default function SeguimientoPage() {
  const [filter, setFilter] = useState<FollowUpStatus | "TODAS">("TODAS");
  const [selectedId, setSelectedId] = useState(followUps[0].id);

  const visibleItems = useMemo(
    () => filter === "TODAS" ? followUps : followUps.filter((item) => item.status === filter),
    [filter],
  );

  const selected = followUps.find((item) => item.id === selectedId) ?? followUps[0];
  const pendingCount = followUps.filter((item) => item.status !== "COMPLETADO").length;
  const blockedCount = followUps.filter((item) => item.status === "BLOQUEADO").length;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandLine}>
          <span className={styles.brand}>ROMA</span>
          <span className={styles.path}>/ OPS / FOLLOW-UP</span>
        </div>
        <div className={styles.headerStatus}><i /> SYSTEM READY <ShieldCheck size={15} /></div>
      </header>

      <div className={styles.shell}>
        <section className={styles.intro}>
          <div>
            <span className={styles.eyebrow}>CASE MANAGEMENT / MANTA NODE</span>
            <h1>Seguimiento operativo</h1>
            <p>Convierte cada señal revisada en una accion visible, asignada y trazable.</p>
          </div>
          <div className={styles.liveBadge}><CircleDot size={15} /> LIVE QUEUE</div>
        </section>

        <section className={styles.summaryGrid} aria-label="Resumen de acciones">
          <div className={styles.summaryCard}><span>ACCIONES ABIERTAS</span><strong>{pendingCount.toString().padStart(2, "0")}</strong><small>requieren seguimiento</small></div>
          <div className={`${styles.summaryCard} ${styles.summaryAlert}`}><span>BLOQUEADAS</span><strong>{blockedCount.toString().padStart(2, "0")}</strong><small>necesitan resolver dependencia</small></div>
          <div className={styles.summaryCard}><span>PROXIMO VENCIMIENTO</span><strong>HOY</strong><small>2 acciones antes de 16:30</small></div>
        </section>

        <section className={styles.workspace}>
          <div className={styles.listPanel}>
            <div className={styles.panelHeader}>
              <div><span className={styles.eyebrow}>ACTION QUEUE</span><h2>Acciones pendientes</h2></div>
              <label className={styles.selectWrap}>
                <span className={styles.srOnly}>Filtrar acciones por estado</span>
                <select value={filter} onChange={(event) => setFilter(event.target.value as FollowUpStatus | "TODAS")}>
                  <option value="TODAS">TODAS</option>
                  <option value="PENDIENTE">PENDIENTES</option>
                  <option value="EN CURSO">EN CURSO</option>
                  <option value="BLOQUEADO">BLOQUEADAS</option>
                  <option value="COMPLETADO">COMPLETADAS</option>
                </select>
                <ChevronDown size={14} />
              </label>
            </div>
            <div className={styles.tableHead}><span>ACCION / REPORTE</span><span>RESPONSABLE</span><span>ESTADO</span><span>FECHA</span></div>
            <div className={styles.actionList}>
              {visibleItems.map((item) => (
                <button className={`${styles.actionRow} ${selectedId === item.id ? styles.selected : ""}`} key={item.id} onClick={() => setSelectedId(item.id)}>
                  <span className={styles.actionCell}>
                    <b>{item.action}</b>
                    <small>{item.id} / {item.reportId} / {item.zone.toUpperCase()}</small>
                  </span>
                  <span className={styles.personCell}><UserRound size={14} /> {item.owner}</span>
                  <span className={`${styles.statusTag} ${statusClass[item.status]}`}>{item.status}</span>
                  <span className={styles.dateCell}><CalendarClock size={14} /> {item.dueLabel}</span>
                </button>
              ))}
              {visibleItems.length === 0 && <div className={styles.empty}>NO HAY ACCIONES EN ESTE FILTRO</div>}
            </div>
          </div>

          <aside className={styles.detailPanel} aria-label="Detalle de accion seleccionada">
            <div className={styles.panelHeader}><div><span className={styles.eyebrow}>SELECTED ACTION</span><h2>{selected.id}</h2></div><span className={`${styles.statusTag} ${statusClass[selected.status]}`}>{selected.status}</span></div>
            <div className={styles.detailBody}>
              <span className={`${styles.priorityTag} ${priorityClass[selected.priority]}`}>{selected.priority} PRIORITY</span>
              <h3>{selected.action}</h3>
              <p className={styles.detailNote}>{selected.note}</p>
              <dl className={styles.metaList}>
                <div><dt><MapPin size={14} /> ZONA</dt><dd>{selected.zone}</dd></div>
                <div><dt><UserRound size={14} /> RESPONSABLE</dt><dd>{selected.owner}</dd></div>
                <div><dt><Clock3 size={14} /> FECHA LIMITE</dt><dd>{selected.dueLabel}</dd></div>
              </dl>
              <div className={styles.progressBlock}><div><span>TRACKING STATUS</span><strong>{selected.status === "COMPLETADO" ? "100%" : selected.status === "EN CURSO" ? "60%" : "20%"}</strong></div><div className={styles.progress}><i style={{ width: selected.status === "COMPLETADO" ? "100%" : selected.status === "EN CURSO" ? "60%" : "20%" }} /></div></div>
              <a className={styles.openReport} href={`/reporte/${selected.reportId}`}><span>ABRIR REPORTE {selected.reportId}</span><ArrowUpRight size={16} /></a>
              <div className={styles.privacyNote}><CheckCircle2 size={15} /> DATOS PERSONALES OMITIDOS EN ESTA VISTA</div>
            </div>
          </aside>
        </section>
        <footer className={styles.footer}>ROMA / AI SUGGESTIONS REQUIRE HUMAN REVIEW / LAST SYNC: 15 JUL 2026 09:42</footer>
      </div>
    </main>
  );
}
