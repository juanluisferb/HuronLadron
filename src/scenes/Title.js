import Phaser from 'phaser';
import { text } from '../ui/text.js';
import { Menu } from '../ui/controls.js';
import { UI } from '../gfx/palette.js';
import { sound } from '../audio/audio.js';
import { uiView } from '../ui/view.js';
import { HD } from '../gfx/textures.js';
import { profiles } from '../profiles.js';

const isAndroid = () => /Android/i.test(navigator.userAgent);

export class Title extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    const { W, H } = uiView(this);
    this.cameras.main.setBackgroundColor('#101828');

    // Fondo: cielo nocturno con estrellitas y un suelo de parqué por donde corre la persecución.
    const g = this.add.graphics();
    for (let i = 0; i < 40; i++) {
      g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.2, 0.8));
      g.fillRect(Phaser.Math.Between(0, W), Phaser.Math.Between(0, 120), 1, 1);
    }
    for (let x = 0; x < W; x += 16) this.add.image(x, H - 32, `floor_wood_${(x / 16) % 4}`).setOrigin(0).setScale(HD);
    for (let x = 0; x < W; x += 16) this.add.image(x, H - 16, `floor_wood_${(x / 16 + 2) % 4}`).setOrigin(0).setScale(HD);
    for (let x = 0; x < W; x += 16) this.add.image(x, H - 32, 'wall_front_1').setOrigin(0, 1).setScale(HD);

    // Logo.
    const l1 = text(this, W / 2, 22, 'HURÓN', { color: UI.gold, scale: 4, align: 'center' });
    const l2 = text(this, W / 2, 58, 'LADRÓN', { color: UI.orange, scale: 4, align: 'center' });
    this.tweens.add({ targets: [l1], y: 25, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: [l2], y: 61, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: 200 });
    text(this, W / 2, 94, 'Sigilo, calcetines y mucha cara', { color: UI.text, align: 'center' });

    // Desfile: tres hurones con botín y el dueño detrás.
    const y = H - 22;
    const parade = this.add.container(-60, 0);
    profiles().slice(0, 3).forEach((p, i) => {
      const f = this.add.sprite(-i * 32, y, `fer_${p.id}_side`).play(`fer_${p.id}_run`).setOrigin(0.5, 33 / 36).setScale(HD);
      const it = this.add.image(-i * 32 + 11, y - 7, ['item_sock_red', 'item_keys', 'item_remote'][i]).setScale(HD);
      parade.add([f, it]);
    });
    const owner = this.add.sprite(-120, y + 2, 'human_owner').play('human_owner_side').setOrigin(0.5, 1).setScale(HD);
    parade.add(owner);
    this.tweens.add({ targets: parade, x: W + 140, duration: 7000, repeat: -1 });

    // Menú.
    const opts = [
      { label: () => 'JUGAR', act: () => this.go() },
      { label: () => `MÚSICA: ${sound.musicOn ? 'SÍ' : 'NO'}`, act: () => { sound.toggleMusic(); this.refresh(); } },
      { label: () => `EFECTOS: ${sound.sfxOn ? 'SÍ' : 'NO'}`, act: () => { sound.toggleSfx(); this.refresh(); } },
    ];
    if (isAndroid()) opts.push({ label: () => 'SALIR', act: () => { document.title = '__exit__'; } });
    this.opts = opts;
    const top = 112;
    this.labels = opts.map((o, i) => text(this, W / 2, top + i * 13, o.label(), { align: 'center' }));
    this.cursor = this.add.image(0, 0, 'icon_arrow').setAngle(-90);
    this.tweens.add({ targets: this.cursor, scaleX: 1.3, duration: 300, yoyo: true, repeat: -1 });
    const items = opts.map((o, i) => ({ x: W / 2 - 60, y: top + i * 13 - 3, w: 120, h: 13, onSelect: o.act }));
    this.menu = new Menu(this, items, {
      sound: (s) => sound.sfx(s),
      onChange: (i) => this.focus(i),
    });
    text(this, 4, H - 10, 'v1.2', { color: UI.gray });

    this.handleBack = () => {
      if (isAndroid()) document.title = '__exit__';
    };
    this.game.events.on('androidBack', this.handleBack);
    this.events.once('shutdown', () => this.game.events.off('androidBack', this.handleBack));
    sound.play('title');
  }

  focus(i) {
    this.labels.forEach((l, j) => l.setTint(j === i ? UI.gold : UI.text));
    const l = this.labels[i];
    this.cursor.setPosition(l.x - 8, l.y + 4);
  }

  refresh() {
    this.labels.forEach((l, i) => l.setText(this.opts[i].label()));
    this.focus(this.menu.index);
  }

  go() {
    this.menu.enabled = false;
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Select'));
  }
}
