import Phaser from 'phaser';

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

    private npcsNerd: Array<any> = [];
    private interactionZone!: Phaser.GameObjects.Zone;
    private interactionKey!: Phaser.Input.Keyboard.Key;
    private interactionPrompt!: Phaser.GameObjects.Container;

  // private userCoordinates: { x: number; y: number } = { x: 1360, y: 2750 };
  private userCoordinates: { x: number; y: number } = { x: 600, y: 600 };
  
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

    this.load.spritesheet('player', 'player.png', { frameWidth: 10, frameHeight: 10 });


    this.load.spritesheet('npcs', 'blueguy.png', { frameWidth: 60, frameHeight: 60 });

    this.load.spritesheet('nerdnpecs', 'npcs.png',{ frameWidth: 60, frameHeight: 60 } )

const npc = this.add.sprite(50, 50, 'npcs').setScale(100); // Setting the scale here won't work, since setScale(100) is later overwritten
npc.setScale(3);  // Use a larger value like 3 to zoom in on the sprite

  }

  private createNerdNPCs() {
    // Create NPCs with different topics
    // this.npcsNerd = this.physics.add.sprite(400, 1300, "player").setScale(0.1);
    const npcData = [
        { id: 'professor_tree', x: 200, y: 150, frame: 0, topic: 'bst', name: 'Professor Oak' },
        { id: 'algorithm_master', x: 400, y: 250, frame: 1, topic: 'dynamic', name: 'Dr. Dynamic' },
        { id: 'network_guru', x: 600, y: 350, frame: 2, topic: 'graphs', name: 'Graph Master' },
        { id: 'data_organizer', x: 300, y: 450, frame: 3, topic: 'sorting', name: 'Sorter Sam' }
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

private showNPCDialog(npc: NPC) {
    // Create a dialog box
    const dialogBox = this.add.rectangle(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 100,
        400,
        150,
        0x000000,
        0.8
    ).setStrokeStyle(2, 0xFFFFFF);
    
    // Add NPC name
    const nameText = this.add.text(
        dialogBox.x - 180,
        dialogBox.y - 55,
        npc.name,
        { fontSize: '18px', color: '#FFFFFF', fontStyle: 'bold' }
    );
    
    // Add dialog text based on NPC topic
    const dialogText = this.add.text(
        dialogBox.x - 180,
        dialogBox.y - 25,
        this.getNPCDialog(npc.topic),
        { 
            fontSize: '16px', 
            color: '#FFFFFF',
            wordWrap: { width: 360 }
        }
    );
    
    // Add continue button
    const continueButton = this.add.rectangle(
        dialogBox.x,
        dialogBox.y + 50,
        150,
        40,
        0x4444FF
    ).setInteractive();
    
    const buttonText = this.add.text(
        continueButton.x,
        continueButton.y,
        'Learn More',
        { fontSize: '16px', color: '#FFFFFF' }
    ).setOrigin(0.5);
    
    // Create a container for easy cleanup
    const dialogContainer = this.add.container(0, 0, [
        dialogBox, nameText, dialogText, continueButton, buttonText
    ]);
    
    // Add interactivity to continue button
    continueButton.on('pointerdown', () => {
        // Remove dialog
        dialogContainer.destroy();
        
        // Start learning scene with this NPC's topic
        this.scene.start('DynamicLearningScene', { topic: npc.topic });
    });
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

  createPlayerAnimations() {
    // Idle animation
      try {
        // Your existing animation creation code
        this.anims.create({
          key: 'player-idle-down',
          frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
          frameRate: 10,
          repeat: -1
        });
    this.anims.create({
      key: 'player-idle-down',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'player-idle-up',
      frames: this.anims.generateFrameNumbers('player', { start: 4, end: 4 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'player-idle-left',
      frames: this.anims.generateFrameNumbers('player', { start: 8, end: 8 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'player-idle-right',
      frames: this.anims.generateFrameNumbers('player', { start: 12, end: 12 }),
      frameRate: 10,
      repeat: -1
    });
    
    // Walking animations
    this.anims.create({
      key: 'player-walk-down',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'player-walk-up',
      frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'player-walk-left',
      frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'player-walk-right',
      frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
      frameRate: 10,
      repeat: -1
    });
    if (this.anims.exists('player-idle-down')) {
      console.log('Animations created successfully');
    } else {
      console.log('Failed to create animations');
    }
  } catch (error) {
    console.error('Animation creation error:', error);
  }
  }

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
      for (let zone of this.grassZones) {
          if (this.player.x > zone.x && this.player.x < zone.x + zone.width &&
              this.player.y > zone.y && this.player.y < zone.y + zone.height) {
              
              console.log('Grass collision detected! Switching to LeetCodeQuestScene...');
              this.scene.start('LeetCodeQuestScene');
              this.userCoordinates.x = this.player.x +90;
              this.userCoordinates.y = this.player.y;
              break;
          }
      }
  }  

  randomizeGrassZones() {
    // Clear previous graphics
    this.graphics.clear();

    // Generate 2-3 random grass zones
    this.grassZones = [];
    for (let i = 0; i < Phaser.Math.Between(2, 20); i++) {
        let x = Phaser.Math.Between(875.3333333333337 , 1575.3333333333296);
        let y = Phaser.Math.Between(1468.4136008177218, 1868.4136008177218);
        let width = Phaser.Math.Between(40, 80);
        let height = Phaser.Math.Between(40, 80);

        this.grassZones.push({ x, y, width, height });
    }

    for (let i = 0; i < Phaser.Math.Between(2, 20); i++) {
      let x = Phaser.Math.Between(1062.8595479208984 , 1346.1928812542292);
      let y = Phaser.Math.Between(1026.6446609406735, 2142.666666666666);
      let width = Phaser.Math.Between(40, 80);
      let height = Phaser.Math.Between(40, 80);

      this.grassZones.push({ x, y, width, height });
    }
    for (let i = 0; i < Phaser.Math.Between(2, 20); i++) {
      let x = Phaser.Math.Between(32, 232.0000000000001);
      let y = Phaser.Math.Between(1385.5152117245555, 2087.0304234491214);
      let width = Phaser.Math.Between(40, 80);
      let height = Phaser.Math.Between(40, 80);

      this.grassZones.push({ x, y, width, height });
    }

    // Draw new grass zones
    this.graphics.fillStyle(0x00FF00, 1);
    this.grassZones.forEach(zone => {
        this.graphics.fillRect(zone.x, zone.y, zone.width, zone.height);
    });

    console.log("Grass zones randomized:", this.grassZones);
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
    this.player.setScale(2);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(12, 12);
    this.player.setOffset(2, 16);
    this.player.setDepth(10); // Ensure player is above other objects
    this.player.play('player-idle-down');
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
    this.createObstacleRect(670, 1650.6336580776644, 130,140);
    this.createObstacleRect(170, 1430.6336580776644, 60,600);
    this.createObstacleRect(170, 1430.6336580776644, 400,60);
    this.createObstacleRect(745, 1440.6336580776644, 60,300);
    this.createObstacleRect(810, 960, 400, 40);
    this.createObstacleRect(810, 1180, 400, 40);
    this.createObstacleRect(0, 2160.6336580776644, 800,60);

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
        rect.setStrokeStyle(2, 0xff0000); // Add a 2px red border
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
    this.createNPC(1250, 1460, 'Mayor', "Just like how a dictionary allows quick lookups, HashMaps in programming provide efficient key-value pair searching!");
    
    // NPC near the second house (880, 1510)
    this.createNPC(830, 1460, 'Shopkeeper', 'Hello traveler! I sell all sorts of items. Would you like to see my wares?');
    
    // NPC near the third house (380, 1580)
    this.createNPC(330, 1530, 'Farmer', 'The crops are growing well this season. Make sure to visit our local market!');
    
    // NPC near fence area (450, 0)
    this.createNPC(400, 50, 'Guard', 'Be careful wandering outside the town. There are strange creatures in the wilderness.');
    
    // NPC near trees (800, 2200)
    this.createNPC(750, 2150, 'Woodcutter', 'The forest provides us with timber and shelter. Respect nature, traveler.');
    
    // NPC near the bottom of the map
    this.createNPC(1000, 2700, 'Fisher', 'The lake has the best fish you\'ll ever taste. I\'ve been fishing here for decades.');
    
    // NPC near the mountain (470, 800)
    this.createNPC(420, 750, 'Miner', 'The mountains contain valuable minerals. We\'ve been mining here for generations.');
    
    // NPC on the path (1000, 2000)
    this.createNPC(1000, 2000, 'Traveler', 'I\'m just passing through. This town has such friendly people!');
  }

  private createNPC(x: number, y: number, name: string, dialog: string, educationalContent?: any[]) {
    // Create a static sprite for the NPC
    const npc = this.physics.add.staticSprite(x, y, 'player');
    npc.setScale(2);
    npc.setDepth(5); // Ensure NPCs are above the background but below the player
    
    // Store educational content if provided
    if (educationalContent) {
      npc.setData('educationalContent', educationalContent);
    }
    
    // Store data on the NPC
    npc.setData('name', name);
    npc.setData('dialog', dialog);
    
    // Randomly select a direction for the NPC to face
    const directions = ['up', 'down', 'left', 'right'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    
    try {
      npc.play(`player-idle-${randomDirection}`);
      npc.setData('direction', randomDirection);
    } catch (e) {
      console.error(`Animation player-idle-${randomDirection} not found`, e);
    }
    
    // Set correct collision body size
    npc.setSize(12, 12);
    npc.setOffset(2, 16);
    
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
    console.log(`Created NPC ${name} at ${x}, ${y}`);
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
    setQ(data.text);
    
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

  

  private checkInteraction() {
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
    this.npcs.getChildren().forEach((npc: any) => {
      if (Phaser.Geom.Circle.ContainsPoint(interactArea, npc)) {
        const npcName = npc.getData('name');
        const npcDialog = npc.getData('dialog');
        
        // Show message with NPC dialog
        this.showMessage({
          text: `${npcName}: ${npcDialog}`,
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
      }
    });
    
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




// import Phaser from 'phaser';

// import PlayerImg from "../../../public/assets/player.png"

// export class WorldScene extends Phaser.Scene {
//   private player!: Phaser.Physics.Arcade.Sprite;
//   private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
//   private spaceKey!: Phaser.Input.Keyboard.Key;
//   private map!: Phaser.GameObjects.Image;
//   private obstacles!: Phaser.Physics.Arcade.StaticGroup;
//   private npcs!: Phaser.Physics.Arcade.StaticGroup;
//   private messageText!: Phaser.GameObjects.Text;
//   private messageBox!: Phaser.GameObjects.Rectangle;
//   private messageVisible: boolean = false;
//   private messageTimer: number = 0;
//   private speed: number = 500;
//   private currentPlayerDirection: string = 'down';
//   private mapScale: number = 2;
//   private showDebugBounds: boolean = true;
  
//   constructor() {
//     super('WorldScene');
//   }

//   preload() {
//     this.load.image('town-map', 'assets/town-map.png');
//     this.load.spritesheet('player', PlayerImg, { frameWidth: 16, frameHeight: 32 });
    
//     // Create player animations
//     this.createPlayerAnimations();
//   }

  // createPlayerAnimations() {
  //   // Idle animations
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
  // }

//   create() {
//     // Create the game world
//     this.createWorld();
    
//     // Set up player character
//     this.createPlayer();
    
//     // Set up camera
//     this.setupCamera();
    
//     // Set up input
//     this.setupInput();
    
//     // Create obstacles
//     this.createObstacles();
    
//     // Create NPCs
//     this.createNPCs();
    
//     // Create message display
//     this.createMessageDisplay();
    
//     // Set physics collisions
//     this.physics.add.collider(this.player, this.obstacles);
//     this.physics.add.collider(this.player, this.npcs);
    
//     // Add event listener for showing messages
//     this.events.on('showMessage', this.showMessage, this);
    
//     // Emit an event for the UI to display a welcome message
//     this.time.delayedCall(500, () => {
//       this.showMessage({
//         text: 'Welcome to Pixel Quest! Use arrow keys to move around and explore the town. Press SPACE near NPCs to talk.',
//         color: '#FFFFFF'
//       });
//     });
//   }

//   update(time: number, delta: number) {
//     // Handle player movement
//     this.handlePlayerMovement();
    
//     // Handle player interaction
//     if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
//       this.checkInteraction();
//     }
    
//     // Handle message timer
//     if (this.messageVisible && time > this.messageTimer) {
//       this.hideMessage();
//     }
//   }

//   private createWorld() {
//     // Add the map image
//     this.map = this.add.image(0, 0, 'town-map');
//     this.map.setOrigin(0, 0);
//     this.map.setScale(this.mapScale);
//   }

//   private createPlayer() {
//     // Create the player sprite at the bottom of the map
//     this.player = this.physics.add.sprite(1360, 2750, 'player');
//     this.player.setScale(2);
//     this.player.setCollideWorldBounds(true);
//     this.player.setSize(12, 12);
//     this.player.setOffset(2, 16);
//     this.player.setDepth(10); // Ensure player is above other objects
//     this.player.play('player-idle-down');
//   }

//   private setupCamera() {
//     // Set world bounds
//     const mapWidth = this.map.width * this.mapScale;
//     const mapHeight = this.map.height * this.mapScale;
//     console.log('Map width:', this.map.width, 'Map height:', this.map.height);
//     this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    
//     // Set camera bounds and follow player
//     this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
//     this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
//     this.cameras.main.setZoom(1);
//   }

//   private setupInput() {
//     this.cursors = this.input.keyboard!.createCursorKeys();
//     this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
//   }

//   private createObstacles() {
//     this.obstacles = this.physics.add.staticGroup();
    
//     // Define map dimensions
//     const mapWidth = this.map.width * this.mapScale;
//     const mapHeight = this.map.height * this.mapScale;
    
//     // Define collision areas based on the map
//     // Trees
//     this.createObstacleRect(0, 100, 20, mapHeight); // Left edge trees
//     // this.createObstacleRect(mapWidth - 32, 0, 32, mapHeight); // Right edge trees
//     this.createObstacleRect(0, 0, mapWidth, 32); // Top edge trees
//     // this.createObstacleRect(0, mapHeight - 32, mapWidth, 32); // Bottom edge trees
    
//     // Mountains
//     this.createObstacleRect(0, 740, 460, 140);
//     this.createObstacleRect(470, 800, 300, 140);

//     // Fence
//     this.createObstacleRect(450, 0, 50, 500);
//     this.createObstacleRect(670, 1650.6336580776644, 130,140);
//     this.createObstacleRect(170, 1430.6336580776644, 60,600);
//     this.createObstacleRect(170, 1430.6336580776644, 400,60);
//     this.createObstacleRect(745, 1440.6336580776644, 60,300);
//     this.createObstacleRect(810, 960, 400, 40);
//     this.createObstacleRect(810, 1180, 400, 40);
//     this.createObstacleRect(0, 2160.6336580776644, 800,60);

//     // Trees
//     this.createObstacleRect(800, 2200, 400,300);

//     // Houses
//     this.createObstacleRect(1300, 1510.6336580776644, 200,200);
//     this.createObstacleRect(1120, 1720.6336580776644, 150,10);
//     this.createObstacleRect(1020, 1780.6336580776644, 340,10);
//     this.createObstacleRect(880, 1510.6336580776644, 200,200);
//     this.createObstacleRect(380, 1580.6336580776644, 280,280);
//   }

//   private createObstacleRect(x: number, y: number, width: number, height: number) {
//     const rect = this.add.rectangle(x, y, width, height, 0x000000, 0);
//     rect.setOrigin(0, 0);
    
//     if (this.showDebugBounds) {
//         rect.setStrokeStyle(2, 0xff0000); // Add a 2px red border
//         rect.setVisible(true);
//     } else {
//         rect.setVisible(false);
//     }
    
//     this.obstacles.add(rect, true);
//   }

//   private createNPCs() {
//     this.npcs = this.physics.add.staticGroup();
    
//     // NPCs near houses - using the house coordinates from the collision data
    
//     // NPC near the main house (1300, 1510)
//     this.createNPC(1250, 1460, 'Mayor', 'Welcome to our town! I am the mayor here. We have many exciting places to explore.');
    
//     // NPC near the second house (880, 1510)
//     this.createNPC(830, 1460, 'Shopkeeper', 'Hello traveler! I sell all sorts of items. Would you like to see my wares?');
    
//     // NPC near the third house (380, 1580)
//     this.createNPC(330, 1530, 'Farmer', 'The crops are growing well this season. Make sure to visit our local market!');
    
//     // NPC near fence area (450, 0)
//     this.createNPC(400, 50, 'Guard', 'Be careful wandering outside the town. There are strange creatures in the wilderness.');
    
//     // NPC near trees (800, 2200)
//     this.createNPC(750, 2150, 'Woodcutter', 'The forest provides us with timber and shelter. Respect nature, traveler.');
    
//     // NPC near the bottom of the map
//     this.createNPC(1000, 2700, 'Fisher', 'The lake has the best fish you\'ll ever taste. I\'ve been fishing here for decades.');
    
//     // NPC near the mountain (470, 800)
//     this.createNPC(420, 750, 'Miner', 'The mountains contain valuable minerals. We\'ve been mining here for generations.');
    
//     // NPC on the path (1000, 2000)
//     this.createNPC(1000, 2000, 'Traveler', 'I\'m just passing through. This town has such friendly people!');
//   }

//   private createNPC(x: number, y: number, name: string, dialog: string) {
//     // Create a static sprite for the NPC
//     const npc = this.physics.add.staticSprite(x, y, 'player');
//     npc.setScale(2);
//     npc.setDepth(5); // Ensure NPCs are above the background but below the player
    
//     // Store data on the NPC
//     npc.setData('name', name);
//     npc.setData('dialog', dialog);
    
//     // Randomly select a direction for the NPC to face
//     const directions = ['up', 'down', 'left', 'right'];
//     const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    
//     try {
//       npc.play(`player-idle-${randomDirection}`);
//       npc.setData('direction', randomDirection);
//     } catch (e) {
//       console.error(`Animation player-idle-${randomDirection} not found`, e);
//     }
    
//     // Set correct collision body size
//     npc.setSize(12, 12);
//     npc.setOffset(2, 16);
    
//     // Add debug bounds to NPCs if debug is enabled
//     if (this.showDebugBounds) {
//         const bounds = npc.getBounds();
//         const debugRect = this.add.rectangle(
//             bounds.x, 
//             bounds.y, 
//             bounds.width, 
//             bounds.height, 
//             0x000000, 
//             0
//         );
//         debugRect.setStrokeStyle(2, 0x00ff00); // Green border for NPCs
//         npc.setData('debugRect', debugRect);
//     }
    
//     this.npcs.add(npc);
//     console.log(`Created NPC ${name} at ${x}, ${y}`);
//     return npc;
//   }

//   private createMessageDisplay() {
//     // Create a message box at the bottom of the screen
//     const width = this.cameras.main.width;
//     const height = 100;
    
//     // Create a rectangle for the message box
//     this.messageBox = this.add.rectangle(
//       width / 2,
//       this.cameras.main.height - height / 2,
//       width - 40,
//       height - 20,
//       0x000000,
//       0.7
//     );
//     this.messageBox.setStrokeStyle(2, 0xffffff);
//     this.messageBox.setScrollFactor(0); // Fixed to camera
//     this.messageBox.setDepth(100); // Ensure it's above everything
//     this.messageBox.setVisible(false);
    
//     // Create text for the message
//     this.messageText = this.add.text(
//       width / 2,
//       this.cameras.main.height - height / 2,
//       '',
//       {
//         fontFamily: 'Arial',
//         fontSize: '18px',
//         color: '#ffffff',
//         align: 'center',
//         wordWrap: { width: width - 80 }
//       }
//     );
//     this.messageText.setOrigin(0.5);
//     this.messageText.setScrollFactor(0); // Fixed to camera
//     this.messageText.setDepth(101); // Ensure it's above the message box
//     this.messageText.setVisible(false);
//   }

//   private showMessage(data: { text: string, color?: string }) {
//     // Show the message box and text
//     this.messageBox.setVisible(true);
//     this.messageText.setVisible(true);
//     this.messageText.setText(data.text);
//     this.messageText.setColor(data.color || '#ffffff');
    
//     // Set the message timer (display for 5 seconds)
//     this.messageTimer = this.time.now + 5000;
//     this.messageVisible = true;
    
//     // Log the message for debugging
//     console.log('Showing message:', data.text);
//   }

//   private hideMessage() {
//     // Hide the message box and text
//     this.messageBox.setVisible(false);
//     this.messageText.setVisible(false);
//     this.messageVisible = false;
//   }

//   private handlePlayerMovement() {
//     // Reset velocity
//     this.player.setVelocity(0);
    
//     let isMoving = false;
//     let newDirection = this.currentPlayerDirection;
    
//     // Handle horizontal movement
//     if (this.cursors.left!.isDown) {
//       this.player.setVelocityX(-this.speed);
//       isMoving = true;
//       newDirection = 'left';
//       console.log(this.player.x, this.player.y);
//     } else if (this.cursors.right!.isDown) {
//       this.player.setVelocityX(this.speed);
//       isMoving = true;
//       newDirection = 'right';
//       console.log(this.player.x, this.player.y);
//     }
    
//     // Handle vertical movement
//     if (this.cursors.up!.isDown) {
//       this.player.setVelocityY(-this.speed);
//       isMoving = true;
//       newDirection = 'up';
//     } else if (this.cursors.down!.isDown) {
//       this.player.setVelocityY(this.speed);
//       isMoving = true;
//       newDirection = 'down';
//     }
    
//     // Normalize diagonal movement
//     if (this.player.body!.velocity.x !== 0 && this.player.body!.velocity.y !== 0) {
//       this.player.body!.velocity.normalize().scale(this.speed);
//     }
    
//     // Update player animation based on movement
//     if (isMoving) {
//       this.player.play(`player-walk-${newDirection}`, true);
//     } else {
//       this.player.play(`player-idle-${newDirection}`, true);
//     }
    
//     this.currentPlayerDirection = newDirection;
    
//     // Update debug rectangles for NPCs if they exist
//     if (this.showDebugBounds) {
//         this.npcs.getChildren().forEach((npc: any) => {
//             const debugRect = npc.getData('debugRect');
//             if (debugRect) {
//                 const bounds = npc.getBounds();
//                 debugRect.setPosition(bounds.x, bounds.y);
//                 debugRect.setSize(bounds.width, bounds.height);
//             }
//         });
//     }
//   }

//   private checkInteraction() {
//     // Get facing tile based on direction
//     let tileX = this.player.x;
//     let tileY = this.player.y;
    
//     // Adjust position based on facing direction
//     const offset = 32;
//     if (this.currentPlayerDirection === 'left') {
//       tileX -= offset;
//     } else if (this.currentPlayerDirection === 'right') {
//       tileX += offset;
//     } else if (this.currentPlayerDirection === 'up') {
//       tileY -= offset;
//     } else if (this.currentPlayerDirection === 'down') {
//       tileY += offset;
//     }
    
//     // Check for NPCs in the interaction zone
//     const interactArea = new Phaser.Geom.Circle(tileX, tileY, 40); // Increased radius for easier interaction
    
//     // Visualize interaction area if debug is enabled
//     if (this.showDebugBounds) {
//         const debugInteractCircle = this.add.circle(tileX, tileY, 40, 0xffff00, 0.3);
//         this.time.delayedCall(500, () => {
//             debugInteractCircle.destroy();
//         });
//     }
    
//     let hasInteracted = false;
//     this.npcs.getChildren().forEach((npc: any) => {
//       if (Phaser.Geom.Circle.ContainsPoint(interactArea, npc)) {
//         const npcName = npc.getData('name');
//         const npcDialog = npc.getData('dialog');
        
//         // Show message with NPC dialog
//         this.showMessage({
//           text: `${npcName}: ${npcDialog}`,
//           color: '#FFFFFF' // White text
//         });
        
//         // Make the NPC face the player
//         const dx = this.player.x - npc.x;
//         const dy = this.player.y - npc.y;
        
//         if (Math.abs(dx) > Math.abs(dy)) {
//           // Horizontal difference is greater
//           if (dx > 0) {
//             npc.play('player-idle-right');
//             npc.setData('direction', 'right');
//           } else {
//             npc.play('player-idle-left');
//             npc.setData('direction', 'left');
//           }
//         } else {
//           // Vertical difference is greater
//           if (dy > 0) {
//             npc.play('player-idle-down');
//             npc.setData('direction', 'down');
//           } else {
//             npc.play('player-idle-up');
//             npc.setData('direction', 'up');
//           }
//         }
        
//         hasInteracted = true;
//       }
//     });
    
//     if (!hasInteracted) {
//       // Check for environment interactions
//       if (this.isNearWater(tileX, tileY)) {
//         this.showMessage({
//           text: 'The water looks refreshing and clear.',
//           color: '#FFFFFF'
//         });
//       } else if (this.isNearBuilding(tileX, tileY)) {
//         this.showMessage({
//           text: 'This building seems important to the town.',
//           color: '#FFFFFF'
//         });
//       } else if (this.isNearTrees(tileX, tileY)) {
//         this.showMessage({
//           text: 'The trees sway gently in the breeze.',
//           color: '#FFFFFF'
//         });
//       }
//     }
//   }

//   private isNearWater(x: number, y: number) {
//     // Map dimensions
//     const mapWidth = this.map.width * this.mapScale;
//     const mapHeight = this.map.height * this.mapScale;
    
//     return (
//       (x > 640 && x < 800 && y > 160 && y < 360) || // Main river
//       (x > 128 && x < 288 && y > 528 && y < 600) || // Bottom pond
//       (x > 32 && x < 128 && y > 288 && y < 384)     // Left pond
//     );
//   }

//   private isNearBuilding(x: number, y: number) {
//     return (
//       // Main house areas
//       (x > 1200 && x < 1500 && y > 1400 && y < 1700) || // Main house (1300, 1510)
//       (x > 780 && x < 980 && y > 1400 && y < 1700) ||   // Second house (880, 1510)
//       (x > 280 && x < 480 && y > 1480 && y < 1780)      // Third house (380, 1580)
//     );
//   }

//   private isNearTrees(x: number, y: number) {
//     const mapWidth = this.map.width * this.mapScale;
//     const mapHeight = this.map.height * this.mapScale;
    
//     return (
//       (x > 700 && x < 900 && y > 2100 && y < 2300) || 
//       x < 32 || x > mapWidth - 32 || y < 32 || y > mapHeight - 32
//     );
//   }
//   public toggleDebugBounds() {
//     this.showDebugBounds = !this.showDebugBounds;
    
//     this.obstacles.getChildren().forEach((obstacle: Phaser.GameObjects.GameObject) => {
//         const rect = obstacle as Phaser.GameObjects.Rectangle;
//         if (this.showDebugBounds) {
//             rect.setStrokeStyle(2, 0xff0000);
//             rect.setVisible(true);
//         } else {
//             rect.setVisible(false);
//         }
//     });
//     this.npcs.getChildren().forEach((npc: any) => {
//         const debugRect = npc.getData('debugRect');
//         if (debugRect) {
//             debugRect.setVisible(this.showDebugBounds);
//         }
//     });
//   }
// }