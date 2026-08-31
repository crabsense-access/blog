import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface TagPillProps {
  children: ReactNode;
  href?: string;
  tone?: "default" | "category";
  color?: string | null;
}

export function TagPill({ children, href, tone = "default", color }: TagPillProps) {
  const customColor = tone === "category" ? color : null;

  const content = (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-3 py-1 text-[0.65rem] uppercase transition-colors",
        tone === "category"
          ? customColor
            ? undefined
            : "bg-primary text-white hover:bg-primary/90"
          : "bg-neutral-200 text-muted-foreground hover:bg-muted-foreground hover:text-muted"
      )}
      style={customColor ? { backgroundColor: customColor, color: "#ffffff" } : undefined}
    >
      {children}
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
