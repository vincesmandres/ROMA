"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  Clock3,
  Hash,
  MapPin,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { reports, type Report } from "@/lib/demo-data";
import {
  type ReportAnalysisOutput,
  type RomaCategory,
  type RomaPriority,
  isRomaCategory,
  isRomaPriority,
} from "@/lib/roma-contracts";
import styles from "./page.module.css";

type DetailPageProps = {
  params: Promise<{ id: string }>;
};

const categoryMap: Record<string, RomaCategory> = {
  "Residuos y contaminación": "residuos_contaminacion",
  "Fuga de agua": "fuga_agua",
  Accesibilidad: "accesibilidad",
  "Infraestructura dañada": "infraestructura_danada",
  "Ambiente y playas": "ambiente_playas",
};

const priorityMap: Record<Report["priority"], RomaPriority> = {
  Crítica: "critica",
  Alta: "alta",
  Media: "media",
  Baja: "baja",
};

const categoryLabels: Record<RomaCategory, string> = {
  residuos_contaminacion: "RESIDUOS / CONTAMINACIÓN",
  fuga_agua: "FUGA DE AGUA",
  infraestructura_danada: "INFRAESTRUCTURA DAÑADA",
  accesibilidad: "ACCESIBILIDAD",
  riesgo_comunitario: "RIESGO COMUNITARIO",
  servicios_publicos: "SERVICIOS PÚBLICOS",
  ambiente_playas: "AMBIENTE / PLAYAS",
  otro: "OTRO",
};

const priorityLabels: Record<RomaPriority, string> = {
  critica: "CRÍTICA",
  alta: "ALTA",
  media: "MEDIA",
  baja: "BAJA",
};

const priorityClass: Record<RomaPriority, string> = {
  critica: styles.critical,
  alta: styles.high,
  media: styles.medium,
  baja: styles.low,
};

const statusLabels: Record<Report["status"], string> = {
  Pendiente: "PENDIENTE",
  "En revisión": "EN REVISIÓN",
  Escalado: "ESCALADO",
  Resuelto: "RESUELTO",
};

function buildAnalysis(report: Report): ReportAnalysisOutput {
  const categoryCandidate = categoryMap[report.category];
  const category = isRomaCategory(categoryCandidate) ? categoryCandidate : "otro";
  const priorityCandidate = priorityMap[report.priority];
  const priority = isRomaPriority(priorityCandidate) ? priorityCandidate : "media";

  return {
    category,
    priority,
    summary: report.summary,
    risks: [report.risk, "Requiere verificación humana en sitio"],
    recommended_action: `Verificar el punto en ${report.zone}, documentar el hallazgo y coordinar una respuesta con la organización responsable.`,
    whatsapp_message: `ROMA registra una señal en ${report.zone}: ${report.title}. Se recomienda verificación humana y seguimiento operativo.`,
    confidence: priority === "critica" ? 0.91 : priority === "alta" ? 0.87 : 0.82,
  };
}

function hashFor(report: Report) {
  return `sha256:demo-${report.id.toLowerCase()}-${report.zone.toLowerCase().replaceAll(" ", "-")}`;
}

export default function ReportDetailPage({ params }: DetailPageProps) {
  const { id } = use(params);
  const [copied, setCopied] = useState(false);
  const report = reports.find((item) => item.id.toLowerCase() === decodeURIComponent(id).toLowerCase());

  if (!report) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <Link className={styles.brand} href="/">ROMA</Link>
          <span className={styles.headerStatus}><i /> SYSTEM READY</span>
        </header>
        <section className={styles.notFound}>
          <span className={styles.eyebrow}>REPORT LOOKUP / 404</span>
          <h1>Señal no encontrada</h1>
          <p>El identificador solicitado no coincide con un reporte disponible en este nodo demo.</p>
          <Link className={styles.primaryAction} href="/">VOLVER AL DASHBOARD <ArrowLeft size={15} /></Link>
        </section>
      </main>
    );
  }

  const analysis = buildAnalysis(report);
  const shareReport = async () => {
    try {
      await navigator.clipboard.writeText(analysis.whatsapp_message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandLine}>
          <Link className={styles.brand} href="/">ROMA</Link>
          <span className={styles.path}>/ OPS / REPORT / {report.id}</span>
        </div>
        <div className={styles.headerStatus}><i /> SYSTEM READY <ShieldCheck size={15} /></div>
      </header>

      <div className={styles.shell}>
        <Link className={styles.backLink} href="/"><ArrowLeft size={15} /> VOLVER A SEÑALES</Link>
        <section className={styles.intro}>
          <div>
            <span className={styles.eyebrow}>REPORT DETAIL / MANTA NODE</span>
            <h1>{report.id}</h1>
            <p>Revisión humana de una señal ciudadana anonimizada.</p>
          </div>
          <div className={styles.statusStack}>
            <span className={`${styles.statusTag} ${styles.statusReview}`}>{statusLabels[report.status]}</span>
            <span className={styles.sourceTag}>{report.source.toUpperCase()} / {report.createdAt}</span>
          </div>
        </section>

        <section className={styles.grid}>
          <div className={styles.mainColumn}>
            <article className={styles.panel}>
              <div className={styles.panelHeader}><span className={styles.eyebrow}>CITIZEN SIGNAL</span><span className={styles.redacted}><CheckCircle2 size={14} /> PERSONAL DATA OMITTED</span></div>
              <div className={styles.panelBody}>
                <div className={styles.location}><MapPin size={15} /> {report.zone} <span>/</span> {report.category}</div>
                <h2>{report.title}</h2>
                <p className={styles.reportText}>{report.summary}</p>
                <div className={styles.signalMeta}><span><Clock3 size={14} /> {report.age}</span><span><Sparkles size={14} /> SOURCE: {report.source.toUpperCase()}</span></div>
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}><span className={styles.eyebrow}>AI ANALYSIS / HUMAN REVIEW REQUIRED</span><Sparkles size={16} className={styles.blueIcon} /></div>
              <div className={styles.panelBody}>
                <div className={styles.analysisTop}>
                  <div><span className={styles.fieldLabel}>CATEGORY</span><strong>{categoryLabels[analysis.category]}</strong></div>
                  <div><span className={styles.fieldLabel}>PRIORITY</span><strong className={`${styles.priorityTag} ${priorityClass[analysis.priority]}`}>{priorityLabels[analysis.priority]}</strong></div>
                  <div><span className={styles.fieldLabel}>CONFIDENCE</span><strong>{Math.round(analysis.confidence * 100)}%</strong></div>
                </div>
                <div className={styles.section}><span className={styles.fieldLabel}>SUMMARY</span><p>{analysis.summary}</p></div>
                <div className={styles.section}><span className={styles.fieldLabel}>RISKS DETECTED</span><ul>{analysis.risks.map((risk) => <li key={risk}><TriangleAlert size={14} /> {risk}</li>)}</ul></div>
                <div className={styles.section}><span className={styles.fieldLabel}>RECOMMENDED ACTION</span><p>{analysis.recommended_action}</p></div>
              </div>
            </article>
          </div>

          <aside className={styles.sideColumn}>
            <article className={styles.panel}>
              <div className={styles.panelHeader}><span className={styles.eyebrow}>ACTION BRIEF</span><span className={styles.briefState}>DRAFT</span></div>
              <div className={styles.panelBody}>
                <p className={styles.briefText}>{analysis.whatsapp_message}</p>
                <button className={styles.primaryAction} type="button" onClick={shareReport}><Clipboard size={15} /> {copied ? "COPIADO" : "COPIAR MENSAJE"}</button>
                <p className={styles.humanNote}>La clasificación es una sugerencia. Una persona responsable debe validar el punto antes de actuar o comunicarlo como hecho confirmado.</p>
              </div>
            </article>
            <article className={styles.panel}>
              <div className={styles.panelHeader}><span className={styles.eyebrow}>TRACEABILITY</span><Hash size={16} className={styles.blueIcon} /></div>
              <div className={styles.panelBody}>
                <span className={styles.fieldLabel}>REPORT HASH</span>
                <code className={styles.hash}>{hashFor(report)}</code>
                <p className={styles.hashNote}>Identificador de demo para evidenciar que el registro redacted permanece trazable.</p>
              </div>
            </article>
          </aside>
        </section>
        <footer className={styles.footer}>ROMA / DATOS CIUDADANOS SIN VIGILANCIA / AI OUTPUT REQUIRES HUMAN REVIEW</footer>
      </div>
    </main>
  );
}
