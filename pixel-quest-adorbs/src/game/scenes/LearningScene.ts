export class LearningScene extends Phaser.Scene {
    private backgroundImage!: Phaser.GameObjects.Image;
    private mapScale: number = 0.7;
    private currentTopic: string = '';
    private courseData: any = {};
    
    constructor() {
        super('DynamicLearningScene');
    }

    init(data: any) {
        // Get the topic from the NPC that triggered this scene
        this.currentTopic = data.topic || 'default';
        this.loadCourseData();
    }

    preload() {
        // Load assets for the dynamic learning scene
        this.load.image('youtube-thumb', 'assets/youtube-thumbnail.png');
        this.load.image('icon-practice', 'assets/icon-practice.png');
        this.load.image('icon-quiz', 'assets/icon-quiz.png');
        this.load.image('icon-back', 'assets/icon-back.png');
        this.load.image('icon-play', 'assets/icon-play.png');
        this.load.image('icon-xp', 'assets/icon-xp.png');
        
        // Load NPC-specific thumbnails
        this.load.image('thumb-bst', 'assets/thumbnails/bst-thumbnail.png');
        this.load.image('thumb-dynamic', 'assets/thumbnails/dynamic-thumbnail.png');
        this.load.image('thumb-graphs', 'assets/thumbnails/graphs-thumbnail.png');
        this.load.image('thumb-sorting', 'assets/thumbnails/sorting-thumbnail.png');
    }

    create() {
        this.createDynamicLearningScene();
        // Set world bounds larger than the screen
        this.cameras.main.setBounds(0, 0, 800, 2000); // Adjust height for scrolling

        // Enable dragging to scroll
        this.input.on("pointermove", (pointer) => {
        if (pointer.isDown) {
            this.cameras.main.scrollY -= (pointer.velocity.y * 0.5);
        }
        });

        // Optional: Add mouse wheel scroll
        this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
        this.cameras.main.scrollY += deltaY * 0.5; // Adjust scroll speed
        });

        // Set world bounds larger than the screen
    this.cameras.main.setBounds(0, 0, 800, 2000); // Adjust height for scrolling

    // Enable dragging to scroll
    this.input.on("pointermove", (pointer) => {
        if (pointer.isDown) {
            this.cameras.main.scrollY -= (pointer.velocity.y * 0.5);
        }
    });

    // Mouse wheel scroll
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
        this.cameras.main.scrollY += deltaY * 0.5; // Adjust scroll speed
    });

    // Create the YouTube iframe element
    const video = document.createElement("iframe");
    video.src = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"; // Replace with your YouTube URL
    video.width = "560";
    video.height = "315";
    video.allow = "autoplay; encrypted-media"; 
    video.frameBorder = "0";
    video.style.position = "absolute";
    
    // Add the video element to the Phaser scene
    const videoElement = this.add.dom(this.scale.width / 2, this.scale.height/2 -50, video);

    // Handle fullscreen mode
    this.scale.on('resize', (gameSize: { width: number, height: number }) => {
        videoElement.setPosition(gameSize.width / 2, gameSize.height / 2);
        video.width = `${gameSize.width * 0.5}`;
        video.height = `${gameSize.height * 0.3}`;
    });


    }
    
    private loadCourseData() {
        // Define course data for different topics
        const courseDatabase = {
            'bst': {
                title: 'Binary Search Trees',
                subtitle: 'Level up your tree traversal skills!',
                videoTitle: 'Binary Search Trees: From Theory to Implementation',
                videoURL: 'https://www.youtube.com/watch?v=bst-example',
                thumbnailKey: 'thumb-bst',
                duration: '8:42',
                channel: 'Tree Traversal Academy',
                views: '15K',
                concepts: [
                    '🌳 A BST is like a family tree where smaller values go left',
                    '🔍 Search operations are O(log n) on average - super fast!',
                    '⚖️ Balanced trees are happy trees - they perform better',
                    '🧩 Insert and delete operations preserve the BST property'
                ],
                funFact: 'The worst-case BST is just a linked list. Sad but true!',
                xpReward: 50
            },
            'dynamic': {
                title: 'Dynamic Programming',
                subtitle: 'Master the art of optimal substructure',
                videoTitle: 'Dynamic Programming: From Fibonacci to Advanced Algorithms',
                videoURL: 'https://www.youtube.com/watch?v=dynamic-example',
                thumbnailKey: 'thumb-dynamic',
                duration: '10:24',
                channel: 'AlgoExpert',
                views: '12K',
                concepts: [
                    '🧩 Break down problems into overlapping subproblems',
                    '📊 Memoization prevents redundant calculations',
                    '📈 Dynamic programming transforms exponential solutions to polynomial',
                    '🔄 Recognize when a greedy approach wont work'
                ],
                funFact: 'The term "dynamic programming" was chosen to hide mathematical research from government officials!',
                xpReward: 75
            },
            'graphs': {
                title: 'Graph Algorithms',
                subtitle: 'Navigate networks like a pro',
                videoTitle: 'Graph Traversal: BFS, DFS, and Dijkstra\'s Algorithm',
                videoURL: 'https://www.youtube.com/watch?v=graphs-example',
                thumbnailKey: 'thumb-graphs',
                duration: '12:15',
                channel: 'NetworkNinja',
                views: '8.5K',
                concepts: [
                    '🗺️ Graphs represent relationships between objects',
                    '🚶 DFS uses a stack, BFS uses a queue',
                    '🛣️ Shortest path algorithms help optimize routes',
                    '🔄 Cycle detection prevents infinite loops'
                ],
                funFact: 'The Seven Bridges of Königsberg problem started graph theory in 1736!',
                xpReward: 60
            },
            'sorting': {
                title: 'Sorting Algorithms',
                subtitle: 'Organize data efficiently',
                videoTitle: 'Sorting Algorithms Visualized: From Bubble Sort to Quick Sort',
                videoURL: 'https://www.youtube.com/watch?v=sorting-example',
                thumbnailKey: 'thumb-sorting',
                duration: '9:37',
                channel: 'SortingMaster',
                views: '22K',
                concepts: [
                    '⏱️ Time complexity determines algorithm efficiency',
                    '🔄 Comparison-based sorts have O(n log n) lower bound',
                    '🧠 Understanding when to use each algorithm is key',
                    '📊 In-place sorting saves memory but can be complex'
                ],
                funFact: 'Bogosort (randomly shuffling until sorted) has an average time complexity of O(n × n!)!',
                xpReward: 45
            },
            'default': {
                title: 'Algorithm Basics',
                subtitle: 'Start your algorithm journey',
                videoTitle: 'Introduction to Algorithms and Data Structures',
                videoURL: 'https://www.youtube.com/watch?v=default-example',
                thumbnailKey: 'youtube-thumb',
                duration: '7:20',
                channel: 'CodeCraft',
                views: '5K',
                concepts: [
                    '📝 Algorithms are step-by-step procedures for solving problems',
                    '🧮 Time and space complexity measure efficiency',
                    '🔍 Different problems require different algorithmic approaches',
                    '🔄 Iteration and recursion are two fundamental approaches'
                ],
                funFact: 'The word "algorithm" comes from the name of Persian mathematician Al-Khwarizmi!',
                xpReward: 30
            }
        };
        
        // Set the current course data based on the topic
        this.courseData = courseDatabase[this.currentTopic] || courseDatabase['default'];
    }

    private createDynamicLearningScene() {
        // Create a clean background
        const bgRect = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x0E0E1E
        );
        
        // Create a modern background panel with more space
        const overlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width * 0.9,
            this.scale.height * 0.9,
            0x1E1E2E,
            0.95
        ).setStrokeStyle(2, 0x6272A4);
        
        // Add decorative elements - thinner top accent
        const topDecoration = this.add.graphics();
        topDecoration.fillStyle(0xBD93F9, 1);
        topDecoration.fillRect(overlay.x - overlay.width / 2, overlay.y - overlay.height / 2, overlay.width, 4);
        
        // Add clean, well-spaced header
        const headerText = this.add.text(
            this.scale.width / 2,
            overlay.y - overlay.height / 2 + 50,
            `LEARN: ${this.courseData.title}`,
            { fontSize: '28px', color: '#FF79C6', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // Add subtitle with more space
        const subtitle = this.add.text(
            this.scale.width / 2,
            headerText.y + 45,
            this.courseData.subtitle,
            { fontSize: '20px', color: '#8BE9FD', fontStyle: 'italic' }
        ).setOrigin(0.5);
        
        // Create XP badge in top right - clean and minimal
        this.createXPBadge(overlay);
        
        // Create main content area - more focus on video
        this.createVideoSection(subtitle.y + 80, overlay.width * 0.8);
        
        // Create two-column layout for concepts and resources
        this.createTwoColumnLayout(overlay, subtitle.y + 380);
        
        // Create cleaner navigation buttons
        this.createNavigationButtons(overlay);
    }
    
    private createXPBadge(overlay: Phaser.GameObjects.Rectangle) {
        const xpContainer = this.add.container(
            overlay.x + overlay.width / 2 - 70,
            overlay.y - overlay.height / 2 + 60
        );
        
        const xpBadge = this.add.circle(0, 0, 30, 0xFFB86C);
        
        const xpText = this.add.text(
            0, 0,
            `+${this.courseData.xpReward}`,
            { fontSize: '18px', color: '#282A36', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        const xpLabel = this.add.text(
            0, 35,
            'XP',
            { fontSize: '16px', color: '#FFB86C', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        xpContainer.add([xpBadge, xpText, xpLabel]);
    }
    
    private createVideoSection(startY: number, maxWidth: number) {
        // Create a cleaner video section with more focus
        const videoContainer = this.add.container(
            this.scale.width / 2,
            startY + 100
        );
        
        // Video frame with more pleasing proportions
        const videoFrame = this.add.rectangle(
            0, 0,
            maxWidth,
            maxWidth * 0.5625, // 16:9 aspect ratio
            0x000000
        ).setStrokeStyle(2, 0xFF5555);
        
        // Use the topic-specific thumbnail
        const thumbnail = this.add.image(
            0, 0, 
            this.courseData.thumbnailKey
        ).setDisplaySize(videoFrame.width, videoFrame.height);
        
        // Nicer play button
        const playButton = this.add.circle(
            0, 0,
            40,
            0xFF5555
        ).setInteractive();
        
        const playSymbol = this.add.triangle(
            playButton.x + 5,
            playButton.y,
            0, -15, 20, 0, 0, 15,
            0xFFFFFF
        );
        
        // Add video title below with more space
        const videoTitle = this.add.text(
            0,
            videoFrame.height / 2 + 35,
            this.courseData.videoTitle,
            { fontSize: '18px', color: '#F8F8F2', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // Video metadata in a cleaner format
        const videoStats = this.add.text(
            0,
            videoTitle.y + 30,
            `${this.courseData.duration} • ${this.courseData.views} views • ${this.courseData.channel}`,
            { fontSize: '16px', color: '#6272A4' }
        ).setOrigin(0.5);
        
        // Cleaner YouTube link
        const linkText = this.add.text(
            0,
            videoStats.y + 30,
            'Watch on YouTube →',
            { fontSize: '16px', color: '#8BE9FD', fontStyle: 'bold' }
        ).setOrigin(0.5).setInteractive();
        
        videoContainer.add([videoFrame, thumbnail, playButton, playSymbol, videoTitle, videoStats, linkText]);
        
        // Add video interactions
        playButton.on('pointerdown', () => {
            this.openYouTubeLink();
        });
        
        linkText.on('pointerdown', () => {
            this.openYouTubeLink();
        });
    }
    
    private createTwoColumnLayout(overlay: Phaser.GameObjects.Rectangle, startY: number) {
        // Create cleaner two-column layout
        const columnWidth = overlay.width * 0.4;
        const leftColX = overlay.x - columnWidth / 2;
        const rightColX = overlay.x + columnWidth / 2;
        
        // Left column: Key concepts
        this.createConceptsColumn(100, 800, 500);
        
        // Right column: Resources
        // this.createResourcesColumn(100, 900, columnWidth);
        
        // Add progress bar at the bottom
        // this.createProgressBar(overlay, startY + 350);
    }
    
    private createConceptsColumn(x: number, y: number, width: number) {
        // Create a container for concepts
        const conceptsContainer = this.add.container(x, y);
        
        // Add section title
        const conceptsTitle = this.add.text(
            0, 0,
            'KEY CONCEPTS',
            { fontSize: '22px', color: '#50FA7B', fontStyle: 'bold' }
        );
        
        conceptsContainer.add(conceptsTitle);
        
        // Add concepts with better spacing
        let yOffset = 50;
        this.courseData.concepts.forEach((concept: string, index: number) => {
            const conceptText = this.add.text(
                0, yOffset,
                concept,
                { 
                    fontSize: '18px', 
                    color: '#F8F8F2', 
                    wordWrap: { width: width - 20 },
                    lineSpacing: 5
                }
            );
            
            conceptsContainer.add(conceptText);
            yOffset += conceptText.height + 25; // Better spacing between concepts
        });
        
        // Add fun fact in a nicer box
        const funFactBox = this.add.rectangle(
            width / 2, yOffset + 40,
            width,
            80,
            0x44475A
        ).setStrokeStyle(2, 0xFFB86C);
        
        const funFactTitle = this.add.text(
            width / 2, yOffset + 20,
            'FUN FACT',
            { fontSize: '16px', color: '#FFB86C', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        const funFactText = this.add.text(
            width / 2, yOffset + 50,
            this.courseData.funFact,
            { 
                fontSize: '16px', 
                color: '#F8F8F2', 
                wordWrap: { width: width - 40 },
                align: 'center'
            }
        ).setOrigin(0.5);
        
        conceptsContainer.add([funFactBox, funFactTitle, funFactText]);
    }
    
    private createResourcesColumn(x: number, y: number, width: number) {
        // Create a container for resources
        const resourcesContainer = this.add.container(x, y);
        
        // Add section title
        const resourcesTitle = this.add.text(
            0, 0,
            'ADDITIONAL RESOURCES',
            { fontSize: '22px', color: '#FF79C6', fontStyle: 'bold' }
        );
        
        resourcesContainer.add(resourcesTitle);
        
        // Create better-looking resource cards
        // this.createResourceCard(
        //     resourcesContainer,
        //     0, 70,
        //     width,
        //     'Practice Problems',
        //     `5 ${this.currentTopic} coding challenges`,
        //     'icon-practice',
        //     0x6272A4,
        //     'PracticeScene'
        // );
        
        // this.createResourceCard(
        //     resourcesContainer,
        //     0, 180,
        //     width,
        //     'Interactive Quiz',
        //     `Test your ${this.currentTopic} knowledge`,
        //     'icon-quiz',
        //     0x44475A,
        //     'QuizScene'
        // );
    }
    
    private createResourceCard(
        container: Phaser.GameObjects.Container,
        x: number, 
        y: number, 
        width: number,
        title: string, 
        description: string, 
        iconKey: string, 
        bgColor: number,
        targetScene: string
    ) {
        // Create a cleaner, more modern card
        const card = this.add.rectangle(
            x,
            y,
            width,
            80,
            bgColor
        ).setStrokeStyle(1, 0x8BE9FD).setInteractive();
        
        // Left side icon
        const iconCircle = this.add.circle(
            x - width / 2 + 40,
            y,
            25,
            0x50FA7B
        );
        
        // Title with better positioning
        const titleText = this.add.text(
            x - width / 2 + 80,
            y - 15,
            title,
            { fontSize: '18px', color: '#F8F8F2', fontStyle: 'bold' }
        ).setOrigin(0, 0.5);
        
        // Description with better alignment
        const descText = this.add.text(
            titleText.x,
            y + 15,
            description,
            { fontSize: '16px', color: '#8BE9FD' }
        ).setOrigin(0, 0.5);
        
        // Add arrow icon to indicate interactivity
        const arrowIcon = this.add.text(
            x + width / 2 - 30,
            y,
            '→',
            { fontSize: '24px', color: '#F8F8F2' }
        ).setOrigin(0.5);
        
        container.add([card, iconCircle, titleText, descText, arrowIcon]);
        
        // Make the entire card interactive
        card.on('pointerdown', () => {
            this.scene.start(targetScene, { topic: this.currentTopic });
        });
        
        // Add hover effect
        card.on('pointerover', () => {
            card.setStrokeStyle(2, 0x50FA7B);
            card.setFillStyle(bgColor + 0x111111);
        });
        
        card.on('pointerout', () => {
            card.setStrokeStyle(1, 0x8BE9FD);
            card.setFillStyle(bgColor);
        });
    }
    
    private createProgressBar(overlay: Phaser.GameObjects.Rectangle, y: number) {
        // Create a container for the progress bar
        const progressContainer = this.add.container(
            overlay.x,
            y
        );
        
        // Add progress label
        const progressLabel = this.add.text(
            -overlay.width * 0.2,
            0,
            'PROGRESS',
            { fontSize: '18px', color: '#8BE9FD', fontStyle: 'bold' }
        ).setOrigin(0, 0.5);
        
        // Create a cleaner progress bar
        const progressBox = this.add.rectangle(
            overlay.width * 0.05,
            0,
            overlay.width * 0.3,
            20,
            0x282A36
        ).setStrokeStyle(1, 0x6272A4);
        
        // Progress fill with smoother edges
        const progressPercent = this.getProgressForTopic(this.currentTopic);
        const progressFill = this.add.rectangle(
            progressBox.x - progressBox.width / 2 + 2,
            progressBox.y,
            Math.max(progressBox.width * (progressPercent / 100) - 4, 0),
            progressBox.height - 4,
            0xBD93F9
        ).setOrigin(0, 0.5);
        
        // Add percentage text
        const progressText = this.add.text(
            progressBox.x + progressBox.width / 2 + 20,
            progressBox.y,
            `${progressPercent}%`,
            { fontSize: '16px', color: '#F8F8F2', fontStyle: 'bold' }
        ).setOrigin(0, 0.5);
        
        progressContainer.add([progressLabel, progressBox, progressFill, progressText]);
    }
    
    private getProgressForTopic(topic: string): number {
        // Simulated progress data
        const progressData = {
            'bst': 65,
            'dynamic': 40,
            'graphs': 25,
            'sorting': 80,
            'default': 10
        };
        
        return progressData[topic] || 0;
    }
    
    private createNavigationButtons(overlay: Phaser.GameObjects.Rectangle) {
        // Create a container for cleaner button placement
        const buttonContainer = this.add.container(
            this.scale.width / 2,
            overlay.y + overlay.height / 2 - 60
        );
        
        // Button spacing
        const buttonSpacing = 20;
        const buttonWidth = 180;
        const smallButtonWidth = 140;
        
        // Primary button - Practice
        const practiceButton = this.add.rectangle(
            -buttonWidth / 2 - smallButtonWidth / 2 - buttonSpacing,
            0,
            buttonWidth,
            50,
            0x50FA7B,
            1
        ).setInteractive();
        
        const practiceText = this.add.text(
            practiceButton.x,
            practiceButton.y,
            'Practice Now',
            { fontSize: '18px', color: '#282A36', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // Secondary button - Quiz
        const quizButton = this.add.rectangle(
            0,
            0,
            smallButtonWidth,
            50,
            0x8BE9FD,
            1
        ).setInteractive();
        
        const quizText = this.add.text(
            quizButton.x,
            quizButton.y,
            'Quiz',
            { fontSize: '18px', color: '#282A36', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // Back button
        const backButton = this.add.rectangle(
            buttonWidth / 2 + smallButtonWidth / 2 + buttonSpacing,
            0,
            smallButtonWidth,
            50,
            0xFF5555,
            1
        ).setInteractive();
        
        const backText = this.add.text(
            backButton.x,
            backButton.y,
            'Back',
            { fontSize: '18px', color: '#F8F8F2', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        buttonContainer.add([
            practiceButton, practiceText,
            quizButton, quizText,
            backButton, backText
        ]);
        
        // Add button interactivity with hover effects
        this.addButtonInteractivity(practiceButton, practiceText, 'PracticeScene');
        this.addButtonInteractivity(quizButton, quizText, 'QuizScene');
        this.addButtonInteractivity(backButton, backText, 'WorldScene');
    }
    
    private addButtonInteractivity(
        button: Phaser.GameObjects.Rectangle,
        text: Phaser.GameObjects.Text,
        targetScene: string
    ) {
        const originalColor = button.fillColor;
        const hoverColor = originalColor + 0x111111;
        
        button.on('pointerover', () => {
            button.setFillStyle(hoverColor);
            text.setScale(1.05);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(originalColor);
            text.setScale(1);
        });
        
        button.on('pointerdown', () => {
            // Add a small animation effect
            this.tweens.add({
                targets: button,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
                ease: 'Power1',
                onComplete: () => {
                    if (targetScene === 'WorldScene') {
                        this.scene.start(targetScene);
                    } else {
                        this.scene.start(targetScene, { topic: this.currentTopic });
                    }
                }
            });
        });
    }
    
    private openYouTubeLink() {
        // Animation for clicking the video
        this.tweens.add({
            targets: this.children.list.filter(child => child instanceof Phaser.GameObjects.Rectangle),
            alpha: 0.7,
            duration: 100,
            yoyo: true,
            ease: 'Power1',
            onComplete: () => {
                console.log(`Opening YouTube URL: ${this.courseData.videoURL}`);
                // In a real implementation, this would open the YouTube video
                // window.open(this.courseData.videoURL, '_blank');
            }
        });
    }
}