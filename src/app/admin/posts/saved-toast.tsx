"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

// El post-form redirige acá con ?saved=1 tras un guardado exitoso (createPost/
// updatePost usan redirect() en el server, así que el toast no puede
// dispararse desde el propio form — se muestra al llegar a esta página en
// su lugar) y esto limpia el parámetro para que no reaparezca en un refresh.
export function SavedToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const saved = searchParams.get("saved");

  useEffect(() => {
    if (!saved) return;
    toast.success("Cambios guardados", {
      icon: <CircleCheck className="size-4" />,
      duration: 2500,
    });
    router.replace("/admin/posts");
  }, [saved, router]);

  return null;
}
