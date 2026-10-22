"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setPostSchedule } from "./actions";

export function ScheduleForm({
  id,
  date,
  time,
  compact,
}: {
  id: string;
  date: string | null;
  time: string | null;
  compact?: boolean;
}) {
  const [d, setD] = useState(date ?? "");
  const [t, setT] = useState(time?.slice(0, 5) ?? "");
  const [pending, start] = useTransition();
  const dirty = d !== (date ?? "") || t !== (time?.slice(0, 5) ?? "");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="date"
        aria-label="Fecha de publicación"
        value={d}
        onChange={(e) => setD(e.target.value)}
        className={compact ? "h-8 w-[9.5rem] text-xs" : "w-40"}
      />
      <Input
        type="time"
        aria-label="Hora de publicación"
        value={t}
        onChange={(e) => setT(e.target.value)}
        className={compact ? "h-8 w-[6.5rem] text-xs" : "w-28"}
      />
      <Button
        type="button"
        size="sm"
        variant={dirty ? "default" : "outline"}
        disabled={pending || !dirty}
        onClick={() =>
          start(async () => {
            await setPostSchedule(id, d || null, t || null);
            toast.success(d ? "Fecha guardada" : "Fecha quitada");
          })
        }
      >
        {pending ? "Guardando…" : "Guardar"}
      </Button>
    </div>
  );
}
