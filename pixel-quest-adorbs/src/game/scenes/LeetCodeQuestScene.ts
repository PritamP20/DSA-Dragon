import {generateLeetCodeQuestion} from "../../components/api/courseDataApi.js";


export class LeetCodeQuestScene extends Phaser.Scene {
    private battleImage!: Phaser.GameObjects.Image;
    private mapScale: number = 0.7;
    private topic: string;
    private difficulty: string;
    
    constructor(config) {
        super({ key: 'LeetCodeQuestScene' });
        // Get topic and difficulty from config if provided
        this.topic = config?.topic || "Arrays";
        this.difficulty = config?.difficulty || "easy";
    }
    
    init(data) {
        // Allow passing topic and difficulty through scene transition data
        if (data.topic) this.topic = data.topic;
        if (data.difficulty) this.difficulty = data.difficulty;
    }
    
    preload() {
        this.load.image('battle', '/Battle.png');
        this.load.spritesheet('player', 'assets/player.png', { frameWidth: 0, frameHeight: 0 });
    }
    
    create() {
        console.log('LeetCodeQuestScene create starting');
        console.log(`Loading ${this.difficulty} question about ${this.topic}`);
        
        // Add background first (so it's on the bottom layer)
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 1);
        graphics.fillRectShape(new Phaser.Geom.Rectangle(0, 0, this.scale.width, this.scale.height));
        
        // Create the battle scene
        this.createWorld();

        // Create loading indicator
        const loadingText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            'Loading challenge...',
            { fontSize: '20px', color: '#ffffff' }
        ).setOrigin(0.5);
        
        // Generate and load question
        this.loadQuestion(loadingText);
        
        console.log('LeetCodeQuestScene create complete');
    }
    
    private createWorld() {
        // Add the map image
        this.battleImage = this.add.image(this.scale.width / 2, this.scale.height, 'battle');
        this.battleImage.setOrigin(0.5, 1); // Set origin to bottom-center
        this.battleImage.setScale(this.mapScale);
    }

    private async loadQuestion(loadingText) {
        try {
            // Call the API to generate a question
            const questionJSON = await generateLeetCodeQuestion(this.topic, this.difficulty);
            const questionData = JSON.parse(questionJSON);
            
            // Remove loading text
            loadingText.destroy();
            
            // Create question UI with the generated data
            this.createQuestionScene(questionData);
        } catch (error) {
            console.error('Failed to load question:', error);
            loadingText.setText('Failed to load question.\nPress SPACE to return.');
            
            this.input.keyboard.on('keydown-SPACE', () => {
                this.scene.start('WorldScene');
            });
        }
    }

    private createQuestionScene(questionData) {
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
        
        // Set color based on difficulty
        const difficultyColors = {
            'easy': '#4CAF50',
            'medium': '#FF9800',
            'hard': '#F44336'
        };
        const difficultyColor = difficultyColors[questionData.difficulty] || '#4CAF50';
        
        // Add question title with difficulty indicator
        const questionTitle = this.add.text(
            this.scale.width / 2,
            headerText.y + 50,
            questionData.title,
            { fontSize: '20px', color: difficultyColor, fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // Add difficulty badge
        const difficultyBadge = this.add.text(
            questionTitle.x + questionTitle.width / 2 + 20,
            questionTitle.y,
            questionData.difficulty.toUpperCase(),
            { 
                fontSize: '12px', 
                color: '#FFFFFF',
                backgroundColor: difficultyColor,
                padding: { x: 8, y: 4 }
            }
        ).setOrigin(0, 0.5);
        
        // Add question description
        const questionText = this.add.text(
            overlay.x - overlay.width / 2 + 30,
            questionTitle.y + 40,
            questionData.description,
            { fontSize: '16px', color: '#ffffff', wordWrap: { width: overlay.width - 60 } }
        );
        
        // Format example
        const example = 
            'Example:\n\n' +
            `Input: ${questionData.example.input}\n` +
            `Output: ${questionData.example.output}\n` +
            `Explanation: ${questionData.example.explanation}`;
        
        const exampleText = this.add.text(
            questionText.x,
            questionText.y + questionText.height + 30,
            example,
            { fontSize: '16px', color: '#FFD700', wordWrap: { width: overlay.width - 60 } }
        );
        
        // Add tags if available
        if (questionData.tags && questionData.tags.length > 0) {
            const tagsText = this.add.text(
                questionText.x,
                exampleText.y + exampleText.height + 20,
                `Tags: ${Array.isArray(questionData.tags) ? questionData.tags.join(', ') : questionData.tags}`,
                { fontSize: '14px', color: '#9E9E9E' }
            );
        }
        
        // Add buttons
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
        
        // Add hint button if hints are available
        if (questionData.hints && questionData.hints.length > 0) {
            const hintButton = this.add.rectangle(
                this.scale.width / 2,
                solveButton.y - 70,
                120,
                40,
                0x2196F3
            ).setInteractive();
            
            const hintText = this.add.text(
                hintButton.x,
                hintButton.y,
                'Show Hint',
                { fontSize: '14px', color: '#ffffff' }
            ).setOrigin(0.5);
            
            // Hint display management
            let currentHint = 0;
            let activeHint = null;
            
            hintButton.on('pointerdown', () => {
                // Remove previous hint if exists
                if (activeHint) {
                    activeHint.destroy();
                    activeHint = null;
                }
                
                if (currentHint < questionData.hints.length) {
                    // Show hint
                    activeHint = this.add.text(
                        this.scale.width / 2,
                        hintButton.y + 30,
                        questionData.hints[currentHint],
                        { 
                            fontSize: '14px', 
                            color: '#FFEB3B', 
                            backgroundColor: '#333333',
                            padding: { x: 10, y: 5 },
                            wordWrap: { width: overlay.width * 0.6 } 
                        }
                    ).setOrigin(0.5, 0);
                    
                    currentHint++;
                    
                    if (currentHint >= questionData.hints.length) {
                        hintText.setText('No more hints');
                    } else {
                        hintText.setText(`Hint ${currentHint}/${questionData.hints.length}`);
                    }
                }
            });
        }
        
        // Add interactivity
        solveButton.on('pointerdown', () => {
            // Open editor or redirect to solution page
            console.log('Solving challenge:', questionData.title);
            // You could open another scene here with the editor
            this.scene.start('EditorScene', { 
                questionData: questionData,
                returnScene: 'LeetCodeQuestScene',
                topic: this.topic,
                difficulty: this.difficulty
            });
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