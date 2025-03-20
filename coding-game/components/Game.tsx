"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";

const Game = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let gameInstance: Phaser.Game | null = null;
  
    const loadPhaser = async () => {
      if (gameInstance) {
        gameInstance.destroy(true);
        gameInstance = null; // Clear instance
      }
  
      class GameScene extends Phaser.Scene {
        player!: Phaser.Physics.Arcade.Sprite;
        cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
        obstacles!: Phaser.Physics.Arcade.StaticGroup;
  
        constructor() {
          super("GameScene");
        }
  
        preload() {
          this.load.image("map", "/assets/map3.jpg");
          this.load.image("player", "/assets/player.png");
        }
  
        create() {
          const background = this.add.image(0, 0, "map").setOrigin(0, 0);
          background.setDisplaySize(800, 1400);
        
          this.player = this.physics.add.sprite(400, 1300, "player").setScale(0.1);
          this.player.setCollideWorldBounds(true);
        
          this.cameras.main.setBounds(0, 0, 800, 1400);
          this.physics.world.setBounds(0, 0, 800, 1400);
          this.cameras.main.startFollow(this.player);
          this.cameras.main.setDeadzone(800, 400);
        
          this.cursors = this.input.keyboard?.createCursorKeys() || {} as Phaser.Types.Input.Keyboard.CursorKeys;
        
          const graphics = this.add.graphics();
          graphics.lineStyle(2, 0xff0000, 1); // Red collision boundaries for debugging
        
          // COLLISION BOUNDARIES
          this.obstacles = this.physics.add.staticGroup();
        
          // Define rectangular collision zones based on the map layout
          const colliders = [
            { x: 440, y: 766, width: 100, height: 100 }, // Top-left fenced area
            { x: 622, y: 780, width: 100, height: 100 }, // Near upper-right house
            { x: 280, y: 1200, width: 120, height: 50 }, // Near bottom house
            { x: 100, y: 600, width: 150, height: 80 },  // Near water pool
            { x: 670, y: 1350, width: 100, height: 50 }, // Bottom-right trees
          ];
        
          colliders.forEach(({ x, y, width, height }) => {
            const rect:any = this.add.rectangle(x, y, width, height).setOrigin(0, 0);
            this.obstacles.add(rect);
            graphics.strokeRectShape(rect); // Debug view
          });
        
          // Apply collision between player and obstacles
          this.physics.add.collider(this.player, this.obstacles);
        }
        
  
        update() {
          const speed = 160;
          this.player.setVelocity(0);
  
          if (this.cursors.left?.isDown) this.player.setVelocityX(-speed);
          else if (this.cursors.right?.isDown) this.player.setVelocityX(speed);
  
          if (this.cursors.up?.isDown) this.player.setVelocityY(-speed);
          else if (this.cursors.down?.isDown) this.player.setVelocityY(speed);
        }
      }
  
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameRef.current!,
        physics: {
          default: "arcade",
          arcade: { gravity: { y: 0, x: 0 } },
        },
        scene: GameScene,
      };
  
      gameInstance = new Phaser.Game(config);
    };
  
    loadPhaser();
  
    return () => {
      if (gameInstance) {
        gameInstance.destroy(true);
        gameInstance = null;
      }
    };
  }, []);
  
  

  return <div ref={gameRef} className=" bg-white" />;
};

// if (import.meta.hot) {
//   import.meta.hot.dispose(() => {
//     gameInstance?.destroy(true);
//   });
// }


export default Game;
