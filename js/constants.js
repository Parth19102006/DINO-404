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

// Tuned Jump & Gravity Physics (Smoother, slower, longer horizontal leap)
export const GRAVITY = 0.42;
export const JUMP_FORCE = -12.4;
export const JUMP_FORCE_BOOSTED = -13.6;
export const JUMP_RAMP_FRAMES = 3;

// Speed Progression Configuration (Starts at 4.0, increases by +0.2 every 50 points)
export const INITIAL_SPEED = 4.0;
export const SPEED_INCREMENT = 0.2;
export const SPEED_INTERVAL_POINTS = 50;
export const MAX_GAME_SPEED = 7;
export const FRAME_TIME = 1000 / 60;

// Run Animation Swap Interval in milliseconds
export const RUN_ANIMATION_INTERVAL = 150;

// Parallax Cloud Configuration
export const CLOUD_COUNT = 5;
export const CLOUD_SPEED_FACTOR = 0.22;

// LocalStorage Persistence Key
export const STORAGE_BEST_SCORE_KEY = 'dragon_runner_best_score';

// Six Obstacle Types & Configurations Matching Reference Art
export const OBSTACLE_CONFIGS = {
  STONE: {
    type: 'STONE',
    w: 44,
    h: 34,
    points: 10,
    weightEarly: 0.32,
    weightLate: 0.25,
    isFlying: false
  },
  CRYSTAL: {
    type: 'CRYSTAL',
    w: 44,
    h: 52,
    points: 20,
    weightEarly: 0.28,
    weightLate: 0.22,
    isFlying: false
  },
  BUSH: {
    type: 'BUSH',
    w: 52,
    h: 42,
    points: 30,
    weightEarly: 0.25,
    weightLate: 0.20,
    isFlying: false
  },
  RUINS: {
    type: 'RUINS',
    w: 58,
    h: 54,
    points: 40,
    weightEarly: 0.15,
    weightLate: 0.12,
    isFlying: false
  },
  ROCK_SPIKES: {
    type: 'ROCK_SPIKES',
    w: 60,
    h: 52,
    points: 50,
    weightEarly: 0.00, // Strictly locked before 200 points
    weightLate: 0.11,  // Unlocked at 200+ points
    isFlying: false
  },
  FLYING: {
    type: 'FLYING',
    w: 58,
    h: 42,
    points: 30,
    weightEarly: 0.10, // Available from 0+ points
    weightLate: 0.10,
    isFlying: true
  }
};

// Spacing between obstacles in logical pixels
export const MIN_OBSTACLE_SPACING = 580;
export const MAX_OBSTACLE_SPACING = 920;
