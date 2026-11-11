import { ferretSheets, LOOKS, SIDE_W, SIDE_H, VERT } from '../../src/gfx/ferret.js';
const S = 4;
const c = document.createElement('canvas');
c.width = 13 * (SIDE_W + 2); c.height = 3 * (SIDE_H + VERT + 6);
const ctx = c.getContext('2d');
ctx.fillStyle = '#4a4458'; ctx.fillRect(0, 0, c.width, c.height);
let y = 0;
for (const id of ['sardi', 'pepis', 'chonko']) {
  const sh = ferretSheets(LOOKS[id]);
  sh.side.forEach((f, i) => f.draw(ctx, sh.pal, i * (SIDE_W + 2), y));
  [...sh.down, ...sh.up].forEach((f, i) => f.draw(ctx, sh.pal, i * (VERT + 2), y + SIDE_H + 2));
  y += SIDE_H + VERT + 6;
}
const big = document.createElement('canvas');
big.width = c.width * S; big.height = c.height * S;
const b = big.getContext('2d'); b.imageSmoothingEnabled = false; b.drawImage(c, 0, 0, big.width, big.height);
document.body.appendChild(big);
