/**
 * Dragon Runner - Dragon Character Entity
 * Handles sprite image loading, timestamp-based 150ms running animation cycle,
 * jump physics, visual baseline alignment (feet on GROUND_Y), hit state,
 * and fair inset AABB collision box calculations.
 */

import {
  DRAGON_X,
  DRAGON_HEIGHT,
  GROUND_Y,
  GRAVITY,
  JUMP_FORCE,
  JUMP_FORCE_BOOSTED,
  RUN_ANIMATION_INTERVAL
} from './constants.js';

export class Dragon {
  constructor() {
    this.x = DRAGON_X;
    this.y = GROUND_Y;
    this.vy = 0;
    this.isGrounded = true;
    this.isHit = false;

    // Time-based animation state (Decoupled from GAME_SPEED)
    this.animTimer = 0;
    this.runFrameIndex = 0;

    // Images map
    this.images = {
      run1: null,
      run2: null,
      run3: null,
      jump: null,
      hit: null
    };
    this.loaded = false;
  }

  reset() {
    this.x = DRAGON_X;
    this.y = GROUND_Y;
    this.vy = 0;
    this.isGrounded = true;
    this.isHit = false;
    this.animTimer = 0;
    this.runFrameIndex = 0;
  }

  /**
   * Preloads all dragon PNG sprite frames.
   */
  async loadAssets() {
    const assets = [
      { key: 'run1', src: 'assets/dragon-run-1.png' },
      { key: 'run2', src: 'assets/dragon-run-2.png' },
      { key: 'run3', src: 'assets/dragon-run-3.png' },
      { key: 'jump', src: 'assets/dragon-jump.png' },
      { key: 'hit', src: 'assets/dragon-hit.png' }
    ];

    const promises = assets.map(({ key, src }) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          this.images[key] = img;
          resolve();
        };
        img.onerror = () => {
          reject(new Error(`Failed to load sprite: ${src}`));
        };
        img.src = src;
      });
    });

    try {
      await Promise.all(promises);
      this.loaded = true;
    } catch (err) {
      console.error('Error preloading dragon assets:', err);
    }
  }

  /**
   * Triggers a jump if the dragon is grounded and not currently hit.
   */
  jump(score = 0) {
    if (this.isGrounded && !this.isHit) {
      // Apply slight jump boost when score >= 200 for comfortable clearance over flying obstacles
      this.vy = score >= 200 ? JUMP_FORCE_BOOSTED : JUMP_FORCE;
      this.isGrounded = false;
    }
  }

  /**
   * Returns fair inset collision box around the dragon's actual body.
   */
  getCollisionBox() {
    const sprite = this.getCurrentSprite();
    const aspect = sprite ? (sprite.width / sprite.height) : 1.5;
    const renderH = DRAGON_HEIGHT;
    const renderW = DRAGON_HEIGHT * aspect;

    // Inset padding (16% horizontal, 12% vertical)
    const padX = renderW * 0.16;
    const padY = renderH * 0.12;

    return {
      x: this.x + padX,
      y: (this.y - renderH) + padY,
      w: renderW - (padX * 2),
      h: renderH - padY
    };
  }

  setHit(hit = true) {
    this.isHit = hit;
  }

  /**
   * Updates dragon physics and timestamp-based animation frame swap.
   * @param {InputHandler} inputHandler
   * @param {number} dt Delta time in milliseconds
   * @param {number} score Current internal game score
   */
  update(inputHandler, dt = 16.66, score = 0) {
    if (this.isHit) {
      // Keep on ground if hit
      if (!this.isGrounded) {
        this.vy += GRAVITY;
        this.y += this.vy;
        if (this.y >= GROUND_Y) {
          this.y = GROUND_Y;
          this.vy = 0;
          this.isGrounded = true;
        }
      }
      return;
    }

    // Check for jump input
    if (inputHandler.consumeJump()) {
      this.jump(score);
    }

    // Apply gravity & vertical velocity integration
    if (!this.isGrounded) {
      this.vy += GRAVITY;
      this.y += this.vy;

      // Ground collision check
      if (this.y >= GROUND_Y) {
        this.y = GROUND_Y;
        this.vy = 0;
        this.isGrounded = true;
      }
    } else {
      // Time-based animation swap: 150ms per frame
      this.animTimer += dt;
      if (this.animTimer >= RUN_ANIMATION_INTERVAL) {
        this.animTimer %= RUN_ANIMATION_INTERVAL;
        // Cycle frames: RUN 1 -> RUN 2 -> RUN 3 -> RUN 1
        this.runFrameIndex = (this.runFrameIndex + 1) % 3;
      }
    }
  }

  /**
   * Returns current active sprite image based on state.
   */
  getCurrentSprite() {
    if (this.isHit) {
      return this.images.hit || this.images.jump;
    }
    if (!this.isGrounded) {
      return this.images.jump;
    }
    const runFrames = [this.images.run1, this.images.run2, this.images.run3];
    return runFrames[this.runFrameIndex];
  }

  /**
   * Renders dragon sprite maintaining aspect ratio with feet aligned to `y`.
   */
  draw(ctx) {
    if (!this.loaded) return;

    const sprite = this.getCurrentSprite();
    if (!sprite || !sprite.complete) return;

    // Calculate aspect ratio and dimensions
    const aspect = sprite.width / sprite.height;
    const renderH = DRAGON_HEIGHT;
    const renderW = DRAGON_HEIGHT * aspect;

    // Anchor: Feet touch `this.y` (GROUND_Y when grounded)
    const drawX = this.x;
    const drawY = this.y - renderH;

    ctx.drawImage(sprite, drawX, drawY, renderW, renderH);
  }
}
