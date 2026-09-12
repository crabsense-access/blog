"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSuccessToast } from "@/lib/use-success-toast";
import type { Profile } from "@/lib/types";
import { updateProfile, type ProfileFormState } from "./actions";

const initialState: ProfileFormState = {};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);
  useSuccessToast(state, initialState);

  return (
    <form action={formAction} className="grid max-w-lg gap-6">
      <div className="grid gap-2">
        <Label htmlFor="public_title">Cargo público</Label>
        <Input
          id="public_title"
          name="public_title"
          defaultValue={profile.public_title ?? ""}
          placeholder="Ej: Fundador, Editor de contenido"
        />
        <p className="text-sm text-muted-foreground">
          Se muestra en el sitio junto a tu nombre como autor. Dejalo vacío
          para no mostrar nada.
        </p>
        {state.fieldErrors?.public_title && (
          <p className="text-sm text-destructive">{state.fieldErrors.public_title[0]}</p>
        )}
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
