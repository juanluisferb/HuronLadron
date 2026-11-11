// Humanos en alta resolución (2x, fotogramas de 40x64): cara con ojos y cejas, pelo con brillo,
// ropa con pliegues y sombras, zapatos y manos. Varias "pieles" para dueño, invitada, pareja, etc.
import { Pix, ramp } from './pix.js';

export const HUMAN_W = 40;
export const HUMAN_H = 64;

const SKINS = {
  owner: { skin: '#f0b890', hair: '#5a3418', top: '#3a68c8', bottom: '#2c3450', shoes: '#2a1c18', style: 'short' },
  guest: { skin: '#e8a878', hair: '#c84a1c', top: '#a040b0', bottom: '#4a2c56', shoes: '#802020', style: 'long', skirt: true },
  partner: { skin: '#c88458', hair: '#1c1418', top: '#3e9a5a', bottom: '#30304a', shoes: '#383040', style: 'bun' },
  gardener: { skin: '#f0b890', hair: '#5a3418', top: '#d07a30', bottom: '#3a5a8a', shoes: '#4a3020', style: 'hat' },
};
export const HUMAN_SKINS = Object.keys(SKINS);

export function humanPalette(id) {
  const s = SKINS[id];
  const [, kS, k, kL] = ramp(s.skin);
  const [hD, hS, h, hL] = ramp(s.hair);
  const [tD, tS, t, tL] = ramp(s.top);
  const [bD, bS, b, bL] = ramp(s.bottom);
  return {
    o: '#1c1420', k, K: kS, j: kL, h, H: hS, i: hL, I: hD,
    S: t, T: tS, U: tL, V: tD, P: b, Q: bS, R: bL, X: bD,
    s: s.shoes, e: '#1c1420', E: '#ffffff', m: '#a0483c', y: '#e8c050', Y: '#a88020',
  };
}

function head(p, cx, cy, dir, style) {
  // dir: 'down' | 'up' | 'side'
  p.ellipse(cx, cy, 8.6, 9.6, null, (x, y, dx, dy) => (dx > 0.55 && dir !== 'up' ? 'K' : 'k'));
  if (dir === 'down') {
    p.rect(cx - 5, cy + 1, 3, 3, 'E'); p.rect(cx + 2, cy + 1, 3, 3, 'E');
    p.rect(cx - 4, cy + 2, 2, 2, 'e'); p.rect(cx + 3, cy + 2, 2, 2, 'e');
    p.rect(cx - 6, cy - 1, 4, 1, 'H'); p.rect(cx + 2, cy - 1, 4, 1, 'H');
    p.rect(cx - 1, cy + 4, 2, 2, 'K');
    p.rect(cx - 2, cy + 7, 4, 1, 'm');
    p.set(cx - 8, cy + 3, 'K'); p.set(cx + 8, cy + 3, 'K');
  } else if (dir === 'side') {
    p.rect(cx + 3, cy + 1, 3, 3, 'E');
    p.rect(cx + 4, cy + 2, 2, 2, 'e');
    p.rect(cx + 2, cy - 1, 5, 1, 'H');
    p.rect(cx + 8, cy + 3, 2, 3, 'k');
    p.rect(cx + 4, cy + 7, 3, 1, 'm');
    p.rect(cx - 3, cy + 2, 3, 4, 'K'); // oreja
  }
  // Pelo.
  const hairFn = (x, y, dx, dy) => (dy < -0.6 && dx < 0.2 ? 'i' : dx > 0.5 ? 'H' : 'h');
  if (style === 'hat') {
    p.ellipse(cx, cy - 6, 14, 3.4, null, (x, y, dx, dy) => (dy < 0 ? 'y' : 'Y'));
    p.ellipse(cx, cy - 9, 8, 5, null, (x, y, dx, dy) => (dy > 0.6 ? 'm' : dx < -0.3 ? 'y' : 'Y'));
    if (dir !== 'down') p.rect(cx - 8, cy - 4, 16, dir === 'up' ? 9 : 5, 'h');
    return;
  }
  if (dir === 'up') {
    p.ellipse(cx, cy - 1, 9.2, 10, null, hairFn);
  } else if (dir === 'down') {
    p.ellipse(cx, cy - 5, 9.4, 6.4, null, hairFn);
    p.rect(cx - 9, cy - 5, 3, 7, 'h');
    p.rect(cx + 6, cy - 5, 3, 7, 'H');
  } else {
    p.ellipse(cx - 1, cy - 4, 9.4, 7, null, hairFn);
    p.rect(cx - 9, cy - 4, 6, 8, 'h');
  }
  if (style === 'long') {
    if (dir === 'down') { p.rect(cx - 10, cy - 2, 4, 16, 'h'); p.rect(cx + 6, cy - 2, 4, 16, 'H'); }
    else if (dir === 'up') p.ellipse(cx, cy + 6, 9, 9, null, hairFn);
    else p.rect(cx - 9, cy - 2, 6, 16, 'h');
  }
  if (style === 'bun') p.disc(dir === 'side' ? cx - 8 : cx, cy - 10, 4, 'h');
}

function body(p, i, dir, opt) {
  const cx = 20;
  const step = [1, 0, -1, 0][i];
  const bob = i % 2 ? -1 : 0;
  const sit = opt.sit;
  const top = 23 + bob + (sit ? 7 : 0);
  // Piernas.
  if (sit) {
    p.rect(cx - 8, 46, 16, 7, 'P');
    p.rect(cx - 8, 46, 16, 2, 'R');
    p.rect(cx - 8, 53, 6, 5, 'P'); p.rect(cx + 2, 53, 6, 5, 'P');
    p.rect(cx - 9, 58, 7, 4, 's'); p.rect(cx + 2, 58, 7, 4, 's');
  } else if (dir === 'side') {
    const legs = [[cx - 2 - step * 3, 'Q'], [cx - 2 + step * 3, 'P']];
    for (const [lx, key] of legs) {
      p.rect(lx, 44, 6, 13, key);
      p.rect(lx, 57, 8, 4, 's');
      p.hline(lx, 60, 8, 'o');
    }
  } else {
    const l = Math.max(0, step) * 2;
    const r = Math.max(0, -step) * 2;
    p.rect(cx - 7, 44, 6, 13 - l, 'P'); p.rect(cx + 1, 44, 6, 13 - r, 'P');
    p.vline(cx - 2, 44, 12 - l, 'Q'); p.vline(cx + 6, 44, 12 - r, 'Q');
    p.rect(cx - 8, 57 - l, 7, 4, 's'); p.rect(cx + 1, 57 - r, 7, 4, 's');
  }
  // Torso con sombra lateral, cuello y cinturón.
  const tw = dir === 'side' ? 12 : 18;
  const tx = cx - tw / 2;
  const th = 22 - (sit ? 4 : 0);
  p.rect(tx, top, tw, th, 'S');
  p.rect(tx, top, 2, th, 'U');
  p.rect(tx + tw - 3, top, 3, th, 'T');
  p.hline(tx + 2, top + th - 1, tw - 2, 'V');
  if (opt.skirt && !sit) {
    p.rect(tx - 2, top + th - 3, tw + 4, 8, 'P');
    p.rect(tx - 2, top + th - 3, tw + 4, 2, 'R');
    p.hline(tx - 2, top + th + 4, tw + 4, 'X');
  } else if (!sit) {
    p.rect(tx, top + th - 3, tw, 3, 'X');
    p.rect(cx - 1, top + th - 3, 3, 3, 'y');
  }
  if (dir === 'down') {
    p.rect(cx - 3, top, 6, 3, 'k');
    p.rect(cx - 4, top + 2, 2, 2, 'U'); p.rect(cx + 2, top + 2, 2, 2, 'U');
    p.vline(cx, top + 5, th - 9, 'T');
  } else if (dir === 'up') {
    p.vline(cx, top + 3, th - 7, 'T');
  }
  // Brazos.
  if (dir === 'side') {
    const a = Math.round(step * 2.5);
    p.rect(cx - 2 + a, top + 2, 5, 15, 'T');
    p.rect(cx - 2 + a, top + 2, 2, 15, 'S');
    p.rect(cx - 2 + a, top + 17, 5, 4, 'k');
  } else {
    const a = dir === 'up' ? -step : step;
    p.rect(tx - 4, top + 2 + a, 4, 15, 'S'); p.vline(tx - 4, top + 2 + a, 15, 'U');
    p.rect(tx - 4, top + 17 + a, 4, 4, 'k');
    if (opt.phone) {
      p.rect(tx + tw, top - 6, 4, 12, 'T');
      p.rect(tx + tw - 2, top - 9, 4, 4, 'k');
      p.rect(tx + tw - 4, top - 13, 4, 7, 'e');
    } else {
      p.rect(tx + tw, top + 2 - a, 4, 15, 'T');
      p.rect(tx + tw, top + 17 - a, 4, 4, 'K');
    }
  }
  head(p, dir === 'side' ? cx + 1 : cx, top - 10 + (sit ? 0 : 0), dir, opt.style);
}

function frame(i, dir, opt) {
  const p = new Pix(HUMAN_W, HUMAN_H);
  body(p, i, dir, opt);
  p.outline('o');
  return p;
}

/** {down:[4], up:[4], side:[4], sit, phone} */
export function humanSheets(id) {
  const s = SKINS[id];
  const opt = { style: s.style, skirt: s.skirt };
  const out = { pal: humanPalette(id), down: [], up: [], side: [] };
  for (let i = 0; i < 4; i++) {
    out.down.push(frame(i, 'down', opt));
    out.up.push(frame(i, 'up', opt));
    out.side.push(frame(i, 'side', opt));
  }
  out.sit = frame(1, 'down', { ...opt, sit: true });
  out.phone = frame(1, 'down', { ...opt, phone: true });
  return out;
}
