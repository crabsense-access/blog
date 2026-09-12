"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSuccessToast } from "@/lib/use-success-toast";
import type { Category, CategoryBlockWithCategory } from "@/lib/types";
import { updateCategoryBlock, type CategoryBlockFormState } from "./actions";

const initialState: CategoryBlockFormState = {};

export function CategoryBlockForm({
  block,
  categories,
}: {
  block: CategoryBlockWithCategory;
  categories: Category[];
}) {
  const action = updateCategoryBlock.bind(null, block.position);
  const [state, formAction, pending] = useActionState(action, initialState);
  useSuccessToast(state, initialState);

  return (
    <form action={formAction} className="grid max-w-lg gap-6">
      <div className="grid gap-2">
        <Label htmlFor={`category_id-${block.position}`}>Categoría</Label>
        <Select name="category_id" defaultValue={block.category_id ?? ""}>
          <SelectTrigger id={`category_id-${block.position}`} className="w-full">
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
        {state.fieldErrors?.category_id && (
          <p className="text-sm text-destructive">{state.fieldErrors.category_id[0]}</p>
        )}
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
