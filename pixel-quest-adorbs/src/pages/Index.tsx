import React, { useRef, useState, useEffect } from 'react';
import GameCanvas from '@/components/GameCanvas';
import Leetcode from '@/components/Leetcode';

const Index = () => {
  const gameSectionRef = useRef(null);
  const [w, setW] = useState(700);
  const [h, setH] = useState(600);
  const [q, setQ] = useState("Nothing")
  const [activeFocus, setActiveFocus] = useState('game'); // 'game' or 'leetcode'
  
  const gameRef = useRef(null);
  const leetcodeRef = useRef(null);

  // Handle focus changes when clicking on components
  const handleGameFocus = () => {
    document.getElementById("game").focus()
    setActiveFocus('game');
  };
  
  const handleLeetcodeFocus = () => {
    document.getElementById("leetcode").focus()
    setActiveFocus('leetcode');
  };


  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle focus when Tab is pressed
      if (e.key === 'Tab') {
        e.preventDefault(); // Prevent the default tab behavior
        setActiveFocus(prevFocus => prevFocus === 'game' ? 'leetcode' : 'game');
        
        // Focus the appropriate DOM element
        if (activeFocus === 'leetcode') {
          document.getElementById("game").focus();
        } else {
          document.getElementById("leetcode").focus();
        }
        return;
      }


      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault(); // Prevent scrolling the page
        
        if (activeFocus === 'game' && gameRef.current) {
          // You need to implement a method in your GameCanvas component to handle these keys
          // For example:
          gameRef.current.handleKeyDown(e);
        } else if (activeFocus === 'leetcode' && leetcodeRef.current) {
          leetcodeRef.current.handleKeyDown(e);
        }
      }
      
      // Handle other keys as needed
      if (e.key === ' ' && activeFocus === 'game' && gameRef.current) {
        e.preventDefault();
        // Handle space key for game
        gameRef.current.handleSpaceKey();
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeFocus]);

  const handleFullScreen = () => {
    if (gameSectionRef.current) {
      if (gameSectionRef.current.requestFullscreen) {
        gameSectionRef.current.requestFullscreen();
      } else if (gameSectionRef.current.mozRequestFullScreen) {
        gameSectionRef.current.mozRequestFullScreen(); // Firefox
      } else if (gameSectionRef.current.webkitRequestFullscreen) {
        gameSectionRef.current.webkitRequestFullscreen(); // Chrome, Safari, Opera
      } else if (gameSectionRef.current.msRequestFullscreen) {
        gameSectionRef.current.msRequestFullscreen(); // IE/Edge
      }
    }
    setW(window.innerWidth/2);
    setH(window.innerHeight);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="w-full bg-white shadow-sm py-4 px-6 mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="font-pixel text-xl text-primary animate-slide-down">
            Pixel Quest
          </h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a href="#game" className="font-pixel text-sm text-slate-600 hover:text-primary transition-colors">
                  Play
                </a>
              </li>
              <li>
                <a href="#about" className="font-pixel text-sm text-slate-600 hover:text-primary transition-colors">
                  About
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        <section id="hero" className="mb-16 text-center">
          <h2 className="font-pixel text-4xl text-primary mb-6 animate-slide-down">
            Begin Your Adventure
          </h2>
          <p className="max-w-2xl mx-auto text-slate-600 mb-8 animate-slide-up">
            Explore a vibrant pixel world inspired by classic Pokémon games. Navigate through towns, 
            interact with characters, and discover hidden secrets in this nostalgic adventure.
          </p>
          <a 
            href="#game" 
            className="inline-block bg-primary text-white font-pixel text-sm py-3 px-8 rounded-md hover:bg-primary/90 transition-colors animate-fade-in"
          >
            Start Playing
          </a>
        </section>

        <button
            onClick={handleFullScreen}
            className="mb-4 px-4 py-2 bg-blue-500 text-white font-pixel text-sm rounded-md hover:bg-blue-700 transition"
          >
            Full Screen
          </button>
        {/* Fullscreen Game Section */}
        <section
          ref={gameSectionRef}
          id="game"
          className="mb-16 scroll-mt-8 flex flex-col items-center justify-center"
        >
          
          <div className="flex w-full max-w-4xl justify-center items-center gap-0">
            <div id="game" className="flex-1 flex justify-center" onClick={handleGameFocus}>
              <GameCanvas ref={gameRef} w={w} h={w} setQ={setQ} isFocused={activeFocus=="game"}/>
            </div>
            <div id="leetcode" className="flex-1 flex justify-center border bg-black text-white border-black" onClick={handleLeetcodeFocus}>
              <Leetcode ref={leetcodeRef} w={w} h={w} q={q} isFocused={activeFocus=="leetcode"}/>

            </div>
          </div>
        </section>
        {/* <section className='mb-16 scroll-mt-8 flex flex-col items-center justify-center'>
      <div className="flex w-full max-w-4xl justify-center items-center gap-0">
        <div 
          className={`flex-1 flex justify-center ${activeFocus === 'game' ? 'outline outline-2 outline-blue-500' : ''}`}
          onClick={handleGameFocus}
        >
          <GameCanvas ref={gameRef} w={w} h={w} setQ={setQ} isFocused={activeFocus === 'game'} />
        </div>
        <div 
          className={`flex-1 flex justify-center border bg-black text-white border-black ${activeFocus === 'leetcode' ? 'outline outline-2 outline-blue-500' : ''}`}
          onClick={handleLeetcodeFocus}
        >
          <Leetcode ref={leetcodeRef} w={w} h={w} q={q} isFocused={activeFocus === 'leetcode'} />
        </div>
      </div>
    </section> */}


        <section id="about" className="mb-16 scroll-mt-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-pixel text-2xl text-primary mb-6 text-center animate-fade-in">
              About Pixel Quest
            </h2>
            <div className="bg-white shadow-sm rounded-lg p-6 animate-fade-in">
              <p className="text-slate-600 mb-4">
                Pixel Quest is a homage to the classic 2D Pokémon games that captivated players worldwide. 
                Built with Phaser and React, this game combines modern web technologies with retro pixel art aesthetics.
              </p>
              <p className="text-slate-600 mb-4">
                In this demo, you can explore a small town environment, interact with NPCs, and discover the charming 
                pixel world. The game features smooth animations, character movement, and interactive elements.
              </p>
              <p className="text-slate-600">
                Use the arrow keys to move your character around the map and press the space bar to interact with 
                objects and characters. Enjoy your adventure in Pixel Quest!
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-white shadow-inner py-6 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-pixel text-xs text-slate-500">
            Pixel Quest © 2023 • Made with Phaser, React & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
