// Editor de hurones personalizados: pelaje, patas, antifaz, hocico, ojos, nariz, pelo, tamaño y estilo.
import Phaser from 'phaser';
import { text, panel } from '../ui/text.js';
import { Menu } from '../ui/controls.js';
import { UI } from '../gfx/palette.js';
import { sound } from '../audio/audio.js';
import { save } from '../save.js';
import { uiView } from '../ui/view.js';
import { OPTIONS, defaultChoices, lookFrom, styleFrom, coatName } from '../data/customize.js';
import { styleStats } from '../data/ferrets.js';
import { makeFerretTextures } from '../gfx/textures.js';
import { saveCustom, newCustomId } from '../profiles.js';

const PREVIEW = '__preview';
const STAT_LABELS = [['speed', 'VEL'], ['stealth', 'SIG'], ['strength', 'FUE'], ['energy', 'AGU']];

export class Editor extends Phaser.Scene {
  constructor() { super('Editor'); }

  init(data) {
    const existing = data.id ? save.data.custom.find((c) => c.id === data.id) : null;
    this.editId = existing?.id ?? null;
    this.choices = { ...defaultChoices(), ...(existing?.choices ?? {}) };
    this.name = existing?.name ?? 'Mi hurón';
  }

  create() {
    this.menu = null; // la escena se reutiliza: no arrastrar el menú anterior
    this.statLabels = null;
    const { W, H } = uiView(this);
    this.cameras.main.fadeIn(200);
    text(this, 8, 6, this.editId ? 'EDITAR HURÓN' : 'NUEVO HURÓN', { color: UI.gold, scale: 2 });

    // Vista previa grande que alterna galope, sigilo, reposo y de pie.
    panel(this, 8, 26, 132, 150, { fill: 0x2a3050 });
    this.add.rectangle(11, 120, 126, 53, 0x6e4a2c).setOrigin(0);
    this.preview = this.add.sprite(74, 118, `fer_${PREVIEW}_side`).setOrigin(0.5, 33 / 36);
    this.previewDown = this.add.sprite(74, 166, `fer_${PREVIEW}_down`).setOrigin(0.5, 0.9);
    this.nameTxt = text(this, 74, 32, '', { color: UI.gold, align: 'center' });
    this.statsG = this.add.graphics();
    this.styleTxt = text(this, 74, 44, '', { color: UI.orange, align: 'center' });
    this.anims_ = ['run', 'sneak', 'idle', 'stand'];
    this.animI = 0;
    this.time.addEvent({ delay: 2200, loop: true, callback: () => { this.animI = (this.animI + 1) % this.anims_.length; this.playPreview(); } });

    // Opciones.
    const ox = 148;
    const rows = [{ key: 'name', label: 'NOMBRE' }, ...OPTIONS];
    this.rowTxt = rows.map((r, i) => {
      const y = 28 + i * 14;
      return {
        label: text(this, ox, y, r.label, { color: UI.gray }),
        value: text(this, W - 16, y, '', { align: 'right' }),
        l: text(this, ox + 76, y, '<', { color: UI.gold }),
        r: text(this, W - 10, y, '>', { color: UI.gold }),
      };
    });
    // La zona táctil de cada fila empieza tras la flecha "<" (que tiene su propio toque).
    const items = rows.map((r, i) => ({
      x: ox + 86, y: 25 + i * 14, w: W - ox - 90, h: 14, row: true,
      onSelect: () => (r.key === 'name' ? this.editName() : this.change(r.key, 1)),
      onLeft: () => r.key !== 'name' && this.change(r.key, -1),
      onRight: () => r.key !== 'name' && this.change(r.key, 1),
    }));
    const by = 28 + rows.length * 14 + 6;
    const bdefs = [['GUARDAR', () => this.store()], ['ALEATORIO', () => this.random()], ['VOLVER', () => this.back()]];
    this.btnT = bdefs.map(([l], i) => text(this, ox + 4 + i * 58 + 26, by + 4, l, { align: 'center' }));
    this.btnG = this.add.graphics().setDepth(-1);
    bdefs.forEach(([, fn], i) => items.push({ x: ox + 4 + i * 58, y: by, w: 54, h: 16, onSelect: fn, btn: i }));
    this.rows = rows;
    this.cursor = this.add.graphics();
    text(this, W / 2, H - 11, 'IZQ/DCHA: CAMBIAR · A: ELEGIR · B: VOLVER', { color: UI.gray, align: 'center' });
    this.menu = new Menu(this, items, {
      sound: (s) => sound.sfx(s),
      onChange: (i) => this.focus(i),
      onBack: () => this.back(),
    });
    this.focus(0);
    // Toques en las flechas < > de cada fila.
    this.input.on('pointerdown', (p) => {
      if (!this.menu.enabled) return;
      const x = p.x / 2;
      const y = p.y / 2;
      rows.forEach((r, i) => {
        if (r.key === 'name' || Math.abs(y - (32 + i * 14)) > 7) return;
        if (Math.abs(x - (ox + 79)) < 9) this.change(r.key, -1);
      });
    });
    this.handleBack = () => { if (this.menu.enabled) this.back(); };
    this.game.events.on('androidBack', this.handleBack);
    this.events.once('shutdown', () => this.game.events.off('androidBack', this.handleBack));
    this.refresh();
  }

  focus(i) {
    if (!this.menu) return;
    this.cursor.clear();
    const it = this.menu.items[i];
    if (it.row) this.cursor.lineStyle(1, UI.gold, 1).strokeRect(146, it.y, this.scale.width / 2 - 150, it.h);
    else this.cursor.lineStyle(1, UI.gold, 1).strokeRect(it.x, it.y, it.w, it.h);
    this.btnT.forEach((t, j) => t.setTint(it.btn === j ? UI.gold : UI.text));
    this.btnG.clear();
    this.menu.items.filter((x) => x.btn != null).forEach((b) => {
      this.btnG.fillStyle(it === b ? UI.gold : UI.borderDark, 1).fillRect(b.x, b.y, b.w, b.h);
      this.btnG.fillStyle(UI.panel, 1).fillRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
    });
  }

  playPreview() {
    const a = this.anims_[this.animI];
    this.preview.play(`fer_${PREVIEW}_${a}`, true);
    this.previewDown.play(`fer_${PREVIEW}_down`, true);
  }

  refresh() {
    // Suelta las texturas antes de regenerarlas (si no, Phaser pinta un fotograma ya borrado).
    for (const spr of [this.preview, this.previewDown]) spr.stop().setTexture('px');
    makeFerretTextures(this, PREVIEW, lookFrom(this.choices));
    this.playPreview();
    this.nameTxt.setText(this.name);
    const st = styleStats(styleFrom(this.choices));
    this.styleTxt.setText(st.style);
    this.statsG.clear();
    STAT_LABELS.forEach(([k], j) => {
      const y = 58 + j * 11;
      for (let n = 0; n < 5; n++) {
        this.statsG.fillStyle(0x000000, 1).fillRect(46 + n * 10, y, 9, 4);
        this.statsG.fillStyle(n < st.stats[k] ? UI.green : 0x404058, 1).fillRect(47 + n * 10, y + 1, 7, 2);
      }
    });
    if (!this.statLabels) this.statLabels = STAT_LABELS.map(([, l], j) => text(this, 18, 56 + j * 11, l, { color: UI.gray }));
    this.rows.forEach((r, i) => {
      const v = r.key === 'name' ? this.name : r.choices[this.choices[r.key]][0];
      this.rowTxt[i].value.setText(v);
      this.rowTxt[i].l.setVisible(r.key !== 'name');
      this.rowTxt[i].r.setVisible(r.key !== 'name');
    });
  }

  change(key, d) {
    const opt = OPTIONS.find((o) => o.key === key);
    const n = opt.choices.length;
    this.choices[key] = (this.choices[key] + d + n) % n;
    sound.sfx('move');
    this.refresh();
  }

  random() {
    for (const o of OPTIONS) this.choices[o.key] = Math.floor(Math.random() * o.choices.length);
    sound.sfx('dook');
    this.refresh();
  }

  editName() {
    this.menu.enabled = false;
    this.scene.launch('NameEntry', {
      name: this.name,
      title: 'NOMBRE DEL HURÓN',
      onDone: (n) => {
        this.menu.enabled = true;
        if (n) { this.name = n; this.refresh(); }
      },
    });
  }

  store() {
    const id = this.editId ?? newCustomId();
    saveCustom({ id, name: this.name, look: lookFrom(this.choices), style: styleFrom(this.choices), coat: coatName(this.choices), choices: this.choices });
    makeFerretTextures(this, id, lookFrom(this.choices));
    save.data.ferret = id;
    save.write();
    sound.sfx('pair');
    this.go('Select');
  }

  back() { this.go('Select'); }

  go(scene) {
    this.menu.enabled = false;
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(scene));
  }
}
