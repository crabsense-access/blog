"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/slugify";
import type { Category, PostWithRelations, Tag } from "@/lib/types";
import type { PostFormState } from "./actions";

interface PostFormProps {
  categories: Category[];
  tags: Tag[];
  post?: PostWithRelations;
  action: (state: PostFormState, formData: FormData) => Promise<PostFormState>;
}

const initialState: PostFormState = {};

export function PostForm({ categories, tags, post, action }: PostFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    new Set(post?.tags.map((t) => t.id) ?? [])
  );

  function toggleTag(id: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="status">Estado</Label>
          <Select name="status" defaultValue={post?.status ?? "draft"}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="published">Publicada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category_id">Categoría</Label>
          <Select name="category_id" defaultValue={post?.category_id ?? ""}>
            <SelectTrigger id="category_id" className="w-full">
              <SelectValue placeholder="Sin categoría" />
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
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="is_featured"
          name="is_featured"
          defaultChecked={post?.is_featured ?? false}
        />
        <Label htmlFor="is_featured" className="font-normal cursor-pointer">
          Destacar en portada
        </Label>
      </div>

      <div className="grid gap-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-4">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selectedTags.has(tag.id)}
                onCheckedChange={() => toggleTag(tag.id)}
              />
              <input
                type="checkbox"
                name="tag_ids"
                value={tag.id}
                checked={selectedTags.has(tag.id)}
                readOnly
                hidden
              />
              {tag.name}
            </label>
          ))}
          {tags.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Todavía no creaste tags.
            </p>
          )}
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : post ? "Guardar cambios" : "Crear nota"}
      </Button>
    </form>
  );
}
