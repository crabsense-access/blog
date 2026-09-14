import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import type { Heading, Root } from "mdast";

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
  children: TocHeading[];
}

// Id fijo (no generado por slug) de la sección de FAQ, para poder
// referenciarlo desde el TOC y desde el anchor del bloque sin depender del
// texto de un heading.
export const FAQ_SECTION_ID = "preguntas-frecuentes";

// Heading H2 que, por convención de algunos posts, cierra el contenido con
// las fuentes/referencias citadas. Si existe, el bloque de FAQ debe
// insertarse justo antes (tanto en el render como en el TOC).
const SOURCES_HEADING_REGEX = /^(fuentes|referencias)\b/i;

/**
 * Extrae los headings H2/H3 del Markdown del post y les asigna un id.
 * Usa el mismo algoritmo (github-slugger) que rehype-slug aplica al
 * renderizar el contenido en MarkdownContent, para que los ids generados
 * acá coincidan con los ids reales del HTML y los anchors (#seccion)
 * funcionen.
 */
export function extractHeadings(markdown: string): TocHeading[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const slugger = new GithubSlugger();
  const flat: { id: string; text: string; level: 2 | 3 }[] = [];

  visit(tree, "heading", (node: Heading) => {
    if (node.depth !== 2 && node.depth !== 3) return;
    const text = toString(node).trim();
    if (!text) return;
    flat.push({ id: slugger.slug(text), text, level: node.depth as 2 | 3 });
  });

  const headings: TocHeading[] = [];
  let currentH2: TocHeading | null = null;

  for (const heading of flat) {
    const item: TocHeading = { ...heading, children: [] };
    if (heading.level === 2) {
      headings.push(item);
      currentH2 = item;
    } else if (currentH2) {
      currentH2.children.push(item);
    } else {
      headings.push(item);
    }
  }

  return headings;
}

export function countHeadings(headings: TocHeading[]): number {
  return headings.reduce((count, heading) => count + 1 + heading.children.length, 0);
}

/**
 * Divide el Markdown del post en dos partes, cortando justo antes del
 * heading H2 de nivel superior "Fuentes"/"Referencias" (si existe). Se usa
 * para poder renderizar el bloque de FAQ entre el resto del contenido y esa
 * sección, sin tocar el resto del documento.
 */
export function splitContentAtSourcesHeading(markdown: string): {
  before: string;
  sources: string | null;
} {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;

  for (const node of tree.children) {
    if (node.type === "heading" && node.depth === 2 && node.position) {
      const text = toString(node).trim();
      if (SOURCES_HEADING_REGEX.test(text)) {
        const offset = node.position.start.offset;
        return {
          before: markdown.slice(0, offset).trimEnd(),
          sources: markdown.slice(offset),
        };
      }
    }
  }

  return { before: markdown, sources: null };
}

// Con menos H2 que esto no insertamos el bloque de nota relacionada — con
// muy pocas secciones, "el H2 más cercano a la mitad" queda pegado al
// principio o al final del contenido.
const MIN_H2_FOR_MIDPOINT_INSERT = 3;

/**
 * Divide el Markdown del post en dos partes, cortando justo después del H2
 * de nivel superior más cercano a la mitad del contenido (con 6 H2, después
 * del 3°; con un n impar, se usa Math.ceil(n/2) — el H2 central). Se usa
 * para insertar un bloque (ej. nota relacionada) entre dos secciones sin
 * que quede pegado al principio o al final. Devuelve `null` si el contenido
 * no tiene suficientes H2 (< 3).
 */
export function splitContentAtMidpointHeading(
  markdown: string
): { before: string; after: string } | null {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const h2Offsets: number[] = [];

  for (const node of tree.children) {
    if (node.type === "heading" && node.depth === 2 && typeof node.position?.start.offset === "number") {
      h2Offsets.push(node.position.start.offset);
    }
  }

  if (h2Offsets.length < MIN_H2_FOR_MIDPOINT_INSERT) return null;

  const splitIndex = Math.ceil(h2Offsets.length / 2);
  const boundaryOffset = h2Offsets[splitIndex];

  return {
    before: markdown.slice(0, boundaryOffset).trimEnd(),
    after: markdown.slice(boundaryOffset),
  };
}

/**
 * Inserta la entrada "Preguntas frecuentes" en el TOC, en el mismo lugar en
 * el que el bloque de FAQ se renderiza en la página: justo antes de
 * "Fuentes"/"Referencias" si el post tiene esa sección, o al final si no.
 */
export function insertFaqHeading(headings: TocHeading[], hasFaq: boolean): TocHeading[] {
  if (!hasFaq) return headings;

  const faqHeading: TocHeading = {
    id: FAQ_SECTION_ID,
    text: "Preguntas frecuentes",
    level: 2,
    children: [],
  };

  const sourcesIndex = headings.findIndex((heading) => SOURCES_HEADING_REGEX.test(heading.text));
  if (sourcesIndex === -1) return [...headings, faqHeading];

  return [...headings.slice(0, sourcesIndex), faqHeading, ...headings.slice(sourcesIndex)];
}
