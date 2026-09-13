/**
 * Dragon Runner - Parallax Canvas Clouds
 * Renders procedural monochrome clouds in the background layer behind gameplay.
 */

import { GAME_WIDTH, CLOUD_COUNT, CLOUD_SPEED_FACTOR } from './constants.js';

export class Cloud {
  constructor(x, y, scale = 1.0) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.baseW = 80;
    this.baseH = 32;
  }

  get width() {
    return this.baseW * this.scale;
  }

  update(speed) {
    this.x -= speed * CLOUD_SPEED_FACTOR;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);

    const w = this.baseW;
    const h = this.baseH;

    // Soft dark background puff
    ctx.fillStyle = '#23232c';
    ctx.beginPath();
    ctx.arc(w * 0.3, h * 0.65, 16, 0, Math.PI * 2);
    ctx.arc(w * 0.55, h * 0.5, 20, 0, Math.PI * 2);
    ctx.arc(w * 0.75, h * 0.65, 14, 0, Math.PI * 2);
    ctx.fill();

    // Main cloud body fill (light monochrome gray)
    ctx.fillStyle = '#32323f';
    ctx.beginPath();
    ctx.arc(w * 0.3, h * 0.6, 14, 0, Math.PI * 2);
    ctx.arc(w * 0.52, h * 0.45, 18, 0, Math.PI * 2);
    ctx.arc(w * 0.75, h * 0.6, 13, 0, Math.PI * 2);
    ctx.fillRect(w * 0.2, h * 0.6, w * 0.6, h * 0.35);
    ctx.fill();

    // Subtle white top contour highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(w * 0.3, h * 0.6, 14, Math.PI * 0.9, Math.PI * 1.7);
    ctx.arc(w * 0.52, h * 0.45, 18, Math.PI * 1.1, Math.PI * 1.9);
    ctx.arc(w * 0.75, h * 0.6, 13, Math.PI * 1.25, Math.PI * 2.0);
    ctx.stroke();

    // Flat bottom subtle border
    ctx.strokeStyle = '#1a1a22';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.95);
    ctx.lineTo(w * 0.88, h * 0.95);
    ctx.stroke();

    ctx.restore();
  }
}

export class CloudManager {
  constructor() {
    this.clouds = [];
    this.initClouds();
  }

  initClouds() {
    this.clouds = [];
    // Distribute clouds evenly across the screen initially
    const spacing = GAME_WIDTH / CLOUD_COUNT;
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const x = i * spacing + (Math.random() * (spacing * 0.6));
      const y = 35 + (Math.random() * 130);
      const scale = 0.7 + (Math.random() * 0.5);
      this.clouds.push(new Cloud(x, y, scale));
    }
  }

  reset() {
    this.initClouds();
  }

  update(speed) {
    for (const cloud of this.clouds) {
      cloud.update(speed);

      // Wrap around when leaving left edge
      if (cloud.x + cloud.width < -50) {
        cloud.x = GAME_WIDTH + 20 + (Math.random() * 150);
        cloud.y = 35 + (Math.random() * 130);
        cloud.scale = 0.7 + (Math.random() * 0.5);
      }
    }
  }

  draw(ctx) {
    for (const cloud of this.clouds) {
      cloud.draw(ctx);
    }
  }
}
