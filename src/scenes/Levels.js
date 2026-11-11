import Phaser from 'phaser';
import { text, panel, wrap } from '../ui/text.js';
import { Menu } from '../ui/controls.js';
import { UI } from '../gfx/palette.js';
import { LEVELS } from '../data/levels/index.js';
import { sound } from '../audio/audio.js';
import { save } from '../save.js';
import { uiView } from '../ui/view.js';
import { profile } from '../profiles.js';
import { HD } from '../gfx/textures.js';

export class Levels extends Phaser.Scene {
  constructor() { super('Levels'); }

  create() {
    const { W, H } = uiView(this);
    this.cameras.main.fadeIn(200);
    text(this, 8, 6, 'ELIGE NIVEL', { color: UI.gold, scale: 2 });
    const p = profile(save.data.ferret);
    this.add.sprite(W - 24, 20, `fer_${p.id}_down`).play(`fer_${p.id}_down_idle`).setScale(HD).setOrigin(0.5, 0.9);
    text(this, W - 24, 23, p.name, { color: UI.gray, align: 'center' });

    const cw = 100;
    const ch = 86;
    const gap = 6;
    const x0 = Math.round((W - cw * 3 - gap * 2) / 2);
    this.cards = LEVELS.map((lv, i) => {
      const x = x0 + (i % 3) * (cw + gap);
      const y = 34 + Math.floor(i / 3) * (ch + gap);
      const locked = lv.id > save.data.unlocked;
      const border = this.add.graphics();
      panel(this, x, y, cw, ch, { fill: locked ? UI.panelDark : UI.panel });
      text(this, x + 8, y + 7, String(lv.id), { color: locked ? UI.gray : UI.gold, scale: 2 });
      text(this, x + 24, y + 7, wrap(lv.name, 12), { color: locked ? UI.gray : UI.text, lineSpacing: 1 });
      if (locked) {
        text(this, x + cw / 2, y + 40, 'BLOQUEADO', { color: UI.red, align: 'center' });
        text(this, x + cw / 2, y + 52, wrap('Supera el nivel anterior', 15), { color: UI.gray, align: 'center' });
      } else {
        text(this, x + 6, y + 30, wrap(lv.subtitle, 15), { color: UI.gray, lineSpacing: 1 });
        const best = save.data.best[lv.id];
        for (let s = 0; s < 3; s++) this.add.image(x + 10 + s * 11, y + ch - 12, best && best.stars > s ? 'star' : 'star_empty');
        text(this, x + cw - 6, y + ch - 15, best ? `${best.score}` : '---', { color: UI.gray, align: 'right' });
      }
      return { lv, x, y, w: cw, h: ch, border, locked };
    });
    text(this, W / 2, H - 12, 'A / DOBLE TOQUE: JUGAR    B: VOLVER', { color: UI.gray, align: 'center' });

    const start = Math.min(save.data.unlocked, LEVELS.length) - 1;
    this.menu = new Menu(this, this.cards.map((c) => ({ x: c.x, y: c.y, w: c.w, h: c.h, onSelect: () => this.play(c) })), {
      layout: 'grid', start, tapToFocus: true,
      sound: (s) => sound.sfx(s),
      onChange: (i) => this.focus(i),
      onBack: () => this.scene.start('Select'),
    });
    this.handleBack = () => this.scene.start('Select');
    this.game.events.on('androidBack', this.handleBack);
    this.events.once('shutdown', () => this.game.events.off('androidBack', this.handleBack));
    sound.play('title');
  }

  focus(i) {
    this.cards.forEach((c, j) => {
      c.border.clear();
      if (j === i) c.border.lineStyle(2, c.locked ? UI.gray : UI.gold, 1).strokeRect(c.x - 2, c.y - 2, c.w + 4, c.h + 4);
    });
  }

  play(card) {
    if (card.locked) {
      sound.sfx('noPower');
      this.cameras.main.shake(120, 0.004);
      return;
    }
    this.menu.enabled = false;
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game', { levelId: card.lv.id, ferret: save.data.ferret }));
  }
}
