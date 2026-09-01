"use client";

import { useActionState, useState } from "react";

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
import { slugify } from "@/lib/slugify";
import type { Category, PostWithRelations, Profile, Subcategory } from "@/lib/types";
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
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [categoryId, setCategoryId] = useState(post?.category_id ?? "");
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(
    new Set(post?.subcategories.map((s) => s.id) ?? [])
  );

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
        <Label htmlFor="content">Contenido</Label>
        <Textarea
          id="content"
          name="content"
          defaultValue={post?.content ?? ""}
          rows={14}
          required
        />
        {state.fieldErrors?.content && (
          <p className="text-sm text-destructive">{state.fieldErrors.content[0]}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cover_image_url">Imagen de portada (URL)</Label>
        <Input
          id="cover_image_url"
          name="cover_image_url"
          defaultValue={post?.cover_image_url ?? ""}
          placeholder="https://..."
        />
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

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : post ? "Guardar cambios" : "Crear nota"}
      </Button>
    </form>
  );
}
