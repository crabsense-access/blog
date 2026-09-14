import { MarkdownContent } from "@/components/site/markdown-content";
import { cn } from "@/lib/utils";

interface FaqSectionItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: FaqSectionItem[];
  id?: string;
  className?: string;
}

/**
 * Bloque de Preguntas frecuentes: título + cards con fondo gris redondeado
 * (mismo estilo en toda la página, ver .prose.post-content h2 en
 * globals.css). Usado tanto en la página del post como en la del término
 * de glosario — no muestra nada si no hay FAQs.
 */
export function FaqSection({ faqs, id, className }: FaqSectionProps) {
  if (faqs.length === 0) return null;

  return (
    <div className={cn("prose post-content mt-12 mb-20 max-w-none", className)}>
      <h2 id={id}>Preguntas frecuentes</h2>
      {/* not-prose: las cards se manejan con clases propias, sin pelear con
          los márgenes/tamaños que el plugin de typography le pondría a los
          h3/p acá adentro. */}
      <div className="not-prose mt-6 space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="-mx-6 rounded-2xl bg-muted p-8 sm:p-10">
            {/* Más chico que el h2 "Preguntas frecuentes". */}
            <h3 className="mb-2 text-xl font-normal lg:text-2xl">{faq.question}</h3>
            <MarkdownContent content={faq.answer} />
          </div>
        ))}
      </div>
    </div>
  );
}
