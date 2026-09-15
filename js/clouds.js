/**
 * Dragon Runner - Parallax Canvas Clouds
 * Renders procedural monochrome clouds in the background layer behind gameplay.
 */

import { GAME_WIDTH, CLOUD_COUNT, CLOUD_SPEED_FACTOR } from './constants.js';

let noisePattern = null;

function getNoisePattern(ctx) {
  if (!noisePattern) {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const nCtx = c.getContext('2d');
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      nCtx.fillStyle = `rgba(255, 255, 255, ${0.02 + Math.random() * 0.05})`;
      nCtx.fillRect(x, y, 2, 2);
      nCtx.fillStyle = `rgba(20, 20, 25, ${0.03 + Math.random() * 0.06})`;
      nCtx.fillRect(x + 1, y + 1, 2, 2);
    }
    noisePattern = ctx.createPattern(c, 'repeat');
  }
  return noisePattern;
}

export class Cloud {
  constructor(x, y, scale = 1.0, type = 0, parallax = 1.0) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.type = type; // 0, 1, or 2 for varied silhouettes
    this.parallax = parallax; // e.g. 0.5 for distant, 1.0 for close
    this.baseW = 90;
    this.baseH = 40;
    
    // Offset for noise pattern to make each cloud texture look unique
    this.noiseOffsetX = Math.random() * 64;
    this.noiseOffsetY = Math.random() * 64;

    // Small irregular bumps to break up the perfect spheres
    this.bumpsBack = [];
    this.bumpsFront = [];
    
    const numBack = 4 + Math.floor(Math.random() * 6);
    for (let i = 0; i < numBack; i++) {
      this.bumpsBack.push({
        x: 0.15 + Math.random() * 0.7,
        y: 0.4 + Math.random() * 0.5,
        r: 3 + Math.random() * 7
      });
    }

    const numFront = 4 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numFront; i++) {
      this.bumpsFront.push({
        x: 0.2 + Math.random() * 0.6,
        y: 0.5 + Math.random() * 0.4,
        r: 3 + Math.random() * 6
      });
    }
  }

  get width() {
    return this.baseW * this.scale;
  }

  update(speed, frameScale = 1) {
    this.x -= speed * CLOUD_SPEED_FACTOR * this.parallax * frameScale;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);

    const w = this.baseW;
    const h = this.baseH;
    
    // Vary transparency slightly based on parallax for depth
    const alpha = 0.5 + (this.parallax * 0.5);
    ctx.globalAlpha = alpha;

    // 1. Build clipping path of the entire cloud (back + front)
    ctx.beginPath();
    
    // Back shapes
    if (this.type === 0) {
      ctx.arc(w * 0.3, h * 0.7, 18, 0, Math.PI * 2);
      ctx.arc(w * 0.55, h * 0.5, 24, 0, Math.PI * 2);
      ctx.arc(w * 0.8, h * 0.7, 16, 0, Math.PI * 2);
    } else if (this.type === 1) {
      ctx.arc(w * 0.25, h * 0.6, 20, 0, Math.PI * 2);
      ctx.arc(w * 0.5, h * 0.55, 22, 0, Math.PI * 2);
      ctx.arc(w * 0.75, h * 0.7, 18, 0, Math.PI * 2);
    } else {
      ctx.arc(w * 0.4, h * 0.5, 25, 0, Math.PI * 2);
      ctx.arc(w * 0.7, h * 0.6, 20, 0, Math.PI * 2);
    }
    for (const b of this.bumpsBack) ctx.arc(w * b.x, h * b.y, b.r, 0, Math.PI * 2);

    // Front shapes
    if (this.type === 0) {
      ctx.arc(w * 0.3, h * 0.75, 14, 0, Math.PI * 2);
      ctx.arc(w * 0.55, h * 0.6, 20, 0, Math.PI * 2);
      ctx.arc(w * 0.8, h * 0.75, 12, 0, Math.PI * 2);
      ctx.rect(w * 0.2, h * 0.7, w * 0.65, h * 0.25);
    } else if (this.type === 1) {
      ctx.arc(w * 0.25, h * 0.7, 16, 0, Math.PI * 2);
      ctx.arc(w * 0.5, h * 0.65, 18, 0, Math.PI * 2);
      ctx.arc(w * 0.75, h * 0.75, 14, 0, Math.PI * 2);
      ctx.rect(w * 0.15, h * 0.7, w * 0.7, h * 0.25);
    } else {
      ctx.arc(w * 0.4, h * 0.6, 20, 0, Math.PI * 2);
      ctx.arc(w * 0.7, h * 0.7, 16, 0, Math.PI * 2);
      ctx.rect(w * 0.25, h * 0.7, w * 0.6, h * 0.25);
    }
    for (const b of this.bumpsFront) ctx.arc(w * b.x, h * b.y, b.r, 0, Math.PI * 2);

    // Clip to the combined shape
    ctx.save();
    ctx.clip();

    // Fill the back layer area
    ctx.fillStyle = '#2a2a35';
    ctx.fillRect(0, 0, w, h);

    // Draw the front layer area precisely
    ctx.fillStyle = '#3a3a48';
    ctx.beginPath();
    if (this.type === 0) {
      ctx.arc(w * 0.3, h * 0.75, 14, 0, Math.PI * 2);
      ctx.arc(w * 0.55, h * 0.6, 20, 0, Math.PI * 2);
      ctx.arc(w * 0.8, h * 0.75, 12, 0, Math.PI * 2);
      ctx.rect(w * 0.2, h * 0.7, w * 0.65, h * 0.25);
    } else if (this.type === 1) {
      ctx.arc(w * 0.25, h * 0.7, 16, 0, Math.PI * 2);
      ctx.arc(w * 0.5, h * 0.65, 18, 0, Math.PI * 2);
      ctx.arc(w * 0.75, h * 0.75, 14, 0, Math.PI * 2);
      ctx.rect(w * 0.15, h * 0.7, w * 0.7, h * 0.25);
    } else {
      ctx.arc(w * 0.4, h * 0.6, 20, 0, Math.PI * 2);
      ctx.arc(w * 0.7, h * 0.7, 16, 0, Math.PI * 2);
      ctx.rect(w * 0.25, h * 0.7, w * 0.6, h * 0.25);
    }
    for (const b of this.bumpsFront) ctx.arc(w * b.x, h * b.y, b.r, 0, Math.PI * 2);
    ctx.fill();

    // Overlay noise texture
    ctx.fillStyle = getNoisePattern(ctx);
    ctx.save();
    ctx.translate(this.noiseOffsetX, this.noiseOffsetY);
    ctx.fillRect(-this.noiseOffsetX, -this.noiseOffsetY, w, h);
    ctx.restore();

    ctx.restore(); // Remove clipping mask

    // Subtle white highlights along the main arcs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (this.type === 0) {
      ctx.arc(w * 0.55, h * 0.6, 20, Math.PI * 1.1, Math.PI * 1.9);
      ctx.arc(w * 0.3, h * 0.75, 14, Math.PI * 1.1, Math.PI * 1.7);
    } else if (this.type === 1) {
      ctx.arc(w * 0.5, h * 0.65, 18, Math.PI * 1.1, Math.PI * 1.9);
    } else {
      ctx.arc(w * 0.4, h * 0.6, 20, Math.PI * 1.0, Math.PI * 1.9);
    }
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
    const spacing = GAME_WIDTH / CLOUD_COUNT;
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const x = i * spacing + (Math.random() * (spacing * 0.6));
      this.spawnCloud(x);
    }
  }

  spawnCloud(x) {
    const y = 20 + (Math.random() * 120);
    // Parallax between 0.4 (slow, distant) and 1.2 (fast, close)
    const parallax = 0.4 + (Math.random() * 0.8);
    const scale = (0.5 + (Math.random() * 0.4)) * (parallax * 0.7 + 0.3);
    const type = Math.floor(Math.random() * 3);
    this.clouds.push(new Cloud(x, y, scale, type, parallax));
  }

  reset() {
    this.initClouds();
  }

  update(speed, frameScale = 1) {
    for (let i = this.clouds.length - 1; i >= 0; i--) {
      const cloud = this.clouds[i];
      cloud.update(speed, frameScale);
      
      if (cloud.x + cloud.width < -50) {
        this.clouds.splice(i, 1);
        this.spawnCloud(GAME_WIDTH + 20 + (Math.random() * 100));
      }
    }
  }

  draw(ctx) {
    // Sort clouds by parallax so slower (distant) ones are drawn first
    this.clouds.sort((a, b) => a.parallax - b.parallax);
    
    for (const cloud of this.clouds) {
      cloud.draw(ctx);
    }
  }
}
