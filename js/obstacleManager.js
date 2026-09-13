/**
 * Dragon Runner - Obstacle Manager
 * Handles score-aware spawning (Rock Spikes locked < 200 pts, Flying available from 0+ pts),
 * randomized non-fixed spacing, AABB collision, and obstacle-pass score rewards.
 */

import {
  GAME_WIDTH,
  DRAGON_X,
  OBSTACLE_CONFIGS,
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
    this.nextSpawnDistance = GAME_WIDTH + 150;
  }

  /**
   * Selects an obstacle type based on current score and weighted distribution.
   * Rock Spikes strictly requires score >= 200.
   */
  getRandomObstacleType(score) {
    const isLateGame = score >= 200;
    const configs = Object.values(OBSTACLE_CONFIGS);
    const rand = Math.random();

    let cumulativeWeight = 0;
    for (const config of configs) {
      const weight = isLateGame ? config.weightLate : config.weightEarly;
      cumulativeWeight += weight;
      if (rand <= cumulativeWeight) {
        return config;
      }
    }
    return configs[0];
  }

  /**
   * Spawns a new obstacle if distance threshold has been crossed.
   */
  spawnIfNeeded(speed, score) {
    const lastObstacle = this.obstacles[this.obstacles.length - 1];
    const rightmostX = lastObstacle ? (lastObstacle.x + lastObstacle.width) : 0;

    if (this.obstacles.length === 0 || rightmostX < GAME_WIDTH - this.nextSpawnDistance) {
      const typeConfig = this.getRandomObstacleType(score);
      const spawnX = Math.max(GAME_WIDTH + 20, rightmostX + this.nextSpawnDistance);

      // Flying obstacle altitude: 70 to 95 px above ground
      let altitude = 0;
      if (typeConfig.isFlying) {
        altitude = 70 + (Math.random() * 25);
      }

      const obstacle = new Obstacle(typeConfig, spawnX, altitude);
      this.obstacles.push(obstacle);

      // Dynamic fair spacing scaling with current movement speed
      const minGap = Math.max(MIN_OBSTACLE_SPACING, speed * 65);
      const spacingRange = MAX_OBSTACLE_SPACING - MIN_OBSTACLE_SPACING;
      this.nextSpawnDistance = minGap + (Math.random() * spacingRange);
    }
  }

  /**
   * Updates obstacle positions, cleans up off-screen obstacles,
   * and returns points earned from newly passed obstacles.
   * @param {number} speed
   * @param {number} score
   * @returns {number} Points earned this frame
   */
  update(speed, score = 0) {
    let earnedPoints = 0;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.update(speed);

      // Award score exactly once when obstacle is successfully passed by the dragon
      if (!obs.passed && (obs.x + obs.width < DRAGON_X)) {
        obs.passed = true;
        earnedPoints += obs.points;
      }

      // Remove off-screen obstacles
      if (obs.x + obs.width < -60) {
        this.obstacles.splice(i, 1);
      }
    }

    // Spawn new obstacles dynamically
    this.spawnIfNeeded(speed, score);

    return earnedPoints;
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
