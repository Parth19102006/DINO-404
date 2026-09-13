/**
 * Dragon Runner - Main Engine & Game Loop
 * Manages responsive canvas scaling, time-based game loop, obstacle manager integration,
 * and logical viewport rendering.
 */

import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import { InputHandler } from './input.js';
import { Ground } from './ground.js';
import { Dragon } from './dragon.js';
import { ObstacleManager } from './obstacleManager.js';

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;

    this.inputHandler = new InputHandler();
    this.ground = new Ground();
    this.dragon = new Dragon();
    this.obstacleManager = new ObstacleManager();

    this.lastTime = 0;

    this.initViewport();
    window.addEventListener('resize', () => this.initViewport());
  }

  /**
   * Recalculates canvas dimensions and scale/translation offsets
   * to fit logical GAME_WIDTH x GAME_HEIGHT seamlessly into window.
   */
  initViewport() {
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;

    // Set physical canvas display size
    this.canvas.width = windowW;
    this.canvas.height = windowH;

    // Calculate scale factor preserving aspect ratio
    const scaleX = windowW / GAME_WIDTH;
    const scaleY = windowH / GAME_HEIGHT;
    this.scale = Math.min(scaleX, scaleY);

    // Calculate centering letterbox offsets
    this.offsetX = (windowW - (GAME_WIDTH * this.scale)) / 2;
    this.offsetY = (windowH - (GAME_HEIGHT * this.scale)) / 2;

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  async start() {
    // Preload assets before launching game loop
    await this.dragon.loadAssets();

    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  loop(currentTime) {
    const dt = Math.min(currentTime - this.lastTime, 100); // Cap max delta time at 100ms
    this.lastTime = currentTime;

    this.update(dt);
    this.draw();

    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  update(dt) {
    this.ground.update();
    this.obstacleManager.update();
    this.dragon.update(this.inputHandler, dt);

    // AABB Collision Check
    const dragonBox = this.dragon.getCollisionBox();
    const hitObstacle = this.obstacleManager.checkCollision(dragonBox);

    if (hitObstacle) {
      this.dragon.setHit(true);
    } else {
      this.dragon.setHit(false);
    }
  }

  draw() {
    // Clear whole screen with dark background color
    this.ctx.fillStyle = '#0f0f13';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    // Transform to logical game coordinate space
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);

    // Draw logical sky/game background box
    this.ctx.fillStyle = '#18181f';
    this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Render Ground
    this.ground.draw(this.ctx);

    // Render Obstacles
    this.obstacleManager.draw(this.ctx);

    // Render Dragon
    this.dragon.draw(this.ctx);

    // Draw logical border outline
    this.ctx.strokeStyle = '#2a2a35';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.ctx.restore();
  }
}

// Instantiate and start engine on window load
window.addEventListener('DOMContentLoaded', () => {
  const engine = new GameEngine();
  engine.start();
});
