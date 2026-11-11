// Perfiles de hurón: los tres originales (con nombre editable) y los personalizados del editor.
import { FERRETS, FERRET_ORDER, styleStats } from './data/ferrets.js';
import { LOOKS } from './gfx/ferret.js';
import { save } from './save.js';

export const MAX_CUSTOM = 6;
export const NAME_MAX = 10;
const BASE_STYLE = { sardi: 'rapido', pepis: 'sigiloso', chonko: 'fuerte' };

export function profiles() {
  const base = FERRET_ORDER.map((id) => ({
    id,
    name: save.data.names[id] || FERRETS[id].name,
    coat: FERRETS[id].coat,
    look: LOOKS[id],
    style: BASE_STYLE[id],
    custom: false,
  }));
  const custom = save.data.custom.map((c) => ({ ...c, coat: c.coat || 'Personalizado', custom: true }));
  return [...base, ...custom];
}

export function profile(id) {
  return profiles().find((p) => p.id === id) ?? profiles()[1];
}

/** Definición de juego (la que usa la simulación) de un perfil. */
export function ferretDef(p) {
  const st = p.custom ? styleStats(p.style) : { ...FERRETS[p.id], style: FERRETS[p.id].style };
  return { ...st, id: p.id, name: p.name, coat: p.coat, look: p.look };
}

export function rename(id, name) {
  const n = String(name).trim().slice(0, NAME_MAX);
  if (!n) return;
  const c = save.data.custom.find((x) => x.id === id);
  if (c) c.name = n; else save.data.names[id] = n;
  save.write();
}

export function saveCustom(p) {
  const list = save.data.custom;
  const i = list.findIndex((x) => x.id === p.id);
  const entry = { id: p.id, name: p.name, look: p.look, style: p.style, coat: p.coat, choices: p.choices };
  if (i >= 0) list[i] = entry; else list.push(entry);
  save.write();
}

export function deleteCustom(id) {
  save.data.custom = save.data.custom.filter((x) => x.id !== id);
  if (save.data.ferret === id) save.data.ferret = 'pepis';
  save.write();
}

export function newCustomId() {
  let n = 1;
  while (save.data.custom.some((c) => c.id === `custom${n}`)) n++;
  return `custom${n}`;
}
