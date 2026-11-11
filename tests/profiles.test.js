import test from 'node:test';
import assert from 'node:assert/strict';
import { OPTIONS, defaultChoices, lookFrom, styleFrom, coatName } from '../src/data/customize.js';
import { styleStats, STYLE_ORDER, FERRETS } from '../src/data/ferrets.js';
import { World } from '../src/sim/world.js';
import { LEVELS } from '../src/data/levels/index.js';
import { ferretSheets, LOOKS } from '../src/gfx/ferret.js';

test('los estilos copian a los hurones originales', () => {
  assert.equal(styleStats('rapido').run, FERRETS.sardi.run);
  assert.equal(styleStats('sigiloso').noise, FERRETS.pepis.noise);
  assert.equal(styleStats('fuerte').slots, 2);
  for (const s of STYLE_ORDER) {
    const st = styleStats(s);
    assert.ok(st.walk > 0 && st.run > st.walk && st.energy > 0, s);
  }
});

test('cada combinación del editor produce una apariencia válida', () => {
  const c = defaultChoices();
  for (const o of OPTIONS) {
    for (let i = 0; i < o.choices.length; i++) {
      const look = lookFrom({ ...c, [o.key]: i });
      for (const k of ['body', 'legs', 'tail', 'mask', 'muzzle', 'eyes', 'nose', 'outline']) {
        assert.match(look[k], /^#[0-9a-f]{6}$/i, `${o.key}=${i}: ${k}`);
      }
    }
  }
  assert.equal(coatName({ ...c, fur: 1 }).endsWith('peludo'), true);
  assert.ok(STYLE_ORDER.includes(styleFrom(c)));
});

test('los sprites HD del hurón tienen todos los fotogramas', () => {
  const sh = ferretSheets(LOOKS.chonko);
  assert.equal(sh.side.length, 13);
  assert.equal(sh.down.length, 4);
  assert.equal(sh.up.length, 4);
  const painted = sh.side[0].d.filter((x) => x !== null).length;
  assert.ok(painted > 250, `galope con cuerpo (${painted} px)`);
});

test('la simulación acepta un hurón personalizado', () => {
  const def = { ...styleStats('fuerte'), id: 'custom1', name: 'Bolita' };
  const w = new World(LEVELS[0], def);
  assert.equal(w.ferret.def.slots, 2);
  assert.equal(w.ferret.energy, def.energy);
});
