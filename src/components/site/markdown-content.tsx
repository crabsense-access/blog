import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

// rehype-sanitize prefija por defecto los "id" con "user-content-" (misma
// lógica que usa GitHub para evitar DOM clobbering). Acá el id de los
// headings tiene que coincidir exactamente con el que genera
// extractHeadings (src/lib/toc.ts) para que los anchors del índice de
// contenidos (#seccion) apunten al lugar correcto, así que desactivamos
// ese prefijo puntual.
const sanitizeSchema = {
  ...defaultSchema,
  clobber: defaultSchema.clobber?.filter((name) => name !== "id"),
};

/**
 * Renderiza el contenido Markdown de un post (títulos, negrita/itálica,
 * listas, tablas, links, etc.) con la tipografía del sitio (prose, ver
 * globals.css). remark-gfm agrega soporte GFM (tablas, tachado, listas de
 * tareas); rehype-slug asigna un id único a cada heading (para el índice
 * de contenidos); rehype-sanitize sanitiza el árbol resultante
 * (atributos/URLs peligrosas, ej. href="javascript:...") — no habilitamos
 * HTML crudo dentro del Markdown, así que esto es una capa extra de
 * seguridad, no la única.
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn("prose max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeSanitize, sanitizeSchema]]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
