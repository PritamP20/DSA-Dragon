
import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.createLoadingScreen();

    this.load.image('player-img', 'Hero.png');
    this.load.image("player", "/assets/player.png");
    this.load.image('town-map', '/lovable-uploads/2176030f-7feb-4f01-b180-e2b5ee6f6016.png');
    // this.load.image('player', 'player.png');
    this.load.image('battle', '/lovable-uploads/battle.png');
    this.load.image("BossBattle", "/assets/BossBattle.png");

    
const canvasTexture = this.textures.createCanvas('player-img', 16, 32);
const context = canvasTexture.getContext();
context.fillStyle = '#4a6fa5';
context.fillRect(0, 0, 16, 32);
canvasTexture.refresh();

// When creating the sprites, set a consistent scale
    
    // Create a basic tileset
    const tilesetCanvas = this.textures.createCanvas('tiles', 64, 64);
    const tilesetContext = tilesetCanvas.getContext();
    tilesetContext.fillStyle = '#7c9463'; // Green for grass
    tilesetContext.fillRect(0, 0, 16, 16);
    tilesetContext.fillStyle = '#4a6fa5'; // Blue for water
    tilesetContext.fillRect(16, 0, 16, 16);
    tilesetContext.fillStyle = '#8b4513'; // Brown for dirt
    tilesetContext.fillRect(32, 0, 16, 16);
    tilesetContext.fillStyle = '#9c9c9c'; // Gray for stone
    tilesetContext.fillRect(48, 0, 16, 16);
    tilesetCanvas.refresh();
    
    // Create a simple dialog box
    const dialogCanvas = this.textures.createCanvas('dialog-box', 320, 100);
    const dialogContext = dialogCanvas.getContext();
    dialogContext.fillStyle = 'rgba(0, 0, 0, 0.7)';
    dialogContext.fillRect(0, 0, 320, 100);
    dialogContext.strokeStyle = 'white';
    dialogContext.lineWidth = 2;
    dialogContext.strokeRect(4, 4, 312, 92);
    dialogCanvas.refresh();
    
    // Track loading progress
    this.load.on('progress', (value: number) => {
      this.updateProgressBar(value);
    });
    
    this.load.on('complete', () => {
      console.log('Assets loaded successfully');
      this.progressBar.destroy();
      this.loadingBar.destroy();
    });
  }

  create() {
    // Create character animations
    this.createAnimations();
    
    // Start the game
    this.scene.start('WorldScene');
    this.scene.launch('UIScene');

// In your create() function:
  }

  private createLoadingScreen() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.loadingBar = this.add.graphics();
    this.loadingBar.fillStyle(0x222222, 0.8);
    this.loadingBar.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    this.progressBar = this.add.graphics();
  }

  private updateProgressBar(value: number) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.progressBar.clear();
    this.progressBar.fillStyle(0x00ff00, 1);
    this.progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
  }

  private createAnimations() {
    // Create simplified animations with the single texture we created
    this.anims.create({
      key: 'player-idle-down',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player-walk-down',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player-idle-up',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player-walk-up',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player-idle-left',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player-walk-left',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player-idle-right',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player-walk-right',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 10,
      repeat: -1
    });
  }
}
