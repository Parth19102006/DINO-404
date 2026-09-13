/**
 * Dragon Runner - Obstacle Manager
 * Handles obstacle spawning, weighted type randomization, movement at GAME_SPEED,
 * garbage collection, and fair AABB collision detection.
 */

import {
  GAME_WIDTH,
  GAME_SPEED,
  OBSTACLE_TYPES,
  MIN_OBSTACLE_SPACING,
  MAX_OBSTACLE_SPACING
} from './constants.js';
import { Obstacle } from './obstacles.js';

export class ObstacleManager {
  constructor() {
    this.obstacles = [];
    this.nextSpawnDistance = 0;
    this.reset();
  }

  reset() {
    this.obstacles = [];
    // Set initial spawn position beyond the right edge
    this.nextSpawnDistance = GAME_WIDTH + 200;
  }

  /**
   * Selects a random obstacle type based on weighted probability distribution.
   */
  getRandomObstacleType() {
    const types = Object.values(OBSTACLE_TYPES);
    const rand = Math.random();

    let cumulativeWeight = 0;
    for (const config of types) {
      cumulativeWeight += config.weight;
      if (rand <= cumulativeWeight) {
        return config;
      }
    }
    return types[0];
  }

  /**
   * Spawns a new obstacle if distance threshold has been crossed.
   */
  spawnIfNeeded() {
    // Check rightmost obstacle position
    const lastObstacle = this.obstacles[this.obstacles.length - 1];
    const rightmostX = lastObstacle ? (lastObstacle.x + lastObstacle.width) : 0;

    if (this.obstacles.length === 0 || rightmostX < GAME_WIDTH - this.nextSpawnDistance) {
      const typeConfig = this.getRandomObstacleType();
      const spawnX = Math.max(GAME_WIDTH + 20, rightmostX + this.nextSpawnDistance);

      const obstacle = new Obstacle(typeConfig, spawnX);
      this.obstacles.push(obstacle);

      // Determine distance for subsequent obstacle
      const spacingRange = MAX_OBSTACLE_SPACING - MIN_OBSTACLE_SPACING;
      this.nextSpawnDistance = MIN_OBSTACLE_SPACING + (Math.random() * spacingRange);
    }
  }

  update() {
    // Update existing obstacles position
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.update(GAME_SPEED);

      // Remove off-screen obstacles
      if (obs.x + obs.width < -50) {
        this.obstacles.splice(i, 1);
      }
    }

    // Check spawning criteria
    this.spawnIfNeeded();
  }

  /**
   * Checks collision against dragon collision box.
   * Returns colliding obstacle or null.
   */
  checkCollision(dragonBox) {
    for (const obs of this.obstacles) {
      const obsBox = obs.getCollisionBox();
      if (this.isAABBIntersecting(dragonBox, obsBox)) {
        return obs;
      }
    }
    return null;
  }

  isAABBIntersecting(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.w &&
      rect1.x + rect1.w > rect2.x &&
      rect1.y < rect2.y + rect2.h &&
      rect1.y + rect1.h > rect2.y
    );
  }

  draw(ctx) {
    for (const obs of this.obstacles) {
      obs.draw(ctx);
    }
  }
}
