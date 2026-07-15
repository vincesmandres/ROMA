import { createHash } from "node:crypto";

import type { ReportHashInput } from "./roma-contracts";

/**
 * Returns a lowercase SHA-256 digest for server-side traceability.
 * Keep this module out of client components: the Node fallback is server-only.
 */
export async function sha256(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const subtle = globalThis.crypto?.subtle;

  if (subtle) {
    const digest = await subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  return createHash("sha256").update(encoded).digest("hex");
}

/** Builds the canonical payload used to hash a redacted report. */
export function serializeReportHashInput(input: ReportHashInput): string {
  return JSON.stringify([
    input.redactedText,
    input.zone,
    input.category,
    input.createdAt,
  ]);
}

export async function createReportHash(input: ReportHashInput): Promise<string> {
  return sha256(serializeReportHashInput(input));
}
