import Link from "next/link";

interface InstagramPromoBlockProps {
  handle?: string;
  url?: string;
  text?: string;
}

export function InstagramPromoBlock({
  handle = "@crabsense",
  url = "https://instagram.com/crabsense",
  text = "Seguinos en Instagram",
}: InstagramPromoBlockProps) {
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full flex-col items-center justify-center gap-3 rounded-lg bg-foreground p-6 text-center text-background transition-opacity hover:opacity-90"
    >
      <InstagramIcon className="size-8" />
      <div>
        <p className="font-semibold">{text}</p>
        <p className="text-sm opacity-80">{handle}</p>
      </div>
    </Link>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
