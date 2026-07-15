import { NextResponse } from "next/server";

import { createReportHash } from "@/lib/report-hash";
import {
  discordResponse,
  parseReportCommand,
  redactDiscordReport,
  verifyDiscordSignature,
  type DiscordInteraction,
} from "@/lib/discord";

export const dynamic = "force-dynamic";

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

export async function POST(request: Request) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) {
    return jsonError("DISCORD_NOT_CONFIGURED", "DISCORD_PUBLIC_KEY no está configurada en el servidor.", 503);
  }

  const rawBody = await request.text();
  if (!verifyDiscordSignature(
    rawBody,
    request.headers.get("x-signature-timestamp"),
    request.headers.get("x-signature-ed25519"),
    publicKey,
  )) {
    return jsonError("INVALID_DISCORD_SIGNATURE", "La firma de Discord no es válida.", 401);
  }

  let interaction: DiscordInteraction;
  try {
    interaction = JSON.parse(rawBody) as DiscordInteraction;
  } catch {
    return jsonError("INVALID_JSON", "El payload de Discord debe ser JSON válido.", 400);
  }

  if (interaction.type === 1) return NextResponse.json({ type: 1 });

  const command = parseReportCommand(interaction);
  if (!command) {
    return NextResponse.json(discordResponse("Usa `/reportar` con zona y descripción.", true));
  }

  const redactedText = redactDiscordReport(command.description);
  const createdAt = new Date().toISOString();
  const reportHash = await createReportHash({ redactedText, zone: command.zone, category: null, createdAt });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "El reporte fue validado y protegido, pero Supabase no está configurado para persistirlo.",
      503,
    );
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/reports?select=id`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        source: "discord",
        zone: command.zone,
        text_redacted: redactedText,
        priority: command.urgency ?? null,
        status: "pending",
        report_hash: reportHash,
        created_at: createdAt,
        updated_at: createdAt,
      }),
      cache: "no-store",
    });

    if (!response.ok) return jsonError("REPORT_PERSISTENCE_FAILED", "No se pudo guardar el reporte en ROMA.", 502);
    const persisted = (await response.json()) as Array<{ id?: string }>;
    const id = persisted[0]?.id;
    return NextResponse.json(discordResponse(id ? `Reporte recibido en ROMA. Código: ${id}` : "Reporte recibido en ROMA.", true));
  } catch {
    return jsonError("SUPABASE_UNREACHABLE", "ROMA no pudo conectar con Supabase.", 502);
  }
}
