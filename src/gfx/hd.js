// Paso a alta resolución: duplica un Pix, añade biselado (luz arriba-izquierda, sombra abajo-derecha),
// texturas de material (veta de madera, trama de tela, brillo de metal/cerámica) y un contorno fino.
import { Pix, lighten, darken } from './pix.js';

// Qué claves de paleta son de qué material.
const WOOD = new Set(['m', 'M', 'q', 'n', 'N', 'i', 'I', 'E', 'e', 't', 'T']);
const FABRIC = new Set(['f', 'F', 'x', 'b', 'B', 'u', 'U', 'p', 'P', 'l', 'L', 'v', 'V', 'r', 'R']);
const GLOSS = new Set(['w', 'W', 'a', 'A', 's', 'g', 'G', 'k', 'z', 'c']);

const hash = (x, y) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export function upscale(src, k = 2) {
  const p = new Pix(src.w * k, src.h * k);
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const c = src.get(x, y);
      if (c !== null) p.rect(x * k, y * k, k, k, c);
    }
  }
  return p;
}

/** Biselado y texturas sobre un Pix ya ampliado. Devuelve el mismo Pix. */
export function enhance(p, { bevel = true, texture = true, seed = 0 } = {}) {
  const src = p.d.slice();
  const get = (x, y) => (x < 0 || y < 0 || x >= p.w || y >= p.h ? null : src[y * p.w + x]);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const c = get(x, y);
      if (c === null || c === 'o' || c.length > 1) continue;
      let out = c;
      if (bevel) {
        const up = get(x, y - 1);
        const left = get(x - 1, y);
        const down = get(x, y + 1);
        const right = get(x + 1, y);
        if (up !== c || left !== c) out = `${c}+`;
        else if (down !== c || right !== c) out = `${c}-`;
      }
      if (texture && out === c) {
        const r = hash(x + seed, y);
        if (WOOD.has(c)) {
          // Vetas horizontales que ondulan un poco.
          const g = Math.sin((x + seed) * 0.35 + Math.floor(y / 3) * 2.1) + (r - 0.5) * 0.8;
          if (g > 1.05) out = `${c}-`;
          else if (r < 0.04) out = `${c}+`;
        } else if (FABRIC.has(c)) {
          if ((x + y) % 2 === 0 && r < 0.35) out = `${c}-`;
          else if (r > 0.94) out = `${c}+`;
        } else if (GLOSS.has(c)) {
          if (r > 0.97) out = `${c}+`;
        }
      }
      if (out !== c) p.d[y * p.w + x] = out;
    }
  }
  return p;
}

/** Añade a una paleta las variantes clara (+) y oscura (-) de cada color. */
export function hdPalette(pal) {
  const out = { ...pal };
  for (const [k, v] of Object.entries(pal)) {
    if (typeof v !== 'string' || !v.startsWith('#') || k.length > 1) continue;
    out[`${k}+`] = lighten(v, 0.22);
    out[`${k}-`] = darken(v, 0.2);
  }
  return out;
}

/** Atajo: Pix de baja resolución -> Pix HD con biselado, textura y contorno de 1 px. */
export function toHD(src, opts = {}) {
  const p = enhance(upscale(src), opts);
  if (opts.outline !== false) p.outline('o');
  return p;
}

export { hash };
