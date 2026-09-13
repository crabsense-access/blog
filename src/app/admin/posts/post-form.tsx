"use client";

import { useActionState, useState } from "react";
import { PlusIcon, TrashIcon } from "lucide-react";

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
import type { PostFormState } from "./actions";

interface PostFormProps {
  categories: Category[];
  subcategories: Subcategory[];
  authors: Profile[];
  post?: PostWithRelations;
  defaultAuthorId?: string;
  action: (state: PostFormState, formData: FormData) => Promise<PostFormState>;
}

const initialState: PostFormState = {};

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
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [categoryId, setCategoryId] = useState(post?.category_id ?? "");
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(
    new Set(post?.subcategories.map((s) => s.id) ?? [])
  );
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? "");
  const [faqs, setFaqs] = useState<PostFaq[]>(post?.faqs ?? []);
  const [content, setContent] = useState(post?.content ?? "");
  const [showPreview, setShowPreview] = useState(false);

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
    <form action={formAction} className="grid max-w-2xl gap-6">
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
          defaultValue={post?.excerpt ?? ""}
          rows={2}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="quick_answer">Respuesta rápida</Label>
        <Textarea
          id="quick_answer"
          name="quick_answer"
          defaultValue={post?.quick_answer ?? ""}
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
            defaultValue={post?.meta_title ?? ""}
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
        <Select name="status" defaultValue={post?.status ?? "draft"}>
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
  );
}
