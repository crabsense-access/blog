import Link from "next/link";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex max-w-7xl mx-auto items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors">
            Crabsense
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <Button className="bg-blue-600 hover:bg-blue-700">
            Contactar
          </Button>
        </div>
      </div>
    </header>
  );
}
