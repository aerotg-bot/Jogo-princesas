import { LevelData } from './types';

export const LEVELS: LevelData[] = [
    { name: "TUTORIAL", dist: 500, speed: 5, sky: ['#000000', '#1a1a1a'], grid: '#444' }, // Placeholder index 0
    { name: "NEO TOKYO", dist: 1000, speed: 6, sky: ['#020024', '#090979'], grid: '#ff00de' },
    { name: "DATA HIGHWAY", dist: 1500, speed: 7, sky: ['#000000', '#434343'], grid: '#00d2d3' },
    { name: "CYBER SLUMS", dist: 2000, speed: 7.5, sky: ['#1a2a6c', '#b21f1f'], grid: '#fdbb2d' },
    { name: "TECH LABS", dist: 2500, speed: 8, sky: ['#000428', '#004e92'], grid: '#ffffff' },
    { name: "ROBOT FACTORY", dist: 3000, speed: 8.5, sky: ['#232526', '#414345'], grid: '#ff4757' },
    { name: "ORBITAL STATION", dist: 3500, speed: 9, sky: ['#000000', '#0f9b0f'], grid: '#2ed573' },
    { name: "DIGITAL DESERT", dist: 4000, speed: 9.5, sky: ['#3a1c71', '#d76d77'], grid: '#ffaf7b' },
    { name: "CORE SYSTEM", dist: 4500, speed: 10, sky: ['#141E30', '#243B55'], grid: '#00a8ff' },
    { name: "VIRUS ZONE", dist: 5000, speed: 11, sky: ['#000000', '#330000'], grid: '#ff0000' },
    { name: "THE MAINFRAME", dist: 6000, speed: 12, sky: ['#000', '#fff'], grid: '#ff00de' } 
];

// Adjust index 0 to match array indexing if needed, but the original code used index 1 as level 1
// We will use index 0 as level 1 for cleaner array access in JS/TS
export const getLevel = (levelIndex: number): LevelData => {
    const idx = Math.min(Math.max(levelIndex - 1, 0), LEVELS.length - 2);
    // Original code logic skipped index 0, so we access index + 1
    return LEVELS[idx + 1];
};

export const CANVAS_CONFIG = {
    GROUND_OFFSET: 100,
    PLAYER_X: 80,
};
