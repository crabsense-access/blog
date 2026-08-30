import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          Crabsense
        </Link>
        <nav className="flex gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground/70">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
