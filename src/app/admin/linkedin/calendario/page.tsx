import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { LINKEDIN_TYPES, STATUS_LABELS, normalizeSlide, type LinkedInPost } from "@/lib/linkedin";
import { cn } from "@/lib/utils";
import { LinkedInNav } from "../linkedin-nav";
import { ScheduleForm } from "./schedule-form";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const STATUS_STYLE: Record<LinkedInPost["status"], string> = {
  draft: "border-dashed border-muted-foreground/40 bg-background",
  approved: "border-[#3e787e]/50 bg-[#3e787e]/10",
  published: "border-[#53539b] bg-[#53539b] text-white",
};

function todayAR() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
}

export default async function CalendarPage({ searchParams }: PageProps<"/admin/linkedin/calendario">) {
  const { m } = await searchParams;
  const today = todayAR();
  const month = typeof m === "string" && /^\d{4}-\d{2}$/.test(m) ? m : today.slice(0, 7);
  const [y, mo] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, mo - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // lunes = 0
  const prev = new Date(Date.UTC(y, mo - 2, 1)).toISOString().slice(0, 7);
  const next = new Date(Date.UTC(y, mo, 1)).toISOString().slice(0, 7);
  const monthLabel = first.toLocaleDateString("es-AR", { month: "long", year: "numeric", timeZone: "UTC" });
  const from = `${month}-01`;
  const to = `${month}-${String(daysInMonth).padStart(2, "0")}`;

  const supabase = await createClient();
  const [{ data: scheduled }, { data: unscheduled }] = await Promise.all([
    supabase
      .from("linkedin_posts")
      .select("*")
      .gte("scheduled_for", from)
      .lte("scheduled_for", to)
      .order("scheduled_time", { ascending: true, nullsFirst: false }),
    supabase
      .from("linkedin_posts")
      .select("*")
      .is("scheduled_for", null)
      .neq("status", "published")
      .order("updated_at", { ascending: false }),
  ]);

  const byDay = new Map<string, LinkedInPost[]>();
  for (const p of (scheduled ?? []) as LinkedInPost[]) {
    const list = byDay.get(p.scheduled_for!) ?? [];
    list.push({ ...p, slides: (p.slides ?? []).map((s) => normalizeSlide(s)) });
    byDay.set(p.scheduled_for!, list);
  }

  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`),
  ];
  while (cells.length % 7) cells.push(null);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <h1 className="text-2xl font-semibold">LinkedIn</h1>
        <LinkedInNav />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold capitalize">{monthLabel}</h2>
            <div className="flex items-center gap-1">
              <Button asChild variant="outline" size="icon" aria-label="Mes anterior">
                <Link href={`/admin/linkedin/calendario?m=${prev}`}>
                  <ChevronLeftIcon />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/linkedin/calendario">Hoy</Link>
              </Button>
              <Button asChild variant="outline" size="icon" aria-label="Mes siguiente">
                <Link href={`/admin/linkedin/calendario?m=${next}`}>
                  <ChevronRightIcon />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 overflow-hidden rounded-lg border">
            {WEEKDAYS.map((d) => (
              <div key={d} className="border-b bg-muted/40 px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                {d}
              </div>
            ))}
            {cells.map((day, i) => {
              const posts = day ? byDay.get(day) ?? [] : [];
              return (
                <div
                  key={i}
                  className={cn(
                    "group min-h-28 border-b border-r p-1.5 [&:nth-child(7n)]:border-r-0",
                    !day && "bg-muted/20",
                    day === today && "bg-[#53539b]/5"
                  )}
                >
                  {day && (
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "grid size-6 place-items-center rounded-full text-xs tabular-nums",
                          day === today && "bg-[#53539b] font-semibold text-white"
                        )}
                      >
                        {Number(day.slice(8))}
                      </span>
                      <Link
                        href={`/admin/linkedin/new?date=${day}`}
                        aria-label={`Nuevo post el ${day}`}
                        className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <PlusIcon className="size-3.5" />
                      </Link>
                    </div>
                  )}
                  <div className="mt-1 grid gap-1">
                    {posts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/admin/linkedin/${p.id}`}
                        className={cn("block rounded border px-1.5 py-1 text-[11px] leading-tight hover:opacity-80", STATUS_STYLE[p.status])}
                        title={`${p.title} · ${STATUS_LABELS[p.status]}`}
                      >
                        <span className="font-semibold">
                          {p.scheduled_time ? p.scheduled_time.slice(0, 5) + " · " : ""}
                          {LINKEDIN_TYPES[p.type]?.short}
                        </span>
                        <span className="line-clamp-2">{p.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {(["draft", "approved", "published"] as const).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <i className={cn("inline-block size-3 rounded border", STATUS_STYLE[s])} /> {STATUS_LABELS[s]}
              </span>
            ))}
          </div>
        </section>

        <aside className="grid content-start gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sin fecha</h2>
          {(unscheduled ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Todos los borradores tienen fecha.</p>
          )}
          {((unscheduled ?? []) as LinkedInPost[]).map((p) => (
            <div key={p.id} className="grid gap-2 rounded-lg border p-3">
              <Link href={`/admin/linkedin/${p.id}`} className="text-sm font-medium hover:underline">
                {p.title}
              </Link>
              <span className="text-xs text-muted-foreground">
                {LINKEDIN_TYPES[p.type]?.label} · {STATUS_LABELS[p.status]}
              </span>
              <ScheduleForm id={p.id} date={p.scheduled_for} time={p.scheduled_time} compact />
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
