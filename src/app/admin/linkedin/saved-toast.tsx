"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

// createLinkedInPost redirige a /admin/linkedin/[id]?saved=1: muestra el
// toast al llegar y limpia el parámetro para que no reaparezca al refrescar.
export function LinkedInSavedToast() {
  const router = useRouter();
  const pathname = usePathname();
  const saved = useSearchParams().get("saved");

  useEffect(() => {
    if (!saved) return;
    toast.success("Post guardado", { icon: <CircleCheck className="size-4" />, duration: 2500 });
    router.replace(pathname);
  }, [saved, router, pathname]);

  return null;
}
