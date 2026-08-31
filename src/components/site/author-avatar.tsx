"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

interface AuthorAvatarProps {
  author: { full_name?: string | null; email?: string | null; avatar_url?: string | null };
  className?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0][0];
  return initials.toUpperCase();
}

export function AuthorAvatar({ author, className }: AuthorAvatarProps) {
  const [error, setError] = useState(false);
  const label = author.full_name || author.email || "";

  if (author.avatar_url && !error) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={author.avatar_url}
        alt={label}
        onError={() => setError(true)}
        className={cn("size-8 shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground",
        className
      )}
    >
      {label ? getInitials(label) : null}
    </span>
  );
}
