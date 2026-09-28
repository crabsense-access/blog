"use client";

import { startTransition, useActionState, useState } from "react";
import { Loader2Icon, PlusIcon, SparklesIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { slugify } from "@/lib/slugify";
import { useSuccessToast } from "@/lib/use-success-toast";
import { MarkdownContent } from "@/components/site/markdown-content";
import type { Category, PostFaq, PostWithRelations, Profile, Subcategory } from "@/lib/types";
import { generatePostContent, type GeneratePostContentState, type PostFormState } from "./actions";

interface PostFormProps {
  categories: Category[];
  subcategories: Subcategory[];
  authors: Profile[];
  post?: PostWithRelations;
  defaultAuthorId?: string;
  action: (state: PostFormState, formData: FormData) => Promise<PostFormState>;
}

const initialState: PostFormState = {};
const initialGenerateState: GeneratePostContentState = {};
const MAX_GENERATE_SUBCATEGORIES = 2;

export function PostForm({
  categories,
  subcategories,
  authors,
  post,
  defaultAuthorId,
  action,
}: PostFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  // Solo dispara para updatePost: createPost redirige server-side (el
  // toast de esa ruta lo muestra saved-toast.tsx en la lista), así que acá
  // nunca llega a resolver un estado antes de navegar.
  useSuccessToast(state, initialState);

  // El botón "Autocompletar con IA" solo existe al crear una nota nueva
  // (ver PostFormProps.post) -- por eso este action solo se importa/usa acá
  // y no viaja como prop desde new/page.tsx.
  const [genState, genFormAction, genPending] = useActionState(
    generatePostContent,
    initialGenerateState
  );
  const [topic, setTopic] = useState("");

  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [quickAnswer, setQuickAnswer] = useState(post?.quick_answer ?? "");
  const [categoryId, setCategoryId] = useState(post?.category_id ?? "");
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(
    new Set(post?.subcategories.map((s) => s.id) ?? [])
  );
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? "");
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [faqs, setFaqs] = useState<PostFaq[]>(post?.faqs ?? []);
  const [content, setContent] = useState(post?.content ?? "");
  const [showPreview, setShowPreview] = useState(false);

  // Cuando termina de generar, precarga todos los campos del formulario de
  // abajo para que los revises y confirmes -- no se guarda nada en la base
  // hasta que apretás "Crear nota". Mismo patrón que glossary-term-form.tsx:
  // derivar estado de un cambio de prop durante el render, no en un efecto
  // (https://react.dev/learn/you-might-not-need-an-effect).
  const [appliedGenData, setAppliedGenData] = useState(genState.data);
  if (genState.data && genState.data !== appliedGenData) {
    setAppliedGenData(genState.data);
    const d = genState.data;
    setTitle(d.title);
    if (!slugTouched) setSlug(slugify(d.title));
    setExcerpt(d.excerpt);
    setQuickAnswer(d.quick_answer);
    setContent(d.content);
    setMetaTitle(d.meta_title);
    setMetaDescription(d.meta_description);
    setFaqs(d.faqs);
    setStatus("draft");
  }

  function addFaq() {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  }

  function removeFaq(index: number) {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  }

  function updateFaq(index: number, field: keyof PostFaq, value: string) {
    setFaqs((prev) => prev.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)));
  }

  function handleCategoryChange(id: string) {
    setCategoryId(id);
    // Cambiar la categoría principal invalida cualquier subcategoría elegida
    // (una subcategoría pertenece a una única categoría).
    setSelectedSubcategories(new Set());
  }

  function toggleSubcategory(id: string) {
    setSelectedSubcategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const categorySubcategories = subcategories.filter(
    (sub) => sub.category_id === categoryId
  );

  return (
    <div className="grid max-w-2xl gap-6">
      {/* Autocompletar con IA: solo al crear una nota nueva. Es un <form>
          separado del de guardar (no se pueden anidar <form>), pero
          comparten el estado de React de categoría/subcategorías -- se
          mandan a esta acción y, aparte, se mandan como inputs ocultos al
          form de guardar de más abajo. */}
      {!post && (
        // OJO: a propósito NO es un <form>. React 19 resetea (llama al
        // .reset() nativo del DOM) los <form action={...}> después de que
        // la action resuelve con éxito -- y el <select> nativo oculto que
        // usa Radix para <Select name="..."> SÍ dispara un evento "change"
        // real al resetearse, que Radix interpreta como si el usuario
        // hubiera elegido esa opción de nuevo, vaciando categoryId (y en
        // cadena, selectedSubcategories) justo cuando termina de generar.
        // Por eso este bloque arma el FormData a mano y llama a
        // genFormAction directamente desde el onClick del botón.
        <div className="grid gap-4 rounded-lg border p-4">
          <p className="text-sm font-semibold">Autocompletar con IA</p>

          <div className="grid gap-2">
            <Label htmlFor="gen-category">Categoría principal</Label>
            <Select value={categoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger id="gen-category" className="w-full sm:w-1/2">
                <SelectValue placeholder="Elegí una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Subcategorías (elegí 1 o 2)</Label>
            {!categoryId ? (
              <p className="text-sm text-muted-foreground">
                Elegí una categoría principal para poder elegir subcategorías.
              </p>
            ) : categorySubcategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Esta categoría todavía no tiene subcategorías.
              </p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {categorySubcategories.map((sub) => {
                  const checked = selectedSubcategories.has(sub.id);
                  return (
                    <label key={sub.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleSubcategory(sub.id)}
                        disabled={!checked && selectedSubcategories.size >= MAX_GENERATE_SUBCATEGORIES}
                      />
                      {sub.name}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="topic">Tema / idea para la nota</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: cómo usar IA para detectar anomalías de tráfico en GA4"
            />
          </div>

          {genState.error && <p className="text-sm text-destructive">{genState.error}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              disabled={genPending || !topic.trim() || !categoryId || selectedSubcategories.size === 0}
              className="w-fit"
              onClick={() => {
                const formData = new FormData();
                formData.set("topic", topic);
                formData.set("category_id", categoryId);
                selectedSubcategories.forEach((id) => formData.append("subcategory_ids", id));
                // startTransition es obligatorio: llamar a un dispatcher de
                // useActionState fuera de una transition ya no funciona en
                // silencio (React tira "called outside of a transition" y
                // ni siquiera dispara la action) -- ver nota más arriba
                // sobre por qué este botón no es un <form>.
                startTransition(() => {
                  genFormAction(formData);
                });
              }}
            >
              {genPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <SparklesIcon className="size-4" />
              )}
              {genPending ? "Generando..." : "Autocompletar con IA"}
            </Button>
            {genPending && (
              <p className="text-sm text-muted-foreground">
                Buscando fuentes y redactando la nota completa -- puede tardar un minuto.
              </p>
            )}
          </div>

          {!genPending && genState.usage && (
            <p className="text-sm text-muted-foreground">
              Generación: {genState.usage.totalTokens.toLocaleString("es-AR")} tokens (
              {genState.usage.inputTokens.toLocaleString("es-AR")} entrada +{" "}
              {genState.usage.outputTokens.toLocaleString("es-AR")} salida)
            </p>
          )}
        </div>
      )}

      <form action={formAction} className="grid gap-6">
        {post ? (
          <>
            <div className="grid gap-2">
              <Label htmlFor="category_id">Categoría principal</Label>
              <Select name="category_id" value={categoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger id="category_id" className="w-full sm:w-1/2">
                  <SelectValue placeholder="Elegí una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.fieldErrors?.category_id && (
                <p className="text-sm text-destructive">{state.fieldErrors.category_id[0]}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Subcategorías</Label>
              {!categoryId ? (
                <p className="text-sm text-muted-foreground">
                  Elegí una categoría principal para poder asignar subcategorías.
                </p>
              ) : categorySubcategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Esta categoría todavía no tiene subcategorías.
                </p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {categorySubcategories.map((sub) => (
                    <label key={sub.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selectedSubcategories.has(sub.id)}
                        onCheckedChange={() => toggleSubcategory(sub.id)}
                      />
                      <input
                        type="checkbox"
                        name="subcategory_ids"
                        value={sub.id}
                        checked={selectedSubcategories.has(sub.id)}
                        readOnly
                        hidden
                      />
                      {sub.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Categoría/subcategorías ya se eligen arriba, en el form de
                Autocompletar con IA -- acá solo viajan como inputs ocultos
                para que createPost las reciba junto con el resto. */}
            <input type="hidden" name="category_id" value={categoryId} />
            {[...selectedSubcategories].map((id) => (
              <input key={id} type="hidden" name="subcategory_ids" value={id} />
            ))}
            {state.fieldErrors?.category_id && (
              <p className="text-sm text-destructive">{state.fieldErrors.category_id[0]}</p>
            )}
          </>
        )}

        <div className="grid gap-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            required
          />
          {state.fieldErrors?.title && (
            <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="slug">Slug (URL)</Label>
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
          <Label htmlFor="excerpt">Resumen</Label>
          <Textarea
            id="excerpt"
            name="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="quick_answer">Respuesta rápida</Label>
          <Textarea
            id="quick_answer"
            name="quick_answer"
            value={quickAnswer}
            onChange={(e) => setQuickAnswer(e.target.value)}
            rows={3}
            placeholder="Respuesta directa/resumen ejecutivo, antes del desarrollo completo del artículo"
          />
          <p className="text-sm text-muted-foreground">
            Acepta formato Markdown, igual que el contenido.
          </p>
          {state.fieldErrors?.quick_answer && (
            <p className="text-sm text-destructive">{state.fieldErrors.quick_answer[0]}</p>
          )}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Contenido</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview((prev) => !prev)}
            >
              {showPreview ? "Volver a editar" : "Vista previa"}
            </Button>
          </div>

          {showPreview ? (
            <div className="rounded-md border p-4">
              <MarkdownContent content={content} />
            </div>
          ) : (
            <Textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              required
            />
          )}
          {/* El Textarea con name="content" no está en el DOM durante la
              preview — este input oculto asegura que el valor viaje igual
              si se hace submit sin volver a "editar" antes. */}
          {showPreview && <input type="hidden" name="content" value={content} />}
          <p className="text-sm text-muted-foreground">
            Acepta formato Markdown: # para títulos, **negrita**, *itálica*, listas, tablas y
            links.
          </p>
          {state.fieldErrors?.content && (
            <p className="text-sm text-destructive">{state.fieldErrors.content[0]}</p>
          )}
        </div>

        <ImageUploadField
          id="cover_image_file"
          name="cover_image_file"
          label="Imagen de portada"
          defaultImageUrl={post?.cover_image_url}
          previewClassName="h-40"
          error={state.fieldErrors?.cover_image_file?.[0]}
        />

        <div className="grid gap-4 rounded-lg border p-4">
          <p className="text-sm font-semibold">SEO / LLMs</p>

          <div className="grid gap-2">
            <Label htmlFor="meta_title">Meta title</Label>
            <Input
              id="meta_title"
              name="meta_title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Si se deja vacío, se usa el título del post"
            />
            {state.fieldErrors?.meta_title && (
              <p className="text-sm text-destructive">{state.fieldErrors.meta_title[0]}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meta_description">Meta description</Label>
            <Textarea
              id="meta_description"
              name="meta_description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={2}
              placeholder="Si se deja vacío, se usa el resumen del post"
            />
            <p
              className={
                metaDescription.length > 160
                  ? "text-sm text-destructive"
                  : "text-sm text-muted-foreground"
              }
            >
              {metaDescription.length}/160 caracteres recomendados
            </p>
            {state.fieldErrors?.meta_description && (
              <p className="text-sm text-destructive">{state.fieldErrors.meta_description[0]}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="canonical_url">Canonical URL</Label>
            <Input
              id="canonical_url"
              name="canonical_url"
              defaultValue={post?.canonical_url ?? ""}
              placeholder="Solo si el contenido se republica en otro lugar"
            />
            {state.fieldErrors?.canonical_url && (
              <p className="text-sm text-destructive">{state.fieldErrors.canonical_url[0]}</p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">Estado</Label>
          <Select name="status" value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
            <SelectTrigger id="status" className="w-full sm:w-1/2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="published">Publicada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="author_id">Autor</Label>
          <Select name="author_id" defaultValue={post?.author_id ?? defaultAuthorId ?? ""}>
            <SelectTrigger id="author_id" className="w-full">
              <SelectValue placeholder="Sin autor" />
            </SelectTrigger>
            <SelectContent>
              {authors.map((author) => (
                <SelectItem key={author.id} value={author.id}>
                  {author.full_name ?? author.email ?? author.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.fieldErrors?.author_id && (
            <p className="text-sm text-destructive">{state.fieldErrors.author_id[0]}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="is_featured"
            name="is_featured"
            defaultChecked={post?.is_featured ?? false}
          />
          <Label htmlFor="is_featured" className="font-normal cursor-pointer">
            Destacar en portada
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="is_popular"
            name="is_popular"
            defaultChecked={post?.is_popular ?? false}
          />
          <Label htmlFor="is_popular" className="font-normal cursor-pointer">
            Mostrar en más vistos
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="featured_in_slider"
            name="featured_in_slider"
            defaultChecked={post?.featured_in_slider ?? false}
          />
          <Label htmlFor="featured_in_slider" className="font-normal cursor-pointer">
            Destacado en slider principal
          </Label>
        </div>

        <div className="grid gap-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Preguntas frecuentes</p>
            <Button type="button" variant="outline" size="sm" onClick={addFaq}>
              <PlusIcon className="size-3.5" />
              Agregar pregunta
            </Button>
          </div>

          {faqs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Sin preguntas cargadas todavía. Si agregás al menos una, se muestran al final de la
              nota y se genera el schema FAQPage.
            </p>
          )}

          {faqs.map((faq, index) => (
            <div key={index} className="grid gap-2 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <Label htmlFor={`faq_question_${index}`}>Pregunta {index + 1}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFaq(index)}
                >
                  <TrashIcon className="size-4" />
                </Button>
              </div>
              <Input
                id={`faq_question_${index}`}
                value={faq.question}
                onChange={(e) => updateFaq(index, "question", e.target.value)}
                placeholder="¿Pregunta?"
              />
              <Label htmlFor={`faq_answer_${index}`}>Respuesta</Label>
              <Textarea
                id={`faq_answer_${index}`}
                value={faq.answer}
                onChange={(e) => updateFaq(index, "answer", e.target.value)}
                rows={2}
                placeholder="Respuesta"
              />
            </div>
          ))}

          <input type="hidden" name="faqs" value={JSON.stringify(faqs)} />
        </div>

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Guardando..." : post ? "Guardar cambios" : "Crear nota"}
        </Button>
      </form>
    </div>
  );
}
