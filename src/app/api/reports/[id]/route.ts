import { NextResponse } from "next/server";

import type { ReportRow } from "@/lib/reports/types";
import { createServerSupabaseClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

const statusMap = {
  Pendiente: "pending",
  "En revisión": "in_review",
  Escalado: "escalated",
  Resuelto: "resolved",
} as const;

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json().catch(() => null) as { status?: keyof typeof statusMap } | null;
  if (!body?.status || !(body.status in statusMap)) {
    return NextResponse.json({ ok: false, error: { message: "El estado solicitado no es válido." } }, { status: 422 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const client = createServerSupabaseClient();
  const { data, error } = await client.from<ReportRow>("reports").select({
    select: "id,reference_code",
    filters: { reference_code: decodeURIComponent(id) },
    limit: 1,
  });

  if (error || !data?.[0]?.id) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const updated = await client.from<ReportRow>("reports").update(
    { status: statusMap[body.status] } as Partial<ReportRow>,
    { id: data[0].id },
  );
  if (updated.error) {
    return NextResponse.json({ ok: false, error: { message: "No fue posible guardar el cambio de estado." } }, { status: 502 });
  }

  return NextResponse.json({ ok: true, mode: "supabase" });
}
