export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER',
}

export interface LevelData {
  name: string;
  dist: number;
  speed: number;
  sky: [string, string];
  grid: string;
}

export interface Particle {
  x: number;
  y: number;
  color: string;
  type: 'explosion' | 'dust' | 'spark';
  size: number;
  speedX: number;
  speedY: number;
  life: number;
}

export interface Building {
  x: number;
  w: number;
  h: number;
  color: string;
  lights: boolean;
}

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  dy: number;
  jumpForce: number;
  gravity: number;
  grounded: boolean;
  shield: boolean;
}

export interface Entity {
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  marked: boolean;
  color?: string;
  angle?: number; // For coins
}
