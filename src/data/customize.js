// Opciones del editor de hurones y cómo se convierten en una apariencia (look) para el dibujo.
import { lighten, darken } from '../gfx/pix.js';
import { STYLE_ORDER, STYLES } from './ferrets.js';

export const OPTIONS = [
  { key: 'coat', label: 'PELAJE', choices: [
    ['Albino', '#f2ece0'], ['Champán', '#dcbf96'], ['Canela', '#b5783e'], ['Sable', '#8c5c36'],
    ['Chocolate', '#6a3e24'], ['Negro', '#3a2c28'], ['Plata', '#a8a4a0'], ['Rojizo', '#a8502c'],
  ] },
  { key: 'legs', label: 'PATAS Y COLA', choices: [['Oscuras', 'dark'], ['Como el cuerpo', 'same'], ['Claras', 'light'], ['Negras', 'black'], ['Blancas', 'white']] },
  { key: 'mask', label: 'ANTIFAZ', choices: [['Marcado', 'strong'], ['Suave', 'soft'], ['Sin antifaz', 'none']] },
  { key: 'muzzle', label: 'HOCICO', choices: [['Blanco', '#f4ece0'], ['Crema', '#e2c8a0'], ['Como el cuerpo', 'same']] },
  { key: 'eyes', label: 'OJOS', choices: [['Negros', '#140c0c'], ['Rubí', '#b0203a'], ['Marrones', '#5a3018'], ['Azules', '#3060b0']] },
  { key: 'nose', label: 'NARIZ', choices: [['Rosa', '#f08878'], ['Marrón', '#7a4030'], ['Negra', '#1c1414'], ['Moteada', '#c06060']] },
  { key: 'fur', label: 'PELO', choices: [['Corto', 'short'], ['Peludo', 'fluffy']] },
  { key: 'size', label: 'TAMAÑO', choices: [['Normal', 0], ['Grandote', 1]] },
  { key: 'style', label: 'ESTILO', choices: STYLE_ORDER.map((s) => [STYLES[s].label, s]) },
];

export function defaultChoices() {
  return { coat: 3, legs: 0, mask: 0, muzzle: 0, eyes: 0, nose: 0, fur: 0, size: 0, style: 0 };
}

const val = (k, c) => OPTIONS.find((o) => o.key === k).choices[c[k]][1];

/** Apariencia de dibujo a partir de las elecciones del editor. */
export function lookFrom(c) {
  const body = val('coat', c);
  const legsMode = val('legs', c);
  const legs = { dark: darken(body, 0.45), same: body, light: lighten(body, 0.3), black: '#2a2020', white: '#f0ece4' }[legsMode];
  const maskMode = val('mask', c);
  const mask = { strong: darken(body, 0.55), soft: darken(body, 0.25), none: body }[maskMode];
  const m = val('muzzle', c);
  return {
    body, legs, tail: legs, mask,
    muzzle: m === 'same' ? lighten(body, 0.15) : m,
    eyes: val('eyes', c), nose: val('nose', c), ears: '#f49080',
    outline: darken(body, 0.8),
    fluffy: val('fur', c) === 'fluffy',
    size: val('size', c),
  };
}

export function styleFrom(c) { return val('style', c); }

export function coatName(c) {
  const name = OPTIONS[0].choices[c.coat][0];
  return val('fur', c) === 'fluffy' ? `${name} peludo` : name;
}
