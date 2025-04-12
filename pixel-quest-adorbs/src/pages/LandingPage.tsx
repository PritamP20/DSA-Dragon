import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CodeQuestLanding = () => {
  // State for animated background pixels
  const [pixels, setPixels] = useState([]);
  const navigate = useNavigate()

  const StyledJSX = ({ children }: { children: string }) => (
    <style dangerouslySetInnerHTML={{ __html: children }} />
  );
  
  // Generate random floating pixels
  useEffect(() => {
    const generatePixels = () => {
      const newPixels = [];
      const colors = ['#8a5cf6', '#ec4899', '#f97316', '#3b82f6', '#10b981'];
      
      for (let i = 0; i < 20; i++) {
        newPixels.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.floor(Math.random() * 16) + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: (Math.random() * 0.05) + 0.02,
          direction: Math.random() > 0.5 ? 1 : -1
        });
      }
      
      setPixels(newPixels);
    };
    
    generatePixels();
    
    // Cleanup
    return () => {
      setPixels([]);
    };
  }, []);
  
  // Animate pixels
  useEffect(() => {
    const interval = setInterval(() => {
      setPixels(prevPixels => 
        prevPixels.map(pixel => ({
          ...pixel,
          y: (pixel.y + pixel.speed) % 100,
          x: (pixel.x + (pixel.speed * pixel.direction * 0.5) + 100) % 100
        }))
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  // Grid animation
  const [gridOffset, setGridOffset] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGridOffset(prev => (prev + 1) % 40);
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white relative overflow-hidden">
      {/* Grid background */}
      <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #444 1px, transparent 1px),
            linear-gradient(to bottom, #444 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: `translate(${gridOffset}px, ${gridOffset}px)`
        }}
      />
      
      {/* Floating pixel elements */}
      {pixels.map(pixel => (
        <div
          key={pixel.id}
          className="absolute opacity-30"
          style={{
            top: `${pixel.y}%`,
            left: `${pixel.x}%`,
            width: `${pixel.size}px`,
            height: `${pixel.size}px`,
            backgroundColor: pixel.color,
            transition: 'transform 0.3s ease-out',
            transform: `rotate(${pixel.id * 45}deg)`
          }}
        />
      ))}
      
      {/* Main content container */}
      <div className="container mx-auto px-4 py-12 z-10 relative flex flex-col items-center">
        {/* Pixelated title with animation */}
        <div 
          className="mb-12 text-center relative"
          style={{
            animation: 'fadeInDown 1s ease-out',
          }}
        >
          <div className="relative mb-2">
            <h1 
              className="font-mono text-4xl md:text-7xl font-bold tracking-wide leading-none"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                letterSpacing: '-0.05em',
                textShadow: '4px 4px 0px rgba(0,0,0,0.5)',
                background: 'linear-gradient(to right, #c084fc 0%, #e879f9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              <div className="mb-4">Your</div>
              <div className="mb-4">AI Tutor</div>
              <div>Adventure</div>
            </h1>
            
            {/* Glitch effect overlay */}
            <div 
              className="absolute inset-0 opacity-0 hover:opacity-30"
              style={{
                textShadow: '2px 0 #ff00ea, -2px 0 #00c3ff',
                animation: 'glitch 2s infinite',
                pointerEvents: 'none'
              }}
            >
              <h1 
                className="font-mono text-4xl md:text-7xl font-bold tracking-wide leading-none"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  letterSpacing: '-0.05em'
                }}
              >
                <div className="mb-4">Your</div>
                <div className="mb-4">AI Tutor</div>
                <div>Adventure</div>
              </h1>
            </div>
          </div>
          
          <p 
            className="text-gray-300 text-lg md:text-xl tracking-wide max-w-xl mx-auto"
            style={{
              fontFamily: "'VT323', monospace",
              letterSpacing: '0.05em'
            }}
          >
            Embark on an epic journey through a world of code, challenges, and adventure!
          </p>
        </div>
        
        {/* CTA Button with animation */}
        <button onClick={e=>navigate("/")}
          className="group relative overflow-hidden font-mono text-xl font-bold py-4 px-10 mt-8 text-white 
                    transition duration-300 transform hover:scale-105 focus:outline-none"
          style={{
            backgroundColor: '#f97316',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '1rem',
            boxShadow: '0 4px 0 #c2410c',
            animation: 'fadeInUp 1s ease-out 0.5s both'
          }}
        >
          <span  className="flex items-center">
            <span className="mr-2">▶</span> Start Adventure
          </span>
          <div 
            className="absolute inset-0 w-0 bg-yellow-500 transition-all duration-300 opacity-50 group-hover:w-full"
            style={{ mixBlendMode: 'overlay' }}
          />
        </button>
        
        {/* Features grid with staggered animation */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
            { 
              title: "Code Dungeons", 
              desc: "Battle algorithmic beasts in our procedurally generated dungeons", 
              icon: "🗝️",
              delay: 0 
            },
            { 
              title: "Skill Trees", 
              desc: "Level up your coding powers with branching specialization paths", 
              icon: "🌳",
              delay: 200 
            },
            { 
              title: "Multiplayer Raids", 
              desc: "Team up with friends to solve complex programming challenges", 
              icon: "👥",
              delay: 400 
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border-2 border-purple-500 border-opacity-30 hover:border-opacity-70 transition-all duration-300"
              style={{
                animation: 'fadeInUp 0.6s ease-out',
                animationDelay: `${feature.delay}ms`,
                animationFillMode: 'both'
              }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 
                className="text-xl font-bold mb-3 text-purple-300"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1rem' }}
              >
                {feature.title}
              </h3>
              <p 
                className="text-gray-300"
                style={{ fontFamily: "'VT323', monospace", fontSize: '1.2rem' }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
        
        {/* Game world preview */}
        <div 
          className="mt-16 w-full max-w-4xl bg-gray-800 bg-opacity-30 p-6 rounded-lg border-2 border-blue-500 border-opacity-20"
          style={{
            animation: 'fadeIn 1s ease-out 0.6s both'
          }}
        >
          <h2 
            className="text-2xl font-bold mb-6 text-center text-blue-300"
            style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1.2rem' }}
          >
            Game World
          </h2>
          
          <div className="aspect-w-16 aspect-h-9 w-full bg-gray-900 relative rounded overflow-hidden">
            {/* Pixelated game world - using CSS grid for pixelated effect */}
            <div className="absolute inset-0 grid grid-cols-32 grid-rows-18 gap-0">
              {Array.from({ length: 576 }).map((_, index) => {
                // Create different colored tiles to simulate a game map
                const colors = [
                  'bg-purple-900', 'bg-purple-800', 
                  'bg-blue-900', 'bg-blue-800',
                  'bg-gray-800', 'bg-gray-900'
                ];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                const isPath = Math.random() > 0.85;
                return (
                  <div 
                    key={index} 
                    className={`${isPath ? 'bg-purple-700' : randomColor} border-opacity-20 ${isPath ? 'border-purple-600' : 'border-gray-900'} border`}
                  ></div>
                );
              })}
              
              {/* Character */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 animate-pulse">
                <div className="w-8 h-8 bg-yellow-500 relative">
                  <div className="absolute top-1 left-1 w-2 h-2 bg-black"></div>
                  <div className="absolute top-1 right-1 w-2 h-2 bg-black"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-1 bg-black"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div 
          className="w-full pt-16 text-center opacity-70 mt-16"
          style={{ animation: 'fadeIn 1s ease-out 0.8s both' }}
        >
          <p 
            className="text-sm text-gray-400"
            style={{ fontFamily: "'VT323', monospace", fontSize: '1rem' }}
          >
            © 2025 CodeQuest • Press [ENTER] to continue...
          </p>
        </div>
      </div>
      
      {/* CSS animations */}
      <StyledJSX>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        
        .grid-cols-32 {
          grid-template-columns: repeat(32, minmax(0, 1fr));
        }
        
        .grid-rows-18 {
          grid-template-rows: repeat(18, minmax(0, 1fr));
        }
      `}</StyledJSX>
    </div>
  );
};

export default CodeQuestLanding;