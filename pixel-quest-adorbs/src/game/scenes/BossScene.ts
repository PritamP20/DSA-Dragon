import {generateLeetCodeQuestion} from "../../components/api/courseDataApi.js";
export class DSABattleScene extends Phaser.Scene {
    private battleImage!: Phaser.GameObjects.Image;
    private mapScale: number = 0.7;
    private topic: string;
    private difficulty: string;
    private questionData:any={};
    private scrollContainer: Phaser.GameObjects.Container;
    private mask: Phaser.Display.Masks.GeometryMask;
    private scrollableHeight: number = 0;
    private scrolling: boolean = false;
    private lastY: number = 0;
    
    constructor(config) {
        super({ key: 'DSABattleScene' });
        this.topic = config?.topic || "Arrays";
        this.difficulty = config?.difficulty || "easy";
    }
    
    init(data) {
        if (data.topic) this.topic = data.topic;
        if (data.difficulty) this.difficulty = data.difficulty;
    }
    
    preload() {
        this.load.image('battle', '/BossBattle.png', );
        
    }
    
    create() {
        console.log('LeetCodeQuestScene create starting');
        console.log(`Loading ${this.difficulty} question about ${this.topic}`);
        
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 1);
        graphics.fillRectShape(new Phaser.Geom.Rectangle(0, 0, this.scale.width, this.scale.height));
        
        this.createWorld();

        const loadingText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            'Loading challenge...',
            { fontSize: '20px', color: '#ffffff' }
        ).setOrigin(0.5);
        
        this.loadQuestion(loadingText);
        
        console.log('LeetCodeQuestScene create complete');
    }
    
    private createWorld() {
        this.battleImage =  this.add.image(350, 580, 'battle');
        this.battleImage.setScale(0.3); 

        this.battleImage.setOrigin(0.5, 1);
    }

    private async loadQuestion(loadingText) {
        try {
            let questionJSON = await generateLeetCodeQuestion(this.topic, this.difficulty);
            


            if (questionJSON.includes("```")) {
                questionJSON = questionJSON.replace(/```json\s*/g, "");
                questionJSON = questionJSON.replace(/```\s*/g, "");
            }

            
            const questionData = JSON.parse(questionJSON);
            console.log(questionData)
            console.log("Parsed data:", this.questionData);
            const setQ = this.registry.get('setQ')
            setQ(questionData)
            console.log("working")
            
            loadingText.destroy();
            
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
        
        const panelWidth = overlay.width;
        const panelHeight = overlay.height;
        const panelX = overlay.x - panelWidth / 2;
        const panelY = overlay.y - panelHeight / 2;
        
        // Create a mask for the scrollable area - using black instead of white
        const maskGraphics = this.add.graphics();
        maskGraphics.fillStyle(0x000000); // Changed to black
        maskGraphics.fillRect(
            panelX + 20, 
            panelY + 100, // Start below the header
            panelWidth - 40, 
            panelHeight - 170 // Leave space for buttons at bottom
        );
        
        // Create a background for the scrollable area (black)
        const scrollBg = this.add.rectangle(
            panelX + 20 + (panelWidth - 40) / 2,
            panelY + 100 + (panelHeight - 170) / 2,
            panelWidth - 40,
            panelHeight - 170,
            0x111111
        );
        
        // The mask is still needed for clipping
        this.mask = new Phaser.Display.Masks.GeometryMask(this, maskGraphics);
        
        // Create scrollable container
        this.scrollContainer = this.add.container(panelX + 30, panelY + 100);
        this.scrollContainer.setMask(this.mask);
        
        // Add panel header (outside scroll container)
        const headerText = this.add.text(
            this.scale.width / 2,
            panelY + 30,
            'CodeQuest Challenge',
            { fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        const difficultyColors = {
            'easy': '#4CAF50',
            'medium': '#FF9800',
            'hard': '#F44336'
        };
        const difficultyColor = difficultyColors[questionData.difficulty] || '#4CAF50';
        
        const questionTitle = this.add.text(
            this.scale.width / 2,
            headerText.y + 50,
            questionData.title,
            { fontSize: '20px', color: difficultyColor, fontStyle: 'bold' }
        ).setOrigin(0.5);
        
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
        
        const questionText = this.add.text(
            0,
            0,
            questionData.description,
            { fontSize: '16px', color: '#ffffff', wordWrap: { width: panelWidth - 60 } }
        );
        this.scrollContainer.add(questionText);
        
        // Format example
        const example = 
            'Example:\n\n' +
            `Input: ${questionData.example.input}\n` +
            `Output: ${questionData.example.output}\n` +
            `Explanation: ${questionData.example.explanation}`;
        
        const exampleText = this.add.text(
            0,
            questionText.height + 30,
            example,
            { fontSize: '16px', color: '#FFD700', wordWrap: { width: panelWidth - 60 } }
        );
        this.scrollContainer.add(exampleText);
        
        let lastY = exampleText.y + exampleText.height + 20;
        
        // Add tags if available
        if (questionData.tags && questionData.tags.length > 0) {
            const tagsText = this.add.text(
                0,
                lastY,
                `Tags: ${Array.isArray(questionData.tags) ? questionData.tags.join(', ') : questionData.tags}`,
                { fontSize: '14px', color: '#9E9E9E' }
            );
            this.scrollContainer.add(tagsText);
            lastY = tagsText.y + tagsText.height + 20;
        }
        
        this.scrollableHeight = lastY;
        const maskHeight = panelHeight-170;
        if (this.scrollableHeight > maskHeight) {
            const scrollIndicator = this.add.text(
                panelX + panelWidth - 30,
                panelY + 120,
                '↕️ Scroll',
                { fontSize: '14px', color: '#9E9E9E' }
            ).setOrigin(1, 0);
        }
        
        // Add buttons (outside scroll container)
        const buttonsY = panelY + panelHeight - 40;
        
        const solveButton = this.add.rectangle(
            this.scale.width / 2 - 100,
            buttonsY,
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
            buttonsY,
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
                buttonsY - 60,
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
                            wordWrap: { width: panelWidth * 0.6 } 
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
            this.scene.start('NFTScene', { 
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
        
        // Set up scrolling
        this.setupScrolling(maskHeight);
    }
    
    private setupScrolling(maskHeight) {
        // Mouse wheel scrolling
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (this.scrollableHeight > maskHeight) {
                const newY = Phaser.Math.Clamp(
                    this.scrollContainer.y - deltaY,
                    maskHeight - this.scrollableHeight + 100, 
                    100 
                );
                this.scrollContainer.y = newY;
            }
        });
        
        this.input.on('pointerdown', (pointer) => {
            if (pointer.y > 100 && pointer.y < this.scale.height - 100) {
                this.scrolling = true;
                this.lastY = pointer.y;
            }
        });
        
        this.input.on('pointermove', (pointer) => {
            if (this.scrolling && this.scrollableHeight > maskHeight) {
                const deltaY = pointer.y - this.lastY;
                const newY = Phaser.Math.Clamp(
                    this.scrollContainer.y + deltaY,
                    maskHeight - this.scrollableHeight + 100, // Lower bound
                    100 // Upper bound
                );
                this.scrollContainer.y = newY;
                this.lastY = pointer.y;
            }
        });
        
        this.input.on('pointerup', () => {
            this.scrolling = false;
        });
        this.input.keyboard.on('keydown-UP', () => {
            if (this.scrollableHeight > maskHeight) {
                const newY = Phaser.Math.Clamp(
                    this.scrollContainer.y - 20, // Change + to -
                    maskHeight - this.scrollableHeight, // Remove the +100
                    0 // Change 100 to 0
                );
                this.scrollContainer.y = newY;
            }
        });
        
        this.input.keyboard.on('keydown-DOWN', () => {
            if (this.scrollableHeight > maskHeight) {
                const newY = Phaser.Math.Clamp(
                    this.scrollContainer.y - 20,
                    maskHeight - this.scrollableHeight + 100,
                    100
                );
                this.scrollContainer.y = newY;
            }
        });
    }
}