import { humanSheets, HUMAN_SKINS, HUMAN_W, HUMAN_H } from '../../src/gfx/humans.js';
const S = 4;
const c = document.createElement('canvas');
c.width = 14 * (HUMAN_W + 2); c.height = HUMAN_SKINS.length * (HUMAN_H + 4);
const ctx = c.getContext('2d');
ctx.fillStyle = '#8a6a48'; ctx.fillRect(0, 0, c.width, c.height);
HUMAN_SKINS.forEach((id, r) => {
  const sh = humanSheets(id);
  [...sh.down, ...sh.up, ...sh.side, sh.sit, sh.phone].forEach((f, i) => f.draw(ctx, sh.pal, i * (HUMAN_W + 2), r * (HUMAN_H + 4)));
});
const big = document.createElement('canvas');
big.width = c.width * S; big.height = c.height * S;
const b = big.getContext('2d'); b.imageSmoothingEnabled = false; b.drawImage(c, 0, 0, big.width, big.height);
document.body.appendChild(big);
