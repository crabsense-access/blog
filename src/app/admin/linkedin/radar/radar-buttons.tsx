"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon, RadarIcon, SearchIcon, PenLineIcon, XIcon, Undo2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createPostFromNews, fetchRelated, scanNow, setNewsItemStatus } from "./actions";

export function ScanNowButton() {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await scanNow();
          if (res.ok) toast.success(res.message);
          else toast.error(res.message);
          router.refresh();
        })
      }
    >
      {pending ? <Loader2Icon className="animate-spin" /> : <RadarIcon />}
      {pending ? "Buscando… (2–4 min)" : "Buscar novedades ahora"}
    </Button>
  );
}

export function RelatedButton({ itemId, hasLinks }: { itemId: string; hasLinks: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await fetchRelated(itemId);
          if (res.ok) toast.success(res.message);
          else toast.error(res.message);
          router.refresh();
        })
      }
    >
      {pending ? <Loader2Icon className="animate-spin" /> : <SearchIcon />}
      {pending ? "Buscando en Google AR + EN…" : hasLinks ? "Buscar más referentes" : "Buscar referentes"}
    </Button>
  );
}

export function CreatePostButton({ itemId, existingPostId }: { itemId: string; existingPostId: string | null }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      onClick={() => start(async () => createPostFromNews(itemId))}
    >
      {pending ? <Loader2Icon className="animate-spin" /> : <PenLineIcon />}
      {existingPostId ? "Abrir post" : "Crear post"}
    </Button>
  );
}

export function DiscardButton({ itemId, discarded }: { itemId: string; discarded: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => start(async () => setNewsItemStatus(itemId, discarded ? "new" : "discarded"))}
    >
      {discarded ? <Undo2Icon /> : <XIcon />}
      {discarded ? "Recuperar" : "Descartar"}
    </Button>
  );
}
