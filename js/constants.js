/**
 * Dragon Runner - Game Constants & Logical Coordinate System
 */

// Logical Game Dimensions (Resolution independent)
export const GAME_WIDTH = 1000;
export const GAME_HEIGHT = 400;

// Ground Baseline Y coordinate (where top surface sits and dragon feet land)
export const GROUND_Y = 320;

// Dragon Metrics
export const DRAGON_X = 100;
export const DRAGON_HEIGHT = 80;

// Physics Parameters
export const GRAVITY = 0.6;
export const JUMP_FORCE = -13.5;

// Horizontal Game Speed (px/frame at 60fps) - Phase 2 balanced speed
export const GAME_SPEED = 4.0;

// Run Animation Swap Interval in milliseconds (Decoupled from GAME_SPEED)
export const RUN_ANIMATION_INTERVAL = 150;

// Obstacle Dimensions & Spawn Configuration
export const OBSTACLE_TYPES = {
  STONE: { type: 'STONE', w: 40, h: 30, weight: 0.25 },
  BUSH: { type: 'BUSH', w: 50, h: 35, weight: 0.25 },
  CRYSTAL: { type: 'CRYSTAL', w: 42, h: 38, weight: 0.20 },
  ROCK_SPIKES: { type: 'ROCK_SPIKES', w: 55, h: 45, weight: 0.15 },
  RUINS: { type: 'RUINS', w: 50, h: 48, weight: 0.10 },
  ARCHWAY: { type: 'ARCHWAY', w: 60, h: 50, weight: 0.05 }
};

// Spacing between obstacles in logical pixels
export const MIN_OBSTACLE_SPACING = 300;
export const MAX_OBSTACLE_SPACING = 480;
