/**
 * Logos placeholder inventados (isotipo genérico + wordmark ficticio) para
 * poblar el carrusel de clientes de la home mientras no haya clientes
 * cargados en /admin/clientes. Ningún nombre ni forma corresponde a una
 * marca real.
 */
function Wordmark({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 140 32"
      className="h-6 w-auto sm:h-7"
      fill="currentColor"
      aria-hidden="true"
    >
      {icon}
      <text
        x="34"
        y="22"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="17"
        fontWeight="700"
        letterSpacing="0.5"
      >
        {label}
      </text>
    </svg>
  );
}

export interface PlaceholderLogo {
  id: string;
  name: string;
  node: React.ReactNode;
}

export const PLACEHOLDER_LOGOS: PlaceholderLogo[] = [
  {
    id: "nimbus",
    name: "Nimbus",
    node: (
      <Wordmark
        label="NIMBUS"
        icon={<circle cx="14" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="3" />}
      />
    ),
  },
  {
    id: "vertex",
    name: "Vertex",
    node: (
      <Wordmark
        label="VERTEX"
        icon={<polygon points="14,4 25,26 3,26" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />}
      />
    ),
  },
  {
    id: "orbit",
    name: "Orbit",
    node: (
      <Wordmark
        label="ORBIT"
        icon={
          <g>
            <circle cx="14" cy="16" r="4" />
            <ellipse cx="14" cy="16" rx="12" ry="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </g>
        }
      />
    ),
  },
  {
    id: "atlas",
    name: "Atlas",
    node: (
      <Wordmark
        label="ATLAS"
        icon={<rect x="4" y="5" width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />}
      />
    ),
  },
  {
    id: "quant",
    name: "Quant",
    node: (
      <Wordmark
        label="QUANT"
        icon={
          <g>
            <rect x="3" y="18" width="5" height="8" />
            <rect x="11" y="11" width="5" height="15" />
            <rect x="19" y="4" width="5" height="22" />
          </g>
        }
      />
    ),
  },
  {
    id: "forge",
    name: "Forge",
    node: (
      <Wordmark
        label="FORGE"
        icon={<polygon points="4,16 14,4 24,16 14,28" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />}
      />
    ),
  },
  {
    id: "prism",
    name: "Prism",
    node: (
      <Wordmark
        label="PRISM"
        icon={
          <path
            d="M14 3 L24 10 V22 L14 29 L4 22 V10 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        }
      />
    ),
  },
  {
    id: "axiom",
    name: "Axiom",
    node: (
      <Wordmark
        label="AXIOM"
        icon={
          <g>
            <path d="M2 22 L14 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M14 6 L26 22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M7 17 H21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </g>
        }
      />
    ),
  },
  {
    id: "delta",
    name: "Delta",
    node: (
      <Wordmark
        label="DELTA"
        icon={
          <path
            d="M4 26 A10 10 0 0 1 24 26 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        }
      />
    ),
  },
  {
    id: "solace",
    name: "Solace",
    node: (
      <Wordmark
        label="SOLACE"
        icon={
          <g>
            <rect x="3" y="5" width="22" height="22" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="14" cy="16" r="3" />
          </g>
        }
      />
    ),
  },
  {
    id: "meridian",
    name: "Meridian",
    node: (
      <Wordmark
        label="MERIDIAN"
        icon={
          <g fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="14" cy="16" r="11" />
            <ellipse cx="14" cy="16" rx="4.5" ry="11" />
            <path d="M3 16 H25" />
          </g>
        }
      />
    ),
  },
  {
    id: "cobalt",
    name: "Cobalt",
    node: (
      <Wordmark
        label="COBALT"
        icon={
          <polygon
            points="14,3 24,9 24,21 14,27 4,21 4,9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        }
      />
    ),
  },
  {
    id: "lumen",
    name: "Lumen",
    node: (
      <Wordmark
        label="LUMEN"
        icon={
          <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="14" cy="16" r="5" fill="none" />
            <path d="M14 3 V7" />
            <path d="M14 25 V29" />
            <path d="M3 16 H7" />
            <path d="M21 16 H25" />
          </g>
        }
      />
    ),
  },
  {
    id: "anchor",
    name: "Anchor",
    node: (
      <Wordmark
        label="ANCHOR"
        icon={
          <path
            d="M3 5 L14 16 L3 27 M25 5 L14 16 L25 27"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        }
      />
    ),
  },
  {
    id: "zephyr",
    name: "Zephyr",
    node: (
      <Wordmark
        label="ZEPHYR"
        icon={
          <path
            d="M3 20 Q9 8 14 20 T25 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        }
      />
    ),
  },
  {
    id: "kestrel",
    name: "Kestrel",
    node: (
      <Wordmark
        label="KESTREL"
        icon={
          <path
            d="M4 22 L14 6 L24 22 M9 22 L14 14 L19 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        }
      />
    ),
  },
  {
    id: "harbor",
    name: "Harbor",
    node: (
      <Wordmark
        label="HARBOR"
        icon={
          <g>
            <rect x="4" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M9 26 L14 20 L19 26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          </g>
        }
      />
    ),
  },
  {
    id: "crest",
    name: "Crest",
    node: (
      <Wordmark
        label="CREST"
        icon={
          <polygon
            points="14,3 17,11 25,11 18.5,16 21,25 14,20 7,25 9.5,16 3,11 11,11"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        }
      />
    ),
  },
];
