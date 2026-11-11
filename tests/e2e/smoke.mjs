// Prueba de humo en Chromium: carga dist/index.html desde file:// (como el WebView de Android),
// recorre menús con teclado, juega un nivel con el bot y comprueba que no hay errores.
// Guarda capturas en docs/screenshots/.
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const { chromium } = createRequire(import.meta.url)('playwright');
const shots = path.resolve('docs/screenshots');
fs.mkdirSync(shots, { recursive: true });
const url = 'file://' + path.resolve('dist/index.html');
const errors = [];
const browser = await chromium.launch();

async function open(query = '', opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 960, height: 448 }, ...opts });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url + query);
  await page.waitForTimeout(800);
  return page;
}
const scene = (page) => page.evaluate(() => window.__game.scene.getScenes(true).map((s) => s.scene.key));
const shot = (page, name) => page.screenshot({ path: path.join(shots, name) });
const ok = (cond, msg) => { if (!cond) { errors.push(msg); console.log('FALLO:', msg); } else console.log('ok -', msg); };

// 1) Menús con teclado y unos segundos de juego manual.
let page = await open();
ok((await scene(page)).includes('Title'), 'arranca en el título');
await shot(page, '01-title.png');
await page.keyboard.press('Enter');
await page.waitForTimeout(1300);
ok((await scene(page)).includes('Select'), 'selección de hurón');
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(200);
await page.keyboard.press('Enter');
await page.waitForTimeout(1300);
ok((await scene(page)).includes('Levels'), 'selección de nivel');
await shot(page, '03-levels.png');
await page.keyboard.press('Enter');
await page.waitForTimeout(1800);
ok((await scene(page)).includes('Game'), 'empieza el nivel');
const p0 = await page.evaluate(() => ({ x: window.__world.ferret.x, y: window.__world.ferret.y }));
await page.keyboard.down('ArrowRight');
await page.waitForTimeout(700);
await page.keyboard.up('ArrowRight');
await page.keyboard.down('ArrowDown');
await page.waitForTimeout(1300);
await page.keyboard.up('ArrowDown');
const p1 = await page.evaluate(() => ({ x: window.__world.ferret.x, y: window.__world.ferret.y }));
ok(Math.hypot(p1.x - p0.x, p1.y - p0.y) > 20, 'el hurón se mueve con el teclado');
await shot(page, '04-game.png');
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
ok((await scene(page)).includes('Pause'), 'menú de pausa');
await shot(page, '05-pause.png');
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
ok(!(await scene(page)).includes('Pause'), 'reanudar');
await page.close();

// 1b) Nombre editable y editor de hurones.
page = await open();
await page.evaluate(() => localStorage.clear());
await page.keyboard.press('Enter');
await page.waitForTimeout(1300);
await page.keyboard.press('ArrowDown'); // de la tarjeta de Pepis baja al botón NOMBRE
await page.waitForTimeout(200);
await page.keyboard.press('Enter');
await page.waitForTimeout(700);
ok((await scene(page)).includes('NameEntry'), 'pantalla de nombre');
for (let i = 0; i < 6; i++) await page.keyboard.press('Backspace');
await page.keyboard.type('Rayo');
await page.waitForTimeout(200);
await shot(page, '08-name.png');
await page.keyboard.press('Enter');
await page.waitForTimeout(1200);
const names = await page.evaluate(() => JSON.parse(localStorage.getItem('huron.save.v1')).names);
ok(names.pepis === 'Rayo', `nombre cambiado (${JSON.stringify(names)})`);
await page.evaluate(() => { const g = window.__game; g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key)); g.scene.start('Editor', { id: null }); });
await page.waitForTimeout(1200);
const key = async (k, n = 1) => { for (let i = 0; i < n; i++) { await page.keyboard.press(k); await page.waitForTimeout(60); } };
await key('ArrowDown');
await key('ArrowRight', 3);
await page.waitForTimeout(400);
await shot(page, '09-editor.png');
await key('ArrowDown', 9);
await page.keyboard.press('Enter');
await page.waitForTimeout(1500);
const custom = await page.evaluate(() => JSON.parse(localStorage.getItem('huron.save.v1')).custom);
ok(custom.length === 1 && custom[0].look.body, 'hurón personalizado guardado');
ok((await scene(page)).includes('Select'), 'vuelve a la selección');
await page.waitForTimeout(500);
await shot(page, '02-select.png');
await page.close();

// 2) Controles táctiles: toques en menús, joystick arrastrado y botón A.
page = await open('', { hasTouch: true, isMobile: true });
const LW = (await page.evaluate(() => window.__game.scale.width)) / 2;
const k = 448 / 224;
const tap = async (gx, gy) => { await page.touchscreen.tap(gx * k, gy * k); await page.waitForTimeout(400); };
await page.evaluate(() => localStorage.clear());
await tap(LW / 2, 116);
await page.waitForTimeout(900);
ok((await scene(page)).includes('Select'), 'táctil: JUGAR');
const sx0 = Math.round((LW - 100 * 3 - 12) / 2);
await tap(sx0 + 50, 100);
await tap(sx0 + 50, 100);
await page.waitForTimeout(900);
ok((await scene(page)).includes('Levels'), 'táctil: elegir hurón (doble toque)');
const lx0 = Math.round((LW - 100 * 3 - 12) / 2);
await tap(lx0 + 50, 70);
await tap(lx0 + 50, 70);
await page.waitForTimeout(1500);
ok((await scene(page)).includes('Game'), 'táctil: elegir nivel');
const cdp = await page.context().newCDPSession(page);
const touchEv = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y]) => ({ x: x * k, y: y * k })) });
const q0 = await page.evaluate(() => ({ x: window.__world.ferret.x, y: window.__world.ferret.y }));
await touchEv('touchStart', [[60, 170]]);
for (let i = 1; i <= 5; i++) { await touchEv('touchMove', [[60 + i * 6, 170]]); await page.waitForTimeout(30); }
await page.waitForTimeout(900);
await shot(page, '07-touch.png');
await touchEv('touchEnd', []);
const q1 = await page.evaluate(() => ({ x: window.__world.ferret.x, y: window.__world.ferret.y }));
ok(q1.x - q0.x > 20, 'táctil: el joystick mueve al hurón');
const H = 224;
await tap(LW - 32, H - 46);
await tap(LW - 12, 34);
await page.waitForTimeout(600);
ok((await scene(page)).includes('Pause'), 'táctil: botón de pausa');
await page.close();

// 3) El bot juega cada nivel acelerado hasta la pantalla de resultados (en pantalla táctil).
for (const lvl of [1, 2, 3, 4, 5]) {
  page = await open('?bot=1&speed=8', { hasTouch: true, isMobile: true });
  await page.evaluate((l) => {
    localStorage.setItem('huron.save.v1', JSON.stringify({ unlocked: 5, best: {}, ferret: 'chonko' }));
    const g = window.__game;
    g.scene.getScenes(true).forEach((s) => g.scene.stop(s.scene.key));
    g.scene.start('Game', { levelId: l, ferret: ['sardi', 'pepis', 'chonko', 'pepis', 'sardi'][l - 1] });
  }, lvl);
  await page.waitForTimeout(6000);
  await shot(page, `1${lvl}-level${lvl}.png`);
  let done = false;
  for (let i = 0; i < 120 && !done; i++) {
    await page.waitForTimeout(1000);
    done = (await scene(page)).includes('Results');
  }
  ok(done, `nivel ${lvl}: el bot llega a la pantalla de resultados`);
  await page.waitForTimeout(2600);
  if (lvl === 1) await shot(page, '06-results.png');
  await page.close();
}

await browser.close();
if (errors.length) {
  console.log('\nERRORES:\n' + [...new Set(errors)].join('\n'));
  process.exit(1);
}
console.log('\nPrueba de humo superada.');
