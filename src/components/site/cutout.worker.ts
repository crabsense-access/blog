/// <reference lib="webworker" />
// Recorte del fondo blanco de las imágenes de servicios (ver cutout-image.tsx),
// fuera del hilo principal: el flood fill sobre ~400 mil píxeles tardaba
// ~70 ms por imagen y bloqueaba la página durante la carga (PageSpeed: Total
// Blocking Time). Acá corre en paralelo y solo devuelve el PNG resultante.

type Req = { id: number; url: string; threshold: number };
type Res =
  | { id: number; status: "cut"; blob: Blob }
  | { id: number; status: "transparent" }
  | { id: number; status: "error" };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (e: MessageEvent<Req>) => {
  const { id, url, threshold } = e.data;
  const reply = (r: Res) => ctx.postMessage(r);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const bmp = await createImageBitmap(await res.blob());
    const w = bmp.width;
    const h = bmp.height;
    const canvas = new OffscreenCanvas(w, h);
    const g = canvas.getContext("2d", { willReadFrequently: true });
    if (!g) throw new Error("no 2d");
    g.drawImage(bmp, 0, 0);
    bmp.close();
    const data = g.getImageData(0, 0, w, h);
    const d = data.data;

    // si ya tiene transparencia en las esquinas, no hace falta recortar
    const corners = [0, w - 1, (h - 1) * w, h * w - 1];
    if (corners.some((i) => d[i * 4 + 3] < 250)) {
      reply({ id, status: "transparent" });
      return;
    }

    const isWhite = (i: number) =>
      d[i * 4] >= threshold && d[i * 4 + 1] >= threshold && d[i * 4 + 2] >= threshold;
    const seen = new Uint8Array(w * h);
    const stack: number[] = [];
    const push = (i: number) => {
      if (!seen[i] && isWhite(i)) {
        seen[i] = 1;
        stack.push(i);
      }
    };
    for (let x = 0; x < w; x++) {
      push(x);
      push((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      push(y * w);
      push(y * w + w - 1);
    }
    while (stack.length) {
      const i = stack.pop()!;
      d[i * 4 + 3] = 0;
      const x = i % w;
      if (x > 0) push(i - 1);
      if (x < w - 1) push(i + 1);
      if (i >= w) push(i - w);
      if (i < w * (h - 1)) push(i + w);
    }
    // borde suave: los píxeles de la figura pegados al fondo quitado
    // quedan semitransparentes según qué tan claros son
    for (let i = 0; i < w * h; i++) {
      if (seen[i]) continue;
      const x = i % w;
      const nearBg =
        (x > 0 && seen[i - 1]) ||
        (x < w - 1 && seen[i + 1]) ||
        (i >= w && seen[i - w]) ||
        (i < w * (h - 1) && seen[i + w]);
      if (nearBg) {
        const light = Math.min(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
        if (light > 200) d[i * 4 + 3] = Math.round(255 * (1 - (light - 200) / 55) * 0.8 + 51);
      }
    }
    g.putImageData(data, 0, 0);
    reply({ id, status: "cut", blob: await canvas.convertToBlob({ type: "image/png" }) });
  } catch {
    reply({ id, status: "error" });
  }
};
