import Phaser from 'phaser';
import { generateTextures, makeFerretTextures } from '../gfx/textures.js';
import { profiles } from '../profiles.js';

export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    generateTextures(this);
    for (const p of profiles()) makeFerretTextures(this, p.id, p.look);
    this.scene.start('Title');
  }
}
