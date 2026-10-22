/**
 * Fondo de prueba para el hero (escritorio): degradé tipo "mesh" sobre un
 * azul noche, con un celeste/azul arriba a la izquierda, el verde del logo
 * de Crabsense abajo a la izquierda (en lugar del rosa de la referencia) y
 * un violeta de transición. Las manchas se mueven y respiran muy despacio
 * (solo CSS: transform en la GPU) y encima va un grano fino como en la
 * imagen de referencia. Con prefers-reduced-motion queda quieto.
 */
const CSS = `
.hg-root{position:absolute;inset:0;overflow:hidden;background:#1d1a52}
.hg-blob{position:absolute;border-radius:9999px;filter:blur(90px);will-change:transform}
.hg-blue{width:70vw;height:70vw;left:-12vw;top:-38vw;
  background:radial-gradient(circle at 50% 55%,#2fa3d6 0%,#2a6fb8 38%,rgba(36,60,140,0) 70%);
  animation:hg-a 26s ease-in-out infinite alternate}
.hg-green{width:62vw;height:62vw;left:-26vw;top:6vw;
  background:radial-gradient(circle at 50% 50%,#7cc9b0 0%,#579191 35%,rgba(62,120,126,0) 70%);
  animation:hg-b 31s ease-in-out infinite alternate}
.hg-violet{width:58vw;height:58vw;left:10vw;top:16vw;
  background:radial-gradient(circle at 50% 50%,#6a2c9a 0%,#4a2a86 40%,rgba(45,35,110,0) 70%);
  animation:hg-c 36s ease-in-out infinite alternate}
.hg-deep{width:80vw;height:80vw;right:-30vw;top:-20vw;
  background:radial-gradient(circle at 50% 50%,#191646 0%,rgba(29,26,82,0) 70%);
  animation:hg-d 40s ease-in-out infinite alternate}
.hg-grain{position:absolute;inset:-50%;opacity:.22;mix-blend-mode:overlay;pointer-events:none;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  animation:hg-grain 1.2s steps(4) infinite}
@keyframes hg-a{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(9vw,5vw,0) scale(1.12)}100%{transform:translate3d(-3vw,9vw,0) scale(.95)}}
@keyframes hg-b{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(8vw,-6vw,0) scale(1.15)}100%{transform:translate3d(14vw,3vw,0) scale(1.05)}}
@keyframes hg-c{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-8vw,-7vw,0) scale(1.1)}100%{transform:translate3d(6vw,-12vw,0) scale(.92)}}
@keyframes hg-d{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(-10vw,8vw,0)}}
@keyframes hg-grain{0%{transform:translate(0,0)}25%{transform:translate(-3%,2%)}50%{transform:translate(2%,-3%)}75%{transform:translate(-2%,-1%)}100%{transform:translate(0,0)}}
@media (prefers-reduced-motion:reduce){.hg-blob,.hg-grain{animation:none}}
`;

export function HeroGradient({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <style>{CSS}</style>
      <div className="hg-root">
        <div className="hg-blob hg-deep" />
        <div className="hg-blob hg-violet" />
        <div className="hg-blob hg-blue" />
        <div className="hg-blob hg-green" />
        <div className="hg-grain" />
      </div>
    </div>
  );
}
