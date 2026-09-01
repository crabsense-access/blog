"use client";

import { useActionState, useState } from "react";
import { PencilIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Category, Subcategory } from "@/lib/types";
import {
  createSubcategory,
  updateSubcategory,
  type SubcategoryFormState,
} from "./actions";

const initialState: SubcategoryFormState = {};

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

  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state !== initialState && !state.error && !state.fieldErrors) {
      setOpen(false);
    }
  }

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
              defaultValue={subcategory?.name}
              onChange={(e) => {
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
