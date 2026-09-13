"use client";

import { useActionState, useState } from "react";
import { PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { useSuccessToast } from "@/lib/use-success-toast";
import type { Profile } from "@/lib/types";
import { updateAuthorProfile, type AuthorFormState } from "./actions";

const initialState: AuthorFormState = {};

export function AuthorDialog({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const action = updateAuthorProfile.bind(null, profile.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  useSuccessToast(state, initialState, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PencilIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar autor: {profile.full_name ?? profile.email}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <ImageUploadField
            id={`avatar_file-${profile.id}`}
            name="avatar_file"
            label="Foto"
            defaultImageUrl={profile.avatar_url}
            previewClassName="size-16 rounded-full"
          />

          <div className="grid gap-2">
            <Label htmlFor={`public_title-${profile.id}`}>Cargo público</Label>
            <Input
              id={`public_title-${profile.id}`}
              name="public_title"
              defaultValue={profile.public_title ?? ""}
              placeholder="Ej: Head of SEO"
            />
            {state.fieldErrors?.public_title && (
              <p className="text-sm text-destructive">{state.fieldErrors.public_title[0]}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`bio-${profile.id}`}>Bio</Label>
            <Textarea
              id={`bio-${profile.id}`}
              name="bio"
              defaultValue={profile.bio ?? ""}
              rows={3}
              placeholder="Breve descripción del autor..."
            />
            {state.fieldErrors?.bio && (
              <p className="text-sm text-destructive">{state.fieldErrors.bio[0]}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id={`is_featured_expert-${profile.id}`}
              name="is_featured_expert"
              defaultChecked={profile.is_featured_expert}
            />
            <Label
              htmlFor={`is_featured_expert-${profile.id}`}
              className="font-normal cursor-pointer"
            >
              Destacar en bloque de expertos
            </Label>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`featured_position-${profile.id}`}>Posición (1 a 5)</Label>
            <Input
              id={`featured_position-${profile.id}`}
              name="featured_position"
              type="number"
              min={1}
              max={5}
              defaultValue={profile.featured_position ?? ""}
            />
            {state.fieldErrors?.featured_position && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.featured_position[0]}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`linkedin_url-${profile.id}`}>LinkedIn</Label>
            <Input
              id={`linkedin_url-${profile.id}`}
              name="linkedin_url"
              defaultValue={profile.linkedin_url ?? ""}
              placeholder="https://linkedin.com/in/..."
            />
            {state.fieldErrors?.linkedin_url && (
              <p className="text-sm text-destructive">{state.fieldErrors.linkedin_url[0]}</p>
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
