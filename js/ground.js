/**
 * Dragon Runner - Code-Drawn Scrolling Ground
 * Rendered entirely via Canvas 2D API.
 * Features a crisp top surface line, dark rocky underside, irregular rocks,
 * cracks, and procedural pebbles with seamless right-to-left scrolling.
 */

import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y, INITIAL_SPEED } from './constants.js';

export class Ground {
  constructor() {
    this.offsetX = 0;
    this.patternWidth = 1200; // Repeat period for procedural features
    this.features = this.generateFeatures();
    this.cachedCanvas = null;
    this.cacheGround();
  }

  cacheGround() {
    this.cachedCanvas = document.createElement('canvas');
    this.cachedCanvas.width = this.patternWidth;
    this.cachedCanvas.height = GAME_HEIGHT - GROUND_Y;
    
    const ctx = this.cachedCanvas.getContext('2d');
    
    // Procedural features
    for (const feat of this.features) {
      const renderY = feat.y - GROUND_Y;
      
      if (feat.type === 'pebble') {
        ctx.fillStyle = feat.color;
        ctx.fillRect(feat.x, renderY, feat.size, feat.size);
      } else if (feat.type === 'rock') {
        ctx.fillStyle = feat.color;
        ctx.beginPath();
        ctx.moveTo(feat.x + feat.points[0].dx, renderY + feat.points[0].dy);
        for (let p = 1; p < feat.points.length; p++) {
          ctx.lineTo(feat.x + feat.points[p].dx, renderY + feat.points[p].dy);
        }
        ctx.closePath();
        ctx.fill();
      } else if (feat.type === 'crack') {
        ctx.strokeStyle = feat.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(feat.x, renderY);
        ctx.lineTo(feat.x + feat.dx, renderY + feat.dy);
        ctx.stroke();
      }
    }
  }

  /**
   * Generates deterministic procedural features (rocks, cracks, pebbles)
   * that seamlessly tile every `this.patternWidth` pixels.
   */
  generateFeatures() {
    const features = [];
    // Seeded pseudo-random placement within [0, patternWidth]
    const count = 75;
    for (let i = 0; i < count; i++) {
      // Use deterministic pseudo-random formula based on index
      const seed = Math.sin(i * 12.9898) * 43758.5453;
      const rand1 = seed - Math.floor(seed);
      const rand2 = (seed * 10) - Math.floor(seed * 10);
      const rand3 = (seed * 100) - Math.floor(seed * 100);

      const x = rand1 * this.patternWidth;
      const depth = 4 + rand2 * 65; // depth below GROUND_Y
      const y = GROUND_Y + depth;

      if (rand3 < 0.35) {
        // Pebble / Dot feature
        features.push({
          type: 'pebble',
          x,
          y,
          size: 1 + Math.floor(rand2 * 3),
          color: rand2 > 0.5 ? '#44444c' : '#2d2d32'
        });
      } else if (rand3 < 0.70) {
        // Irregular Rock feature
        const w = 6 + rand1 * 14;
        const h = 4 + rand2 * 10;
        features.push({
          type: 'rock',
          x,
          y,
          w,
          h,
          points: [
            { dx: 0, dy: h / 2 },
            { dx: w * 0.3, dy: 0 },
            { dx: w * 0.8, dy: h * 0.2 },
            { dx: w, dy: h },
            { dx: w * 0.2, dy: h * 0.9 }
          ],
          color: rand1 > 0.5 ? '#333338' : '#28282d'
        });
      } else {
        // Crack line feature
        const length = 8 + rand1 * 16;
        features.push({
          type: 'crack',
          x,
          y,
          dx: length * (rand2 > 0.5 ? 1 : -1),
          dy: length * 0.5,
          color: '#111115'
        });
      }
    }
    return features;
  }

  update(speed = INITIAL_SPEED, frameScale = 1) {
    this.offsetX += speed * frameScale;
    if (this.offsetX >= this.patternWidth) {
      this.offsetX -= this.patternWidth;
    }
  }

  draw(ctx) {
    // 1. Dark Rocky Underside (from GROUND_Y to GAME_HEIGHT)
    ctx.fillStyle = '#1c1c20';
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

    // 2. Draw cached features
    if (this.cachedCanvas) {
      const drawX = -this.offsetX;
      ctx.drawImage(this.cachedCanvas, drawX, GROUND_Y);
      // If we need to loop around
      if (drawX + this.patternWidth < GAME_WIDTH) {
        ctx.drawImage(this.cachedCanvas, drawX + this.patternWidth, GROUND_Y);
      }
    }

    // 3. Crisp Top Surface Line (White / Light Gray running surface at exact GROUND_Y)
    ctx.strokeStyle = '#e6e6e6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(GAME_WIDTH, GROUND_Y);
    ctx.stroke();

    // Subtle dark accent line immediately beneath top surface
    ctx.strokeStyle = '#3a3a40';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 2);
    ctx.lineTo(GAME_WIDTH, GROUND_Y + 2);
    ctx.stroke();
  }
}
