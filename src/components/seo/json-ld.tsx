export function JsonLd({ data }: { data: object }) {
  // Escapa "<" para que el contenido de una nota no pueda cerrar el <script>
  // ni inyectar HTML si llegara a incluir la secuencia "</script>".
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
