"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/linkedin", label: "Posts" },
  { href: "/admin/linkedin/radar", label: "Radar de novedades" },
  { href: "/admin/linkedin/calendario", label: "Calendario" },
];

export function LinkedInNav() {
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/admin/linkedin"
      ? pathname === href || (/^\/admin\/linkedin\/[^/]+/.test(pathname) && !/radar|calendario/.test(pathname))
      : pathname.startsWith(href);

  return (
    <nav className="flex gap-1 border-b">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
            active(t.href)
              ? "border-[#53539b] text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
