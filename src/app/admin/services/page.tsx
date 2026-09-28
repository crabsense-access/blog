import { getServiceImages } from "@/lib/queries/service-images";
import { SERVICE_LIST } from "@/lib/services";
import { ServiceImageForm } from "./service-image-form";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  let images: Awaited<ReturnType<typeof getServiceImages>> = [];
  let loadError: string | null = null;
  try {
    images = await getServiceImages();
  } catch (e) {
    loadError = (e as { message?: string }).message ?? "Error desconocido.";
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Servicios</h1>
        <p className="text-sm text-muted-foreground">
          Imagen de cada servicio en el bloque &quot;Nuestros servicios&quot; de la home (arriba
          del título). Recomendado: horizontal 16:9, por ejemplo 1600 × 900 px.
        </p>
      </div>
      {loadError && (
        <p className="text-sm text-destructive">
          No se pudieron cargar las imágenes ({loadError}). ¿Corriste la migración
          20260927000003_service_images.sql?
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        {SERVICE_LIST.map((s) => (
          <ServiceImageForm
            key={s.slug}
            slug={s.slug}
            name={s.name}
            image={images.find((i) => i.slug === s.slug)}
          />
        ))}
      </div>
    </div>
  );
}
