import { useState, useEffect, useRef } from 'react';

const MetaballsBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    // Create metaballs
    const metaballs = [];
    const metaballCount = 6;
    const metaballColors = [
      'rgba(120, 81, 169, 0.8)', // Purple
      'rgba(56, 189, 248, 0.8)',  // Cyan
      'rgba(168, 85, 247, 0.8)',  // Purple-600
      'rgba(22, 163, 74, 0.8)',   // Green
      'rgba(236, 72, 153, 0.8)',  // Pink
      'rgba(37, 99, 235, 0.8)',   // Blue
    ];
    
    for (let i = 0; i < metaballCount; i++) {
      metaballs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        r: Math.random() * 40 + 20,
        color: metaballColors[i % metaballColors.length]
      });
    }
    
    // Animation loop
    const animate = () => {
      // Clear canvas with slight fade for trails
      ctx.fillStyle = 'rgba(24, 24, 27, 0.02)'; // Zinc-900 with low opacity
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw metaballs
      for (const ball of metaballs) {
        // Update position
        ball.x += ball.vx;
        ball.y += ball.vy;
        
        // Bounce off walls
        if (ball.x < 0 || ball.x > canvas.width) ball.vx *= -1;
        if (ball.y < 0 || ball.y > canvas.height) ball.vy *= -1;
        
        // Draw metaball
        const gradient = ctx.createRadialGradient(
          ball.x, ball.y, 0,
          ball.x, ball.y, ball.r
        );
        
        gradient.addColorStop(0, ball.color);
        gradient.addColorStop(1, 'rgba(24, 24, 27, 0)');
        
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full opacity-30"
      style={{ filter: 'blur(20px)' }}
    />
  );
};

export default MetaballsBackground;