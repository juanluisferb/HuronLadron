// Suelos y paredes HD (32x32 por casilla; las paredes 32x48 porque asoman hacia arriba).
import { Pix, lighten, darken, mix } from './pix.js';
import { hash } from './hd.js';

export const T2 = 32;

const C = {
  wood: ['#b57a44', '#c48a50', '#a86e3c', '#cf9a5e'],
  woodSeam: '#6e4424', woodGrain: '#9a6234', woodShine: '#e0b070',
  tileA: '#ecebe2', tileB: '#c9dcea', grout: '#9aa0aa', tileShine: '#ffffff',
  carpet: '#b8423e', carpetD: '#8a2c2c', carpetGold: '#e0b048', carpetL: '#d0605a',
  grass: ['#5aa048', '#4c9440', '#68b050', '#3e8236'], grassBlade: '#86c860', flower: ['#f0e060', '#f08cb0', '#ffffff'],
  stone: '#b8b0a0', stoneD: '#8a8478', stoneL: '#d8d0c0', soil: '#7a5030', soilD: '#5a3820', soilL: '#946238',
  cap: '#3a2c48', capL: '#5a4870', capD: '#241a30', base: '#5c3818', baseL: '#8a5a30',
};

const pal = {};
const key = (hex) => { pal[hex] = hex; return hex; };

export function woodFloor(v) {
  const p = new Pix(T2, T2);
  for (let row = 0; row < 4; row++) {
    const y0 = row * 8;
    const shift = (row * 13 + v * 7) % T2;
    for (let seg = 0; seg < 2; seg++) {
      const x0 = (shift + seg * 19) % T2;
      const tone = C.wood[(row + seg + v) % 4];
      for (let x = 0; x < 19; x++) {
        const xx = (x0 + x) % T2;
        for (let y = 0; y < 7; y++) {
          const r = hash(xx + v * 31, y0 + y);
          let c = tone;
          const g = Math.sin(xx * 0.45 + row * 3 + seg) + (r - 0.5);
          if (g > 1.15) c = C.woodGrain;
          if (y === 0) c = lighten(tone, 0.12);
          p.set(xx, y0 + y, key(c));
        }
      }
      p.vline((shift + seg * 19) % T2, y0, 7, key(C.woodSeam));
    }
    p.hline(0, y0 + 7, T2, key(C.woodSeam));
  }
  if (v === 2) { p.set(9, 4, key(C.woodSeam)); p.set(25, 20, key(C.woodSeam)); }
  return p;
}

export function tileFloor(v) {
  const p = new Pix(T2, T2);
  for (let ty = 0; ty < 2; ty++) {
    for (let tx = 0; tx < 2; tx++) {
      const base = (tx + ty + v) % 2 ? C.tileB : C.tileA;
      p.rect(tx * 16, ty * 16, 16, 16, key(base));
      p.hline(tx * 16 + 1, ty * 16 + 1, 14, key(lighten(base, 0.4)));
      p.vline(tx * 16 + 1, ty * 16 + 1, 14, key(lighten(base, 0.3)));
      p.hline(tx * 16 + 1, ty * 16 + 14, 14, key(darken(base, 0.08)));
      for (let i = 0; i < 4; i++) p.set(tx * 16 + 4 + i, ty * 16 + 7 - i, key(C.tileShine));
      p.hline(tx * 16, ty * 16 + 15, 16, key(C.grout));
      p.vline(tx * 16 + 15, ty * 16, 16, key(C.grout));
    }
  }
  return p;
}

export function carpetFloor(v) {
  const p = new Pix(T2, T2);
  p.rect(0, 0, T2, T2, key(C.carpet));
  p.pattern(0, 0, T2, T2, (x, y) => ((x + y) % 2 === 0 && hash(x, y + v) < 0.25 ? key(C.carpetD) : undefined));
  // Rombo ornamental.
  for (let i = 0; i <= 10; i++) {
    for (const [dx, dy] of [[i, 10 - i], [-i, 10 - i], [i, i - 10], [-i, i - 10]]) p.set(16 + dx, 16 + dy, key(C.carpetGold));
  }
  p.ellipse(16, 16, 3.5, 3.5, key(C.carpetD));
  p.disc(16, 16, 1.5, key(C.carpetGold));
  for (const [x, y] of [[0, 0], [31, 0], [0, 31], [31, 31]]) p.disc(x, y, 3, key(C.carpetL));
  return p;
}

export function grassFloor(v) {
  const p = new Pix(T2, T2);
  p.pattern(0, 0, T2, T2, (x, y) => key(C.grass[Math.floor(hash(x + v * 50, y) * 4)]));
  for (let i = 0; i < 14; i++) {
    const x = Math.floor(hash(i, v + 7) * 30) + 1;
    const y = Math.floor(hash(v + 3, i) * 28) + 3;
    p.set(x, y, key(C.grassBlade));
    p.set(x, y - 1, key(C.grassBlade));
    p.set(x + 1, y - 2, key(lighten(C.grassBlade, 0.2)));
  }
  if (v === 3) {
    const f = C.flower[Math.floor(hash(v, 9) * 3)];
    p.disc(10, 10, 1.4, key(f));
    p.set(10, 10, key('#e0a020'));
  }
  return p;
}

export function pathFloor(v) {
  const p = new Pix(T2, T2);
  p.rect(0, 0, T2, T2, key(C.soilD));
  const stones = [[8, 8, 7, 6], [24, 7, 7, 6], [7, 24, 6, 6], [23, 23, 8, 7], [16, 16, 4, 3]];
  stones.forEach(([x, y, rx, ry], i) => {
    p.ellipse(x + (v % 2), y, rx, ry, null, (px, py, dx, dy) => key(dy < -0.5 || dx < -0.6 ? C.stoneL : dy > 0.55 ? C.stoneD : hash(px, py + i) > 0.9 ? C.stoneD : C.stone));
  });
  return p;
}

export function soilFloor(v) {
  const p = new Pix(T2, T2);
  p.pattern(0, 0, T2, T2, (x, y) => {
    const r = hash(x + v * 17, y);
    return key(r < 0.2 ? C.soilD : r > 0.85 ? C.soilL : C.soil);
  });
  for (let y = 4; y < T2; y += 8) p.hline(0, y, T2, key(C.soilD));
  return p;
}

// Temas de pared: papel pintado por nivel y valla de madera para el jardín.
export const WALL_THEMES = {
  1: { a: '#e8c898', b: '#d4ae7c', motif: 'stripes' },
  2: { a: '#a8d8b8', b: '#88bc9c', motif: 'dots' },
  3: { a: '#c8b0e0', b: '#a892c8', motif: 'damask' },
  4: { a: '#a87848', b: '#7e5430', motif: 'fence' },
  5: { a: '#e6d6b0', b: '#9a3a3a', motif: 'wainscot' },
};

export function wallFace(theme, front) {
  const p = new Pix(T2, 48);
  const t = WALL_THEMES[theme] ?? WALL_THEMES[1];
  if (t.motif === 'fence') {
    if (!front) {
      p.rect(0, 0, T2, 48, key(darken(t.a, 0.35)));
      p.hline(0, 0, T2, key(lighten(t.a, 0.1)));
      return p;
    }
    // Valla de tablones con remate en punta.
    for (let x = 0; x < T2; x += 8) {
      p.rect(x, 4, 7, 44, key(t.a));
      p.vline(x, 4, 44, key(lighten(t.a, 0.2)));
      p.vline(x + 6, 4, 44, key(t.b));
      p.rect(x + 2, 2, 3, 2, key(t.a));
      p.set(x + 3, 1, key(t.a));
      p.pattern(x + 1, 6, 5, 40, (px, py) => (Math.sin(py * 0.5 + px) > 0.92 ? key(t.b) : undefined));
    }
    p.rect(0, 14, T2, 3, key(t.b));
    p.rect(0, 34, T2, 3, key(t.b));
    p.hline(0, 14, T2, key(lighten(t.a, 0.15)));
    p.hline(0, 34, T2, key(lighten(t.a, 0.15)));
    return p;
  }
  if (!front) {
    p.rect(0, 0, T2, 48, key(C.cap));
    p.hline(0, 0, T2, key(C.capL));
    p.pattern(0, 1, T2, 47, (x, y) => (hash(x, y) > 0.96 ? key(C.capD) : undefined));
    return p;
  }
  p.rect(0, 0, T2, 16, key(C.cap));
  p.hline(0, 0, T2, key(C.capL));
  p.hline(0, 1, T2, key(mix(C.cap, C.capL, 0.5)));
  p.hline(0, 15, T2, key(C.capD));
  p.rect(0, 16, T2, 32, key(t.a));
  if (t.motif === 'stripes') {
    for (let x = 2; x < T2; x += 8) p.rect(x, 16, 2, 26, key(t.b));
  } else if (t.motif === 'dots') {
    for (let y = 20; y < 42; y += 6) for (let x = (y / 6) % 2 ? 3 : 7; x < T2; x += 8) p.rect(x, y, 2, 2, key(t.b));
  } else if (t.motif === 'damask') {
    for (const [cx, cy] of [[8, 24], [24, 34]]) {
      p.ellipse(cx, cy, 3, 4, key(t.b));
      p.ellipse(cx, cy, 1.4, 2, key(t.a));
      p.set(cx, cy - 6, key(t.b));
      p.set(cx, cy + 6, key(t.b));
    }
  } else if (t.motif === 'wainscot') {
    p.rect(0, 30, T2, 12, key(t.b));
    p.hline(0, 30, T2, key(lighten(t.b, 0.35)));
    p.box(3, 32, 11, 8, key(darken(t.b, 0.1)), key(darken(t.b, 0.3)));
    p.box(18, 32, 11, 8, key(darken(t.b, 0.1)), key(darken(t.b, 0.3)));
    for (let x = 0; x < T2; x += 16) p.vline(x + 8, 18, 10, key(darken(t.a, 0.08)));
  }
  p.hline(0, 16, T2, key(darken(t.a, 0.25)));
  p.rect(0, 42, T2, 6, key(C.base));
  p.hline(0, 42, T2, key(C.baseL));
  p.hline(0, 47, T2, key(darken(C.base, 0.3)));
  return p;
}

export function doorHD(closed, theme) {
  const p = new Pix(T2, 48);
  const garden = WALL_THEMES[theme]?.motif === 'fence';
  const cap = garden ? darken(WALL_THEMES[4].a, 0.35) : C.cap;
  p.rect(0, 0, T2, 16, key(cap));
  p.hline(0, 0, T2, key(lighten(cap, 0.2)));
  p.hline(0, 15, T2, key(darken(cap, 0.3)));
  const jamb = '#5c3818';
  p.rect(0, 16, 2, 32, key(jamb));
  p.rect(30, 16, 2, 32, key(jamb));
  if (closed) {
    const wood = '#a06a3a';
    p.rect(2, 16, 28, 32, key(wood));
    p.box(5, 19, 22, 11, key(lighten(wood, 0.1)), key(darken(wood, 0.3)));
    p.box(5, 32, 22, 13, key(lighten(wood, 0.1)), key(darken(wood, 0.3)));
    p.rect(24, 30, 3, 3, key('#e8c050'));
    p.set(24, 30, key('#fff0a0'));
  }
  return p;
}

export const FLOOR_PAL = pal;
