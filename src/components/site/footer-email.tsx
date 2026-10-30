/**
 * Correo gigante del footer. En mobile (< 768px) el texto ocupa casi el
 * 100% del ancho de la pantalla (el contenedor rompe el padding lateral del
 * footer). En escritorio usa el tamaño fijo de 8.2vw.
 *
 * El tamaño mobile es CSS puro: "hola@crabsense.com" en Google Sans Flex
 * semibold con tracking-tighter mide ~9.92em (medido en el navegador), así que 100vw / 9.92 ≈
 * 10vw. Antes se calculaba con JS al cargar y el footer cambiaba de alto
 * después del primer render (PageSpeed: Cumulative Layout Shift). Si se
 * cambia el correo, recalcular este valor.
 */
export function FooterEmail({ email }: { email: string }) {
  return (
    // mobile: el contenedor padre (site-footer) no tiene padding lateral,
    // así que este ancho = 100vw
    <div className="max-md:text-center">
      <a
        href={`mailto:${email}`}
        className="-mb-[0.22em] block whitespace-nowrap font-heading text-[8.2vw] font-semibold leading-none tracking-tighter text-white/[0.05] transition-colors duration-300 hover:text-white/[0.12] max-md:text-[10vw] max-md:text-white/[0.08]"
      >
        <span className="inline-block">{email}</span>
      </a>
    </div>
  );
}
