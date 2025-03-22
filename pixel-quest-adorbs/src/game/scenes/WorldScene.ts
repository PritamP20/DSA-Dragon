import Phaser from 'phaser';
import {npcDialogues} from "../../components/api/courseDataApi.js"

class NPC extends Phaser.GameObjects.Sprite {
  public id: string;
  public topic: string;
  declare public name: string;

  constructor(
      scene: Phaser.Scene,
      x: number,
      y: number,
      texture: string,
      frame: number,
      id: string,
      topic: string,
      name: string
  ) {
      super(scene, x, y, texture, frame);
      this.id = id;
      this.topic = topic;
      this.name = name;
      scene.add.existing(this);
  }
}


export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private grassZones!: { x: number; y: number; width: number; height: number, grassType?:number, density?:number }[];
  private yellowGrassZones!: { x: number; y: number; width: number; height: number, grassType?:number, density?:number }[];
  private redGrassZones!: { x: number; y: number; width: number; height: number, grassType?:number, density?:number }[];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private map!: Phaser.GameObjects.Image;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private npcs!: Phaser.Physics.Arcade.StaticGroup;
  private messageText!: Phaser.GameObjects.Text;
  private messageBox!: Phaser.GameObjects.Rectangle;
  private messageVisible: boolean = false;
  private messageTimer: number = 0;
  private speed: number = 500;
  private currentPlayerDirection: string = 'down';
  private mapScale: number = 2;
  private showDebugBounds: boolean = true;
  private graphics: Phaser.GameObjects.Graphics;
  private difficulty:String;
  private topic:String;

  private greenGraphics:any;
  private redGraphics:any;
  private yellowGraphics:any;

    private npcsNerd: Array<any> = [];
    private interactionZone!: Phaser.GameObjects.Zone;
    private interactionKey!: Phaser.Input.Keyboard.Key;
    private interactionPrompt!: Phaser.GameObjects.Container;

  private userCoordinates: { x: number; y: number } = { x: 1360, y: 2750 };
  // private userCoordinates: { x: number; y: number } = { x: 1241.625240354536, y: 1148.0498440352615 };
  
  constructor() {
    super('WorldScene');
  }

  preload() {
    this.load.on('filecomplete', (key) => {
      console.log(`Asset loaded: ${key}`);
    });
    
    this.load.on('complete', () => {
      console.log('All assets loaded');
      if (this.textures.exists('player')) {
        console.log('Player texture loaded successfully');
        console.log('Player texture frames:', this.textures.get('player').frameTotal);
      } else {
        console.log('Player texture FAILED to load');
      }
    });

    this.load.spritesheet('player', 'player.png', { frameWidth: 12, frameHeight: 20 });


    this.load.spritesheet('npcs', 'blueguy.png', { frameWidth: 60, frameHeight: 60 });

    this.load.spritesheet('nerdnpecs', 'npcs.png',{ frameWidth: 60, frameHeight: 60 } )

// const npc = this.add.sprite(50, 50, 'npcs').setScale(100);
//  // Setting the scale here won't work, since setScale(100) is later overwritten
// npc.setScale(3);  // Use a larger value like 3 to zoom in on the sprite

  }

  private createNerdNPCs() {
    // Create NPCs with different topics
    // this.npcsNerd = this.physics.add.sprite(400, 1300, "player").setScale(0.1);
    const npcData = [
        { id: 'professor_tree', x: 652.8181216087671, y: 559.5262145875631, frame: 0, topic: 'bst', name: 'Professor Oak' },
        { id: 'professor_tree', x: 1332.2621458756246, y: 246.91780967929733, frame: 1, topic: 'bst', name: 'Pritam' },
        { id: 'algorithm_master', x: 741.3443361963309, y: 1030.9229799590119, frame: 2, topic: 'linkedList', name: 'Dr. Dynamic' },
        { id: 'network_guru', x: 485.0025851398573, y: 1890.6336580776644, frame: 3, topic: 'Sorting', name: 'Graph Master' },
        { id: 'data_organizer', x:1457.3637567824637, y: 2457.6938426723746, frame: 4, topic: 'Array', name: 'Sorter Sam' }
    ];
    
    npcData.forEach(data => {
        const npc = new NPC(
            this,
            data.x,
            data.y,
            'npcs',  // This is the key for your spritesheet/image
            data.frame,
            data.id,
            data.topic,
            data.name
        );
        this.npcsNerd.push(npc);
        
        // Add NPC to physics system
        this.physics.add.existing(npc);
        
    });
}

private setupInteraction() {
    // Create interaction key (e.g., 'E' key)
    this.interactionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    
    // Create interaction zone around player
    this.interactionZone = this.add.zone(this.player.x, this.player.y, 60, 60);
    this.physics.world.enable(this.interactionZone);
    
    // Create interaction prompt (hidden by default)
    this.interactionPrompt = this.createInteractionPrompt();
    this.interactionPrompt.setVisible(false);
}

private createInteractionPrompt() {
    // Create a container for the interaction prompt
    const container = this.add.container(0, 0);
    
    // Background
    const background = this.add.rectangle(0, 0, 120, 40, 0x000000, 0.7)
        .setStrokeStyle(2, 0xFFFFFF);
    
    // Text
    const text = this.add.text(0, 0, 'Press E', {
        fontSize: '14px',
        color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // Add to container
    container.add([background, text]);
    
    return container;
}


private checkNPCProximity() {
    // Keep track of whether player is near any NPC
    let nearNPC = false;
    let nearestNPC: NPC | null = null;
    let shortestDistance = Infinity;
    
    // Check each NPC
    this.npcsNerd.forEach(npc => {
        // Check if player's interaction zone overlaps with NPC
        const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            npc.x, npc.y
        );
        
        if (distance < 60) {
            nearNPC = true;
            
            // Find the nearest NPC
            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestNPC = npc;
            }
        }
    });
    
    // Show/hide interaction prompt based on proximity
    if (nearNPC && nearestNPC) {
        this.interactionPrompt.setPosition(nearestNPC.x, nearestNPC.y - 50);
        this.interactionPrompt.setVisible(true);
        
        // Check for interaction key press
        if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
            this.interactWithNPC(nearestNPC);
        }
    } else {
        this.interactionPrompt.setVisible(false);
    }
}

private interactWithNPC(npc: NPC) {
    console.log(`Interacting with ${npc.name} (${npc.id})`);
    
    // Display dialog or directly start the learning scene
    this.showNPCDialog(npc);
}

// private showNPCDialog(npc: NPC) {
//   // Calculate positions based on player position
//   const dialogBoxX = this.player.x;
//   const dialogBoxY = this.player.y - 80; // Position above player
//   const boxWidth = 400;
//   const boxHeight = 150;
  
//   // Create a dialog box
//   const dialogBox = this.add.rectangle(
//     dialogBoxX,
//     dialogBoxY,
//     boxWidth,
//     boxHeight,
//     0x000000,
//     0.8
//   ).setStrokeStyle(2, 0xFFFFFF);
  
//   // Add NPC name (positioned at top-left of dialog box)
//   const nameText = this.add.text(
//     dialogBoxX - (boxWidth / 2) + 20,
//     dialogBoxY - (boxHeight / 2) + 15,
//     npc.name,
//     { fontSize: '18px', color: '#FFFFFF', fontStyle: 'bold' }
//   );
  
//   // Add dialog text (positioned below name with proper padding)
//   const dialogText = this.add.text(
//     dialogBoxX - (boxWidth / 2) + 20,
//     dialogBoxY - (boxHeight / 2) + 45,
//     this.getNPCDialog(npc.topic),
//     {
//       fontSize: '16px',
//       color: '#FFFFFF',
//       wordWrap: { width: boxWidth - 40 }
//     }
//   );
  
//   // Add continue button (centered at bottom of dialog)
//   const continueButton = this.add.rectangle(
//     dialogBoxX,
//     dialogBoxY + (boxHeight / 2) - 25,
//     150,
//     40,
//     0x4444FF
//   ).setInteractive();
  
//   // Add button text (centered on button)
//   const buttonText = this.add.text(
//     continueButton.x,
//     continueButton.y,
//     'Learn More',
//     { fontSize: '16px', color: '#FFFFFF' }
//   ).setOrigin(0.5);
  
//   // Create a container for easy cleanup
//   const dialogContainer = this.add.container(0, 0, [
//     dialogBox, nameText, dialogText, continueButton, buttonText
//   ]);
  
//   // Add interactivity to continue button
//   continueButton.on('pointerdown', () => {
//     // Remove dialog
//     dialogContainer.destroy();
    
//     // Start learning scene with this NPC's topic
//     this.scene.start('DynamicLearningScene', { topic: npc.topic });
//   });
// }
private showNPCDialog(npc: NPC) {
  // Calculate positions based on player position
  const dialogBoxX = this.player.x;
  const dialogBoxY = this.player.y + 100; // Position below player
  const boxWidth = 400;
  const boxHeight = 150;
  
  // Create a dialog box
  const dialogBox = this.add.rectangle(
    dialogBoxX,
    dialogBoxY,
    boxWidth,
    boxHeight,
    0x000000,
    0.8
  ).setStrokeStyle(2, 0xFFFFFF);
  
  // Add NPC name (positioned at top-left of dialog box)
  const nameText = this.add.text(
    dialogBoxX - (boxWidth / 2) + 20,
    dialogBoxY - (boxHeight / 2) + 15,
    npc.name,
    { fontSize: '18px', color: '#FFFFFF', fontStyle: 'bold' }
  );
  
  // Add dialog text (positioned below name with proper padding)
  const dialogText = this.add.text(
    dialogBoxX - (boxWidth / 2) + 20,
    dialogBoxY - (boxHeight / 2) + 45,
    this.getNPCDialog(npc.topic),
    {
      fontSize: '16px',
      color: '#FFFFFF',
      wordWrap: { width: boxWidth - 40 }
    }
  );
  
  // Add close button (positioned at top-right of dialog box)
  const closeButton = this.add.rectangle(
    dialogBoxX + (boxWidth / 2) - 15,
    dialogBoxY - (boxHeight / 2) + 15,
    24,
    24,
    0xFF4444
  ).setInteractive();
  
  // Add X symbol on close button
  const closeText = this.add.text(
    closeButton.x,
    closeButton.y,
    'X',
    { fontSize: '16px', color: '#FFFFFF'}
  ).setOrigin(0.5);
  
  // Add continue button (centered at bottom of dialog)
  const continueButton = this.add.rectangle(
    dialogBoxX,
    dialogBoxY + (boxHeight / 2) - 25,
    150,
    40,
    0x4444FF
  ).setInteractive();
  
  // Add button text (centered on button)
  const buttonText = this.add.text(
    continueButton.x,
    continueButton.y,
    'Learn More',
    { fontSize: '16px', color: '#FFFFFF' }
  ).setOrigin(0.5);
  
  // Create a container for easy cleanup
  const dialogContainer = this.add.container(0, 0, [
    dialogBox, nameText, dialogText, closeButton, closeText, continueButton, buttonText
  ]);
  
  // Store initial NPC position to calculate distance later
  const initialNpcX = npc.x;
  const initialNpcY = npc.y;
  
  // Close dialog function
  const closeDialog = () => {
    dialogContainer.destroy();
    // Remove the update listener when dialog is closed
    this.events.off('update', checkDistance);
  };
  
  // Add interactivity to close button
  closeButton.on('pointerdown', closeDialog);
  
  // Add hover effect for close button
  closeButton.on('pointerover', () => {
    closeButton.setFillStyle(0xFF6666); // Lighter red on hover
  });
  
  closeButton.on('pointerout', () => {
    closeButton.setFillStyle(0xFF4444); // Back to original red
  });
  
  // Add interactivity to continue button
  continueButton.on('pointerdown', () => {
    // Remove dialog
    closeDialog();
    
    // Start learning scene with this NPC's topic
    this.scene.start('DynamicLearningScene', { topic: npc.topic });
  });
  
  // Add hover effect for continue button
  continueButton.on('pointerover', () => {
    continueButton.setFillStyle(0x6666FF); // Lighter blue on hover
  });
  
  continueButton.on('pointerout', () => {
    continueButton.setFillStyle(0x4444FF); // Back to original blue
  });
  
  // Function to check distance between player and NPC
  const checkDistance = () => {
    const distX = Math.abs(this.player.x - initialNpcX);
    const distY = Math.abs(this.player.y - initialNpcY);
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    // Close dialog if player moves more than 150 pixels away from initial NPC position
    if (distance > 150) {
      closeDialog();
    }
  };
  
  // Add update listener to check distance on each frame
  this.events.on('update', checkDistance);
}
//USE AI HERE TO GENERATE RANDOM RELATED DIALOGUES FOR THE GAME
private getNPCDialog(topic: string): string {
    // Return dialog text based on topic
    const dialogs = {
        'bst': "Want to learn about Binary Search Trees? I've got a great tutorial that will help you understand tree structures and traversal algorithms.",
        'dynamic': "Dynamic Programming is a powerful technique for solving complex problems. I can show you how to master it with some practical examples.",
        'graphs': "Graphs are everywhere in computer science! Let me show you how to work with graph algorithms and solve real-world network problems.",
        'sorting': "Sorting algorithms are fundamental to computer science. I can teach you about different sorting methods and when to use each one.",
        'default': "I'd be happy to teach you about algorithms and data structures. What would you like to learn?"
    };
    
    return dialogs[topic] || dialogs['default'];
}


  //end

  // createPlayerAnimations() {
  //   // Idle animation
  //     try {
  //       // Your existing animation creation code
  //       this.anims.create({
  //         key: 'player-idle-down',
  //         frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
  //         frameRate: 10,
  //         repeat: -1
  //       });
  //   this.anims.create({
  //     key: 'player-idle-down',
  //     frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
  //     frameRate: 10,
  //     repeat: -1
  //   });
  //   this.anims.create({
  //     key: 'player-idle-up',
  //     frames: this.anims.generateFrameNumbers('player', { start: 4, end: 4 }),
  //     frameRate: 10,
  //     repeat: -1
  //   });
  //   this.anims.create({
  //     key: 'player-idle-left',
  //     frames: this.anims.generateFrameNumbers('player', { start: 8, end: 8 }),
  //     frameRate: 10,
  //     repeat: -1
  //   });
  //   this.anims.create({
  //     key: 'player-idle-right',
  //     frames: this.anims.generateFrameNumbers('player', { start: 12, end: 12 }),
  //     frameRate: 10,
  //     repeat: -1
  //   });
    
  //   // Walking animations
  //   this.anims.create({
  //     key: 'player-walk-down',
  //     frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
  //     frameRate: 10,
  //     repeat: -1
  //   });
  //   this.anims.create({
  //     key: 'player-walk-up',
  //     frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
  //     frameRate: 10,
  //     repeat: -1
  //   });
  //   this.anims.create({
  //     key: 'player-walk-left',
  //     frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
  //     frameRate: 10,
  //     repeat: -1
  //   });
  //   this.anims.create({
  //     key: 'player-walk-right',
  //     frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
  //     frameRate: 10,
  //     repeat: -1
  //   });
  //   if (this.anims.exists('player-idle-down')) {
  //     console.log('Animations created successfully');
  //   } else {
  //     console.log('Failed to create animations');
  //   }
  // } catch (error) {
  //   console.error('Animation creation error:', error);
  // }
  // }

  create() {
    // const testSprite = this.add.sprite(400, 300, 'player');
    // testSprite.setScale(4); // Make it big so it's easy to see
    // console.log('Test sprite created', testSprite);

    console.log('Loaded textures:', Object.keys(this.textures.list));
    if (this.textures.exists('player')) {
      console.log('Player texture exists with frames:', this.textures.get('player').frameTotal);
    } else {
      console.log('Player texture failed to load');
    }
    
    if (this.textures.exists('npcs')) {
      console.log('NPC texture exists with frames:', this.textures.get('npcs').frameTotal);
    } else {
      console.log('NPC texture failed to load');
    }

    // Create the game world
    this.createWorld();
    
    // Set up player character
    this.createPlayer();
    

    this.greenGraphics = this.add.graphics();
    this.redGraphics = this.add.graphics();
    this.yellowGraphics = this.add.graphics(); // Add this line
    
    // Set up camera
    this.setupCamera();
    
    // Set up input
    this.setupInput();
    
    // Create obstacles
    this.createObstacles();
    
    // Create NPCs
    this.createNPCs();

    this.createNerdNPCs();

    this.setupInteraction();

    this.graphics = this.add.graphics();
        this.randomizeGrassZones();
        this.randomRedGrass();
        this.randomYellowGrass(); // Add this line


    this.graphics = this.add.graphics();

    
    this.graphics.fillStyle(0x00FF00, 1); // Green
      this.grassZones.forEach(zone => {
          this.graphics.fillRect(zone.x, zone.y, zone.width, zone.height);
      });
    
    // Create message display
    this.createMessageDisplay();
    
    // Set physics collisions
    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.player, this.npcs);
    
    // Add event listener for showing messages
    this.events.on('showMessage', this.showMessage, this);
    
    // Emit an event for the UI to display a welcome message
    this.time.delayedCall(500, () => {
      this.showMessage({
        text: 'Welcome to Pixel Quest! Use arrow keys to move around and explore the town. Press SPACE near NPCs to talk.',
        color: '#FFFFFF'
      });
    });
  }


  checkGrassCollision() {
    // Check green grass zones (existing code)
    for (let zone of this.grassZones) {
        if (this.player.x > zone.x && this.player.x < zone.x + zone.width &&
            this.player.y > zone.y && this.player.y < zone.y + zone.height) {
            
            console.log('Green grass collision detected! Switching to LeetCodeQuestScene...');
            this.topic = "Array";
            this.difficulty = "easy";
            this.scene.start('LeetCodeQuestScene', { 
                topic: this.topic,
                difficulty: this.difficulty
            });
            this.userCoordinates.x = this.player.x + 90;
            this.userCoordinates.y = this.player.y;
            return; // Exit after finding collision
        }
    }
    
    // Add checks for red grass zones
    for (let zone of this.redGrassZones) { // You need to store these zones in a class property
        if (this.player.x > zone.x && this.player.x < zone.x + zone.width &&
            this.player.y > zone.y && this.player.y < zone.y + zone.height) {
            
            console.log('Red grass collision detected! Switching to LeetCodeQuestScene...');
            this.topic = "BST";
            this.difficulty = "hard";
            this.scene.start('LeetCodeQuestScene', { 
                topic: this.topic,
                difficulty: this.difficulty
            });
            this.userCoordinates.x = this.player.x + 90;
            this.userCoordinates.y = this.player.y;
            return; // Exit after finding collision
        }
    }
    
    // Add checks for yellow grass zones
    for (let zone of this.yellowGrassZones) { // You need to store these zones in a class property
        if (this.player.x > zone.x && this.player.x < zone.x + zone.width &&
            this.player.y > zone.y && this.player.y < zone.y + zone.height) {
            
            console.log('Yellow grass collision detected! Switching to LeetCodeQuestScene...');
            this.topic = "Linked List";
            this.difficulty = "medium";
            this.scene.start('LeetCodeQuestScene', { 
                topic: this.topic,
                difficulty: this.difficulty
            });
            this.userCoordinates.x = this.player.x + 90;
            this.userCoordinates.y = this.player.y;
            return; // Exit after finding collision
        }
    }
}

  randomizeGrassZones() {
    // Clear the green graphics specifically
    this.greenGraphics.clear();
    this.difficulty="easy"
    this.topic="array"
  
    // Generate random grass zones
    this.grassZones = [];
    for (let i = 0; i < Phaser.Math.Between(2, 20); i++) {
      let x = Phaser.Math.Between(875.3333333333337, 1575.3333333333296);
      let y = Phaser.Math.Between(1468.4136008177218, 1868.4136008177218);
      let width = Phaser.Math.Between(40, 80);
      let height = Phaser.Math.Between(40, 80);
  
      this.grassZones.push({ x, y, width, height });
    }
  
    // Add other zones as you have them...
  
    // Use the green graphics object to draw green grass
    this.greenGraphics.fillStyle(0x00FF00, 1.0);
    
    this.grassZones.forEach(zone => {
      this.greenGraphics.fillRect(zone.x, zone.y, zone.width, zone.height);
    });
  
    console.log("Green grass zones randomized:", this.grassZones);
  }
  randomRedGrass() {
    // Clear the red graphics specifically
    this.redGraphics.clear();
    
    // Store as a class property instead of local variable
    this.redGrassZones = [];
    for (let i = 0; i < Phaser.Math.Between(2, 20); i++) {
        let x = Phaser.Math.Between(862.3333333333337, 988.3333333333296);
        let y = Phaser.Math.Between(249.4136008177218, 515.4136008177218);
        let width = Phaser.Math.Between(40, 80);
        let height = Phaser.Math.Between(40, 80);
    
        this.redGrassZones.push({ x, y, width, height });
    }
    
    // Set red color with full opacity
    this.redGraphics.fillStyle(0xFF0000, 1.0);
    
    // Draw the red grass zones using the red graphics object
    this.redGrassZones.forEach(zone => {
        this.redGraphics.fillRect(zone.x, zone.y, zone.width, zone.height);
    });
    
    console.log("Red grass zones randomized:", this.redGrassZones);
}

randomYellowGrass() {
    // Clear the yellow graphics specifically
    this.yellowGraphics.clear();
    
    // Store as a class property instead of local variable
    this.yellowGrassZones = [];
    for (let i = 0; i < Phaser.Math.Between(2, 20); i++) {
        let x = Phaser.Math.Between(1163.5922317655475, 1389.6032346285429);
        let y = Phaser.Math.Between(644.4246036807261, 794.4246036807268);
        let width = Phaser.Math.Between(40, 80);
        let height = Phaser.Math.Between(40, 80);
    
        this.yellowGrassZones.push({ x, y, width, height });
    }
    
    // Set yellow color with full opacity
    this.yellowGraphics.fillStyle(0xFFFF00, 1.0); 
    
    // Draw the yellow grass zones using the yellow graphics object
    this.yellowGrassZones.forEach(zone => {
        this.yellowGraphics.fillRect(zone.x, zone.y, zone.width, zone.height);
    });
    
    console.log("Yellow grass zones randomized:", this.yellowGrassZones);
}


  update(time: number, delta: number) {
    // Handle player movement
    this.handlePlayerMovement();

    this.checkGrassCollision();

    this.checkNPCProximity();

    this.interactionZone.setPosition(this.player.x, this.player.y);
    
    // Update interaction prompt position
    this.interactionPrompt.setPosition(this.player.x, this.player.y - 50);
    
    // Handle player interaction
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.checkInteraction();
    }
    
    // Handle message timer
    if (this.messageVisible && time > this.messageTimer) {
      this.hideMessage();
    }
  }

  private createWorld() {
    // Add the map image
    // In your create() function
    this.map = this.add.image(0, 0, 'town-map');
    this.map.setOrigin(0, 0);
    this.map.setScale(this.mapScale);
  }

  private createPlayer() {
    // Create the player sprite at the bottom of the map
    this.player = this.physics.add.sprite(this.userCoordinates.x, this.userCoordinates.y, 'player');
    this.player.setCollideWorldBounds(true);
    
    // Set appropriate scale
    this.player.setScale(2); 
    // Adjust t
    this.player.setSize(12, 20);
    this.player.setOffset(2, 16);
    this.player.setDepth(10); 
    // this.createPlayerAnimations();// Ensure player is above other objects
    this.player.anims.play('player-idle-down');

    // const testPlayer = this.add.image(400, 300, 'player');
    // testPlayer.setScale(4);
  }

  private setupCamera() {
    // Set world bounds
    const mapWidth = this.map.width * this.mapScale;
    const mapHeight = this.map.height * this.mapScale;
    console.log('Map width:', this.map.width, 'Map height:', this.map.height);
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    
    // Set camera bounds and follow player
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
  }

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  private createObstacles() {
    this.obstacles = this.physics.add.staticGroup();
    
    // Define map dimensions
    const mapWidth = this.map.width * this.mapScale;
    const mapHeight = this.map.height * this.mapScale;
    
    // Define collision areas based on the map
    // Trees
    this.createObstacleRect(0, 100, 20, mapHeight); // Left edge trees
    // this.createObstacleRect(mapWidth - 32, 0, 32, mapHeight); // Right edge trees
    this.createObstacleRect(0, 0, mapWidth, 32); // Top edge trees
    // this.createObstacleRect(0, mapHeight - 32, mapWidth, 32); // Bottom edge trees
    
    // Mountains
    this.createObstacleRect(0, 740, 460, 140);
    this.createObstacleRect(470, 800, 300, 140);

    // Fence
    this.createObstacleRect(450, 0, 50, 500);
    this.createObstacleRect(730, 240, 50, 500);
    this.createObstacleRect(790, 100, 200, 10);
    this.createObstacleRect(790, 180, 200, 10);
    this.createObstacleRect(1000, 0, 10, 95);
    this.createObstacleRect(1000, 200, 10, 110);
    this.createObstacleRect(1002, 314.30615732761544, 190, 10);
    this.createObstacleRect(1210.8543776411702, 378.63949066094875, 260, 10);
    this.createObstacleRect(1210.8543776411702, 318.63949066094875, 10, 50);
    this.createObstacleRect(1484.6666666666674, 406.08026748439414, 10, 100);
    this.createObstacleRect(670, 1650.6336580776644, 130,140);
    this.createObstacleRect(170, 1430.6336580776644, 60,600);
    this.createObstacleRect(170, 1430.6336580776644, 400,60);
    this.createObstacleRect(745, 1440.6336580776644, 60,300);
    this.createObstacleRect(810, 960, 400, 40);
    this.createObstacleRect(810, 1180, 400, 40);
    this.createObstacleRect(0, 2160.6336580776644, 800,60);
    this.createObstacleRect(1230.625240354536, 871.5980643488132, 145,20);
    this.createObstacleRect(1371.680254669522, 870.0168354462705, 20,140);
    this.createObstacleRect(1430.3469213361886, 1020.1572875253744,20, 280);
    this.createObstacleRect(1380.3469213361882, 1020.1572875253744,50, 20);
    this.createObstacleRect(1380.3469213361882, 1289.7165107019268,50, 20);
    this.createObstacleRect(1060.2588984322117, 1289.7165107019268,160, 20);
    this.createObstacleRect(1060.2588984322117, 1302.0828526242512,20, 160);
    this.createObstacleRect(960.9779942740058, 871.5980643488132, 430,20);
    this.createObstacleRect(963.1734606680948 , 891.5980643488132, 20, -300);

    // Trees
    this.createObstacleRect(800, 2200, 400,300);

    // Houses
    this.createObstacleRect(1300, 1510.6336580776644, 200,200);
    this.createObstacleRect(1120, 1720.6336580776644, 150,10);
    this.createObstacleRect(1020, 1780.6336580776644, 340,10);
    this.createObstacleRect(880, 1510.6336580776644, 200,200);
    this.createObstacleRect(380, 1580.6336580776644, 280,280);
  }

  private createObstacleRect(x: number, y: number, width: number, height: number) {
    const rect = this.add.rectangle(x, y, width, height, 0x000000, 0);
    rect.setOrigin(0, 0);
    
    if (this.showDebugBounds) {
        // rect.setStrokeStyle(2, 0xff0000); // Add a 2px red border
        rect.setVisible(true);
    } else {
        rect.setVisible(false);
    }
    
    this.obstacles.add(rect, true);
  }

  private createNPCs() {
    this.npcs = this.physics.add.staticGroup();
    
    // NPCs near houses - using the house coordinates from the collision data
    //USING GEMINI API
    ///GENERATE RANDOM HINTS RELATED TO THE COMMENTS WE HAVE PUT
    // NPC near the main house (1300, 1510)
    this.createNPC(1250, 1460, 'Mayor', "Just like how a dictionary allows quick lookups, HashMaps in programming provide efficient key-value pair searching!",0);
    
    // NPC near the second house (880, 1510)
    //HINT RELATED TO BINARY SEARCH
    this.createNPC(830, 1460, 'Shopkeeper', "Finding the right item in a shop is like Binary Search—efficient and fast when everything is sorted!", 1);
    
    // HINT RELATED TO BINARY TREES IN DSA
    this.createNPC(330, 1530, 'Farmer', "A well-structured farm, like a Binary Tree, ensures everything is organized for quick access and growth!", 2);
    
    // HINT RELATED TO STACKS IN DSA
    this.createNPC(400, 50, 'Guard', "Just like a stack, guards handle threats in a Last-In-First-Out manner—dealing with the most recent danger first!", 3);
    
    // NPC near trees (800, 2200)
    // A HINT RELATED TO LINKED LISTS IN DSA
    // this.createNPC(750, 2150, 'Woodcutter', "Array", 4);
    this.createNPC(1323.785113019775, 2305.710678118657, 'Woodcutter', "Array", 4);
    
    // A HINT RELATED TO THE CODING JOURNEY AHEAD
    this.createNPC(1000, 2700, 'Fisher', '"Learning to code is like fishing—you need patience, the right tools, and practice to master it!"', 5);
    
    // NPC near the mountain (470, 800)
    this.createNPC(420, 750, 'Miner', 'The mountains contain valuable minerals. We\'ve been mining here for generations.', 6);
    
    // NPC on the path (1000, 2000)
    //A HINT RELATED TO ARRAYS IN DSA
    this.createNPC(1000, 2000, 'Traveler', "An array is like a road—you can travel to any point directly if you know the index (position)!", 7);
  }

  private createNPC(x: number, y: number, name: string, dialog: string, frame: number = 0, educationalContent?: any[]) {
    // Create a static sprite for the NPC using the correct texture key 'nerdnpecs'
    const npc = this.physics.add.staticSprite(x, y, 'nerdnpecs', frame);
    npc.setScale(2);
    npc.setDepth(5); // Ensure NPCs are above the background but below the player
    
    // Store educational content if provided
    if (educationalContent) {
      npc.setData('educationalContent', educationalContent);
    }
    
    // Store data on the NPC
    npc.setData('name', name);
    npc.setData('dialog', dialog);
    
    // Set correct collision body size for the 60x60 sprite
    npc.setSize(12, 12);
    npc.setOffset(24, 40); // Adjusted offset for the larger sprite
    
    // Add debug bounds to NPCs if debug is enabled
    if (this.showDebugBounds) {
      const bounds = npc.getBounds();
      const debugRect = this.add.rectangle(
        bounds.x, 
        bounds.y, 
        bounds.width, 
        bounds.height, 
        0x000000, 
        0
      );
      debugRect.setStrokeStyle(2, 0x00ff00); // Green border for NPCs
      npc.setData('debugRect', debugRect);
    }
    
    this.npcs.add(npc);
    console.log(`Created NPC ${name} at ${x}, ${y} with frame ${frame}`);
    return npc;
  }

  private createMessageDisplay() {
    // Create a message box at the bottom of the screen
    const width = this.cameras.main.width;
    const height = 100;
    
    // Create a rectangle for the message box
    this.messageBox = this.add.rectangle(
      width / 2,
      this.cameras.main.height - height / 2,
      width - 40,
      height - 20,
      0x000000,
      0.7
    );
    this.messageBox.setStrokeStyle(2, 0xffffff);
    this.messageBox.setScrollFactor(0); // Fixed to camera
    this.messageBox.setDepth(100); // Ensure it's above everything
    this.messageBox.setVisible(false);
    
    // Create text for the message
    this.messageText = this.add.text(
      width / 2,
      this.cameras.main.height - height / 2,
      '',
      {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: width - 80 }
      }
    );
    this.messageText.setOrigin(0.5);
    this.messageText.setScrollFactor(0); // Fixed to camera
    this.messageText.setDepth(101); // Ensure it's above the message box
    this.messageText.setVisible(false);
  }

  private showMessage(data: { text: string, color?: string }) {
    // Show the message box and text
    this.messageBox.setVisible(true);
    this.messageText.setVisible(true);
    this.messageText.setText(data.text);
    this.messageText.setColor(data.color || '#ffffff');
    const setQ = this.registry.get('setQ');
    // setQ(data.text);
    
    // Set the message timer (display for 5 seconds)
    this.messageTimer = this.time.now + 5000;
    this.messageVisible = true;
    
    // Log the message for debugging
    console.log('Showing message:', data.text);
  }

  private hideMessage() {
    // Hide the message box and text
    this.messageBox.setVisible(false);
    this.messageText.setVisible(false);
    this.messageVisible = false;
  }

  private handlePlayerMovement() {
    // Reset velocity
    this.player.setVelocity(0);
    
    let isMoving = false;
    let newDirection = this.currentPlayerDirection;
    
    // Handle horizontal movement
    if (this.cursors.left!.isDown) {
      this.player.setVelocityX(-this.speed);
      isMoving = true;
      newDirection = 'left';
      console.log(this.player.x, this.player.y);
    } else if (this.cursors.right!.isDown) {
      this.player.setVelocityX(this.speed);
      isMoving = true;
      newDirection = 'right';
      console.log(this.player.x, this.player.y);
    }
    
    // Handle vertical movement
    if (this.cursors.up!.isDown) {
      this.player.setVelocityY(-this.speed);
      isMoving = true;
      newDirection = 'up';
    } else if (this.cursors.down!.isDown) {
      this.player.setVelocityY(this.speed);
      isMoving = true;
      newDirection = 'down';
    }
    
    // Normalize diagonal movement
    if (this.player.body!.velocity.x !== 0 && this.player.body!.velocity.y !== 0) {
      this.player.body!.velocity.normalize().scale(this.speed);
    }
    
    // Update player animation based on movement
    if (isMoving) {
      this.player.play(`player-walk-${newDirection}`, true);
    } else {
      this.player.play(`player-idle-${newDirection}`, true);
    }
    
    this.currentPlayerDirection = newDirection;
    
    // Update debug rectangles for NPCs if they exist
    if (this.showDebugBounds) {
        this.npcs.getChildren().forEach((npc: any) => {
            const debugRect = npc.getData('debugRect');
            if (debugRect) {
                const bounds = npc.getBounds();
                debugRect.setPosition(bounds.x, bounds.y);
                debugRect.setSize(bounds.width, bounds.height);
            }
        });
    }
  }

  

  private async checkInteraction() {
    // Get facing tile based on direction
    let tileX = this.player.x;
    let tileY = this.player.y;
    
    // Adjust position based on facing direction
    const offset = 32;
    if (this.currentPlayerDirection === 'left') {
      tileX -= offset;
    } else if (this.currentPlayerDirection === 'right') {
      tileX += offset;
    } else if (this.currentPlayerDirection === 'up') {
      tileY -= offset;
    } else if (this.currentPlayerDirection === 'down') {
      tileY += offset;
    }
    
    // Check for NPCs in the interaction zone
    const interactArea = new Phaser.Geom.Circle(tileX, tileY, 40); // Increased radius for easier interaction
    
    // Visualize interaction area if debug is enabled
    if (this.showDebugBounds) {
      const debugInteractCircle = this.add.circle(tileX, tileY, 40, 0xffff00, 0.3);
      this.time.delayedCall(500, () => {
        debugInteractCircle.destroy();
      });
    }
    
    let hasInteracted = false;
    
    // Use for...of loop instead of forEach for async handling
    for (const child of this.npcs.getChildren()) {
      const npc = child as any;
      if (Phaser.Geom.Circle.ContainsPoint(interactArea, npc)) {
        const npcName = npc.getData('name');
        const npcDialog = npc.getData('dialog');

        
        // Show message with NPC dialog
        let response = npcDialog.split(':');
        console.log(response)
        let msg:any = response[0]
        console.log(msg)
        console.log(msg.split(" "))
        msg = msg.split(" ")
        console.log(msg.length==1)

        if(msg.length==1){
          response = await npcDialogues(msg)
        }
  
        this.showMessage({
          text: `${npcName}: ${response}`,
          color: '#FFFFFF' // White text
        });
        
        // Make the NPC face the player
        const dx = this.player.x - npc.x;
        const dy = this.player.y - npc.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal difference is greater
          if (dx > 0) {
            npc.play('player-idle-right');
            npc.setData('direction', 'right');
          } else {
            npc.play('player-idle-left');
            npc.setData('direction', 'left');
          }
        } else {
          // Vertical difference is greater
          if (dy > 0) {
            npc.play('player-idle-down');
            npc.setData('direction', 'down');
          } else {
            npc.play('player-idle-up');
            npc.setData('direction', 'up');
          }
        }
        
        hasInteracted = true;
        break; // Only interact with one NPC at a time
      }
    }
    
    if (!hasInteracted) {
      // Check for environment interactions
      if (this.isNearWater(tileX, tileY)) {
        this.showMessage({
          text: 'The water looks refreshing and clear.',
          color: '#FFFFFF'
        });
      } else if (this.isNearBuilding(tileX, tileY)) {
        this.showMessage({
          text: 'This building seems important to the town.',
          color: '#FFFFFF'
        });
      } else if (this.isNearTrees(tileX, tileY)) {
        this.showMessage({
          text: 'The trees sway gently in the breeze.',
          color: '#FFFFFF'
        });
      }
    }
  
    if (this.interactionKey.isDown && !this.messageVisible) {
      const playerBounds = this.player.getBounds();
      
      this.npcs.getChildren().forEach((child) => {
        const npc = child as Phaser.Physics.Arcade.Sprite;
        const npcBounds = npc.getBounds();
        
        // Check if player is close enough to interact
        if (Phaser.Geom.Rectangle.Overlaps(playerBounds, npcBounds)) {
          // Save the current frame and texture before interaction
          const currentFrame = npc.frame.name;
          const currentTexture = npc.texture.key;
          
          // Handle the interaction
          this.handleNPCInteraction(npc);
          
          // Ensure the NPC maintains its appearance
          npc.setTexture(currentTexture, currentFrame);
        }
      });
    }
  }

  private handleNPCInteraction(npc: Phaser.Physics.Arcade.Sprite) {
    // Get the NPC's data
    const name = npc.getData('name');
    const dialog = npc.getData('dialog');
    const frame = npc.frame.name; // Store the current frame number
    
    // Show the dialog message
    this.showMessage({
      text:"it should be working-handle interaction",
      color:"#ffff"
    });
    
    // Store the original texture and frame to restore after interaction
    const originalTexture = npc.texture.key;
    
    // If you're doing any animation or visual change during interaction,
    // make sure to restore the NPC's appearance afterward
    
    // Example of how you might animate the NPC during interaction:
    // this.tweens.add({
    //   targets: npc,
    //   scaleX: 2.2, // Slightly larger
    //   scaleY: 2.2,
    //   duration: 200,
    //   yoyo: true, // Return to original scale
    //   onComplete: () => {
    //     // Ensure NPC returns to original appearance
    //     npc.setTexture(originalTexture, frame);
    //   }
    // });
    
    // Log the interaction for debugging
    console.log(`Interacted with ${name}, using texture: ${originalTexture}, frame: ${frame}`);
    
    // If the NPC resets to a different sprite, force it back to the correct one
    // This is the key fix - add this to any interaction method
    setTimeout(() => {
      if (npc.texture.key !== originalTexture || npc.frame.name !== frame) {
        console.log(`Restoring NPC ${name} to texture: ${originalTexture}, frame: ${frame}`);
        npc.setTexture(originalTexture, frame);
      }
    }, 100); // Small delay to ensure it catches any changes
  }

  private isNearWater(x: number, y: number) {
    // Map dimensions
    const mapWidth = this.map.width * this.mapScale;
    const mapHeight = this.map.height * this.mapScale;
    
    return (
      (x > 640 && x < 800 && y > 160 && y < 360) || // Main river
      (x > 128 && x < 288 && y > 528 && y < 600) || // Bottom pond
      (x > 32 && x < 128 && y > 288 && y < 384)     // Left pond
    );
  }

  private isNearBuilding(x: number, y: number) {
    return (
      // Main house areas
      (x > 1200 && x < 1500 && y > 1400 && y < 1700) || // Main house (1300, 1510)
      (x > 780 && x < 980 && y > 1400 && y < 1700) ||   // Second house (880, 1510)
      (x > 280 && x < 480 && y > 1480 && y < 1780)      // Third house (380, 1580)
    );
  }

  private isNearTrees(x: number, y: number) {
    const mapWidth = this.map.width * this.mapScale;
    const mapHeight = this.map.height * this.mapScale;
    
    return (
      (x > 700 && x < 900 && y > 2100 && y < 2300) || 
      x < 32 || x > mapWidth - 32 || y < 32 || y > mapHeight - 32
    );
  }
  public toggleDebugBounds() {
    this.showDebugBounds = !this.showDebugBounds;
    
    this.obstacles.getChildren().forEach((obstacle: Phaser.GameObjects.GameObject) => {
        const rect = obstacle as Phaser.GameObjects.Rectangle;
        if (this.showDebugBounds) {
            rect.setStrokeStyle(2, 0xff0000);
            rect.setVisible(true);
        } else {
            rect.setVisible(false);
        }
    });
    this.npcs.getChildren().forEach((npc: any) => {
        const debugRect = npc.getData('debugRect');
        if (debugRect) {
            debugRect.setVisible(this.showDebugBounds);
        }
    });
  }

  
}

