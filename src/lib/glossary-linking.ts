import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { visit, SKIP } from "unist-util-visit";
import type { Link, Root, Text } from "mdast";

import type { GlossaryTermLight } from "@/lib/queries/glossary";

// Tipos de nodo cuyo contenido nunca debe auto-enlazarse: headings (no
// queremos linkear texto de un título), links existentes (no anidar un link
// dentro de otro) y bloques/inline de código (no es prosa).
const SKIPPED_NODE_TYPES = new Set(["heading", "link", "code", "inlineCode"]);

// Boundary Unicode-aware: cualquier letra (con acentos) o dígito cuenta como
// parte de una "palabra", para no cortar en medio de un término compuesto ni
// matchear parcialmente dentro de otra palabra más larga.
const WORD_CHAR = "A-Za-z0-9À-ÖØ-öø-ÿ";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface CandidatePattern {
  regex: RegExp;
  // Longitud del término "base" (sin el plural), usada para priorizar
  // matches más específicos cuando dos candidatos empatan en posición.
  specificity: number;
}

interface TermCandidates {
  term: GlossaryTermLight;
  href: string;
  patterns: CandidatePattern[];
}

// Mínimo de caracteres que debe tener la forma parcial (término multi-palabra
// sin la primera palabra) para generarse como candidato — evita candidatos
// demasiado genéricos como enlazar una sola palabra corta cualquiera.
const MIN_PARTIAL_LENGTH = 4;

// Conectores/preposiciones en español que nunca deben quedar como primera
// palabra de una forma parcial: si aparecen, indican que lo que sigue es un
// modificador ("de dominio", "de búsqueda") y no una mención natural por
// sí sola.
const SPANISH_STOPWORDS = new Set([
  "de", "del", "la", "las", "el", "los", "en", "y", "o", "u", "e",
  "para", "con", "por", "sin", "al", "un", "una",
]);

function isAllUppercase(value: string): boolean {
  return value === value.toUpperCase() && value !== value.toLowerCase();
}

// Agrega `form` como candidato y, además, su variante de número opuesta:
// si termina en "s" (y no es una sigla en mayúsculas, donde la "s" final
// puede ser parte del acrónimo) suma el singular quitándola; si no termina
// en "s", suma el plural agregándola. Esto cubre tanto términos guardados en
// singular (LLM -> LLMs) como en plural (Google AI Overviews -> Google AI
// Overview / AI Overview).
function addWithNumberVariant(surfaceForms: Set<string>, form: string): void {
  const trimmed = form.trim();
  if (!trimmed) return;

  surfaceForms.add(trimmed);

  if (trimmed.endsWith("s")) {
    if (!isAllUppercase(trimmed)) {
      surfaceForms.add(trimmed.slice(0, -1));
    }
  } else {
    surfaceForms.add(`${trimmed}s`);
  }
}

function buildCandidates(term: GlossaryTermLight): TermCandidates {
  const words = term.term.trim().split(/\s+/);
  const surfaceForms = new Set<string>();

  addWithNumberVariant(surfaceForms, term.term.trim());

  if (words.length > 1) {
    const stopwordIndex = words.findIndex(
      (word, i) => i > 0 && SPANISH_STOPWORDS.has(word.toLowerCase())
    );

    if (stopwordIndex > 0) {
      // Frase descriptiva en español con conector (ej. "Autoridad de
      // dominio", "Intención de búsqueda"): el candidato parcial útil es
      // la cabeza, antes del conector ("Autoridad", "Intención"). Lo que
      // queda después del conector ("de dominio", "de búsqueda") no es una
      // mención natural por sí sola y genera falsos positivos con frases
      // genéricas no relacionadas con el término.
      const head = words.slice(0, stopwordIndex).join(" ");
      if (head.length >= MIN_PARTIAL_LENGTH) {
        addWithNumberVariant(surfaceForms, head);
      }
    } else {
      // Término compuesto sin conector, típicamente un nombre propio/marca
      // (ej. "Google AI Overviews" -> "AI Overviews"): el candidato parcial
      // útil es sacar la primera palabra, que suele ser un calificador.
      const partial = words.slice(1).join(" ");
      if (partial.length >= MIN_PARTIAL_LENGTH) {
        addWithNumberVariant(surfaceForms, partial);
      }
    }
  }

  const patterns: CandidatePattern[] = [...surfaceForms].map((form) => ({
    regex: new RegExp(
      `(?<![${WORD_CHAR}])${escapeRegExp(form)}(?![${WORD_CHAR}])`,
      "i"
    ),
    specificity: form.length,
  }));

  return {
    term,
    href: `/glosario/${term.category}/${term.slug}`,
    patterns,
  };
}

interface TextMatch {
  index: number;
  length: number;
  matchedText: string;
  candidate: TermCandidates;
}

// Palabra con mayúscula inicial y el resto en minúscula (“Pew”, “Google”):
// NO incluye siglas todo en mayúscula (“SEO”, “AI”), que son un calificador
// habitual de los propios términos del glosario y no una señal de nombre
// propio ajeno.
const TITLE_CASE_WORD = /^[A-ZÀ-Ö][a-zà-öø-ÿ]*$/;

// Puntuación que cierra una oración (con una comilla/paréntesis de cierre
// opcional de por medio), usada para decidir si una palabra con mayúscula
// es la primera palabra de una oración (mayúscula "de cortesía") o no.
const SENTENCE_END = /[.!?:]["'”)\]]?$/;

/**
 * Devuelve `true` si el candidato que empieza en `matchIndex` viene
 * precedido, sin puntuación de por medio, por otra palabra con mayúscula
 * inicial que a su vez NO está al comienzo de una oración. Ese patrón
 * (“... de Pew Research...”) es la firma de un nombre propio ajeno de dos o
 * más palabras (persona, marca, estudio) del que el candidato es solo la
 * segunda mitad — no una mención real del término del glosario —, así que
 * ese match se descarta.
 */
function isPrecededByUnrelatedProperNoun(text: string, matchIndex: number): boolean {
  const before = text.slice(0, matchIndex);
  const precedingWordMatch = /([A-Za-zÀ-ÖØ-öø-ÿ]+)[ \t]+$/.exec(before);
  if (!precedingWordMatch) return false;

  const precedingWord = precedingWordMatch[1];
  if (!TITLE_CASE_WORD.test(precedingWord)) return false;

  const remainder = before.slice(0, precedingWordMatch.index);
  const trimmedRemainder = remainder.replace(/\s+$/, "");
  if (trimmedRemainder.length === 0) return false; // inicio de párrafo/fragmento
  if (SENTENCE_END.test(trimmedRemainder)) return false; // inicio de oración

  return true;
}

function findFirstMatch(text: string, candidates: TermCandidates[]): TextMatch | null {
  let best: TextMatch | null = null;

  for (const candidate of candidates) {
    for (const pattern of candidate.patterns) {
      const globalRegex = new RegExp(
        pattern.regex.source,
        pattern.regex.flags.includes("g") ? pattern.regex.flags : `${pattern.regex.flags}g`
      );

      let match: RegExpExecArray | null;
      while ((match = globalRegex.exec(text)) !== null) {
        if (isPrecededByUnrelatedProperNoun(text, match.index)) {
          if (globalRegex.lastIndex === match.index) globalRegex.lastIndex += 1;
          continue;
        }

        const current: TextMatch = {
          index: match.index,
          length: match[0].length,
          matchedText: match[0],
          candidate,
        };

        if (
          !best ||
          current.index < best.index ||
          (current.index === best.index && current.length > best.length)
        ) {
          best = current;
        }
        break;
      }
    }
  }

  return best;
}

/**
 * Reemplaza, dentro de un único nodo de texto, todas las primeras-menciones
 * de términos del glosario todavía no enlazados por nodos `link`. Devuelve
 * `null` si no encontró ningún match (el nodo de texto queda intacto).
 */
function linkifyTextValue(
  value: string,
  remainingCandidates: Map<string, TermCandidates>
): (Text | Link)[] | null {
  const result: (Text | Link)[] = [];
  let cursor = 0;
  let mutated = false;

  while (cursor < value.length) {
    const remaining = value.slice(cursor);
    const match = findFirstMatch(remaining, [...remainingCandidates.values()]);
    if (!match) break;

    mutated = true;
    const absoluteIndex = cursor + match.index;

    if (absoluteIndex > cursor) {
      result.push({ type: "text", value: value.slice(cursor, absoluteIndex) });
    }

    result.push({
      type: "link",
      url: match.candidate.href,
      children: [{ type: "text", value: match.matchedText }],
    });

    // Ese término ya quedó enlazado una vez en todo el documento: no debe
    // volver a matchear en el resto del texto (acá ni en nodos siguientes).
    remainingCandidates.delete(match.candidate.term.slug + "|" + match.candidate.term.category);

    cursor = absoluteIndex + match.length;
  }

  if (!mutated) return null;

  if (cursor < value.length) {
    result.push({ type: "text", value: value.slice(cursor) });
  }

  return result;
}

// Detecta hrefs con forma "/glosario/{categoria}/{slug}" (con o sin
// dominio/protocolo delante) para no auto-enlazar un término que el post ya
// linkea manualmente en algún otro lugar del texto.
const GLOSSARY_HREF_REGEX = /\/glosario\/([a-z0-9-]+)\/([a-z0-9-]+)/i;

function findManuallyLinkedTerms(tree: Root): Set<string> {
  const linked = new Set<string>();

  visit(tree, "link", (node: Link) => {
    const match = GLOSSARY_HREF_REGEX.exec(node.url);
    if (match) {
      linked.add(`${match[2].toLowerCase()}|${match[1].toLowerCase()}`);
    }
  });

  return linked;
}

function linkTreeInPlace(tree: Root, remainingCandidates: Map<string, TermCandidates>): void {
  visit(tree, (node, index, parent) => {
    if (!parent || index === null || index === undefined) return;

    if (SKIPPED_NODE_TYPES.has(node.type)) {
      return SKIP;
    }

    if (node.type === "text") {
      if (remainingCandidates.size === 0) return;

      const replacement = linkifyTextValue((node as Text).value, remainingCandidates);
      if (replacement) {
        parent.children.splice(index, 1, ...replacement);
        return [SKIP, index + replacement.length];
      }
    }
  });
}

const stringifier = unified().use(remarkStringify).use(remarkGfm);

function parseMarkdown(content: string): Root {
  return unified().use(remarkParse).use(remarkGfm).parse(content) as Root;
}

export interface GlossaryLinker {
  /**
   * Auto-enlaza, dentro de un fragmento de Markdown, la primera mención
   * pendiente de cada término del Glosario. El estado de "qué término ya se
   * enlazó" se comparte entre todos los fragmentos procesados por el mismo
   * linker (ver `createGlossaryLinker`), así que solo la primerísima
   * mención en todo el post (contenido, FAQs, etc., en el orden en que se
   * llame a `link`) queda enlazada.
   */
  link(content: string): string;
}

/**
 * Crea un "linker" de términos del Glosario para un post completo.
 *
 * Reglas:
 * - Solo la primera ocurrencia de cada término en TODO el post se enlaza
 *   (no todas, y no una por cada fragmento de texto que se procese).
 * - Nunca enlaza texto dentro de un heading (H2/H3/etc.), de un link ya
 *   existente, o de código.
 * - Si el post ya tiene, en cualquier parte de cualquier fragmento, un link
 *   manual hacia la página de un término, ese término no se auto-enlaza de
 *   nuevo en ningún otro fragmento.
 * - Matchea variantes de plural (LLM -> LLMs) y formas parciales de
 *   términos compuestos (Google AI Overviews -> AI Overviews), sin
 *   configuración manual por término.
 *
 * `existingContentForManualLinkScan` debe incluir TODOS los fragmentos de
 * texto del post (contenido, respuesta rápida, FAQs, etc.) para detectar
 * correctamente links manuales ya presentes en cualquiera de ellos, aunque
 * después solo se llame a `.link()` sobre algunos de esos fragmentos.
 *
 * Se aplica en el momento de renderizar el post (no al guardarlo), así que
 * términos nuevos agregados al glosario más tarde iluminan automáticamente
 * menciones en posts viejos.
 */
export function createGlossaryLinker(
  terms: GlossaryTermLight[],
  existingContentForManualLinkScan: string[]
): GlossaryLinker {
  if (terms.length === 0) return { link: (content) => content };

  const manuallyLinked = new Set<string>();
  for (const text of existingContentForManualLinkScan) {
    if (!text) continue;
    for (const key of findManuallyLinkedTerms(parseMarkdown(text))) {
      manuallyLinked.add(key);
    }
  }

  const remainingCandidates = new Map<string, TermCandidates>();
  for (const term of terms) {
    const key = `${term.slug.toLowerCase()}|${term.category.toLowerCase()}`;
    if (manuallyLinked.has(key)) continue;
    remainingCandidates.set(key, buildCandidates(term));
  }

  return {
    link(content: string): string {
      if (!content || remainingCandidates.size === 0) return content;

      const tree = parseMarkdown(content);
      linkTreeInPlace(tree, remainingCandidates);
      return stringifier.stringify(tree).trim();
    },
  };
}

/**
 * Variante de un solo fragmento de `createGlossaryLinker`, para el caso
 * simple de auto-enlazar un único bloque de Markdown de forma aislada.
 */
export function linkGlossaryTerms(content: string, terms: GlossaryTermLight[]): string {
  return createGlossaryLinker(terms, [content]).link(content);
}
