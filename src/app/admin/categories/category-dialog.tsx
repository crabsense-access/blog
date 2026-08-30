"use client";

import { useActionState, useState } from "react";
import { PencilIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { slugify } from "@/lib/slugify";
import type { Category } from "@/lib/types";
import { createCategory, updateCategory, type CategoryFormState } from "./actions";

const initialState: CategoryFormState = {};

export function CategoryDialog({ category }: { category?: Category }) {
  const [open, setOpen] = useState(false);
  const action = category ? updateCategory.bind(null, category.id) : createCategory;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category));

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
        {category ? (
          <Button variant="ghost" size="icon">
            <PencilIcon className="size-4" />
          </Button>
        ) : (
          <Button>
            <PlusIcon />
            Nueva categoría
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={category?.name}
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
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={category?.description ?? ""}
              rows={2}
            />
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
