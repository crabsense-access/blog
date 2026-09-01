import Link from "next/link";

import { PostImage } from "@/components/site/post-image";
import { LinkedinIcon } from "@/components/site/linkedin-icon";
import type { Profile } from "@/lib/types";

export function ExpertsSection({ experts }: { experts: Profile[] }) {
  if (experts.length === 0) return null;

  return (
    <section className="w-full bg-[#1a1a1a] py-16 md:py-24">
      <div className="mx-auto max-w-[108rem] px-10 text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          Nuestros expertos en el blog
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-neutral-300">
          Conocé al equipo detrás de nuestro contenido
        </p>

        <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {experts.map((expert) => (
            <div key={expert.id} className="flex flex-col items-center gap-2">
              <Link
                href={`/blog/autor/${expert.id}`}
                className="flex flex-col items-center gap-3"
              >
                <PostImage
                  src={expert.avatar_url}
                  alt={expert.full_name ?? "Autor"}
                  className="aspect-square w-full rounded-lg"
                />
                <div>
                  <p className="font-bold text-white">
                    {expert.full_name ?? "Autor"} <span aria-hidden>→</span>
                  </p>
                  {expert.public_title && (
                    <p className="mt-1 text-sm text-neutral-400">{expert.public_title}</p>
                  )}
                </div>
              </Link>
              {expert.linkedin_url && (
                <a
                  href={expert.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 transition-colors hover:text-white"
                >
                  <LinkedinIcon className="size-4" />
                  <span className="sr-only">
                    LinkedIn de {expert.full_name ?? "este autor"}
                  </span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
