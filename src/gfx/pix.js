// Lienzo de píxeles indexado: se dibuja con claves de paleta y luego se vuelca a un <canvas>.
// Así todo el arte sale con paleta limitada, contornos limpios y sin antialiasing (estilo 16 bits).

export class Pix {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.d = new Array(w * h).fill(null);
  }

  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.d[y * this.w + x];
  }

  set(x, y, c) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
    this.d[y * this.w + x] = c;
    return this;
  }

  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
    return this;
  }

  /** Rectángulo con borde de otro color. */
  box(x, y, w, h, fill, border) {
    this.rect(x, y, w, h, border);
    if (w > 2 && h > 2) this.rect(x + 1, y + 1, w - 2, h - 2, fill);
    return this;
  }

  hline(x, y, w, c) { return this.rect(x, y, w, 1, c); }
  vline(x, y, h, c) { return this.rect(x, y, 1, h, c); }

  ellipse(cx, cy, rx, ry, c, fn) {
    const x0 = Math.floor(cx - rx - 1);
    const x1 = Math.ceil(cx + rx + 1);
    const y0 = Math.floor(cy - ry - 1);
    const y1 = Math.ceil(cy + ry + 1);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, fn ? fn(x, y, dx, dy) : c);
      }
    }
    return this;
  }

  /** Disco de radio r (para trazos gruesos). */
  disc(cx, cy, r, c, fn) {
    return this.ellipse(cx, cy, r, r, c, fn);
  }

  /** Línea gruesa de (x0,y0) a (x1,y1) con radio r (r puede variar de r0 a r1). */
  line(x0, y0, x1, y1, r0, c, r1 = r0) {
    const d = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.ceil(d * 2));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const r = r0 + (r1 - r0) * t;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      if (r < 0.75) this.set(Math.floor(x), Math.floor(y), c);
      else this.disc(x, y, r, c);
    }
    return this;
  }

  /** Curva cuadrática gruesa; fn(t) devuelve el radio y shadeFn opcional decide el color por píxel. */
  curve(p0, p1, p2, radius, c, shadeFn) {
    const pts = [];
    const n = 24;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const u = 1 - t;
      pts.push({ t, x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y });
    }
    for (const q of pts) {
      const r = typeof radius === 'function' ? radius(q.t) : radius;
      this.ellipse(q.x, q.y, r, r, c, shadeFn ? (x, y, dx, dy) => shadeFn(dx, dy, q.t) : null);
    }
    return pts;
  }

  /** Rellena con un patrón: fn(x, y) -> clave o undefined (no tocar). Solo píxeles ya pintados si onlyPainted. */
  pattern(x0, y0, w, h, fn, onlyPainted = false) {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        if (onlyPainted && this.get(x, y) === null) continue;
        const k = fn(x, y, this.get(x, y));
        if (k !== undefined) this.set(x, y, k);
      }
    }
    return this;
  }

  /** Recorre píxeles pintados y cambia color según una función (para sombrear). */
  map(fn) {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const c = this.d[y * this.w + x];
        if (c !== null) {
          const n = fn(x, y, c);
          if (n !== undefined) this.d[y * this.w + x] = n;
        }
      }
    }
    return this;
  }

  /** Añade contorno de 1 px alrededor de todo lo pintado. */
  outline(c, diagonal = false) {
    const add = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.get(x, y) !== null) continue;
        const n = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        if (diagonal) n.push([1, 1], [-1, 1], [1, -1], [-1, -1]);
        if (n.some(([dx, dy]) => { const v = this.get(x + dx, y + dy); return v !== null && v !== c; })) add.push([x, y]);
      }
    }
    for (const [x, y] of add) this.set(x, y, c);
    return this;
  }

  /** Pelo revuelto: añade píxeles sueltos fuera del contorno (para Chonko). */
  fluff(c, seed = 3, density = 0.35) {
    let s = seed;
    const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    const add = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.get(x, y) !== null) continue;
        const near = [[1, 0], [-1, 0], [0, -1]].some(([dx, dy]) => this.get(x + dx, y + dy) === 'o');
        if (near && rnd() < density) add.push([x, y]);
      }
    }
    for (const [x, y] of add) this.set(x, y, c);
    return this;
  }

  /** Pega otro Pix encima (opcionalmente volteado). */
  blit(src, ox, oy, flip = false) {
    for (let y = 0; y < src.h; y++) {
      for (let x = 0; x < src.w; x++) {
        const c = src.get(flip ? src.w - 1 - x : x, y);
        if (c !== null) this.set(ox + x, oy + y, c);
      }
    }
    return this;
  }

  /** Dibuja un arte en texto (una fila por cadena, '.' = transparente). */
  art(rows, ox = 0, oy = 0, remap = null) {
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        let ch = row[x];
        if (ch === '.' || ch === ' ') continue;
        if (remap && remap[ch]) ch = remap[ch];
        this.set(ox + x, oy + y, ch);
      }
    });
    return this;
  }

  flipX() {
    const p = new Pix(this.w, this.h);
    p.blit(this, 0, 0, true);
    return p;
  }

  /** Vuelca a un canvas usando una paleta {clave: '#rrggbb'}. */
  draw(ctx, pal, ox = 0, oy = 0) {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const c = this.d[y * this.w + x];
        if (c === null) continue;
        const col = pal[c] ?? c;
        if (!col || col === 'none') continue;
        ctx.fillStyle = col;
        ctx.fillRect(ox + x, oy + y, 1, 1);
      }
    }
  }
}

// ---------------------------------------------------------------- color
export function rgb(hex) {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function hex([r, g, b]) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${((1 << 24) | (c(r) << 16) | (c(g) << 8) | c(b)).toString(16).slice(1)}`;
}
export function mix(a, b, t) {
  const A = rgb(a);
  const B = rgb(b);
  return hex(A.map((v, i) => v + (B[i] - v) * t));
}
export const lighten = (c, t) => mix(c, '#fff8e8', t);
export const darken = (c, t) => mix(c, '#140c1c', t);

/** Rampa de 4 tonos a partir de un color base: [sombra profunda, sombra, base, luz]. */
export function ramp(base) {
  return [darken(base, 0.45), darken(base, 0.22), base, lighten(base, 0.28)];
}

export function makeCanvas(w, h) {
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  throw new Error('makeCanvas necesita un navegador');
}

/** Junta varios Pix en una tira horizontal de fotogramas. */
export function sheetCanvas(frames, pal) {
  const fw = frames[0].w;
  const fh = frames[0].h;
  const c = makeCanvas(fw * frames.length, fh);
  const ctx = c.getContext('2d');
  frames.forEach((f, i) => f.draw(ctx, pal, i * fw, 0));
  return c;
}
