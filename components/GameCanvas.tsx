import React, { useRef, useEffect, useCallback } from 'react';
import { getLevel, CANVAS_CONFIG } from '../constants';
import { GameStatus, Particle, Building, Player, Entity, LevelData } from '../types';

interface GameCanvasProps {
  status: GameStatus;
  currentLevelIndex: number;
  onScoreUpdate: (score: number, coins: number, progress: number) => void;
  onGameOver: () => void;
  onLevelComplete: () => void;
  setPowerUpMessage: (msg: string | null) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  status,
  currentLevelIndex,
  onScoreUpdate,
  onGameOver,
  onLevelComplete,
  setPowerUpMessage
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game State Refs (Mutable, no re-renders)
  const gameState = useRef({
    active: false,
    levelIdx: 1,
    score: 0,
    coins: 0,
    speed: 6,
    frames: 0,
    bgOffset: 0,
  });

  const playerRef = useRef<Player>({
    x: CANVAS_CONFIG.PLAYER_X, y: 0, w: 40, h: 80, dy: 0, jumpForce: -16, gravity: 0.8, grounded: false, shield: false
  });

  const entitiesRef = useRef<{
    particles: Particle[];
    buildings: Building[];
    obstacles: Entity[];
    items: Entity[];
  }>({
    particles: [],
    buildings: [],
    obstacles: [],
    items: []
  });

  // --- Logic Helpers ---

  const spawnExplosion = (x: number, y: number, color: string) => {
    for(let i=0; i<15; i++) {
      entitiesRef.current.particles.push({
        x, y, color, type: 'explosion',
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 5,
        speedY: (Math.random() - 0.5) * 5,
        life: 1.0
      });
    }
  };

  const initBackground = () => {
    const b: Building[] = [];
    for(let i=0; i<20; i++) {
      b.push({
        x: i * 100, 
        w: 50 + Math.random() * 80, 
        h: 100 + Math.random() * 300,
        color: Math.random() > 0.5 ? '#111' : '#1a1a1a', 
        lights: Math.random() > 0.3
      });
    }
    entitiesRef.current.buildings = b;
  };

  const resetGame = useCallback((levelIdx: number) => {
    const levelData = getLevel(levelIdx);
    gameState.current = {
      active: true,
      levelIdx: levelIdx,
      score: 0,
      coins: 0, // In a real app, coins might persist, but resetting for this arcade style
      speed: levelData.speed,
      frames: 0,
      bgOffset: 0
    };
    
    playerRef.current = {
      x: CANVAS_CONFIG.PLAYER_X, y: 0, w: 40, h: 80, dy: 0, jumpForce: -16, gravity: 0.8, grounded: false, shield: false
    };

    entitiesRef.current = {
      particles: [],
      buildings: [],
      obstacles: [],
      items: []
    };
    
    initBackground();
    onScoreUpdate(0, 0, 0);
    setPowerUpMessage(null);
  }, [onScoreUpdate, setPowerUpMessage]);

  // --- Render Loop ---

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If game isn't active (paused or menu), just render one frame or stop?
    // For this implementation, we only run the loop if status is PLAYING
    if (status !== GameStatus.PLAYING) return;

    const levelData: LevelData = getLevel(gameState.current.levelIdx);
    const { width, height } = canvas;
    const groundY = height - CANVAS_CONFIG.GROUND_OFFSET;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, levelData.sky[0]); 
    grad.addColorStop(1, levelData.sky[1]);
    ctx.fillStyle = grad; 
    ctx.fillRect(0,0, width, height);

    // Buildings
    ctx.save();
    gameState.current.bgOffset -= gameState.current.speed * 0.1;
    if(gameState.current.bgOffset < -1000) gameState.current.bgOffset = 0;
    
    entitiesRef.current.buildings.forEach(b => {
      let renderX = (b.x + gameState.current.bgOffset) % (width + 200);
      if(renderX < -100) renderX += width + 200;
      
      ctx.fillStyle = b.color; 
      ctx.fillRect(renderX, height - 100 - b.h, b.w, b.h);
      
      if(b.lights) {
        ctx.fillStyle = levelData.grid;
        for(let j=0; j<b.h; j+=40) {
          if(Math.random()>0.5) ctx.fillRect(renderX+10, height-100-b.h+j, 5, 5);
        }
      }
    });
    ctx.restore();

    // Grid Floor
    ctx.save();
    ctx.shadowBlur = 20; 
    ctx.shadowColor = levelData.grid; 
    ctx.strokeStyle = levelData.grid; 
    ctx.lineWidth = 2;
    
    ctx.beginPath(); 
    ctx.moveTo(0, groundY); 
    ctx.lineTo(width, groundY); 
    ctx.stroke();
    
    ctx.globalAlpha = 0.3; 
    ctx.fillStyle = '#000'; 
    ctx.fillRect(0, groundY, width, 100);
    
    ctx.beginPath();
    let gridMove = (gameState.current.frames * gameState.current.speed) % 50;
    for(let x = -gridMove; x < width; x += 50) {
      ctx.moveTo(x + 50, groundY); 
      ctx.lineTo(x - 50, height); 
    }
    ctx.stroke();
    ctx.restore();

    // 2. Spawners
    // Obstacles
    if(gameState.current.frames % Math.floor(1000/gameState.current.speed) === 0) {
       const types = ['drone', 'glitch_block', 'hover_car'];
       const type = types[Math.floor(Math.random()*3)];
       let obsY = groundY - 60;
       let obsW = 100;
       let obsH = 40;
       let color = '#ff9f43';

       if(type === 'drone') { 
         obsY = groundY - 80 - Math.random() * 50; 
         obsW = 50; 
         obsH = 30; 
         color = '#ff0000'; 
       } else if (type === 'glitch_block') { 
         obsY = groundY - 50; 
         obsW = 40; 
         obsH = 50; 
         color = '#fff'; 
       }

       entitiesRef.current.obstacles.push({
         type, 
         x: width, 
         y: obsY, 
         w: obsW, 
         h: obsH, 
         color,
         marked: false
       });
    }

    // Items
    if(gameState.current.frames % 60 === 0 && Math.random() > 0.4) {
      entitiesRef.current.items.push({
        type: Math.random() > 0.9 ? 'shield' : 'coin',
        x: width,
        y: groundY - (40 + Math.random()*80),
        w: 30, 
        h: 30,
        marked: false,
        angle: 0
      });
    }

    // 3. Player Logic
    const p = playerRef.current;
    p.dy += p.gravity;
    p.y += p.dy;
    
    const playerGround = groundY - p.h;
    if(p.y > playerGround) {
      p.y = playerGround; 
      p.dy = 0; 
      p.grounded = true;
      if(gameState.current.frames % 5 === 0) {
        entitiesRef.current.particles.push({
          x: p.x, y: p.y + p.h, color: '#00d2d3', type: 'dust',
          size: Math.random() * 3 + 1, speedX: -gameState.current.speed, speedY: Math.random() * -1, life: 1.0
        });
      }
    } else { 
      p.grounded = false; 
    }

    // Draw Player
    const bob = p.grounded ? Math.sin(gameState.current.frames * 0.3) * 5 : 0;
    ctx.save(); 
    ctx.translate(p.x, p.y + bob);
    
    if(p.shield) {
        ctx.shadowBlur = 20; ctx.shadowColor = '#00d2d3';
        ctx.strokeStyle = `rgba(0, 210, 211, ${0.5 + Math.sin(gameState.current.frames*0.2)*0.5})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(20, 40, 60, 0, Math.PI*2); ctx.stroke(); ctx.shadowBlur = 0;
    }
    
    // Cyberpunk Character Drawing
    ctx.fillStyle = 'rgba(255, 0, 222, 0.2)'; ctx.fillRect(-20, 10, 20, 60); // Trail
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, p.w, p.h); // Body
    ctx.shadowBlur = 10; ctx.shadowColor = '#ff00de'; ctx.fillStyle = '#ff00de';
    ctx.fillRect(5, 20, 5, 40); ctx.fillRect(30, 20, 5, 40); // Neon stripes
    ctx.shadowBlur = 0; ctx.fillStyle = '#ffccaa'; ctx.fillRect(5, -15, 30, 30); // Head
    ctx.fillStyle = '#6c5ce7'; ctx.fillRect(0, -20, 40, 15); ctx.fillRect(-10, -15, 15, 40); // Hair
    ctx.shadowBlur = 15; ctx.shadowColor = '#00d2d3'; ctx.fillStyle = '#00d2d3'; ctx.fillRect(10, -10, 25, 8); // Visor
    
    ctx.restore();

    // 4. Entity Loop
    // Obstacles
    entitiesRef.current.obstacles.forEach((obs, i) => {
      obs.x -= gameState.current.speed;
      if(obs.type === 'drone') obs.y += Math.sin(gameState.current.frames * 0.1) * 2;
      
      // Collision
      if(p.x < obs.x + obs.w && p.x + p.w - 15 > obs.x &&
         p.y < obs.y + obs.h && p.y + p.h > obs.y + 15) {
          if(p.shield) {
             p.shield = false; 
             obs.marked = true; 
             setPowerUpMessage("SHIELD BROKEN"); 
             setTimeout(() => setPowerUpMessage(null), 1500);
             spawnExplosion(obs.x, obs.y, '#00d2d3');
          } else {
             spawnExplosion(p.x, p.y, '#ff00de');
             gameState.current.active = false;
             onGameOver();
          }
      }

      if(obs.x + obs.w < 0) obs.marked = true;

      // Draw Obstacle
      if (!obs.marked) {
          ctx.save(); 
          ctx.shadowBlur = 15; 
          ctx.shadowColor = obs.color || '#fff'; 
          ctx.fillStyle = obs.color || '#fff';
          
          if(obs.type === 'drone') {
              ctx.fillRect(obs.x, obs.y, obs.w, obs.h); 
              ctx.fillStyle = '#000'; ctx.fillRect(obs.x+15, obs.y+5, 20, 20);
          } else if (obs.type === 'glitch_block') {
              if(Math.random() > 0.8) ctx.fillStyle = '#ff00de';
              ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          } else {
              ctx.beginPath(); 
              ctx.moveTo(obs.x, obs.y+20); ctx.lineTo(obs.x+20, obs.y); ctx.lineTo(obs.x+80, obs.y);
              ctx.lineTo(obs.x+100, obs.y+20); ctx.lineTo(obs.x+90, obs.y+40); ctx.lineTo(obs.x+10, obs.y+40); 
              ctx.fill();
              ctx.fillStyle = '#00d2d3'; ctx.fillRect(obs.x+10, obs.y+40, 80, 5);
          }
          ctx.restore();
      }
    });

    // Items
    entitiesRef.current.items.forEach((item, i) => {
       // Magnet effect for coins?
       item.x -= gameState.current.speed;
       if(item.x < -50) item.marked = true;

       // Collision
       let dx = (p.x+20) - (item.x+15); 
       let dy = (p.y+40) - (item.y+15);
       if(Math.sqrt(dx*dx + dy*dy) < 45) {
           if(item.type === 'coin') { 
             gameState.current.coins++; 
             spawnExplosion(item.x, item.y, '#ffd700'); 
           } else { 
             p.shield = true; 
             setPowerUpMessage("SHIELD ACTIVE");
             setTimeout(() => setPowerUpMessage(null), 1500);
           }
           item.marked = true;
       }

       // Draw Item
       if(!item.marked) {
         item.angle = (item.angle || 0) + 0.1; 
         ctx.save(); 
         ctx.translate(item.x + 15, item.y + 15); 
         ctx.rotate(item.angle);
         if(item.type === 'coin') {
             ctx.shadowBlur = 15; ctx.shadowColor = '#ffd700'; ctx.fillStyle = '#ffd700';
             ctx.fillRect(-10, -10, 20, 20); 
             ctx.fillStyle = '#000'; ctx.font = '16px Arial'; ctx.fillText('₿', -6, 6);
         } else {
             ctx.shadowBlur = 20; ctx.shadowColor = '#00d2d3'; ctx.strokeStyle = '#00d2d3'; ctx.lineWidth = 3;
             ctx.beginPath(); ctx.arc(0,0,15,0,Math.PI*2); ctx.stroke(); 
             ctx.font = '12px Arial'; ctx.fillStyle='#fff'; ctx.fillText('S', -4, 4);
         }
         ctx.restore();
       }
    });

    // Particles
    entitiesRef.current.particles.forEach(pt => {
      pt.x += pt.speedX;
      pt.y += pt.speedY;
      pt.life -= 0.03;
      pt.size *= 0.95;
      
      if (pt.life > 0) {
        ctx.globalAlpha = pt.life; 
        ctx.fillStyle = pt.color;
        ctx.beginPath(); 
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2); 
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    });

    // Cleanup marked
    entitiesRef.current.obstacles = entitiesRef.current.obstacles.filter(o => !o.marked);
    entitiesRef.current.items = entitiesRef.current.items.filter(i => !i.marked);
    entitiesRef.current.particles = entitiesRef.current.particles.filter(p => p.life > 0);

    // 5. Global Logic
    if (gameState.current.active) {
      gameState.current.score += gameState.current.speed * 0.05;
      gameState.current.frames++;

      // UI Update (Throttled slightly by nature of requestAnimationFrame, but we call the hook)
      // To avoid React render spam, we might only want to do this every X frames, 
      // but for smoothness on modern devices, every frame is usually okay for simple props.
      // Optimization: Calculate progress only
      const maxDist = levelData.dist;
      const progress = Math.min(100, (gameState.current.score / maxDist) * 100);
      
      onScoreUpdate(Math.floor(gameState.current.score), gameState.current.coins, progress);

      if(gameState.current.score >= maxDist) {
         gameState.current.active = false;
         onLevelComplete();
      } else {
         requestRef.current = requestAnimationFrame(loop);
      }
    }

  }, [status, currentLevelIndex, onScoreUpdate, onGameOver, onLevelComplete, setPowerUpMessage]);

  // --- Input Handling ---

  const handleJump = useCallback(() => {
    if (status === GameStatus.PLAYING && playerRef.current.grounded) {
        playerRef.current.dy = playerRef.current.jumpForce;
        // Jump particles
        for(let i=0; i<10; i++) {
            entitiesRef.current.particles.push({
              x: playerRef.current.x + 20, 
              y: playerRef.current.y + 80, 
              color: '#fff', 
              type: 'spark',
              size: Math.random() * 3 + 1, speedX: (Math.random() - 0.5) * 5, speedY: (Math.random() - 0.5) * 5, life: 1.0
            });
        }
    }
  }, [status]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') handleJump();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  // --- Lifecycle ---

  useEffect(() => {
    // Resize handler
    const handleResize = () => {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Game Loop Management
    if (status === GameStatus.PLAYING) {
      // If we just switched to playing, ensure request runs
      if (!gameState.current.active) {
          // If we were paused or stopped, logic handled by resetGame called by parent
      }
      requestRef.current = requestAnimationFrame(loop);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status, loop]);

  // Reset trigger when level changes or game starts
  useEffect(() => {
    if (status === GameStatus.PLAYING && gameState.current.levelIdx !== currentLevelIndex) {
        resetGame(currentLevelIndex);
    }
    // Initial Start
    if (status === GameStatus.START) {
        initBackground();
        // Render one frame for background
        const tid = setTimeout(loop, 100);
        return () => clearTimeout(tid);
    }
  }, [status, currentLevelIndex, resetGame, loop]);
  
  // Expose reset logic via effect if needed when restarting same level
  useEffect(() => {
     // We need a way to detect "Restart" if the level index didn't change.
     // The parent handles this by setting status to PLAYING from GAME_OVER.
     // We can check if we are entering PLAYING state with active=false.
     if (status === GameStatus.PLAYING && !gameState.current.active) {
         resetGame(currentLevelIndex);
     }
  }, [status, currentLevelIndex, resetGame]);


  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-screen touch-none"
      onTouchStart={handleJump}
      onMouseDown={handleJump}
    />
  );
};
