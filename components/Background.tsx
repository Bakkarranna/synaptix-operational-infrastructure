import React, { useRef, useEffect } from 'react';

interface BackgroundProps {
  theme: string;
}

const Background: React.FC<BackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // The animation now runs for both themes.
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Theme-aware color settings
    const isDarkMode = theme === 'dark';
    const particleColor = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.5)';
    const lineColorBase = isDarkMode ? '255, 255, 255' : '0, 0, 0';
    const lineOpacity = isDarkMode ? 0.3 : 0.15;
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
    const mouseLineColorBase = '255, 86, 48'; // Primary color is vibrant enough for both themes

    let animationFrameId: number;
    let particles: Particle[] = [];

    const mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      radius: 96,
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;

      constructor(x: number, y: number, size: number, speedX: number, speedY: number) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
      }

      update() {
        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

        this.x += this.speedX;
        this.y += this.speedY;
      }

      draw() {
        if(!ctx) return;
        ctx.fillStyle = particleColor; // Use theme-aware color
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      const numberOfParticles = (canvas.width * canvas.height) / 8180;
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 0.96 + 0.32;
        const x = Math.random() * (canvas.width - size * 2) + size;
        const y = Math.random() * (canvas.height - size * 2) + size;
        const speedX = (Math.random() - 0.5) * 0.3;
        const speedY = (Math.random() - 0.5) * 0.3;
        particles.push(new Particle(x, y, size, speedX, speedY));
      }
    };

    const connect = () => {
      if(!ctx) return;
      let opacityValue = 1;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const distance = Math.sqrt(
            (particles[a].x - particles[b].x) ** 2 + (particles[a].y - particles[b].y) ** 2
          );

          if (distance < 64) {
            opacityValue = 1 - distance / 64;
            ctx.strokeStyle = `rgba(${lineColorBase}, ${opacityValue * lineOpacity})`; // Use theme-aware color
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
      
      // Connect to mouse
      for(let i = 0; i < particles.length; i++) {
        const distance = Math.sqrt(
            (particles[i].x - mouse.x) ** 2 + (particles[i].y - mouse.y) ** 2
        );
        if(distance < mouse.radius){
             opacityValue = 1 - distance / mouse.radius;
             ctx.strokeStyle = `rgba(${mouseLineColorBase}, ${opacityValue * 0.8})`; // Use theme-aware color
             ctx.lineWidth = 1;
             ctx.beginPath();
             ctx.moveTo(particles[i].x, particles[i].y);
             ctx.lineTo(mouse.x, mouse.y);
             ctx.stroke();
        }
      }
    };
    
    const drawGrid = () => {
        if(!ctx) return;
        ctx.strokeStyle = gridColor; // Use theme-aware color
        ctx.lineWidth = 0.5;
        const gridSize = 9.6;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw layers
      drawGrid();
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      connect();

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      mouse.radius = 96;
      init();
    };

    window.addEventListener('resize', handleResize);
    
    handleResize(); // Initial setup
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]); // Rerun effect when theme changes

  const backgroundStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 0,
    background: theme === 'dark'
      ? `
        radial-gradient(circle at top left, rgba(255, 86, 48, 0.15), transparent 40%),
        radial-gradient(circle at top right, rgba(255, 86, 48, 0.15), transparent 40%),
        radial-gradient(circle at bottom left, rgba(255, 86, 48, 0.15), transparent 40%),
        radial-gradient(circle at bottom right, rgba(255, 86, 48, 0.15), transparent 40%),
        #000000
      `.replace(/\s+/g, ' ')
      : `
        radial-gradient(circle at top left, rgba(255, 86, 48, 0.16), transparent 40%),
        radial-gradient(circle at top right, rgba(255, 86, 48, 0.16), transparent 40%),
        radial-gradient(circle at bottom left, rgba(255, 86, 48, 0.16), transparent 40%),
        radial-gradient(circle at bottom right, rgba(255, 86, 48, 0.16), transparent 40%),
        #F9FAFB
      `.replace(/\s+/g, ' '),
  } as React.CSSProperties;

  return <canvas ref={canvasRef} style={backgroundStyle} />;
};

export default Background;