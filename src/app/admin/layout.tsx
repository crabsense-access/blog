import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboardIcon, Newspaper, FolderIcon, TagIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/posts", label: "Notas", icon: Newspaper },
  { href: "/admin/categories", label: "Categorías", icon: FolderIcon },
  { href: "/admin/tags", label: "Tags", icon: TagIcon },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El middleware ya redirige a /login si no hay usuario, pero validamos
  // acá también el rol de admin/editor contra la tabla profiles.
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <aside className="flex flex-col justify-between border-r bg-muted/20 p-4">
        <div>
          <div className="mb-6 px-2">
            <p className="text-sm font-semibold">Admin del blog</p>
            <p className="text-xs text-muted-foreground">
              {profile?.full_name ?? user.email}
            </p>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <SignOutButton />
      </aside>
      <main className="p-8">{children}</main>
    </div>
  );
}
