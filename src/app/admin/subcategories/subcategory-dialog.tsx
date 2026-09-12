"use client";

import { useActionState, useState } from "react";
import { PencilIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { slugify } from "@/lib/slugify";
import { useSuccessToast } from "@/lib/use-success-toast";
import { TagPill } from "@/components/site/tag-pill";
import type { Category, Subcategory } from "@/lib/types";
import {
  createSubcategory,
  updateSubcategory,
  type SubcategoryFormState,
} from "./actions";

const initialState: SubcategoryFormState = {};
const DEFAULT_PILL_COLOR = "#6b7280";

interface SubcategoryDialogProps {
  categories: Category[];
  subcategory?: Subcategory;
  defaultCategoryId?: string;
}

export function SubcategoryDialog({
  categories,
  subcategory,
  defaultCategoryId,
}: SubcategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const action = subcategory
    ? updateSubcategory.bind(null, subcategory.id)
    : createSubcategory;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [slug, setSlug] = useState(subcategory?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(subcategory));
  const [pillColor, setPillColor] = useState(subcategory?.pill_color ?? DEFAULT_PILL_COLOR);
  const [name, setName] = useState(subcategory?.name ?? "");
  const [preview, setPreview] = useState<string | null>(subcategory?.image_url ?? null);

  useSuccessToast(state, initialState, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {subcategory ? (
          <Button variant="ghost" size="icon">
            <PencilIcon className="size-4" />
          </Button>
        ) : (
          <Button variant={defaultCategoryId ? "outline" : "default"} size={defaultCategoryId ? "sm" : "default"}>
            <PlusIcon className={defaultCategoryId ? "size-3.5" : undefined} />
            {defaultCategoryId ? "Subcategoría" : "Nueva subcategoría"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {subcategory ? "Editar subcategoría" : "Nueva subcategoría"}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              required
            />
            {state.fieldErrors?.name && (
              <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
            )}
          </div>
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
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={subcategory?.description ?? ""}
              rows={2}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category_id">Categoría</Label>
            <Select
              name="category_id"
              defaultValue={subcategory?.category_id ?? defaultCategoryId ?? ""}
            >
              <SelectTrigger id="category_id" className="w-full">
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
            <Label htmlFor="image_file">Imagen de fondo</Label>
            <Input
              id="image_file"
              name="image_file"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Vista previa de la imagen"
                className="h-24 w-full max-w-xs rounded object-cover"
              />
            )}
            {state.fieldErrors?.image_file && (
              <p className="text-sm text-destructive">{state.fieldErrors.image_file[0]}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pill_color">Color del pill</Label>
            <div className="flex items-center gap-3">
              <input
                id="pill_color"
                name="pill_color"
                type="color"
                value={pillColor}
                onChange={(e) => setPillColor(e.target.value)}
                className="h-9 w-14 cursor-pointer rounded border"
              />
              <TagPill tone="category" color={pillColor}>
                {name || "Ejemplo"}
              </TagPill>
            </div>
            {state.fieldErrors?.pill_color && (
              <p className="text-sm text-destructive">{state.fieldErrors.pill_color[0]}</p>
            )}
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
