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
  private npc!: Phaser.Physics.Arcade.Sprite;
  private grassZones!: { x: number; y: number; width: number; height: number, grassType?:number, density?:number }[];
  private yellowGrassZones!: { x: number; y: number; width: number; height: number, grassType?:number, density?:number }[];
  private redGrassZones!: { x: number; y: number; width: number; height: number, grassType?:number, density?:number }[];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private map!: Phaser.GameObjects.Image;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private npcs!: Phaser.Physics.Arcade.StaticGroup;
  private bossNPCs!: Phaser.Physics.Arcade.Group;
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

    this.load.spritesheet('player', 'Hero.png', { frameWidth: 12, frameHeight: 20 });


    this.load.spritesheet('npcs', 'blueguy.png', { frameWidth: 60, frameHeight: 60 });

    this.load.spritesheet('nerdnpecs', 'Hero.png',{ frameWidth: 60, frameHeight: 60 } )

    this.load.spritesheet('boss', 'BOSSnpc.png', { frameWidth: 60, frameHeight: 60 });

  }

  private createNerdNPCs() {
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
            'npcs',  
            data.frame,
            data.id,
            data.topic,
            data.name
        );
        this.npcsNerd.push(npc);
        this.physics.add.existing(npc);
        
    });
}

private setupInteraction() {
    this.interactionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    
    this.interactionZone = this.add.zone(this.player.x, this.player.y, 60, 60);
    this.physics.world.enable(this.interactionZone);
    
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

  continueButton.on('pointerdown', () => {
    // Remove dialog
    closeDialog();
    const xPlayer = this.player.x;
    const yPlayer = this.player.y;
    // Start learning scene with this NPC's topic
    this.scene.start('DynamicLearningScene', { topic: npc.topic });
    this.player.x = xPlayer;
    this.player.y = yPlayer;
    this.userCoordinates= { x: 1360, y: 2750 };
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

  create() {
    // this.player.setScale(1);
    // this.npc.setScale(0.5);

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

    this.createBOSSs()

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
  
    this.greenGraphics.fillStyle(0x00FF00, 1.0);
    
    this.grassZones.forEach(zone => {
      this.greenGraphics.fillRect(zone.x, zone.y, zone.width, zone.height);
    });
  
    console.log("Green grass zones randomized:", this.grassZones);
  }
  randomRedGrass() {
    this.redGraphics.clear();
    
    this.redGrassZones = [];
    for (let i = 0; i < Phaser.Math.Between(2, 20); i++) {
        let x = Phaser.Math.Between(862.3333333333337, 1173.8543776411705);
        let y = Phaser.Math.Between(249.4136008177218, 515.4136008177218);
        let width = Phaser.Math.Between(40, 80);
        let height = Phaser.Math.Between(40, 80);
    
        this.redGrassZones.push({ x, y, width, height });
    }
    
    this.redGraphics.fillStyle(0xFF0000, 1.0);
    
    // Draw the red grass zones using the red graphics object
    this.redGrassZones.forEach(zone => {
        this.redGraphics.fillRect(zone.x, zone.y, zone.width, zone.height);
    });
    
    console.log("Red grass zones randomized:", this.redGrassZones);
}

randomYellowGrass() {
    this.yellowGraphics.clear();
    
    this.yellowGrassZones = [];
    for (let i = 0; i < Phaser.Math.Between(2, 20); i++) {
        let x = Phaser.Math.Between(1263.5922317655475, 1389.6032346285429);
        let y = Phaser.Math.Between(644.4246036807261, 794.4246036807268);
        let width = Phaser.Math.Between(40, 80);
        let height = Phaser.Math.Between(40, 80);
    
        this.yellowGrassZones.push({ x, y, width, height });
    }
    
    this.yellowGraphics.fillStyle(0xFFFF00, 1.0); 
    
    this.yellowGrassZones.forEach(zone => {
        this.yellowGraphics.fillRect(zone.x, zone.y, zone.width, zone.height);
    });
    
    console.log("Yellow grass zones randomized:", this.yellowGrassZones);
}


  private createWorld() {
    this.map = this.add.image(0, 0, 'town-map');
    this.map.setOrigin(0, 0);
    this.map.setScale(this.mapScale);
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(this.userCoordinates.x, this.userCoordinates.y, 'player');
    this.player.setCollideWorldBounds(true);
    
    this.player.setScale(0.1); 
    this.player.setSize(12, 20);
    this.player.setOffset(2, 16);
    this.player.setDepth(10);
    this.player.anims.play('player-idle-down');
  }

  private setupCamera() {
    // Set world bounds
    const mapWidth = this.map.width * this.mapScale;
    const mapHeight = this.map.height * this.mapScale;
    console.log('Map width:', this.map.width, 'Map height:', this.map.height);
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    
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
        rect.setVisible(true);
    } else {
        rect.setVisible(false);
    }
    
    this.obstacles.add(rect, true);
  }

  private createNPCs() {
    this.npcs = this.physics.add.staticGroup();
    this.createNPC(1250, 1460, 'Mayor', "Just like how a dictionary allows quick lookups, HashMaps in programming provide efficient key-value pair searching!",0);
    
    this.createNPC(830, 1460, 'Shopkeeper', "Finding the right item in a shop is like Binary Search—efficient and fast when everything is sorted!", 1);
    
    this.createNPC(330, 1530, 'Farmer', "A well-structured farm, like a Binary Tree, ensures everything is organized for quick access and growth!", 2);
    
    this.createNPC(400, 50, 'Guard', "Just like a stack, guards handle threats in a Last-In-First-Out manner—dealing with the most recent danger first!", 3);
    
    this.createNPC(1323.785113019775, 2305.710678118657, 'Woodcutter', "Array", 4);
    
    this.createNPC(1000, 2700, 'Fisher', '"Learning to code is like fishing—you need patience, the right tools, and practice to master it!"', 5);
    
    this.createNPC(420, 750, 'Miner', 'The mountains contain valuable minerals. We\'ve been mining here for generations.', 6);
    
    this.createNPC(1000, 2000, 'Traveler', "An array is like a road—you can travel to any point directly if you know the index (position)!", 7);
  }


  private createNPC(x: number, y: number, name: string, dialog: string, frame: number = 0, educationalContent?: any[]) {
    // Create a static sprite for the NPC using the correct texture key 'nerdnpecs'
    const npc = this.physics.add.staticSprite(x, y, 'nerdnpecs', frame);
    npc.setScale(2);
    npc.setDepth(5);

    if (educationalContent) {
      npc.setData('educationalContent', educationalContent);
    }
    
    npc.setData('name', name);
    npc.setData('dialog', dialog);
    npc.setSize(12, 12);
    npc.setOffset(24, 40); 
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
      npc.setData('debugRect', debugRect);
    }
    
    this.npcs.add(npc);
    console.log(`Created NPC ${name} at ${x}, ${y} with frame ${frame}`);
    return npc;
  }
  // First, create a specialized interaction method for bosses

private interactWithBoss(boss: Phaser.Physics.Arcade.Sprite) {
  console.log(`Interacting with BOSS ${boss.getData('name')}`);
  
  const playerX = this.player.x;
  const playerY = this.player.y;
  
  // Start the boss scene with boss data
  this.scene.start('DSABattleScene', { 
    bossName: boss.getData('name'),
    bossLevel: boss.getData('level') || 1,
    playerStats: this.registry.get('playerStats') || { health: 100, attack: 10 },
    returnPosition: { x: playerX, y: playerY }
  });
}

private checkBossProximity() {
  let nearBoss = false;
  let nearestBoss: Phaser.Physics.Arcade.Sprite | null = null;
  let shortestDistance = Infinity;
  
  this.bossNPCs.getChildren().forEach((boss:any) => {
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      boss.x, boss.y
    );
    
    if (distance < 60) {
      nearBoss = true;
      
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestBoss = boss;
      }
    }
  });
  
  if (nearBoss && nearestBoss) {
    this.interactionPrompt.setPosition(nearestBoss.x, nearestBoss.y - 50);
    this.interactionPrompt.setVisible(true);
    
    if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
      this.interactWithBoss(nearestBoss);
    }
  }
}


private createBOSSs() {
  this.bossNPCs = this.physics.add.group();
  
  this.createBoss(
    1395.470875528236, 
    236.84434901120468, 
    'Final Algorithm Boss', 
    "Challenge me if you dare! Prove your coding skills against my ultimate algorithm challenges!", 
    0,  // frame
    {
      level: 3,
      rewards: { xp: 500, item: 'Algorithm Mastery Badge' },
      challenges: ['Binary Tree Traversal', 'Dynamic Programming', 'Graph Algorithms']
    }
  );
  
  // Add more bosses as needed
  this.createBoss(
    800, 
    500, 
    'Data Structure Demon', 
    "I am the master of all data structures! Can you solve my puzzles?", 
    1,  // frame
    {
      level: 2,
      rewards: { xp: 300, item: 'Data Structure Handbook' },
      challenges: ['Linked List Manipulation', 'Stack Implementation', 'Queue Operations']
    }
  );
}


private createBoss(x: number, y: number, name: string, dialog: string, frame: number = 0, bossData?: any) {
  const boss = this.physics.add.sprite(x, y, 'boss', frame);
  boss.setScale(2);
  boss.setDepth(5); 
  
  if (bossData) {
    Object.keys(bossData).forEach(key => {
      boss.setData(key, bossData[key]);
    });
  }

  boss.setData('name', name);
  boss.setData('dialog', dialog);
  boss.setData('isBoss', true);
  
  boss.setSize(16, 16);
  boss.setOffset(22, 38); 
  
  if (this.showDebugBounds) {
    const bounds = boss.getBounds();
    const debugRect = this.add.rectangle(
      bounds.x, 
      bounds.y, 
      bounds.width, 
      bounds.height, 
      0xFF0000, 
      0
    );
    boss.setData('debugRect', debugRect);
  }
  
  this.bossNPCs.add(boss);
  console.log(`Created Boss ${name} at ${x}, ${y} with frame ${frame}`);
  return boss;
}


update(time: number, delta: number) {
  // Handle player movement
  this.handlePlayerMovement();

  this.checkGrassCollision();
  this.checkNPCProximity();
  this.checkBossProximity(); // Add this line

  this.interactionZone.setPosition(this.player.x, this.player.y);
  
  this.interactionPrompt.setPosition(this.player.x, this.player.y - 50);
  
  if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
    this.checkInteraction();
  }
  
  // Handle message timer
  if (this.messageVisible && time > this.messageTimer) {
    this.hideMessage();
  }
}


private async checkInteraction() {
  let tileX = this.player.x;
  let tileY = this.player.y;
  
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
  
  const interactArea = new Phaser.Geom.Circle(tileX, tileY, 40);
  
  if (this.showDebugBounds) {
    const debugInteractCircle = this.add.circle(tileX, tileY, 40, 0xffff00, 0.3);
    this.time.delayedCall(500, () => {
      debugInteractCircle.destroy();
    });
  }
  
  let hasInteracted = false;
  
  for (const child of this.bossNPCs.getChildren()) {
    const boss = child as Phaser.Physics.Arcade.Sprite;
    if (Phaser.Geom.Circle.ContainsPoint(interactArea, boss)) {
      const bossName = boss.getData('name');
      const bossDialog = boss.getData('dialog');
      
      this.showMessage({
        text: `${bossName}: ${bossDialog}`,
        color: '#FF0000'
      });
      
      this.time.delayedCall(2000, () => {
        this.showBossChallengeConfirmation(boss);
      });
      
      hasInteracted = true;
      break;
    }
  }
  
  if (!hasInteracted) {
    this.checkInteractionOriginal()
  }
}

private showBossChallengeConfirmation(boss: Phaser.Physics.Arcade.Sprite) {
  // Create a dialog container
  const dialogContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
  dialogContainer.setScrollFactor(0); 
  dialogContainer.setDepth(200);
  
  // Background
  const bg = this.add.rectangle(0, 0, 400, 200, 0x000000, 0.8)
    .setStrokeStyle(2, 0xFF0000);
  
  const title = this.add.text(0, -70, `Challenge ${boss.getData('name')}?`, {
    fontSize: '24px',
    color: '#FF0000',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  const desc = this.add.text(0, -20, "Are you ready to face this coding challenge?\nYou will need to solve algorithm problems to defeat the boss.", {
    fontSize: '16px',
    color: '#FFFFFF',
    align: 'center'
  }).setOrigin(0.5);
  
  const acceptBtn = this.add.rectangle(80, 50, 150, 40, 0x00AA00)
    .setInteractive();
  const acceptText = this.add.text(80, 50, "Accept", {
    fontSize: '18px',
    color: '#FFFFFF'
  }).setOrigin(0.5);
  
  const declineBtn = this.add.rectangle(-80, 50, 150, 40, 0xAA0000)
    .setInteractive();
  const declineText = this.add.text(-80, 50, "Decline", {
    fontSize: '18px',
    color: '#FFFFFF'
  }).setOrigin(0.5);
  
  dialogContainer.add([bg, title, desc, acceptBtn, acceptText, declineBtn, declineText]);
  
  acceptBtn.on('pointerdown', () => {
    dialogContainer.destroy();
    this.startBossBattle(boss);
  });
  
  declineBtn.on('pointerdown', () => {
    dialogContainer.destroy();
    this.showMessage({
      text: `${boss.getData('name')}: Come back when you're ready to face my challenge!`,
      color: '#FF0000'
    });
  });
  
  acceptBtn.on('pointerover', () => {
    acceptBtn.setFillStyle(0x00FF00);
  });
  
  acceptBtn.on('pointerout', () => {
    acceptBtn.setFillStyle(0x00AA00);
  });
  
  declineBtn.on('pointerover', () => {
    declineBtn.setFillStyle(0xFF0000);
  });
  
  declineBtn.on('pointerout', () => {
    declineBtn.setFillStyle(0xAA0000);
  });
}

// Method to start the boss battle
private startBossBattle(boss: Phaser.Physics.Arcade.Sprite) {
  // Store player position for return
  const playerX = this.player.x;
  const playerY = this.player.y;
  
  // Start the boss battle scene
  this.scene.start('BossBattleScene', {
    bossName: boss.getData('name'),
    bossLevel: boss.getData('level') || 1,
    challenges: boss.getData('challenges') || [],
    rewards: boss.getData('rewards') || {},
    returnPosition: { x: playerX, y: playerY }
  });
}

  private createMessageDisplay() {
    const width = this.cameras.main.width;
    const height = 100;
    
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

  private async checkInteractionOriginal() { //original check interaction
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
          color: '#FFFFFF' 
        });
        
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
    
    const originalTexture = npc.texture.key;
    console.log(`Interacted with ${name}, using texture: ${originalTexture}, frame: ${frame}`);
    
    setTimeout(() => {
      if (npc.texture.key !== originalTexture || npc.frame.name !== frame) {
        console.log(`Restoring NPC ${name} to texture: ${originalTexture}, frame: ${frame}`);
        npc.setTexture(originalTexture, frame);
      }
    }, 100); 
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