
import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  private dialogBox!: Phaser.GameObjects.Image;
  private dialogText!: Phaser.GameObjects.Text;
  private dialogActive: boolean = false;
  private dialogTimer: number = 0;
  
  constructor() {
    super({ key: 'UIScene', active: false });
  }

  create() {
    this.createUI();
    const worldScene = this.scene.get('WorldScene');
    worldScene.events.on('showMessage', this.showMessage, this);
    
    this.input.keyboard!.on('keydown-SPACE', () => {
      if (this.dialogActive) {
        this.hideDialog();
      }
    });
  }

  update(time: number, delta: number) {
    if (this.dialogActive) {
      this.dialogTimer += delta;
      if (this.dialogTimer > 5000) { // 5 seconds
        this.hideDialog();
      }
    }
  }

  private createUI() {
    // Create dialog box at the bottom of the screen
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.dialogBox = this.add.image(width / 2, height - 100, 'dialog-box');
    this.dialogBox.setScale(2);
    this.dialogBox.setVisible(false);
    
    this.dialogText = this.add.text(width / 2 - 150, height - 130, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '16px',
      color: '#333',
      wordWrap: { width: 300, useAdvancedWrap: true }
    });
    this.dialogText.setVisible(false);
  }

  showMessage(message: string) {
    // Show dialog box with message
    this.dialogBox.setVisible(true);
    this.dialogText.setText(message);
    this.dialogText.setVisible(true);
    
    // Set dialog as active and reset timer
    this.dialogActive = true;
    this.dialogTimer = 0;
  }

  hideDialog() {
    // Hide dialog box and text
    this.dialogBox.setVisible(false);
    this.dialogText.setVisible(false);
    
    this.dialogActive = false;
  }
}
