import Link from "next/link";

import { cn } from "@/lib/utils";

interface HighlightBannerProps {
  title: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  className?: string;
}

export function HighlightBanner({ title, imageUrl, linkUrl, className }: HighlightBannerProps) {
  const content = (
    <div
      className={cn(
        "relative flex h-40 items-start justify-start overflow-hidden rounded-lg p-6",
        imageUrl ? "bg-cover bg-center" : "bg-primary",
        className
      )}
      style={
        imageUrl
          ? {
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${imageUrl}')`,
            }
          : undefined
      }
    >
      <h3
        className={cn(
          "text-2xl font-bold md:text-3xl",
          imageUrl ? "text-white" : "text-primary-foreground"
        )}
      >
        {title}
      </h3>
    </div>
  );

  if (linkUrl) {
    return (
      <Link href={linkUrl} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
