import { NextResponse, type NextRequest } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { runRadarScan } from "@/lib/radar";

// Lo dispara Vercel Cron cada 3 días (ver vercel.json). Vercel manda
// "Authorization: Bearer <CRON_SECRET>" cuando la variable CRON_SECRET está
// configurada en el proyecto; sin ese header la ruta responde 401.
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await runRadarScan(createServiceRoleClient(), "cron");
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
