import { DownloadIcon } from "lucide-react";

const PLACEHOLDER_IMAGE_URL =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80";

export function PromptDownloadBlock() {
  return (
    <div className="relative flex min-h-40 flex-col justify-end gap-3 overflow-hidden rounded-lg bg-[url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80')] bg-cover bg-center p-4 text-white">
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative flex flex-col gap-3">
        <p className="text-sm font-semibold">
          Descargá nuestro prompt gratuito para blogs con IA
        </p>
        <a
          href="/downloads/prompt-ejemplo.txt"
          download
          className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-white/90"
        >
          <DownloadIcon className="size-3.5" />
          Descargar
        </a>
      </div>
    </div>
  );
}
