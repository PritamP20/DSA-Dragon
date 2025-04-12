import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { toast } from 'sonner';

// Import scenes dynamically
const loadScenes = async () => {
  const { BootScene } = await import('@/game/scenes/BootScene');
  const { PreloadScene } = await import('@/game/scenes/PreloadScene');
  const { WorldScene } = await import('@/game/scenes/WorldScene');
  const { LeetCodeQuestScene } = await import('@/game/scenes/LeetCodeQuestScene');
  const {DSABattleScene}:any = await import('@/game/scenes/BossScene');
  const {LearningScene} = await import('@/game/scenes/LearningScene');
  const { UIScene } = await import('@/game/scenes/UIScene');
  const {NFTScene} = await import('@/game/scenes/NFTScene');
  return [BootScene, PreloadScene, WorldScene, UIScene, LeetCodeQuestScene, LearningScene, DSABattleScene, NFTScene];
};

interface PhaserGameProps {
  w?: number;
  h?: number;
  setQ?: any;
  ref?: any;
  isFocused?: boolean;
  setTestCases?:any
}

const PhaserGame: React.FC<PhaserGameProps> = ({ ref,w = 800, h = 600, setQ, isFocused, setTestCases }) => {
  const gameRef = useRef<HTMLDivElement | null>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let game: Phaser.Game;

    const initGame = async () => {
      if(!isFocused) return;
      if (!gameRef.current || gameInstance.current) return;

      try {
        const scenes = await loadScenes();

        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          parent: gameRef.current,
          pixelArt: true,
          width: w, // Set width dynamically
          height: h, // Set height dynamically
          physics: {
            default: 'arcade',
            arcade: { gravity: { x: 0, y: 0 }, debug: false },
          },
          scene: scenes,
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: w, // Ensure Phaser knows the correct width
            height: h, // Ensure Phaser knows the correct height
          },
          dom: {
            createContainer: true
        },
          render: { antialias: false, pixelArt: true, roundPixels: true },
        };

        game = new Phaser.Game(config);
        gameInstance.current = game;
        game.registry.set('setQ', setQ);
        game.registry.set('setTestcases', setTestCases)
      } catch (error) {
        console.error('Failed to load Phaser:', error);
        toast.error('Failed to load the game engine. Please try again.');
      }
    };

    initGame();

    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, [w, h]); // Ensure effect re-runs when w or h changes

  return <div ref={gameRef} id="phaser-game" style={{ width: `${w}px`, height: `${h}px` }} />;
};

export default PhaserGame;
