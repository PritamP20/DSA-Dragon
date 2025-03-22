import {generateCourseData} from "../../components/api/courseDataApi.js";

const map_video = {  
    'Array': [
      "https://www.youtube.com/watch?v=TQMvBTKn2p0", 
      "https://www.youtube.com/watch?v=8wmn7k1TTcI", 
      "https://www.youtube.com/watch?v=3_x_Fb31NLE"
    ],  
    'Linked List': [
      "https://www.youtube.com/watch?v=dqLHTK7RuIo", 
      "https://www.youtube.com/watch?v=N6dOwBde7-M", 
      "https://www.youtube.com/watch?v=LyuuqCVkP5I"
    ],  
    'Binary Search Trees': [
      "https://www.youtube.com/watch?v=EPwWrs8OtfI", 
      "https://www.youtube.com/watch?v=pYT9F8_LFTM", 
      "https://www.youtube.com/watch?v=cySVml6e_Fc"
    ]  
  };
export class LearningScene extends Phaser.Scene {
    private backgroundImage!: Phaser.GameObjects.Image;
    private mapScale: number = 0.7;
    private currentTopic: string = '';
    private courseData: any = {};
    private loadingText:any="fetching from ai"
    
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

    // create() {
    //     this.createDynamicLearningScene();
    //     // Set world bounds larger than the screen
    //     this.cameras.main.setBounds(0, 0, 800, 2000); // Adjust height for scrolling

    //     // Enable dragging to scroll
    //     this.input.on("pointermove", (pointer) => {
    //     if (pointer.isDown) {
    //         this.cameras.main.scrollY -= (pointer.velocity.y * 0.5);
    //     }
    //     });

    //     // Optional: Add mouse wheel scroll
    //     this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
    //     this.cameras.main.scrollY += deltaY * 0.5; // Adjust scroll speed
    //     });

    //     // Set world bounds larger than the screen
    // this.cameras.main.setBounds(0, 0, 800, 2000); // Adjust height for scrolling

    // // Enable dragging to scroll
    // this.input.on("pointermove", (pointer) => {
    //     if (pointer.isDown) {
    //         this.cameras.main.scrollY -= (pointer.velocity.y * 0.5);
    //     }
    // });

    // // Mouse wheel scroll
    // this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
    //     this.cameras.main.scrollY += deltaY * 0.5; // Adjust scroll speed
    // });

    // // // Create the YouTube iframe element
    // // const video = document.createElement("iframe");
    // // video.src = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"; // Replace 
    // // video.width = "560";
    // // video.height = "315";
    // // video.allow = "autoplay; encrypted-media"; 
    // // video.frameBorder = "0";
    // // video.style.position = "absolute";
    
    // // // Add the video element to the Phaser scene
    // // const videoElement = this.add.dom(this.scale.width / 2, this.scale.height/2 -50, video);

    // // // Handle fullscreen mode
    // // this.scale.on('resize', (gameSize: { width: number, height: number }) => {
    // //     videoElement.setPosition(gameSize.width / 2, gameSize.height / 2);
    // //     video.width = `${gameSize.width * 0.5}`;
    // //     video.height = `${gameSize.height * 0.3}`;
    // // });

    // // this.createVideoPlayer();

    // this.events.once('courseDataLoaded', () => {
    //     // Create the UI with course data
    //     this.createCourseContentUI();
    //     // Create the video player
    //     this.createVideoPlayer();
    // });


    // }

    create() {
        // Set up the camera and world bounds first
        this.createSceneSetup(); // Just camera and bounds
        
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
        
        // Create the initial UI that doesn't depend on course data
        this.createBackgroundUI();
        
        // Listen for when course data is loaded
        this.events.once('courseDataLoaded', () => {
            // Create the UI with course data
            this.createCourseContentUI();
            // Create the video player
            this.createVideoPlayer();
            // Now create the content that depends on course data
            this.createDynamicLearningScene()
        });
    }
    
    private createSceneSetup() {
        // Just camera and world setup
        this.cameras.main.setBounds(0, 0, 800, 2000);
    }
    private createBackgroundUI() {
        // Create a background container0xeef6ff 
        const background = this.add.rectangle(0, 0, 800, 2000, 0x000000).setOrigin(0)
        
        // Add loading indicator if needed
        const loadingText = this.add.text(400, 200, 'Loading course content...', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFFFF' // Changed from #000000 to #FFFFFF
        }).setOrigin(0.5);
        
        // Store reference to remove later
        this.loadingText = loadingText;
        
        // Add back button to return to world map
        const backButton = this.add.image(50, 30, 'icon-back').setScale(0.6).setInteractive();
        backButton.on('pointerdown', () => {
            this.scene.start('WorldScene'); // Return to world map
        });
    }

    private createCourseContentUI() {
        // Remove loading text if exists
        if (this.loadingText) {
            this.loadingText.destroy();
        }
        
        // Add course title and subtitle
        this.add.text(400, 50, this.courseData.title || 'Learning Topic', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        
        this.add.text(400, 90, this.courseData.subtitle || 'Expand your knowledge', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#666666'
        }).setOrigin(0.5, 0);
        
        // Video information
        this.add.text(400, 380, this.courseData.videoTitle || 'Educational Video', {
            fontFamily: 'Arial', 
            fontSize: '20px',
            color: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        
        // Key concepts section
        this.add.text(50, 450, 'Key Concepts:', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#333333',
            fontStyle: 'bold'
        });
        
        // Add concept points
        if (this.courseData.concepts && Array.isArray(this.courseData.concepts)) {
            this.courseData.concepts.forEach((concept, index) => {
                this.add.text(70, 490 + (index * 40), concept, {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    color: '#444444',
                    wordWrap: { width: 700 }
                });
            });
        }
        
        // Fun fact section
        const funFactY = 490 + ((this.courseData.concepts?.length || 0) * 40) + 30;
        this.add.text(50, funFactY, 'Did You Know?', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#333333',
            fontStyle: 'bold'
        });
        
        this.add.text(70, funFactY + 40, this.courseData.funFact || 'Algorithms are everywhere!', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#444444',
            fontStyle: 'italic',
            wordWrap: { width: 700 }
        });
        
        // XP Reward display
        const xpIcon = this.add.image(70, funFactY + 100, 'icon-xp').setScale(0.5);
        this.add.text(100, funFactY + 100, `${this.courseData.xpReward || 30} XP`, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFA500',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        if(this.loadingText){
            this.loadingText.destroy()
            this.loadingText = null
        }
    }
private async loadCourseData() {
    try {
        let courseDataJson = await generateCourseData(this.currentTopic);
        console.log("Raw response:", courseDataJson);
        
        // Strip out markdown code blocks if present
        if (courseDataJson.includes("```")) {
            courseDataJson = courseDataJson.replace(/```json\s*/g, "");
            courseDataJson = courseDataJson.replace(/```\s*/g, "");
        }
        
        // Parse the JSON response
        this.courseData = JSON.parse(courseDataJson);
        console.log("Parsed data:", this.courseData);
        
        // Emit an event to notify that course data is loaded
        this.events.emit('courseDataLoaded');
        
    } catch (error) {
        console.error(`Error loading course data: ${error}`);
        // Set default fallback data
        this.courseData = this.getDefaultCourseData();
        this.events.emit('courseDataLoaded');
    }
}

// private createVideoPlayer() {
//     // Create the YouTube iframe element
//     const video = document.createElement("iframe");
//     video.width = "560";
//     video.height = "315";
//     video.allow = "autoplay; encrypted-media";
//     video.frameBorder = "0";
//     video.style.position = "absolute";

//     console.log(this.courseData.videoURL)
    
//     // Set the correct video URL from course data
//     if (this.courseData && this.courseData.videoURL) {
//         // Convert regular YouTube URL to embed URL if needed
//         let embedURL = this.courseData.videoURL;
//         if (embedURL.includes('watch?v=')) {
//             const videoId = embedURL.split('v=')[1].split('&')[0];
//             // embedURL = `https://www.youtube.com/embed/${this.courseData.videoURL}`;
//             embedURL = this.courseData.videoURL;
//         }
//         video.src = embedURL;
//     } else {
//         console.error("No video URL found for topic:", this.currentTopic);
//         // Use a default URL if needed
//         video.src = "https://youtu.be/cySVml6e_Fc?si=gR-oTnJTQNkbrtks";
//     }
    
//     // Append to the DOM using Phaser's add.dom
//     const videoElement = this.add.dom(this.scale.width / 2, this.scale.height / 2 - 50, video);
    
//     // Handle fullscreen mode
//     this.scale.on('resize', (gameSize: { width: number, height: number }) => {
//         videoElement.setPosition(gameSize.width / 2, gameSize.height / 2);
//         video.width = `${gameSize.width * 0.5}`;
//         video.height = `${gameSize.height * 0.3}`;
//     });
// }


private createVideoPlayer() {
    // Create the YouTube iframe element
    const video = document.createElement("iframe");
    
    // Calculate appropriate dimensions based on the container
    // The green box appears to be your intended container
    const containerWidth = this.scale.width * 0.7; // 70% of game width
    const containerHeight = this.scale.height * 0.45; // 45% of game height
    
    video.width = containerWidth.toString();
    video.height = containerHeight.toString();
    video.allow = "autoplay; encrypted-media";
    video.frameBorder = "0";
    video.style.position = "absolute";
    video.allowFullscreen = true;

    // Set the video source as before
    if (this.courseData && this.courseData.videoURL) {
        let videoId: string | null = null;
        
        if (this.courseData.videoURL.includes('watch?v=')) {
            videoId = this.courseData.videoURL.split('v=')[1]?.split('&')[0];
        } else if (this.courseData.videoURL.includes('youtu.be/')) {
            videoId = this.courseData.videoURL.split('youtu.be/')[1]?.split('?')[0];
        }
        
        if (videoId) {
            video.src = `https://www.youtube.com/embed/${videoId}`;
        } else {
            console.error("Invalid video URL format");
            video.src = "https://www.youtube.com/embed/cySVml6e_Fc";
        }
    } else {
        console.error("No video URL found for topic:", this.currentTopic);
        video.src = "https://www.youtube.com/embed/cySVml6e_Fc";
    }
    
    // Position slightly higher within the green container area
    // Adjust these values based on your UI
    const posX = this.scale.width / 2;
    const posY = this.scale.height * 0.45; // Positioned higher in the screen
    
    const videoElement = this.add.dom(posX, posY, video);
    
    // Add resize handler
    this.scale.on('resize', (gameSize: { width: number, height: number }) => {
        // Update position
        videoElement.setPosition(gameSize.width / 2, gameSize.height * 0.45);
        
        // Update size proportionally
        const newWidth = gameSize.width * 0.7;
        const newHeight = gameSize.height * 0.45;
        video.width = newWidth.toString();
        video.height = newHeight.toString();
    });
    
    // Add a method to destroy the video when transitioning away
    return videoElement; // Return element so you can destroy it later
}


// Add a default data method in case API fails
private getDefaultCourseData() {
    return {
        title: 'Algorithm Basics',
        subtitle: 'Start your algorithm journey',
        videoTitle: 'Introduction to Algorithms and Data Structures',
        videoURL: 'https://www.youtube.com/watch?v=kHi1DUhp9kM',
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
    };
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