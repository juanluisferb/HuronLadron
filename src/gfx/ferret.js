// Hurones en alta resolución (2x) dibujados con un "esqueleto": columna que se arquea y se estira,
// patas articuladas, cola y cabeza con hocico claro y orejas rosas. Estilo inspirado en el galope
// de un hurón real: el lomo se encoge y se estira en cada zancada.
import { Pix, ramp, mix, lighten, darken } from './pix.js';

export const SIDE_W = 56;
export const SIDE_H = 36;
export const VERT = 40;
const BASE = 33; // línea del suelo en la vista lateral

// --------------------------------------------------------------------- paletas
/** Construye la paleta de un hurón a partir de su apariencia. */
export function ferretPalette(look) {
  const [, bShade, b, bLight] = ramp(look.body);
  const leg = look.legs ?? darken(look.body, 0.35);
  return {
    o: look.outline ?? mix(darken(look.body, 0.75), '#2a2228', 0.5),
    b, B: bShade, h: bLight,
    l: look.muzzle ?? '#f4ece0',
    L: darken(look.muzzle ?? '#f4ece0', 0.18),
    m: look.mask ?? darken(look.body, 0.5),
    e: look.eyes ?? '#140c0c',
    w: '#ffffff',
    n: look.nose ?? '#f08878',
    r: look.ears ?? '#f49080',
    p: leg,
    q: darken(leg, 0.3),
    t: look.tail ?? leg,
    T: darken(look.tail ?? leg, 0.25),
  };
}

// Apariencias de los tres hurones originales (se mantienen sus diseños).
export const LOOKS = {
  sardi: { body: '#f2ece0', legs: '#e4dac8', tail: '#ece4d4', muzzle: '#ffffff', mask: '#e8dece', eyes: '#b0203a', nose: '#f2a0b0', ears: '#f4a8b4', outline: '#3e3236', fluffy: false, size: 0 },
  pepis: { body: '#8c5c36', legs: '#3a2414', tail: '#3a2414', muzzle: '#f4ece0', mask: '#3e2414', eyes: '#140c0c', nose: '#f08878', ears: '#f49080', outline: '#2a2020', fluffy: false, size: 0 },
  chonko: { body: '#6a3e24', legs: '#3a1e0e', tail: '#4a2812', muzzle: '#d8b894', mask: '#36200f', eyes: '#100808', nose: '#c87070', ears: '#e09080', outline: '#1c1210', fluffy: true, size: 1 },
};

// --------------------------------------------------------------------- vista lateral
// Fotogramas clave del galope: cadera, hombros, arco del lomo, cabeceo y pies (relativos).
const GALLOP = [
  { hip: [17, 24], sh: [32, 24], arch: 7, head: 0, ff: [-4, 0], bf: [6, 0] },   // recogido
  { hip: [15, 23], sh: [33, 22], arch: 4, head: -1, ff: [5, 2], bf: [-4, 0] },  // impulso
  { hip: [13, 22], sh: [35, 22], arch: 0, head: -1, ff: [8, 3], bf: [-8, 3] },  // vuelo estirado
  { hip: [14, 23], sh: [34, 24], arch: 1, head: 1, ff: [3, 0], bf: [-6, 2] },   // aterriza delante
  { hip: [16, 24], sh: [33, 24], arch: 4, head: 1, ff: [-1, 0], bf: [2, 3] },   // recoge
  { hip: [17, 24], sh: [32, 23], arch: 6, head: 0, ff: [-3, 1], bf: [5, 0] },
];
const SNEAK = [
  { hip: [14, 27], sh: [34, 27], arch: -1, head: 2, ff: [3, 0], bf: [-3, 1], low: true },
  { hip: [14, 27], sh: [34, 27], arch: -1, head: 2, ff: [0, 1], bf: [0, 0], low: true },
  { hip: [14, 27], sh: [34, 27], arch: -1, head: 2, ff: [-3, 0], bf: [3, 1], low: true },
  { hip: [14, 27], sh: [34, 27], arch: -1, head: 2, ff: [0, 0], bf: [0, 1], low: true },
];
const IDLE = [
  { hip: [15, 24], sh: [32, 23], arch: 4, head: -1, ff: [0, 0], bf: [1, 0] },
  { hip: [15, 24], sh: [32, 23], arch: 4.6, head: -2, ff: [0, 0], bf: [1, 0], look: true },
];

function sideFrame(k, pal, look, tailPhase) {
  const p = new Pix(SIDE_W, SIDE_H);
  const big = look.size ? 1.2 : 0;
  const [hx, hy] = k.hip;
  const [sx, sy] = k.sh;
  const R = 5 + big;
  // Cola: sale de la cadera hacia atrás, casi rozando el suelo, con un leve vaivén.
  const tailEnd = { x: hx - 15, y: BASE - 4 + Math.round(Math.sin(tailPhase) * 1.5) };
  p.curve({ x: hx, y: hy }, { x: hx - 8, y: hy + 1 }, tailEnd, (t) => 2.8 + big * 0.6 - t * 1.9, 't',
    (dx, dy) => (dy > 0.3 ? 'T' : 't'));

  // Patas lejanas (más oscuras), detrás del cuerpo.
  const leg = (jx, jy, foot, key, back) => {
    const fx = jx + foot[0];
    const fy = BASE - foot[1] - (k.low ? 0 : 0);
    const mx = (jx + fx) / 2 + (back ? -2 : 1);
    const my = (jy + fy) / 2 + (back ? -1 : 0);
    p.line(jx, jy, mx, my, 2.1 + big * 0.4, key, 1.7);
    p.line(mx, my, fx, fy - 1, 1.7, key, 1.5);
    p.rect(Math.round(fx) - 1, Math.round(fy) - 1, 4, 2, key === 'p' ? 'q' : 'o');
  };
  const legY = (y) => y + R * 0.55;
  leg(sx - 2, legY(sy), [k.ff[0] - 3, k.ff[1] + 1], 'q', false);
  leg(hx + 2, legY(hy), [k.bf[0] + 3, k.bf[1] + 1], 'q', true);

  // Vientre (rellena el hueco bajo el lomo cuando se arquea) y lomo: curva de cadera a hombros.
  p.line(hx, hy + 1, sx, sy + 1, R * 0.85, 'B');
  const ctrl = { x: (hx + sx) / 2, y: Math.min(hy, sy) - k.arch * 1.6 };
  p.curve({ x: hx, y: hy }, ctrl, { x: sx, y: sy }, (t) => R + Math.sin(Math.PI * t) * 0.8, 'b',
    (dx, dy) => (dy < -0.55 ? 'h' : dy > 0.45 ? 'B' : 'b'));

  // Cuello y cabeza.
  const hdx = sx + 8;
  const hdy = sy - 4 + k.head;
  p.line(sx, sy, hdx - 2, hdy + 1, R - 0.5, 'b');
  p.ellipse(hdx, hdy, 5.6 + big * 0.4, 4.4 + big * 0.3, null, (x, y, dx, dy) => (dy < -0.5 ? 'h' : dy > 0.55 ? 'B' : 'b'));
  // Antifaz, hocico claro, nariz, ojo y oreja.
  p.ellipse(hdx + 1, hdy - 0.6, 3.4, 1.7, 'm');
  p.ellipse(hdx + 5.5, hdy + 1.4, 4, 2.6, null, (x, y, dx, dy) => (dy > 0.5 ? 'L' : 'l'));
  p.rect(Math.round(hdx + 9), Math.round(hdy), 2, 2, 'n');
  p.rect(Math.round(hdx + 1), Math.round(hdy - 2), 2, 2, 'e');
  p.set(Math.round(hdx + 2), Math.round(hdy - 2), 'w');
  const ex = Math.round(hdx - 3);
  const ey = Math.round(hdy - 5);
  p.disc(ex + 0.5, ey + 0.5, 2.2, 'b');
  p.rect(ex, ey, 1, 2, 'r');
  if (k.look) p.set(Math.round(hdx + 1), Math.round(hdy - 1), 'e');

  // Patas cercanas.
  leg(sx - 1, legY(sy), k.ff, 'p', false);
  leg(hx + 1, legY(hy), k.bf, 'p', true);

  if (look.fluffy) {
    p.outline('o');
    p.fluff('o', 5 + Math.round(hx * 3 + sx), 0.5);
  }
  p.outline('o');
  return p;
}

/** Hurón de pie sobre las patas traseras (mirando alrededor / en el corralito). */
function standFrame(pal, look) {
  const p = new Pix(SIDE_W, SIDE_H);
  const big = look.size ? 1.2 : 0;
  p.curve({ x: 24, y: 30 }, { x: 16, y: 33 }, { x: 10, y: 33 }, (t) => 2.6 - t * 1.6, 't');
  p.line(25, 26, 23, BASE - 1, 2, 'q', 1.7);
  p.curve({ x: 26, y: 29 }, { x: 24, y: 19 }, { x: 28, y: 11 }, (t) => 5 + big - t * 0.8, 'b',
    (dx) => (dx < -0.5 ? 'h' : dx > 0.5 ? 'B' : 'b'));
  p.line(28, 28, 29, BASE - 1, 2, 'p', 1.7);
  p.rect(28, BASE - 2, 4, 2, 'q');
  p.line(30, 15, 33, 19, 1.6, 'p', 1.4);
  p.ellipse(30, 8, 5.2 + big * 0.4, 4.3, null, (x, y, dx, dy) => (dy < -0.5 ? 'h' : 'b'));
  p.ellipse(31, 7.5, 3.4, 1.6, 'm');
  p.ellipse(35, 9.5, 3.6, 2.4, 'l');
  p.rect(38, 8, 2, 2, 'n');
  p.rect(31, 6, 2, 2, 'e');
  p.set(32, 6, 'w');
  p.disc(26.5, 4.5, 2.2, 'b');
  p.rect(26, 4, 1, 2, 'r');
  if (look.fluffy) { p.outline('o'); p.fluff('o', 9, 0.5); }
  p.outline('o');
  return p;
}

// --------------------------------------------------------------------- vistas frontal y trasera
function downFrame(i, look) {
  const p = new Pix(VERT, VERT);
  const big = look.size ? 1.1 : 0;
  const bob = [0, -1, 0, -1][i];
  const a = [1, 0, -1, 0][i];
  const sway = [1, 0, -1, 0][i];
  p.curve({ x: 20, y: 12 }, { x: 20 + sway * 2, y: 8 }, { x: 20 + sway * 3, y: 6 }, (t) => 2.4 - t * 1.2, 't');
  p.ellipse(20, 17 + bob, 7.4 + big, 9 + big * 0.6, null, (x, y, dx, dy) => (Math.abs(dx) > 0.7 ? 'B' : dy < -0.5 ? 'h' : 'b'));
  p.rect(11 - big, 22 + bob + a, 4, 3, 'p');
  p.rect(25 + big, 22 + bob - a, 4, 3, 'p');
  p.disc(13.5, 20.5 + bob, 2.6, 'b');
  p.disc(26.5, 20.5 + bob, 2.6, 'b');
  p.rect(13, 20 + bob, 1, 2, 'r');
  p.rect(26, 20 + bob, 1, 2, 'r');
  p.ellipse(20, 26 + bob, 7.6 + big * 0.5, 6.2, null, (x, y, dx, dy) => (dy < -0.55 ? 'h' : dy > 0.6 ? 'B' : 'b'));
  p.ellipse(20, 25 + bob, 6.4, 2.3, 'm');
  p.ellipse(20, 29.5 + bob, 3.9, 2.7, null, (x, y, dx, dy) => (dy > 0.5 ? 'L' : 'l'));
  p.rect(16, 24 + bob, 2, 2, 'e');
  p.rect(22, 24 + bob, 2, 2, 'e');
  p.set(16, 24 + bob, 'w');
  p.set(22, 24 + bob, 'w');
  p.rect(19, 28 + bob, 2, 2, 'n');
  p.rect(15, 32 + bob - a, 3, 3, 'p');
  p.rect(22, 32 + bob + a, 3, 3, 'p');
  if (look.fluffy) { p.outline('o'); p.fluff('o', 13 + i, 0.5); }
  p.outline('o');
  return p;
}

function upFrame(i, look) {
  const p = new Pix(VERT, VERT);
  const big = look.size ? 1.1 : 0;
  const bob = [0, -1, 0, -1][i];
  const a = [1, 0, -1, 0][i];
  const sway = [1, 0, -1, 0][i];
  p.rect(12, 16 + bob - a, 3, 3, 'p');
  p.rect(25, 16 + bob + a, 3, 3, 'p');
  p.curve({ x: 20, y: 30 }, { x: 20 + sway * 2, y: 34 }, { x: 20 + sway * 3, y: 38 }, (t) => 2.6 - t * 1.4, 't');
  p.ellipse(20, 23 + bob, 7.4 + big, 9 + big * 0.6, null, (x, y, dx, dy) => (Math.abs(dx) > 0.7 ? 'B' : dy < -0.4 ? 'h' : 'b'));
  p.rect(11 - big, 27 + bob + a, 4, 3, 'p');
  p.rect(25 + big, 27 + bob - a, 4, 3, 'p');
  p.ellipse(20, 13 + bob, 6.4 + big * 0.4, 5.4, null, (x, y, dx, dy) => (dy < -0.4 ? 'h' : 'b'));
  p.disc(14.5, 9 + bob, 2.4, 'b');
  p.disc(25.5, 9 + bob, 2.4, 'b');
  p.set(14, 9 + bob, 'r');
  p.set(25, 9 + bob, 'r');
  if (look.fluffy) { p.outline('o'); p.fluff('o', 21 + i, 0.5); }
  p.outline('o');
  return p;
}

/**
 * Todos los fotogramas de un hurón:
 * side: 0-5 galope, 6-9 sigilo, 10-11 reposo, 12 de pie; down/up: 0-3 andar.
 */
export function ferretSheets(look) {
  const pal = ferretPalette(look);
  const side = [
    ...GALLOP.map((k, i) => sideFrame(k, pal, look, i)),
    ...SNEAK.map((k, i) => sideFrame(k, pal, look, i * 1.5)),
    ...IDLE.map((k, i) => sideFrame(k, pal, look, i * 3)),
    standFrame(pal, look),
  ];
  const down = [0, 1, 2, 3].map((i) => downFrame(i, look));
  const up = [0, 1, 2, 3].map((i) => upFrame(i, look));
  return { pal, side, down, up };
}

export { lighten };
