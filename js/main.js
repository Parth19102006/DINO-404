/**
 * Dragon Runner - Main Engine & Game Loop
 * Features READY -> RUNNING -> GAMEOVER state flow, obstacle-pass scoring (+10 to +50 pts),
 * Rock Spikes score restriction (200+ pts), unrestricted flying obstacle, no-blur Game Over,
 * and reliable collision handling.
 */

import {
  GAME_WIDTH,
  GAME_HEIGHT,
  INITIAL_SPEED,
  SPEED_INCREMENT,
  SPEED_INTERVAL_POINTS,
  FRAME_TIME,
  STORAGE_BEST_SCORE_KEY
} from './constants.js';
import { InputHandler } from './input.js';
import { Ground } from './ground.js';
import { Dragon } from './dragon.js';
import { ObstacleManager } from './obstacleManager.js';
import { CloudManager } from './clouds.js';

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
    this.cloudManager = new CloudManager();

    // Game states: 'READY' | 'RUNNING' | 'GAMEOVER'
    this.gameState = 'READY';

    // Scoring & Speed
    this.score = 0;
    this.bestScore = this.loadBestScore();
    this.currentSpeed = INITIAL_SPEED;

    this.lastTime = 0;
    this.canRestartTime = 0;

    // DOM UI Elements
    this.currentScoreEl = document.getElementById('current-score');
    this.bestScoreEl = document.getElementById('best-score');
    this.startOverlay = document.getElementById('start-overlay');
    this.gameOverOverlay = document.getElementById('game-over-overlay');
    this.finalScoreEl = document.getElementById('final-score');
    this.finalBestScoreEl = document.getElementById('final-best-score');
    this.restartBtn = document.getElementById('restart-btn');

    this.updateScoreUI();
    this.initEventListeners();
    this.initViewport();
    window.addEventListener('resize', () => this.initViewport());
  }

  loadBestScore() {
    try {
      const saved = localStorage.getItem(STORAGE_BEST_SCORE_KEY);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch (e) {
      console.warn('localStorage not accessible:', e);
      return 0;
    }
  }

  saveBestScore() {
    try {
      localStorage.setItem(STORAGE_BEST_SCORE_KEY, String(this.bestScore));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  initEventListeners() {
    // Restart button click / touch handler
    const triggerRestart = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (this.gameState === 'GAMEOVER') {
        this.restart();
      }
    };

    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', triggerRestart);
      this.restartBtn.addEventListener('touchend', triggerRestart);
    }
  }

  /**
   * Recalculates canvas dimensions and scale/translation offsets
   * to fit logical GAME_WIDTH x GAME_HEIGHT seamlessly into window.
   */
  initViewport() {
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;

    this.canvas.width = windowW;
    this.canvas.height = windowH;

    const scaleX = windowW / GAME_WIDTH;
    const scaleY = windowH / GAME_HEIGHT;
    this.scale = Math.min(scaleX, scaleY);

    this.offsetX = (windowW - (GAME_WIDTH * this.scale)) / 2;
    this.offsetY = (windowH - (GAME_HEIGHT * this.scale)) / 2;

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  async start() {
    // Preload assets before starting game loop
    await this.dragon.loadAssets();

    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  loop(currentTime) {
    const dt = Math.min(currentTime - this.lastTime, 100);
    this.lastTime = currentTime;

    this.update(dt);
    this.draw();

    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  update(dt) {
    const frameScale = dt / FRAME_TIME;

    if (this.gameState === 'READY') {
      // Check if player initiated start via Space, ArrowUp, Enter, or Tap
      if (this.inputHandler.consumeStartOrRestart()) {
        this.gameState = 'RUNNING';
        if (this.startOverlay) {
          this.startOverlay.classList.add('hidden');
        }
      }
      return;
    }

    if (this.gameState === 'RUNNING') {
      // 1. Move clouds at parallax speed
      this.cloudManager.update(this.currentSpeed, frameScale);

      // 2. Move ground
      this.ground.update(this.currentSpeed, frameScale);

      // 3. Move obstacles and collect points from newly passed obstacles
      const earnedPoints = this.obstacleManager.update(this.currentSpeed, this.score, frameScale);
      if (earnedPoints > 0) {
        this.score += earnedPoints;

        // Update high score
        if (this.score > this.bestScore) {
          this.bestScore = this.score;
          this.saveBestScore();
        }

        // Update speed progression: +0.5 px/frame every 50 points
        const speedSteps = Math.floor(this.score / SPEED_INTERVAL_POINTS);
        this.currentSpeed = INITIAL_SPEED + (speedSteps * SPEED_INCREMENT);

        this.updateScoreUI();
      }

      // 4. Update dragon physics and animation
      this.dragon.update(this.inputHandler, dt, this.score);

      // 5. AABB Collision Check (from any angle: front, top, landing)
      const dragonBox = this.dragon.getCollisionBox();
      const hitObstacle = this.obstacleManager.checkCollision(dragonBox);

      if (hitObstacle) {
        this.handleGameOver();
      }
    } else if (this.gameState === 'GAMEOVER') {
      // Enforce 350ms buffer before accepting restart keys to avoid accidental instant resets
      if (performance.now() > this.canRestartTime) {
        if (this.inputHandler.consumeStartOrRestart()) {
          this.restart();
        }
      }
    }
  }

  handleGameOver() {
    this.gameState = 'GAMEOVER';
    this.dragon.setHit(true);
    this.inputHandler.reset();
    this.canRestartTime = performance.now() + 350;

    // Save persistent best score
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.saveBestScore();
    }

    // Populate and show Game Over modal (with NO BLUR on game scene)
    if (this.finalScoreEl) {
      this.finalScoreEl.textContent = this.score;
    }
    if (this.finalBestScoreEl) {
      this.finalBestScoreEl.textContent = this.bestScore;
    }
    if (this.gameOverOverlay) {
      this.gameOverOverlay.classList.remove('hidden');
    }
  }

  restart() {
    this.score = 0;
    this.currentSpeed = INITIAL_SPEED;

    this.dragon.reset();
    this.obstacleManager.reset();
    this.cloudManager.reset();
    this.inputHandler.reset();

    if (this.gameOverOverlay) {
      this.gameOverOverlay.classList.add('hidden');
    }

    this.updateScoreUI();
    this.gameState = 'RUNNING';
  }

  formatScore(num) {
    return String(Math.floor(num)).padStart(5, '0');
  }

  updateScoreUI() {
    if (this.currentScoreEl) {
      this.currentScoreEl.textContent = this.formatScore(this.score);
    }
    if (this.bestScoreEl) {
      this.bestScoreEl.textContent = this.formatScore(this.bestScore);
    }
  }

  draw() {
    // Clear viewport with deep dark background
    this.ctx.fillStyle = '#0f0f13';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    // Transform to logical game coordinate space
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);

    // 1. Draw logical sky background
    this.ctx.fillStyle = '#18181f';
    this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 2. Draw Parallax Clouds (Rendered behind gameplay)
    this.cloudManager.draw(this.ctx);

    // 3. Draw Ground
    this.ground.draw(this.ctx);

    // 4. Draw Obstacles
    this.obstacleManager.draw(this.ctx);

    // 5. Draw Dragon (Shows hit sprite when in GAMEOVER state)
    this.dragon.draw(this.ctx);

    // 6. Draw logical border outline
    this.ctx.strokeStyle = '#2a2a35';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.ctx.restore();
  }
}

// Instantiate and launch game engine on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  const engine = new GameEngine();
  engine.start();
});
