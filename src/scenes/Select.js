// Selección de hurón: los tres originales y los personalizados, con nombre editable.
import Phaser from 'phaser';
import { text, panel } from '../ui/text.js';
import { Menu } from '../ui/controls.js';
import { UI } from '../gfx/palette.js';
import { sound } from '../audio/audio.js';
import { save } from '../save.js';
import { uiView } from '../ui/view.js';
import { profiles, ferretDef, rename, deleteCustom, MAX_CUSTOM } from '../profiles.js';

const STAT_LABELS = [['speed', 'VELOC.'], ['stealth', 'SIGILO'], ['strength', 'FUERZA'], ['energy', 'AGUANTE']];
const CW = 100;
const CH = 132;
const GAP = 6;

export class Select extends Phaser.Scene {
  constructor() { super('Select'); }

  create() {
    this.menu = null; // la escena se reutiliza: no arrastrar el menú anterior
    const { W, H } = uiView(this);
    this.W = W;
    this.H = H;
    this.cameras.main.fadeIn(200);
    text(this, W / 2, 4, 'ELIGE TU HURÓN', { color: UI.gold, scale: 2, align: 'center' });
    this.list = profiles();
    if (save.data.custom.length < MAX_CUSTOM) this.list.push({ id: '__new', name: 'NUEVO', isNew: true });
    this.x0 = Math.round((W - CW * 3 - GAP * 2) / 2);
    this.offset = 0;
    this.cardIndex = Math.max(0, this.list.findIndex((p) => p.id === save.data.ferret));
    this.offset = Math.max(0, Math.min(this.cardIndex - 1, this.list.length - 3));
    this.cardLayer = this.add.container(0, 0);
    this.arrows = [text(this, 4, 92, '<', { color: UI.gold, scale: 2 }), text(this, W - 14, 92, '>', { color: UI.gold, scale: 2 })];

    // Botones bajo las tarjetas.
    const by = 172;
    const labels = ['JUGAR', 'NOMBRE', 'EDITAR', 'BORRAR'];
    const bw = 70;
    const bx0 = Math.round(W / 2 - (bw * 4 + 6 * 3) / 2);
    this.btns = labels.map((l, i) => {
      const x = bx0 + i * (bw + 6);
      const g = this.add.graphics();
      const t = text(this, x + bw / 2, by + 5, l, { align: 'center' });
      return { x, y: by, w: bw, h: 18, g, t, label: l };
    });
    this.desc = text(this, W / 2, 196, '', { color: UI.text, align: 'center' });
    text(this, W / 2, H - 11, 'A: ELEGIR · B: VOLVER · DOBLE TOQUE EN LA TARJETA PARA JUGAR', { color: UI.gray, align: 'center' });

    this.cardBorders = [];
    const cardItems = this.list.map((p, i) => ({ x: 0, y: 26, w: CW, h: CH, tapToFocus: true, onSelect: () => this.activateCard(i) }));
    const btnItems = this.btns.map((b, i) => ({ x: b.x, y: b.y, w: b.w, h: b.h, tapToFocus: false, onSelect: () => this.button(i) }));
    this.nCards = cardItems.length;
    this.menu = new Menu(this, [...cardItems, ...btnItems], {
      layout: 'grid', start: this.cardIndex,
      sound: (s) => sound.sfx(s),
      onChange: (i) => this.focus(i),
      onBack: () => this.scene.start('Title'),
    });
    this.layoutCards();
    this.focus(this.menu.index);
    this.handleBack = () => { if (this.menu.enabled) this.scene.start('Title'); };
    this.game.events.on('androidBack', this.handleBack);
    this.events.once('shutdown', () => this.game.events.off('androidBack', this.handleBack));
    sound.play('title');
  }

  layoutCards() {
    this.cardLayer.removeAll(true);
    this.cardBorders = [];
    this.menu.items.slice(0, this.nCards).forEach((it, i) => {
      const slot = i - this.offset;
      it.x = this.x0 + slot * (CW + GAP);
      it.zone.setPosition(it.x, it.y);
      const visible = slot >= 0 && slot < 3;
      it.zone.setVisible(visible);
      if (visible) this.drawCard(this.list[i], it.x, it.y);
      this.cardBorders[i] = visible ? this.add.graphics() : null;
      if (this.cardBorders[i]) this.cardLayer.add(this.cardBorders[i]);
    });
    this.arrows[0].setVisible(this.offset > 0);
    this.arrows[1].setVisible(this.offset + 3 < this.nCards);
  }

  drawCard(p, x, y) {
    const L = this.cardLayer;
    L.add(panel(this, x, y, CW, CH, { fill: p.isNew ? 0x203020 : UI.panelDark }));
    if (p.isNew) {
      L.add(text(this, x + CW / 2, y + 40, '+', { color: UI.green, scale: 4, align: 'center' }));
      L.add(text(this, x + CW / 2, y + 80, 'CREA TU HURÓN', { color: UI.green, align: 'center' }));
      return;
    }
    const spr = this.add.sprite(x + CW / 2, y + 40, `fer_${p.id}_side`).setOrigin(0.5, 33 / 36).play(`fer_${p.id}_run`);
    spr.anims.timeScale = 0.6;
    L.add(spr);
    const def = ferretDef(p);
    L.add(text(this, x + CW / 2, y + 44, p.name, { color: UI.gold, align: 'center' }));
    L.add(text(this, x + CW / 2, y + 54, p.coat.slice(0, 16), { color: UI.gray, align: 'center' }));
    L.add(text(this, x + CW / 2, y + 64, def.style, { color: UI.orange, align: 'center' }));
    const pg = this.add.graphics();
    L.add(pg);
    STAT_LABELS.forEach(([k, label], j) => {
      const sy = y + 78 + j * 12;
      L.add(text(this, x + 6, sy, label, { color: UI.text }));
      for (let n = 0; n < 5; n++) {
        pg.fillStyle(0x000000, 1).fillRect(x + 56 + n * 8, sy + 1, 7, 6);
        pg.fillStyle(n < def.stats[k] ? UI.green : 0x404058, 1).fillRect(x + 57 + n * 8, sy + 2, 5, 4);
      }
    });
  }

  current() { return this.list[this.cardIndex]; }

  focus(i) {
    if (!this.menu) return;
    if (i < this.nCards) {
      this.cardIndex = i;
      const off = Math.max(0, Math.min(this.offset, i), i - 2);
      if (off !== this.offset) {
        this.offset = off;
        this.layoutCards();
      }
    }
    const p = this.current();
    this.cardBorders.forEach((g, j) => {
      if (!g) return;
      g.clear();
      if (j === this.cardIndex) {
        const it = this.menu.items[j];
        g.lineStyle(2, i < this.nCards ? UI.gold : UI.gray, 1).strokeRect(it.x - 2, it.y - 2, CW + 4, CH + 4);
      }
    });
    const enabled = [true, !p.isNew, !!p.custom, !!p.custom];
    this.btns.forEach((b, j) => {
      const focused = i === this.nCards + j;
      b.g.clear();
      b.g.fillStyle(focused ? UI.border : UI.borderDark, 1).fillRect(b.x, b.y, b.w, b.h);
      b.g.fillStyle(enabled[j] ? UI.panel : UI.panelDark, 1).fillRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
      b.t.setTint(!enabled[j] ? UI.gray : focused ? UI.gold : UI.text);
      this.menu.items[this.nCards + j].disabled = !enabled[j];
    });
    if (p.isNew) this.desc.setText('Diseña tu propio hurón: pelaje, antifaz, ojos y estilo.');
    else this.desc.setText(ferretDef(p).desc ?? '');
  }

  activateCard(i) {
    this.cardIndex = i;
    this.button(0);
  }

  button(i) {
    const p = this.current();
    if (p.isNew) {
      if (i === 0) this.go('Editor', { id: null });
      return;
    }
    if (i === 0) {
      save.data.ferret = p.id;
      save.write();
      sound.sfx('dook');
      this.go('Levels');
    } else if (i === 1) {
      this.menu.enabled = false;
      this.scene.launch('NameEntry', {
        name: p.name,
        title: 'NOMBRE DEL HURÓN',
        onDone: (name) => {
          this.menu.enabled = true;
          if (name) {
            rename(p.id, name);
            this.scene.restart();
          }
        },
      });
    } else if (i === 2 && p.custom) {
      this.go('Editor', { id: p.id });
    } else if (i === 3 && p.custom) {
      this.menu.enabled = false;
      this.scene.launch('NameEntry', {
        confirm: `¿Borrar a ${p.name}?`,
        onDone: (yes) => {
          this.menu.enabled = true;
          if (yes) {
            deleteCustom(p.id);
            this.scene.restart();
          }
        },
      });
    } else {
      sound.sfx('noPower');
    }
  }

  go(scene, data) {
    this.menu.enabled = false;
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(scene, data));
  }
}
