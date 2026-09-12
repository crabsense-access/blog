"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

interface ActionFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Detecta cuándo una server action (useActionState) terminó con éxito (sin
 * error ni fieldErrors) y dispara un toast "Cambios guardados" una sola vez
 * por resultado nuevo — se desvanece solo (ver duration). `onSuccess` es
 * para lo que haga falta además (ej. cerrar el diálogo).
 */
export function useSuccessToast<T extends ActionFormState>(
  state: T,
  initialState: T,
  onSuccess?: () => void
) {
  const [prevState, setPrevState] = useState(state);

  if (state !== prevState) {
    setPrevState(state);
    if (state !== initialState && !state.error && !state.fieldErrors) {
      toast.success("Cambios guardados", {
        icon: <CircleCheck className="size-4" />,
        duration: 2500,
      });
      onSuccess?.();
    }
  }
}
