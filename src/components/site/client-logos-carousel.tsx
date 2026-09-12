import { PLACEHOLDER_LOGOS } from "@/lib/placeholder-logos";
import type { Client } from "@/lib/types";

interface ClientLogosCarouselProps {
  clients?: Client[];
}

interface LogoEntry {
  key: string;
  name: string;
  node: React.ReactNode;
}

const ROWS = [1, 2, 3] as const;
const ROW_DIRECTION: Record<(typeof ROWS)[number], "left" | "right"> = {
  1: "left",
  2: "right",
  3: "left",
};

function placeholderLogo(logo: (typeof PLACEHOLDER_LOGOS)[number]): LogoEntry {
  return { key: `placeholder-${logo.id}`, name: logo.name, node: logo.node };
}

function clientLogo(client: Client): LogoEntry {
  return {
    key: client.id,
    name: client.name,
    node: (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={client.logo_url}
        alt={client.name}
        className="h-6 w-auto max-w-32 object-contain sm:h-7"
      />
    ),
  };
}

/**
 * Carrusel de logos de clientes: 3 filas full-bleed (rompe el contenedor
 * centrado del layout) que se desplazan en loop infinito, en direcciones
 * alternadas, con CSS puro (sin JS por frame) para que sea performante.
 */
export function ClientLogosCarousel({ clients = [] }: ClientLogosCarouselProps) {
  const rows = ROWS.map((rowNumber) => {
    const rowClients = clients.filter((client) => client.row_number === rowNumber);
    const items =
      rowClients.length > 0
        ? rowClients.map(clientLogo)
        : PLACEHOLDER_LOGOS.filter((_, index) => index % 3 === rowNumber - 1).map(
            placeholderLogo
          );
    return { rowNumber, items, direction: ROW_DIRECTION[rowNumber] };
  });

  return (
    <section
      aria-label="Marcas que confiaron en nosotros"
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-10 sm:py-14"
    >
      <div className="flex flex-col gap-6 sm:gap-8">
        {rows.map((row) => (
          <LogoMarqueeRow key={row.rowNumber} items={row.items} direction={row.direction} />
        ))}
      </div>
    </section>
  );
}

function LogoMarqueeRow({
  items,
  direction,
}: {
  items: LogoEntry[];
  direction: "left" | "right";
}) {
  if (items.length === 0) return null;

  return (
    <div className="marquee-row">
      <div
        className={`marquee-track ${direction === "right" ? "marquee-track-reverse" : ""}`}
      >
        {[...items, ...items].map((item, index) => (
          <div
            key={`${item.key}-${index}`}
            className="flex shrink-0 items-center justify-center px-8 text-black grayscale opacity-30 sm:px-12"
            title={item.name}
          >
            {item.node}
          </div>
        ))}
      </div>
    </div>
  );
}
