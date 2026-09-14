import type { GlossaryFormula } from "@/lib/types";

/**
 * Tarjeta visual de la fórmula de una métrica: la expresión completa
 * arriba, y sus componentes desglosados abajo como cajas conectadas por
 * una línea (no solo un párrafo de texto).
 */
export function GlossaryFormulaCard({ formula }: { formula: GlossaryFormula }) {
  return (
    <div className="not-prose my-8 rounded-2xl bg-muted p-8 sm:p-10">
      <p className="mb-6 text-center font-heading text-2xl font-normal lg:text-3xl">
        {formula.expression}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {formula.components.map((component, index) => (
          <div key={index} className="flex items-center gap-3">
            {index > 0 && (
              <span aria-hidden="true" className="h-px w-6 bg-border sm:w-10" />
            )}
            <div className="flex min-w-32 flex-col items-center gap-1 rounded-xl border-2 border-border bg-background px-5 py-4 text-center">
              {component.symbol && (
                <span className="font-heading text-lg font-semibold">{component.symbol}</span>
              )}
              <span className="text-sm text-muted-foreground">{component.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
