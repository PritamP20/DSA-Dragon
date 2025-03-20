import { skip } from "node:test";

export class LeetCodeQuestScene extends Phaser.Scene {
    private battleImage!: Phaser.GameObjects.Image;
    private mapScale: number = 0.7;
    
    constructor() {
        super({ key: 'LeetCodeQuestScene' });
    }
    
    preload() {
        this.load.image('battle', '/Battle.png');
        this.load.spritesheet('player', 'assets/player.png', { frameWidth: 0, frameHeight: 0 });
    }
    
    create() {
        console.log('LeetCodeQuestScene create starting');
        
        // Add background first (so it's on the bottom layer)
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 1);
        graphics.fillRectShape(new Phaser.Geom.Rectangle(0, 0, this.scale.width, this.scale.height));
        
        // Create the battle scene
        this.createWorld();

        this.createQuestionScene();
        
        // // Add text on top of everything
        // this.add.text(200, 200, 'Solve the LeetCode Challenge!', { fontSize: '20px', color: '#ffffff' });
        // this.add.text(200, 250, 'Press SPACE to return to the world', { fontSize: '16px', color: '#ffffff' });
        
        // // Return to WorldScene
        // this.input.keyboard.on('keydown-SPACE', () => {
        //     console.log('Returning to WorldScene');
        //     this.scene.start('WorldScene');
        // });
        
        console.log('LeetCodeQuestScene create complete');
    }
    
    private createWorld() {
        // Add the map image
        this.battleImage = this.add.image(this.scale.width / 2, this.scale.height, 'battle');
        this.battleImage.setOrigin(0.5, 1); // Set origin to bottom-center
        this.battleImage.setScale(this.mapScale);
    }

    private createQuestionScene() {
        // Create a semi-transparent overlay panel
        const overlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width * 0.8,
            this.scale.height * 0.7,
            0x222222,
            0.9
        );
        
        // Add panel header
        const headerText = this.add.text(
            this.scale.width / 2,
            overlay.y - overlay.height / 2 + 30,
            'LeetCode Challenge',
            { fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // Add question title
        const questionTitle = this.add.text(
            this.scale.width / 2,
            headerText.y + 50,
            'Two Sum',
            { fontSize: '20px', color: '#4CAF50', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // Add question description
        const description = 
            'Given an array of integers nums and an integer target, return indices of\n' +
            'the two numbers such that they add up to target.\n\n' +
            'You may assume that each input would have exactly one solution,\n' +
            'and you may not use the same element twice.';
        
        const questionText = this.add.text(
            overlay.x - overlay.width / 2 + 30,
            questionTitle.y + 40,
            description,
            { fontSize: '16px', color: '#ffffff', wordWrap: { width: overlay.width - 60 } }
        );
        
        const example = 
            'Example:\n\n' +
            'Input: nums = [2,7,11,15], target = 9\n' +
            'Output: [0,1]\n' +
            'Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].';
        
        const exampleText = this.add.text(
            questionText.x,
            questionText.y + questionText.height + 30,
            example,
            { fontSize: '16px', color: '#FFD700', wordWrap: { width: overlay.width - 60 } }
        );
        
        const solveButton = this.add.rectangle(
            this.scale.width / 2 - 100,
            overlay.y + overlay.height / 2 - 40,
            180,
            50,
            0x4CAF50
        ).setInteractive();
        
        const solveText = this.add.text(
            solveButton.x,
            solveButton.y,
            'Solve Challenge',
            { fontSize: '16px', color: '#ffffff' }
        ).setOrigin(0.5);
        
        const skipButton = this.add.rectangle(
            this.scale.width / 2 + 100,
            solveButton.y,
            120,
            50,
            0x607D8B
        ).setInteractive();
        
        const skipText = this.add.text(
            skipButton.x,
            skipButton.y,
            'Skip',
            { fontSize: '16px', color: '#ffffff' }
        ).setOrigin(0.5);
        
        // Add interactivity
        solveButton.on('pointerdown', () => {
            // Open editor or redirect to solution page
            console.log('Solving challenge');
            // You could open another scene here with the editor
        });
        
        skipButton.on('pointerdown', () => {
            console.log('Skipping challenge');
            this.scene.start('WorldScene');
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            skipButton.emit('pointerdown');
        });
    }
}