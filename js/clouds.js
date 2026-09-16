/**
 * Dragon Runner - Parallax Canvas Clouds
 * Renders procedural monochrome clouds in the background layer behind gameplay.
 * Features organic, noisy, swirly lobes, internal strokes, and procedural noise.
 */

import { GAME_WIDTH, CLOUD_COUNT, CLOUD_SPEED_FACTOR } from './constants.js';

let noisePattern = null;

function getNoisePattern(ctx) {
  if (!noisePattern) {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const nCtx = c.getContext('2d');
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      nCtx.fillStyle = `rgba(255, 255, 255, ${0.01 + Math.random() * 0.04})`;
      nCtx.fillRect(x, y, 2, 2);
      nCtx.fillStyle = `rgba(15, 15, 20, ${0.02 + Math.random() * 0.05})`;
      nCtx.fillRect(x + 1, y + 1, 2, 2);
    }
    noisePattern = ctx.createPattern(c, 'repeat');
  }
  return noisePattern;
}

// Helper to draw a single irregular organic lobe/blob using quadratic curves
function drawOrganicLobe(ctx, cx, cy, r, seed) {
  const steps = 16;
  const points = [];
  
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    // Add multiple frequencies of noise for uneven edges
    const noise = Math.sin(angle * 3 + seed) * 0.15 + Math.cos(angle * 5 - seed * 1.5) * 0.08;
    const currentR = r * (1 + noise);
    
    // Add slight horizontal stretch for a wind-swept look
    points.push({
      x: cx + Math.cos(angle) * currentR * 1.25,
      y: cy + Math.sin(angle) * currentR * 0.8
    });
  }
  
  // Draw smooth closed loop using midpoints
  ctx.moveTo(
    (points[0].x + points[steps - 1].x) / 2,
    (points[0].y + points[steps - 1].y) / 2
  );
  
  for (let i = 0; i < steps; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % steps];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
  }
}

export class Cloud {
  constructor(x, y, scale = 1.0, type = 0, parallax = 1.0) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.type = type;
    this.parallax = parallax;
    
    // Vary cloud base sizes so they don't repeat identically
    this.baseW = 90 + Math.random() * 40;
    this.baseH = 40 + Math.random() * 15;
    
    // Offset for noise pattern
    this.noiseOffsetX = Math.random() * 128;
    this.noiseOffsetY = Math.random() * 128;

    // Unique seed for procedural shape generation
    this.seed = Math.random() * 100;
    
    // Generate overlapping curved/spiral lobes for back layer (shadow/volume)
    this.lobesBack = this.generateLobes(4 + Math.floor(Math.random() * 3), this.baseW, this.baseH);
    
    // Generate overlapping curved/spiral lobes for front layer (highlight/main body)
    this.lobesFront = this.generateLobes(3 + Math.floor(Math.random() * 2), this.baseW * 0.9, this.baseH * 0.9);
    
    // Generate internal curved contour strokes to give a swirling look
    this.contours = this.generateContours(2 + Math.floor(Math.random() * 2), this.baseW, this.baseH);

    this.cachedCanvas = null;
    this.cacheCloud();
  }

  cacheCloud() {
    this.cachedCanvas = document.createElement('canvas');
    const padding = 20; // To account for lobes extending beyond baseW/baseH
    this.cachedCanvas.width = this.baseW + padding * 2;
    this.cachedCanvas.height = this.baseH + padding * 2;
    
    const ctx = this.cachedCanvas.getContext('2d');
    ctx.translate(padding + this.baseW * 0.5, padding + this.baseH * 0.5);

    const w = this.baseW;
    const h = this.baseH;

    // 1. Build clipping path of the entire cloud (back lobes + base)
    ctx.beginPath();
    for (const lobe of this.lobesBack) {
      drawOrganicLobe(ctx, lobe.x - w * 0.5, lobe.y - h * 0.5, lobe.r, lobe.seed);
    }
    // Solid core for the base so there are no holes
    drawOrganicLobe(ctx, 0, h * 0.15, w * 0.35, this.seed); 
    
    ctx.save();
    ctx.clip(); // Clip everything to the back lobes & core

    // Fill the back layer area
    ctx.fillStyle = '#282834';
    ctx.fillRect(-w, -h, w * 2, h * 2);

    // Draw the front layer area
    ctx.fillStyle = '#3a3a4a';
    ctx.beginPath();
    for (const lobe of this.lobesFront) {
      drawOrganicLobe(ctx, lobe.x - w * 0.5, lobe.y - h * 0.5 + h * 0.1, lobe.r, lobe.seed + 100);
    }
    // Solid core for the front layer
    drawOrganicLobe(ctx, 0, h * 0.25, w * 0.3, this.seed + 100);
    ctx.fill();

    // Subtle curved internal strokes/contours (swirling wind-like appearance)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const c of this.contours) {
      ctx.moveTo(c.sx - w * 0.5, c.sy - h * 0.5);
      ctx.bezierCurveTo(c.cp1x - w * 0.5, c.cp1y - h * 0.5, c.cp2x - w * 0.5, c.cp2y - h * 0.5, c.ex - w * 0.5, c.ey - h * 0.5);
    }
    
    // Add some swooping strokes around the top front lobes
    for (let i = 0; i < this.lobesFront.length; i += 2) {
       const lobe = this.lobesFront[i];
       const lx = lobe.x - w * 0.5;
       const ly = lobe.y - h * 0.5;
       ctx.moveTo(lx - lobe.r * 0.7, ly - lobe.r * 0.2);
       ctx.quadraticCurveTo(lx, ly - lobe.r * 0.9, lx + lobe.r * 0.8, ly + lobe.r * 0.1);
    }
    ctx.stroke();

    // Overlay procedural noise texture inside the cloud
    ctx.fillStyle = getNoisePattern(ctx);
    ctx.save();
    ctx.translate(this.noiseOffsetX, this.noiseOffsetY);
    ctx.fillRect(-this.noiseOffsetX - w, -this.noiseOffsetY - h, w * 2, h * 2);
    ctx.restore();

    ctx.restore(); // Remove clipping mask

    // Subtle outline on the outside edge to frame the organic shape
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (const lobe of this.lobesBack) {
      drawOrganicLobe(ctx, lobe.x - w * 0.5, lobe.y - h * 0.5, lobe.r, lobe.seed);
    }
    drawOrganicLobe(ctx, 0, h * 0.15, w * 0.35, this.seed); 
    ctx.stroke();
  }

  generateLobes(count, w, h) {
    const lobes = [];
    for (let i = 0; i < count; i++) {
      // Distribute lobes horizontally along the cloud length
      const nx = 0.1 + (i / count) * 0.8 + (Math.random() * 0.2 - 0.1);
      const ny = 0.4 + Math.random() * 0.3;
      // Vary radius, making the center ones generally larger
      const edgeFactor = 1 - Math.abs(nx - 0.5) * 2; 
      const r = (h * 0.25) + (edgeFactor * h * 0.35) + (Math.random() * h * 0.15);
      
      lobes.push({
        x: nx * w,
        y: ny * h,
        r: r,
        seed: this.seed + i * 7.3
      });
    }
    
    // Add a few small scattered irregular bumps
    const numBumps = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numBumps; i++) {
       lobes.push({
         x: (0.15 + Math.random() * 0.7) * w,
         y: (0.3 + Math.random() * 0.5) * h,
         r: h * 0.15 + Math.random() * h * 0.15,
         seed: this.seed + i * 11.1
       });
    }
    return lobes;
  }

  generateContours(count, w, h) {
    const contours = [];
    for (let i = 0; i < count; i++) {
      const sx = (0.2 + Math.random() * 0.4) * w;
      const sy = (0.3 + Math.random() * 0.5) * h;
      
      const ex = sx + (0.2 + Math.random() * 0.3) * w;
      const ey = sy - (0.1 + Math.random() * 0.2) * h;
      
      // Control points for a swooping wind/swirl curve
      const cp1x = sx + (Math.random() * 0.2) * w;
      const cp1y = sy - (0.2 + Math.random() * 0.3) * h;
      
      const cp2x = ex - (Math.random() * 0.2) * w;
      const cp2y = ey + (0.2 + Math.random() * 0.3) * h;
      
      contours.push({ sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey });
    }
    return contours;
  }

  get width() {
    return this.baseW * this.scale;
  }

  update(speed, frameScale = 1) {
    this.x -= speed * CLOUD_SPEED_FACTOR * this.parallax * frameScale;
  }

  draw(ctx) {
    if (!this.cachedCanvas) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);

    const alpha = 0.5 + (this.parallax * 0.5);
    ctx.globalAlpha = alpha;
    
    const padding = 20;
    ctx.drawImage(this.cachedCanvas, -padding - this.baseW * 0.5, -padding - this.baseH * 0.5);

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
    const type = Math.floor(Math.random() * 3); // Kept for compatibility though procedural now varies naturally
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
