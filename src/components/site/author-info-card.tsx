import { PostImage } from "@/components/site/post-image";
import { LinkedinIcon } from "@/components/site/linkedin-icon";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export function AuthorInfoCard({
  author,
  className,
}: {
  author: Profile;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full flex-col gap-3 rounded border border-gray-200 p-4", className)}>
      <div className="flex items-center gap-4">
        <PostImage
          src={author.avatar_url}
          alt={author.full_name ?? "Autor"}
          className="size-14 shrink-0 rounded-full"
        />
        <div>
          <p className="text-lg font-bold">{author.full_name ?? "Autor"}</p>
          {author.public_title && (
            <p className="text-sm text-muted-foreground">{author.public_title}</p>
          )}
        </div>
      </div>

      {author.bio && <p className="text-sm text-muted-foreground">{author.bio}</p>}

      {/* Redes sociales: agregar más íconos acá cuando sumemos más campos al perfil. */}
      {author.linkedin_url && (
        <div className="flex items-center gap-3">
          <a
            href={author.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <LinkedinIcon className="size-5" />
            <span className="sr-only">LinkedIn de {author.full_name ?? "este autor"}</span>
          </a>
        </div>
      )}
    </div>
  );
}
