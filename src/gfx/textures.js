// Genera todas las texturas del juego en el arranque (no hay ni un PNG en el proyecto).
// El mundo se dibuja a doble resolución: las texturas "HD" se muestran con escala 0.5.
import Phaser from 'phaser';
import { ferretSheets, SIDE_W, SIDE_H, VERT } from './ferret.js';
import { humanSheets, HUMAN_SKINS, HUMAN_W, HUMAN_H } from './humans.js';
import { itemIcon } from './items.js';
import { furnitureSprite } from './furniture.js';
import { woodFloor, tileFloor, carpetFloor, grassFloor, pathFloor, soilFloor, wallFace, doorHD, WALL_THEMES } from './floors.js';
import { toHD, hdPalette } from './hd.js';
import { fontCanvas, FONT_CHARS, FONT_W, FONT_H } from './font.js';
import { PAL, md } from './palette.js';
import { Pix, makeCanvas } from './pix.js';
import { ITEMS } from '../data/items.js';
import { FURNITURE } from '../sim/furniture.js';

export const HD = 0.5; // escala con la que se muestran las texturas HD

function addSheet(scene, key, frames, pal) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const fw = frames[0].w;
  const fh = frames[0].h;
  const c = makeCanvas(fw * frames.length, fh);
  const ctx = c.getContext('2d');
  frames.forEach((f, i) => f.draw(ctx, pal, i * fw, 0));
  const tex = scene.textures.addCanvas(key, c);
  frames.forEach((_, i) => tex.add(i, 0, i * fw, 0, fw, fh));
  return tex;
}

function addPix(scene, key, pix, pal) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const c = makeCanvas(pix.w, pix.h);
  pix.draw(c.getContext('2d'), pal);
  scene.textures.addCanvas(key, c);
}

function circle(scene, key, r, fill, border, inner) {
  const p = new Pix(r * 2 + 2, r * 2 + 2);
  p.ellipse(r + 1, r + 1, r + 0.5, r + 0.5, 'b');
  p.ellipse(r + 1, r + 1, r - 1.5, r - 1.5, 'f');
  if (inner) p.ellipse(r + 1, r * 0.75, r * 0.6, r * 0.4, 'h');
  addPix(scene, key, p, { b: border, f: fill, h: inner });
}

/** Texturas y animaciones de un hurón (se puede llamar de nuevo tras editarlo). */
export function makeFerretTextures(scene, id, look) {
  const sh = ferretSheets(look);
  addSheet(scene, `fer_${id}_side`, sh.side, sh.pal);
  addSheet(scene, `fer_${id}_down`, sh.down, sh.pal);
  addSheet(scene, `fer_${id}_up`, sh.up, sh.pal);
  const A = scene.anims;
  const mk = (key, tex, frames, rate) => {
    if (A.exists(key)) A.remove(key);
    A.create({ key, frames: A.generateFrameNumbers(tex, { frames }), frameRate: rate, repeat: -1 });
  };
  mk(`fer_${id}_run`, `fer_${id}_side`, [0, 1, 2, 3, 4, 5], 12);
  mk(`fer_${id}_sneak`, `fer_${id}_side`, [6, 7, 8, 9], 6);
  mk(`fer_${id}_idle`, `fer_${id}_side`, [10, 10, 10, 11, 10, 10], 3);
  mk(`fer_${id}_stand`, `fer_${id}_side`, [12], 1);
  for (const d of ['down', 'up']) {
    mk(`fer_${id}_${d}`, `fer_${id}_${d}`, [0, 1, 2, 3], 9);
    mk(`fer_${id}_${d}_idle`, `fer_${id}_${d}`, [1, 1, 3], 2);
  }
}

export function generateTextures(scene) {
  // Humanos -----------------------------------------------------------------
  for (const skin of HUMAN_SKINS) {
    const sh = humanSheets(skin);
    addSheet(scene, `human_${skin}`, [...sh.down, ...sh.up, ...sh.side, sh.sit, sh.phone], sh.pal);
    const dirs = { down: 0, up: 4, side: 8 };
    for (const [d, o] of Object.entries(dirs)) {
      scene.anims.create({ key: `human_${skin}_${d}`, frames: scene.anims.generateFrameNumbers(`human_${skin}`, { frames: [o, o + 1, o + 2, o + 3] }), frameRate: 7, repeat: -1 });
    }
  }
  // Objetos -----------------------------------------------------------------
  const hdPal = hdPalette(PAL);
  for (const [id, def] of Object.entries(ITEMS)) {
    const { pix, extra } = itemIcon(def.icon, def.tint);
    addPix(scene, `item_${id}`, toHD(pix), { ...hdPal, ...hdPalette(extra) });
  }
  // Muebles -----------------------------------------------------------------
  for (const [type, def] of Object.entries(FURNITURE)) {
    const sp = furnitureSprite(type, def.w, def.h);
    addPix(scene, `furn_${type}`, toHD(sp.pix, { outline: sp.outline, seed: type.length * 7 }), hdPal);
  }
  const tvOn = furnitureSprite('tv', 2, 1, 'on');
  addPix(scene, 'furn_tv_on', toHD(tvOn.pix), hdPal);
  const hole = furnitureSprite('burrow', 1, 1, 'hole');
  addPix(scene, 'furn_burrow_hole', toHD(hole.pix, { outline: false }), hdPal);
  // Suelos y paredes ----------------------------------------------------------
  for (let v = 0; v < 4; v++) {
    addPix(scene, `floor_wood_${v}`, woodFloor(v), {});
    addPix(scene, `floor_grass_${v}`, grassFloor(v), {});
  }
  for (let v = 0; v < 2; v++) {
    addPix(scene, `floor_tile_${v}`, tileFloor(v), {});
    addPix(scene, `floor_carpet_${v}`, carpetFloor(v), {});
    addPix(scene, `floor_path_${v}`, pathFloor(v), {});
    addPix(scene, `floor_soil_${v}`, soilFloor(v), {});
  }
  for (const theme of Object.keys(WALL_THEMES)) {
    addPix(scene, `wall_front_${theme}`, wallFace(theme, true), {});
    addPix(scene, `wall_top_${theme}`, wallFace(theme, false), {});
    addPix(scene, `door_open_${theme}`, doorHD(false, theme), {});
    addPix(scene, `door_closed_${theme}`, doorHD(true, theme), {});
  }

  // Interfaz ------------------------------------------------------------------
  const px = makeCanvas(1, 1);
  const pctx = px.getContext('2d');
  pctx.fillStyle = '#fff';
  pctx.fillRect(0, 0, 1, 1);
  scene.textures.addCanvas('px', px);

  const star = new Pix(9, 9).art([
    '....o....', '...oyo...', 'oooyyyooo', 'oyyyyyyyo', '.oyyyyyo.', '..oyyyo..', '.oyyoyyo.', '.oyo.oyo.', '.oo...oo.',
  ]);
  addPix(scene, 'star', star, { o: md('#3a2408'), y: md('#f8d030') });
  addPix(scene, 'star_empty', star, { o: md('#202030'), y: md('#505068') });
  const home = new Pix(11, 10).art([
    '.....o.....', '....oro....', '...orrro...', '..orrrrro..', '.orrrrrrro.', 'ooowwwwwooo', '..ow.oowo..', '..ow.oowo..', '..owwoowo..', '..ooooooo..',
  ]);
  addPix(scene, 'icon_home', home, { o: md('#20141c'), r: md('#e04030'), w: md('#f8e8b0') });
  const eye = new Pix(11, 7).art([
    '...ooooo...', '.oowwwwwoo.', 'owwwkkkwwwo', 'owwkkhkkwwo', 'owwwkkkwwwo', '.oowwwwwoo.', '...ooooo...',
  ]);
  addPix(scene, 'icon_eye', eye, { o: md('#20141c'), w: md('#f8f8f8'), k: md('#2050a0'), h: md('#ffffff') });
  const bolt = new Pix(7, 9).art(['...ooo.', '..oyyo.', '.oyyo..', 'oyyyyyo', 'ooyyyo.', '..oyo..', '.oyo...', '.oo....', 'o......']);
  addPix(scene, 'icon_bolt', bolt, { o: md('#20141c'), y: md('#f8d030') });
  const note = new Pix(8, 8).art(['....ooo.', '...owwo.', '...oo.o.', '...o..o.', '.ooo..o.', 'owwo.oo.', 'owwo.o..', '.oo.....']);
  addPix(scene, 'icon_noise', note, { o: md('#20141c'), w: md('#f8f8f8') });
  const zzz = new Pix(9, 9).art(['....ooooo', '.......o.', '......o..', '.....ooooo', 'oooo.....', '..o......', '.o.......', 'oooo.....', '.........']);
  addPix(scene, 'icon_zzz', zzz, { o: md('#f8f8f8') });
  const sparkle = new Pix(7, 7).art(['...w...', '...w...', '..wyw..', 'wwyyyww', '..wyw..', '...w...', '...w...']);
  addPix(scene, 'sparkle', sparkle, { w: md('#ffffff'), y: md('#f8f0a0') });
  const arrow = new Pix(9, 6).art(['ooooooooo', 'oyyyyyyyo', '.oyyyyyo.', '..oyyyo..', '...oyo...', '....o....']);
  addPix(scene, 'icon_arrow', arrow, { o: md('#20141c'), y: md('#f8d030') });
  const pencil = new Pix(9, 9).art(['......oo.', '.....oyyo', '....oyyo.', '...oyyo..', '..oyyo...', '.owyo....', 'owwo.....', 'oko......', 'oo.......']);
  addPix(scene, 'icon_pencil', pencil, { o: md('#20141c'), y: md('#f8b030'), w: md('#f0d0a0'), k: md('#404048') });

  // Controles táctiles (HD, se muestran a escala 0.5).
  circle(scene, 'touch_base', 60, 'rgba(255,255,255,0.10)', 'rgba(255,255,255,0.45)');
  circle(scene, 'touch_knob', 26, 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0.85)');
  circle(scene, 'btn_a', 34, md('#d83838'), md('#601010'), md('#f07070'));
  circle(scene, 'btn_b', 26, md('#3868d8'), md('#102060'), md('#78a0f0'));
  circle(scene, 'btn_run', 24, md('#d89030'), md('#603810'), md('#f0c070'));
  circle(scene, 'btn_sneak', 24, md('#40a050'), md('#104018'), md('#80d088'));
  circle(scene, 'btn_small', 18, md('#505068'), md('#181828'), md('#8888a0'));

  // Fuente bitmap.
  scene.textures.addCanvas('font_src', fontCanvas());
  const cfg = {
    image: 'font_src', width: FONT_W, height: FONT_H, chars: FONT_CHARS,
    charsPerRow: FONT_CHARS.length, spacing: { x: 0, y: 0 }, offset: { x: 0, y: 0 }, lineSpacing: 2,
  };
  scene.cache.bitmapFont.add('font', Phaser.GameObjects.RetroFont.Parse(scene, cfg));
}

export { SIDE_W, SIDE_H, VERT, HUMAN_W, HUMAN_H };
