import React, { useState, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { MenuScreen } from './components/MenuScreen';
import { getLevel } from './constants';
import { GameStatus } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [levelIndex, setLevelIndex] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [progress, setProgress] = useState(0);
  const [powerUpMsg, setPowerUpMsg] = useState<string | null>(null);

  const currentLevelData = getLevel(levelIndex);

  const handleScoreUpdate = useCallback((s: number, c: number, p: number) => {
    setScore(s);
    setCoins(c);
    setProgress(p);
  }, []);

  const startGame = () => {
    setLevelIndex(1);
    setStatus(GameStatus.PLAYING);
  };

  const nextLevel = () => {
    const maxLevel = 10; 
    if (levelIndex < maxLevel) {
      setLevelIndex(prev => prev + 1);
      setStatus(GameStatus.PLAYING);
    } else {
      // Loop back to 1 or show credits? Loop for endless runner feel
      setLevelIndex(1);
      setStatus(GameStatus.PLAYING);
    }
  };

  const retryLevel = () => {
    // GameCanvas watches for status change to PLAYING + internal active state to reset
    setStatus(GameStatus.PLAYING);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050505]">
      
      {/* Game Layer */}
      <GameCanvas 
        status={status}
        currentLevelIndex={levelIndex}
        onScoreUpdate={handleScoreUpdate}
        onGameOver={() => setStatus(GameStatus.GAME_OVER)}
        onLevelComplete={() => setStatus(GameStatus.LEVEL_COMPLETE)}
        setPowerUpMessage={setPowerUpMsg}
      />

      {/* HUD Layer */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-[max(15px,env(safe-area-inset-top))] px-[max(15px,env(safe-area-inset-right))] pb-[max(15px,env(safe-area-inset-bottom))] pl-[max(15px,env(safe-area-inset-left))]">
        
        {/* Top Bar */}
        <div className="w-full">
          <div className="flex justify-between items-center w-full mb-2">
            {/* Score */}
            <div className="bg-slate-900/80 border-2 border-neon-cyan shadow-[inset_0_0_10px_#00d2d3] rounded-lg px-4 py-2 text-white font-bold backdrop-blur-sm min-w-[80px] text-center">
              {score}m
            </div>
            {/* Coins */}
            <div className="bg-slate-900/80 border-2 border-neon-yellow shadow-[inset_0_0_10px_#fdbb2d] text-neon-yellow rounded-lg px-4 py-2 font-bold backdrop-blur-sm min-w-[80px] text-center">
              $ {coins}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-900 border border-gray-700 rounded-full overflow-hidden shadow-lg">
            <div 
              className="h-full bg-gradient-to-r from-neon-pink to-neon-cyan shadow-[0_0_15px_#00d2d3] transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Level Title */}
          <div className="mt-8 w-full text-center pointer-events-none">
            <h2 className="text-white/20 font-black text-4xl md:text-6xl tracking-[0.2em] uppercase drop-shadow-sm">
              {currentLevelData.name}
            </h2>
          </div>
        </div>

        {/* Power Up Alert (Centered) */}
        {powerUpMsg && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center animate-pulse-fast pointer-events-none">
             <h3 className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_0_20px_#00d2d3] uppercase whitespace-nowrap">
               {powerUpMsg}
             </h3>
          </div>
        )}
        
        {/* Bottom Padding Helper */}
        <div className="h-8" />
      </div>

      {/* Screens */}
      <MenuScreen 
        isVisible={status === GameStatus.START}
        title="CYBER PRINCESS"
        subtitle="Tap to jump. Dodge drones. Hack the system."
        buttonText="START MISSION"
        onAction={startGame}
        variant="cyan"
      />

      <MenuScreen 
        isVisible={status === GameStatus.GAME_OVER}
        title="SYSTEM FAILURE"
        subtitle="You collided with a firewall."
        buttonText="REBOOT SYSTEM"
        onAction={retryLevel}
        variant="pink"
      />

      <MenuScreen 
        isVisible={status === GameStatus.LEVEL_COMPLETE}
        title="SECTOR CLEARED"
        subtitle="Data transfer complete."
        buttonText="NEXT SECTOR"
        onAction={nextLevel}
        variant="cyan"
      />

    </div>
  );
};

export default App;