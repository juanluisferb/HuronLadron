// Teclado en pantalla para escribir nombres (táctil, mando o teclado físico) y diálogo SÍ/NO.
import Phaser from 'phaser';
import { text, panel } from '../ui/text.js';
import { Menu } from '../ui/controls.js';
import { UI } from '../gfx/palette.js';
import { sound } from '../audio/audio.js';
import { uiView } from '../ui/view.js';
import { NAME_MAX } from '../profiles.js';
import { fontText } from '../gfx/font.js';

const ROWS = ['ABCDEFGHIJ', 'KLMNÑOPQRS', 'TUVWXYZÁÉÍ', 'ÓÚÜ0123456'];
const ALLOWED = /^[A-ZÑÁÉÍÓÚÜ0-9 \-.']$/;

export class NameEntry extends Phaser.Scene {
  constructor() { super('NameEntry'); }

  init(data) { this.opts = data; }

  create() {
    const { W, H } = uiView(this);
    this.add.rectangle(0, 0, W, H, 0x000000, 0.6).setOrigin(0).setInteractive();
    if (this.opts.confirm) return this.buildConfirm(W, H);

    this.name = String(this.opts.name ?? '').toUpperCase().slice(0, NAME_MAX);
    const pw = 300;
    const px = Math.round(W / 2 - pw / 2);
    panel(this, px, 14, pw, 196);
    text(this, W / 2, 22, this.opts.title ?? 'NOMBRE', { color: UI.gold, align: 'center' });
    this.field = text(this, W / 2, 38, '', { scale: 2, align: 'center' });
    this.keys = [];
    const kw = 26;
    const kh = 18;
    const kx0 = Math.round(W / 2 - (kw * 10) / 2);
    ROWS.forEach((row, r) => {
      [...row].forEach((ch, c) => {
        const x = kx0 + c * kw;
        const y = 62 + r * (kh + 2);
        this.keys.push({ x, y, w: kw - 2, h: kh, label: ch, onSelect: () => this.type(ch) });
      });
    });
    const wide = [['ESPACIO', () => this.type(' ')], ['BORRAR', () => this.del()], ['ACEPTAR', () => this.done(true)], ['CANCELAR', () => this.done(false)]];
    const bw = 64;
    wide.forEach(([label, fn], i) => {
      this.keys.push({ x: Math.round(W / 2 - (bw * 4 + 12) / 2) + i * (bw + 4), y: 148, w: bw, h: kh, label, onSelect: fn });
    });
    this.keyG = this.add.graphics();
    this.keyT = this.keys.map((k) => text(this, k.x + k.w / 2, k.y + 5, k.label, { align: 'center' }));
    text(this, W / 2, 174, 'Escribe con el teclado o elige letras.', { color: UI.gray, align: 'center' });
    text(this, W / 2, 186, 'INTRO: ACEPTAR · ESC: CANCELAR', { color: UI.gray, align: 'center' });

    this.menu = new Menu(this, this.keys, {
      layout: 'grid', typing: true, sound: (s) => sound.sfx(s),
      onChange: (i) => this.draw(i),
      onBack: () => this.done(false),
    });
    this.onKey = (e) => {
      if (e.key === 'Enter') this.done(true);
      else if (e.key === 'Backspace') this.del();
      else if (e.key.length === 1 && ALLOWED.test(e.key.toUpperCase())) this.type(e.key.toUpperCase());
    };
    this.input.keyboard.on('keydown', this.onKey);
    this.handleBack = () => this.done(false);
    this.game.events.on('androidBack', this.handleBack);
    this.events.once('shutdown', () => this.game.events.off('androidBack', this.handleBack));
    this.refresh();
    this.time.addEvent({ delay: 400, loop: true, callback: () => { this.blink = !this.blink; this.refresh(); } });
  }

  buildConfirm(W, H) {
    const pw = 220;
    const px = Math.round(W / 2 - pw / 2);
    panel(this, px, H / 2 - 34, pw, 64);
    text(this, W / 2, H / 2 - 24, this.opts.confirm, { align: 'center' });
    const yes = text(this, W / 2 - 40, H / 2 - 2, 'SÍ', { scale: 2, align: 'center' });
    const no = text(this, W / 2 + 40, H / 2 - 2, 'NO', { scale: 2, align: 'center' });
    this.menu = new Menu(this, [
      { x: W / 2 - 66, y: H / 2 - 8, w: 52, h: 24, onSelect: () => this.done(true) },
      { x: W / 2 + 14, y: H / 2 - 8, w: 52, h: 24, onSelect: () => this.done(false) },
    ], {
      layout: 'h', start: 1, sound: (s) => sound.sfx(s), onBack: () => this.done(false),
      onChange: (i) => { yes.setTint(i === 0 ? UI.gold : UI.text); no.setTint(i === 1 ? UI.gold : UI.text); },
    });
    this.handleBack = () => this.done(false);
    this.game.events.on('androidBack', this.handleBack);
    this.events.once('shutdown', () => this.game.events.off('androidBack', this.handleBack));
  }

  draw(i) {
    if (!this.keyG) return;
    this.keyG.clear();
    this.keys.forEach((k, j) => {
      this.keyG.fillStyle(j === i ? UI.gold : UI.borderDark, 1).fillRect(k.x, k.y, k.w, k.h);
      this.keyG.fillStyle(j === i ? 0x403010 : UI.panelDark, 1).fillRect(k.x + 1, k.y + 1, k.w - 2, k.h - 2);
      this.keyT[j].setTint(j === i ? UI.gold : UI.text);
    });
  }

  refresh() {
    const shown = fontText(this.name) + (this.name.length < NAME_MAX ? (this.blink ? '_' : ' ') : '');
    this.field.setText(shown);
  }

  type(ch) {
    if (this.name.length >= NAME_MAX) { sound.sfx('noPower'); return; }
    this.name += ch;
    sound.sfx('tick');
    this.refresh();
  }

  del() {
    this.name = this.name.slice(0, -1);
    sound.sfx('back');
    this.refresh();
  }

  done(ok) {
    if (this.finished) return;
    this.finished = true;
    if (this.onKey) this.input.keyboard.off('keydown', this.onKey);
    const cb = this.opts.onDone;
    let value = ok;
    if (!this.opts.confirm) {
      const n = this.name.trim();
      value = ok && n ? n.charAt(0) + n.slice(1).toLowerCase() : null;
    }
    sound.sfx(ok ? 'select' : 'back');
    this.scene.stop();
    cb?.(value);
  }
}
