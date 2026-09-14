import { MainBlockHorizontalItem } from "@/components/site/main-block-horizontal-item";
import type { PostWithRelations } from "@/lib/types";

interface RelatedNoteBlockProps {
  post: PostWithRelations;
}

/**
 * Nota relacionada insertada a mitad del Contenido del post (ver
 * splitContentAtMidpointHeading). Reusa MainBlockHorizontalItem (mismo
 * diseño imagen+título+excerpt que el resto del sitio) pero sin pills, sin
 * autor y sin fecha — solo la sugerencia de lectura. Mismo fondo/radio que
 * las cards de FAQ (rounded-2xl bg-muted).
 */
export function RelatedNoteBlock({ post }: RelatedNoteBlockProps) {
  return (
    <div className="not-prose my-12">
      <p className="mb-3 text-sm font-semibold text-muted-foreground">Te puede interesar...</p>
      <div className="-mx-6 rounded-2xl bg-muted p-8 sm:p-10">
        <MainBlockHorizontalItem
          post={post}
          showPills={false}
          showAuthorMeta={false}
          className="min-h-0 p-0"
        />
      </div>
    </div>
  );
}
