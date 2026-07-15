import { createPublicKey, verify as verifySignature } from "node:crypto";

export const DISCORD_PING = 1;
export const DISCORD_APPLICATION_COMMAND = 2;
export const DISCORD_CHANNEL_MESSAGE = 4;

export type DiscordInteractionOption = {
  name?: unknown;
  type?: unknown;
  value?: unknown;
  options?: unknown;
};

export type DiscordInteraction = {
  type?: unknown;
  data?: {
    name?: unknown;
    options?: unknown;
  };
};

export type DiscordReportCommand = {
  zone: string;
  description: string;
  urgency?: string;
};

const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");
const MAX_ZONE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 5000;
const ALLOWED_URGENCY = new Set(["baja", "media", "alta", "critica"]);

export function verifyDiscordSignature(
  body: string,
  timestamp: string | null,
  signature: string | null,
  publicKey: string | undefined,
): boolean {
  if (!publicKey || !timestamp || !signature) return false;

  try {
    const keyBytes = Buffer.from(publicKey.trim(), "hex");
    const signatureBytes = Buffer.from(signature.trim(), "hex");
    if (keyBytes.length !== 32 || signatureBytes.length !== 64) return false;

    const key = createPublicKey({
      key: Buffer.concat([ED25519_SPKI_PREFIX, keyBytes]),
      format: "der",
      type: "spki",
    });

    return verifySignature(null, Buffer.from(timestamp + body), key, signatureBytes);
  } catch {
    return false;
  }
}

function getOptions(interaction: DiscordInteraction): DiscordInteractionOption[] {
  if (!Array.isArray(interaction.data?.options)) return [];
  return interaction.data.options.filter(
    (option): option is DiscordInteractionOption => Boolean(option && typeof option === "object"),
  );
}

export function parseReportCommand(interaction: DiscordInteraction): DiscordReportCommand | null {
  if (interaction.type !== DISCORD_APPLICATION_COMMAND || interaction.data?.name !== "reportar") return null;

  const values = new Map(
    getOptions(interaction)
      .filter((option) => typeof option.name === "string")
      .map((option) => [option.name as string, typeof option.value === "string" ? option.value.trim() : ""]),
  );

  const zone = values.get("zone") ?? "";
  const description = values.get("description") ?? "";
  const requestedUrgency = values.get("urgency") || undefined;
  const urgency = requestedUrgency && ALLOWED_URGENCY.has(requestedUrgency) ? requestedUrgency : undefined;

  if (!zone || zone.length > MAX_ZONE_LENGTH || !description || description.length > MAX_DESCRIPTION_LENGTH) return null;
  return { zone, description, ...(urgency ? { urgency } : {}) };
}

export function redactDiscordReport(value: string): string {
  return value
    .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/gi, "[correo oculto]")
    .replace(/(?:\+?593|0)?9\d{8}\b/g, "[telefono oculto]")
    .replace(/\b\d{10}\b/g, "[identificador oculto]")
    .replace(/\b(?:c\.c\.?|cedula|c[eé]dula|dni|id)\s*[:#-]?\s*[\d.-]{6,}\b/gi, "[identificador oculto]");
}

export function discordResponse(content: string, ephemeral = false) {
  return {
    type: DISCORD_CHANNEL_MESSAGE,
    data: {
      content,
      ...(ephemeral ? { flags: 64 } : {}),
    },
  };
}
