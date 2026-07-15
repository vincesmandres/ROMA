"use client";

import Link from "next/link";
import { Check, CircleHelp, LockKeyhole, MapPin, RotateCcw, Send, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import styles from "./reportar.module.css";

const categories = [
  ["", "Seleccionar categoría"],
  ["residuos_contaminacion", "Residuos / contaminación"],
  ["fuga_agua", "Fuga de agua"],
  ["infraestructura_danada", "Infraestructura dañada"],
  ["accesibilidad", "Accesibilidad"],
  ["riesgo_comunitario", "Riesgo comunitario"],
  ["servicios_publicos", "Servicios públicos"],
  ["ambiente_playas", "Ambiente / playas"],
  ["otro", "Otro"],
];

const urgencies = [
  ["baja", "BAJA"],
  ["media", "MEDIA"],
  ["alta", "ALTA"],
  ["critica", "CRÍTICA"],
];

export default function ReportarPage() {
  const [zone, setZone] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("media");
  const [shareLocation, setShareLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportId, setReportId] = useState("");

  function handleLocationToggle(checked: boolean) {
    if (!checked) { setShareLocation(false); setCoordinates(null); setLocationStatus(""); return; }
    if (!("geolocation" in navigator)) { setLocationStatus("Tu navegador no permite compartir ubicación."); return; }
    setShareLocation(true); setLocationStatus("Obteniendo ubicación aproximada...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({ latitude: Math.round(coords.latitude * 1000) / 1000, longitude: Math.round(coords.longitude * 1000) / 1000 });
        setLocationStatus("Ubicación aproximada lista (precisión reducida por privacidad). ");
      },
      () => { setShareLocation(false); setCoordinates(null); setLocationStatus("No se concedió acceso a la ubicación."); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }

  function resetForm() {
    setZone(""); setDescription(""); setCategory(""); setUrgency("media"); setShareLocation(false); setCoordinates(null); setLocationStatus(""); setError(""); setSubmitted(false); setReportId("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanZone = zone.trim();
    const cleanDescription = description.trim();

    if (!cleanZone || cleanZone.length < 3) {
      setError("Indica una zona reconocible de Manta.");
      return;
    }
    if (!cleanDescription || cleanDescription.length < 20) {
      setError("Describe el problema con al menos 20 caracteres.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const analysisResponse = await fetch("/api/reports/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zone: cleanZone,
          text: cleanDescription,
          source: "web_form",
          ...(category ? { reportedCategory: category } : {}),
          ...(urgency ? { perceivedUrgency: urgency } : {}),
        }),
      });
      const analysisPayload = await analysisResponse.json().catch(() => null);
      if (!analysisResponse.ok) {
        setError(analysisPayload?.error?.message ?? "No se pudo analizar la señal. Intenta nuevamente.");
        return;
      }
      const analysis = analysisPayload?.analysis;
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zone: cleanZone,
          text: cleanDescription,
          source: "web_form",
          reportedCategory: analysis?.category ?? (category || undefined),
          perceivedUrgency: analysis?.priority ?? (urgency || undefined),
          ...(coordinates ?? {}),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message ?? "No se pudo guardar la señal. Intenta nuevamente.");
        return;
      }
      setReportId(payload?.report?.id ?? `DEMO-RM-${String(zone.length + description.length).padStart(4, "0")}`);
      setSubmitted(true);
    } catch {
      setError("No fue posible conectar con el servidor. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.brand}>ROMA <span>/ CIUDADANO</span></div>
          <div className={styles.topLinks}>
            <a className={styles.telegramLink} href="https://t.me/RomaReporteBot" target="_blank" rel="noreferrer">ABRIR TELEGRAM</a>
            <Link className={styles.backLink} href="/">← VOLVER AL PANEL</Link>
          </div>
        </header>

        <section className={styles.intro}>
          <div>
            <span className={styles.eyebrow}>{"// NUEVA SEÑAL CIUDADANA"}</span>
            <h1>Reporta lo que necesita atención en Manta.</h1>
            <p>Comparte una situación local para que pueda ser clasificada, revisada y convertida en una acción concreta.</p>
          </div>
          <aside className={styles.introNote}>
            <span className={styles.meta}>PROTOCOLO ROMA_01</span>
            <strong>SEÑAL PRIVADA / ACCIÓN PÚBLICA</strong>
            <p>No necesitas crear una cuenta. Evita incluir nombres, teléfonos o datos que identifiquen a una persona.</p>
          </aside>
        </section>

        <div className={styles.formGrid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}><span>REGISTRAR REPORTE</span><span>INPUT_CHANNEL: WEB</span></div>
            <form className={styles.formBody} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="zone">ZONA O REFERENCIA <span className={styles.optional}>REQUERIDO</span></label>
                <input className={styles.input} id="zone" value={zone} onChange={(event) => setZone(event.target.value)} placeholder="Ej. Playa Murciélago, Tarqui" maxLength={100} />
                <p className={styles.fieldHint}>Usa un barrio, sector, calle principal o punto de referencia. No escribas tu dirección exacta.</p>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="description">¿QUÉ ESTÁ PASANDO? <span className={styles.optional}>REQUERIDO</span></label>
                <textarea className={styles.textarea} id="description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe el problema, desde cuándo ocurre y a quién podría afectar..." maxLength={1200} />
                <p className={styles.fieldHint}>{description.length}/1200 caracteres · No incluyas nombres, números de teléfono ni documentos.</p>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="category">CATEGORÍA <span className={styles.optional}>OPCIONAL</span></label>
                <select className={styles.select} id="category" value={category} onChange={(event) => setCategory(event.target.value)}>
                  {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>

              <fieldset className={styles.field}>
                <legend className={styles.fieldLabel}>URGENCIA PERCIBIDA <span className={styles.optional}>OPCIONAL</span></legend>
                <div className={styles.urgencyGroup}>
                  {urgencies.map(([value, label]) => <div className={styles.urgencyOption} key={value}><input id={`urgency-${value}`} type="radio" name="urgency" value={value} checked={urgency === value} onChange={() => setUrgency(value)} /><label htmlFor={`urgency-${value}`}>{label}</label></div>)}
                </div>
              </fieldset>

              <div className={`${styles.field} ${styles.locationBox}`}>
                <label className={styles.locationToggle} htmlFor="share-location"><input id="share-location" type="checkbox" checked={shareLocation} onChange={(event) => handleLocationToggle(event.target.checked)} /><span><strong><MapPin size={13} aria-hidden="true" /> UBICACIÓN APROXIMADA</strong><small>Opcional. Solo se usaría para agrupar reportes por zona, nunca para mostrar tu punto exacto.</small>{locationStatus && <small className={styles.locationStatus}>{locationStatus}</small>}</span></label>
              </div>

              {error && <p className={styles.error} role="alert">{error}</p>}
              <div className={styles.privacy}><ShieldCheck size={19} aria-hidden="true" /><div><span className={styles.privacyLabel}>PRIVACIDAD COMO CONFIGURACIÓN BASE</span><p>Este prototipo no solicita nombre, teléfono, cédula ni login. La clasificación de IA será una sugerencia para revisión humana.</p></div></div>
              <button className={styles.submit} type="submit" disabled={submitting}><Send size={15} aria-hidden="true" /> {submitting ? "PROCESANDO..." : "ENVIAR SEÑAL PRIVADA"}</button>
            </form>
          </section>

          <aside className={styles.side}>
            {submitted ? <div className={styles.success} role="status"><Check size={20} aria-hidden="true" /><div><strong>SEÑAL REGISTRADA</strong><p>El reporte fue validado, redactado y enviado al flujo de revisión de ROMA.</p><code>{reportId}</code><div className={styles.successActions}><button type="button" onClick={resetForm}><RotateCcw size={13} /> NUEVA SEÑAL</button><Link href="/">VER PANEL</Link></div></div></div> : null}
            <section className={`${styles.panel} ${styles.sidePanel}`}><h2>ANTES DE ENVIAR</h2><ul><li><span>01</span><div>Cuenta lo observable: qué ocurre, dónde y desde cuándo.</div></li><li><span>02</span><div>Elige una urgencia según el posible impacto, no según la identidad de quien reporta.</div></li><li><span>03</span><div>ROMA organizará la señal para que una persona pueda revisarla.</div></li></ul></section>
            <section className={`${styles.panel} ${styles.sidePanel} ${styles.demoNote}`}><h2><CircleHelp size={14} aria-hidden="true" /> CANALES ACTIVOS</h2><p className={styles.fieldHint}>Envía desde esta página o cuéntale el problema y la zona directamente a <a href="https://t.me/RomaReporteBot" target="_blank" rel="noreferrer">@RomaReporteBot</a>.</p></section>
            <section className={`${styles.panel} ${styles.sidePanel}`}><h2><LockKeyhole size={14} aria-hidden="true" /> DATOS QUE NO PEDIMOS</h2><p className={styles.fieldHint}>Nombre · teléfono · cédula · dirección exacta · cuenta de usuario.</p></section>
          </aside>
        </div>
        <footer className={styles.footer}>ROMA / RED DE OBSERVACIÓN MANTA ANÓNIMA · DATOS CIUDADANOS SIN VIGILANCIA</footer>
      </div>
    </main>
  );
}
