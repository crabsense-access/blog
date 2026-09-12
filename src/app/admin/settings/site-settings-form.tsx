"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSuccessToast } from "@/lib/use-success-toast";
import type { SiteSettings } from "@/lib/types";
import { updateSiteSettings, type SiteSettingsFormState } from "./actions";

const initialState: SiteSettingsFormState = {};

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateSiteSettings, initialState);
  useSuccessToast(state, initialState);

  return (
    <form action={formAction} className="grid max-w-lg gap-6">
      <div className="grid gap-2">
        <Label htmlFor="category_page_initial_items">
          Items iniciales en la página de categoría
        </Label>
        <Input
          id="category_page_initial_items"
          name="category_page_initial_items"
          type="number"
          min={1}
          max={50}
          defaultValue={settings.category_page_initial_items}
          className="max-w-32"
          required
        />
        <p className="text-sm text-muted-foreground">
          Cantidad de notas que se muestran al entrar a cualquier página de categoría, antes de
          usar el botón &quot;Ver más&quot;. Aplica a todas las categorías por igual.
        </p>
        {state.fieldErrors?.category_page_initial_items && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.category_page_initial_items[0]}
          </p>
        )}
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
