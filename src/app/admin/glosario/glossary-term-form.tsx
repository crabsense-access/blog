"use client";

import { useActionState, useState } from "react";
import { PlusIcon, TrashIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/slugify";
import { useSuccessToast } from "@/lib/use-success-toast";
import { GLOSSARY_CATEGORY_LABELS } from "@/lib/validations/glossary";
import {
  generateGlossaryTermContent,
  type GenerateGlossaryContentState,
  type GlossaryTermFormState,
} from "./actions";
import type {
  GlossaryCategory,
  GlossaryFaq,
  GlossaryFormulaComponent,
  GlossaryTermWithRelations,
  Profile,
} from "@/lib/types";

const CATEGORIES: GlossaryCategory[] = ["ga4", "ads", "ia", "seo"];
const initialGenerateState: GenerateGlossaryContentState = {};
const initialFormState: GlossaryTermFormState = {};

interface GlossaryTermFormProps {
  authors: Profile[];
  term?: GlossaryTermWithRelations;
  defaultAuthorId?: string;
  action: (state: GlossaryTermFormState, formData: FormData) => Promise<GlossaryTermFormState>;
}

export function GlossaryTermForm({ authors, term, defaultAuthorId, action }: GlossaryTermFormProps) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  useSuccessToast(state, initialFormState);

  const [genState, genFormAction, genPending] = useActionState(
    generateGlossaryTermContent,
    initialGenerateState
  );

  const [termName, setTermName] = useState(term?.term ?? "");
  const [category, setCategory] = useState<GlossaryCategory>(term?.category ?? "ga4");
  const [slug, setSlug] = useState(term?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(term));
  const [hasContent, setHasContent] = useState(Boolean(term));

  const [quickAnswer, setQuickAnswer] = useState(term?.quick_answer ?? "");
  const [hasFormula, setHasFormula] = useState(term?.has_formula ?? false);
  const [formulaExpression, setFormulaExpression] = useState(term?.formula?.expression ?? "");
  const [formulaComponents, setFormulaComponents] = useState<GlossaryFormulaComponent[]>(
    term?.formula?.components ?? []
  );
  const [extendedExplanation, setExtendedExplanation] = useState(term?.extended_explanation ?? "");
  const [example, setExample] = useState(term?.example ?? "");
  const [hasComparisonTable, setHasComparisonTable] = useState(Boolean(term?.comparison_table));
  const [comparisonHeaders, setComparisonHeaders] = useState<string[]>(
    term?.comparison_table?.headers ?? ["", ""]
  );
  const [comparisonRows, setComparisonRows] = useState<string[][]>(
    term?.comparison_table?.rows ?? []
  );
  const [relatedTerms, setRelatedTerms] = useState<string[]>(term?.related_terms ?? []);
  const [faqs, setFaqs] = useState<GlossaryFaq[]>(term?.faqs ?? []);
  const [status, setStatus] = useState(term?.status ?? "published");

  // Cuando termina de generar, precarga todos los campos y recién ahí
  // muestra el resto del formulario (no se guarda nada sin revisarlo antes).
  // Ajustamos el estado durante el render (no en un efecto) siguiendo el
  // patrón que recomienda React para "derivar estado de un cambio de prop":
  // https://react.dev/learn/you-might-not-need-an-effect
  const [appliedGenData, setAppliedGenData] = useState(genState.data);
  if (genState.data && genState.data !== appliedGenData) {
    setAppliedGenData(genState.data);
    const d = genState.data;
    setQuickAnswer(d.quick_answer);
    setHasFormula(d.has_formula);
    setFormulaExpression(d.formula?.expression ?? "");
    setFormulaComponents(d.formula?.components ?? []);
    setExtendedExplanation(d.extended_explanation);
    setExample(d.example);
    setHasComparisonTable(d.has_comparison_table);
    setComparisonHeaders(d.comparison_table?.headers ?? ["", ""]);
    setComparisonRows(d.comparison_table?.rows ?? []);
    setRelatedTerms(d.related_terms);
    setFaqs(d.faqs);
    setHasContent(true);
    if (!slugTouched) setSlug(slugify(termName));
  }

  function addFormulaComponent() {
    setFormulaComponents((prev) => [...prev, { label: "", symbol: "" }]);
  }
  function removeFormulaComponent(index: number) {
    setFormulaComponents((prev) => prev.filter((_, i) => i !== index));
  }
  function updateFormulaComponent(index: number, field: "label" | "symbol", value: string) {
    setFormulaComponents((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  function addComparisonColumn() {
    setComparisonHeaders((prev) => [...prev, ""]);
    setComparisonRows((prev) => prev.map((row) => [...row, ""]));
  }
  function removeComparisonColumn(index: number) {
    setComparisonHeaders((prev) => prev.filter((_, i) => i !== index));
    setComparisonRows((prev) => prev.map((row) => row.filter((_, i) => i !== index)));
  }
  function updateComparisonHeader(index: number, value: string) {
    setComparisonHeaders((prev) => prev.map((h, i) => (i === index ? value : h)));
  }
  function addComparisonRow() {
    setComparisonRows((prev) => [...prev, comparisonHeaders.map(() => "")]);
  }
  function removeComparisonRow(index: number) {
    setComparisonRows((prev) => prev.filter((_, i) => i !== index));
  }
  function updateComparisonCell(rowIndex: number, colIndex: number, value: string) {
    setComparisonRows((prev) =>
      prev.map((row, r) => (r === rowIndex ? row.map((cell, c) => (c === colIndex ? value : cell)) : row))
    );
  }

  function addRelatedTerm() {
    setRelatedTerms((prev) => [...prev, ""]);
  }
  function removeRelatedTerm(index: number) {
    setRelatedTerms((prev) => prev.filter((_, i) => i !== index));
  }
  function updateRelatedTerm(index: number, value: string) {
    setRelatedTerms((prev) => prev.map((t, i) => (i === index ? value : t)));
  }

  function addFaq() {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  }
  function removeFaq(index: number) {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  }
  function updateFaq(index: number, field: keyof GlossaryFaq, value: string) {
    setFaqs((prev) => prev.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)));
  }

  const formulaJson = hasFormula
    ? JSON.stringify({ expression: formulaExpression, components: formulaComponents })
    : "";
  const comparisonTableJson = hasComparisonTable
    ? JSON.stringify({ headers: comparisonHeaders, rows: comparisonRows })
    : "";

  return (
    <div className="grid gap-6">
      {/* Form 1: término + categoría + autocompletar. Separado del form de
          guardar (no se pueden anidar <form>), comparten estado de React. */}
      <form action={genFormAction} className="grid gap-4 rounded-lg border p-4">
        <div className="grid gap-2">
          <Label htmlFor="gen-term">Término</Label>
          <Input
            id="gen-term"
            name="term"
            value={termName}
            onChange={(e) => {
              setTermName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Ej: Tasa de conversión"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="gen-category">Categoría</Label>
          <Select
            name="category"
            value={category}
            onValueChange={(v) => setCategory(v as GlossaryCategory)}
          >
            <SelectTrigger id="gen-category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {GLOSSARY_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {genState.error && <p className="text-sm text-destructive">{genState.error}</p>}
        <Button type="submit" disabled={genPending || !termName.trim()} className="w-fit">
          <SparklesIcon className="size-4" />
          {genPending ? "Generando..." : hasContent ? "Regenerar con IA" : "Autocompletar con IA"}
        </Button>
      </form>

      {hasContent && (
        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="term" value={termName} />
          <input type="hidden" name="category" value={category} />

          <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              required
            />
            {state.fieldErrors?.slug && (
              <p className="text-sm text-destructive">{state.fieldErrors.slug[0]}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quick_answer">Respuesta rápida</Label>
            <Textarea
              id="quick_answer"
              name="quick_answer"
              value={quickAnswer}
              onChange={(e) => setQuickAnswer(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Switch id="has_formula" checked={hasFormula} onCheckedChange={setHasFormula} />
              <Label htmlFor="has_formula" className="cursor-pointer font-normal">
                Es una métrica con fórmula
              </Label>
            </div>
            {hasFormula && (
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="formula_expression">Fórmula</Label>
                  <Input
                    id="formula_expression"
                    value={formulaExpression}
                    onChange={(e) => setFormulaExpression(e.target.value)}
                    placeholder="Ej: (Conversiones / Sesiones) × 100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Componentes</Label>
                  {formulaComponents.map((comp, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={comp.label}
                        onChange={(e) => updateFormulaComponent(index, "label", e.target.value)}
                        placeholder="Nombre"
                      />
                      <Input
                        value={comp.symbol ?? ""}
                        onChange={(e) => updateFormulaComponent(index, "symbol", e.target.value)}
                        placeholder="Símbolo (opcional)"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFormulaComponent(index)}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addFormulaComponent} className="w-fit">
                    <PlusIcon className="size-3.5" />
                    Agregar componente
                  </Button>
                </div>
              </div>
            )}
          </div>
          <input type="hidden" name="has_formula" value={hasFormula ? "on" : ""} />
          <input type="hidden" name="formula" value={formulaJson} />

          <div className="grid gap-2">
            <Label htmlFor="extended_explanation">Explicación extendida (Markdown)</Label>
            <Textarea
              id="extended_explanation"
              name="extended_explanation"
              value={extendedExplanation}
              onChange={(e) => setExtendedExplanation(e.target.value)}
              rows={6}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="example">Ejemplo concreto (Markdown)</Label>
            <Textarea
              id="example"
              name="example"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Switch
                id="has_comparison_table"
                checked={hasComparisonTable}
                onCheckedChange={setHasComparisonTable}
              />
              <Label htmlFor="has_comparison_table" className="cursor-pointer font-normal">
                Incluir tabla comparativa
              </Label>
            </div>
            {hasComparisonTable && (
              <div className="grid gap-3 overflow-x-auto">
                <div className="flex gap-2">
                  {comparisonHeaders.map((header, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <Input
                        value={header}
                        onChange={(e) => updateComparisonHeader(index, e.target.value)}
                        placeholder={`Columna ${index + 1}`}
                        className="w-40"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeComparisonColumn(index)}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addComparisonColumn}>
                    <PlusIcon className="size-3.5" />
                    Columna
                  </Button>
                </div>
                {comparisonRows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-2">
                    {row.map((cell, colIndex) => (
                      <Input
                        key={colIndex}
                        value={cell}
                        onChange={(e) => updateComparisonCell(rowIndex, colIndex, e.target.value)}
                        className="w-40"
                      />
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeComparisonRow(rowIndex)}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addComparisonRow} className="w-fit">
                  <PlusIcon className="size-3.5" />
                  Fila
                </Button>
              </div>
            )}
          </div>
          <input type="hidden" name="comparison_table" value={comparisonTableJson} />

          <div className="grid gap-2">
            <Label>Términos relacionados</Label>
            {relatedTerms.map((relatedTerm, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={relatedTerm}
                  onChange={(e) => updateRelatedTerm(index, e.target.value)}
                  placeholder="Nombre del término"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeRelatedTerm(index)}>
                  <TrashIcon className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addRelatedTerm} className="w-fit">
              <PlusIcon className="size-3.5" />
              Agregar término relacionado
            </Button>
            <input
              type="hidden"
              name="related_terms"
              value={JSON.stringify(relatedTerms.filter((t) => t.trim()))}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Preguntas frecuentes</Label>
              <Button type="button" variant="outline" size="sm" onClick={addFaq}>
                <PlusIcon className="size-3.5" />
                Agregar FAQ
              </Button>
            </div>
            {faqs.length === 0 && (
              <p className="text-sm text-muted-foreground">Todavía no hay preguntas frecuentes.</p>
            )}
            {faqs.map((faq, index) => (
              <div key={index} className="grid gap-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFaq(index)}>
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
                <Input
                  value={faq.question}
                  onChange={(e) => updateFaq(index, "question", e.target.value)}
                  placeholder="Pregunta"
                />
                <Textarea
                  value={faq.answer}
                  onChange={(e) => updateFaq(index, "answer", e.target.value)}
                  placeholder="Respuesta"
                  rows={2}
                />
              </div>
            ))}
            <input type="hidden" name="faqs" value={JSON.stringify(faqs)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="author_id">Autor / revisor</Label>
            <Select name="author_id" defaultValue={term?.author_id ?? defaultAuthorId ?? ""}>
              <SelectTrigger id="author_id" className="w-full">
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                {authors.map((author) => (
                  <SelectItem key={author.id} value={author.id}>
                    {author.full_name || author.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Estado</Label>
            <Select name="status" value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      )}
    </div>
  );
}
