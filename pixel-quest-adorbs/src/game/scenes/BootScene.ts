
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Create simple graphics objects for loading screen instead of loading external images
    this.load.on('start', () => {
      console.log('Boot scene load started');
    });
    
    this.load.on('complete', () => {
      console.log('Boot scene assets loaded successfully');
    });
  }

  create() {
    console.log('BootScene loaded successfully');
    this.scene.start('PreloadScene');
  }
}
