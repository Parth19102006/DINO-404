/**
 * Dragon Runner - Redesigned Canvas-Drawn Obstacles
 * Faithfully matches the provided visual reference for all 6 obstacles:
 * 1. STONE (44x36 visual, 44x26 collision) - Rounded boulder with side pebble and grass sprigs (+10 pts)
 * 2. CRYSTAL (50x55 visual, 44x42 collision) - Central tall crystal spire with flanking crystals & shards (+20 pts)
 * 3. BUSH (60x55 visual, 52x34 collision) - Fan-shaped radiating pointed foliage cluster (+30 pts)
 * 4. RUINS (65x65 visual, 58x46 collision) - Broken left column, fallen fragment, right pillar with lintel (+40 pts)
 * 5. ROCK SPIKES (65x60 visual, 60x44 collision) - Five sharp triangular spires in stepped row (+50 pts)
 * 6. FLYING (58x34) - Winged dragon/drone soaring at altitude (+30 pts)
 */

import { GROUND_Y } from './constants.js';

const VISUAL_OBSTACLE_SCALE = 1.9;

const obstacleCache = {};

export class Obstacle {
  constructor(config, x, altitude = 0) {
    this.type = config.type;
    this.width = config.w;
    this.height = config.h;
    this.points = config.points || 10;
    this.isFlying = config.isFlying || false;
    this.passed = false; // Tracks if points were already awarded
    this.x = x;
    this.altitude = altitude;

    // Ground obstacles sit on GROUND_Y; Flying obstacles hover at GROUND_Y - altitude
    if (this.isFlying) {
      this.y = GROUND_Y - this.height - this.altitude;
    } else {
      this.y = GROUND_Y - this.height;
    }

    this.flapTimer = 0;
  }

  update(speed, frameScale = 1) {
    this.x -= speed * frameScale;
    if (this.isFlying) {
      this.flapTimer += 0.09 * frameScale;
    }
  }

  /**
   * Inset collision box for fair AABB collision detection.
   */
  getCollisionBox() {
    const padX = this.isFlying ? 6 : 5;
    const padY = this.isFlying ? 6 : 5;
    return {
      x: this.x + padX,
      y: this.y + padY,
      w: Math.max(this.width - (padX * 2), 10),
      h: Math.max(this.height - padY, 12)
    };
  }

  draw(ctx) {
    const renderDimensions = this.getRenderDimensions();
    
    // Only static obstacles are cached; flying obstacle is animated
    if (!this.isFlying) {
      if (!obstacleCache[this.type]) {
        const c = document.createElement('canvas');
        c.width = renderDimensions.w;
        c.height = renderDimensions.h;
        const cctx = c.getContext('2d');
        
        cctx.save();
        // Since we are drawing at 0,0 in the cache canvas, we adjust scaling
        // The original rendering centered it based on this.x and this.y, 
        // we'll center it locally in the cache canvas
        cctx.scale(renderDimensions.w / this.width, renderDimensions.h / this.height);
        
        // original switch used this.width and this.height
        switch (this.type) {
          case 'STONE': this.drawStone(cctx); break;
          case 'CRYSTAL': this.drawCrystal(cctx); break;
          case 'BUSH': this.drawSingleSpike(cctx); break;
          case 'RUINS': this.drawRuins(cctx); break;
          case 'ROCK_SPIKES': this.drawRockSpikes(cctx); break;
          default: this.drawStone(cctx);
        }
        cctx.restore();
        obstacleCache[this.type] = c;
      }
      
      const drawX = this.x - ((renderDimensions.w - this.width) / 2);
      const drawY = this.y - (renderDimensions.h - this.height);
      ctx.drawImage(obstacleCache[this.type], drawX, drawY);
      return;
    }

    // Dynamic drawing for flying obstacles
    ctx.save();
    ctx.translate(
      this.x - ((renderDimensions.w - this.width) / 2),
      this.y - (renderDimensions.h - this.height)
    );
    ctx.scale(renderDimensions.w / this.width, renderDimensions.h / this.height);

    switch (this.type) {
      case 'STONE':
        this.drawStone(ctx);
        break;
      case 'CRYSTAL':
        this.drawCrystal(ctx);
        break;
      case 'BUSH':
        this.drawSingleSpike(ctx);
        break;
      case 'RUINS':
        this.drawRuins(ctx);
        break;
      case 'ROCK_SPIKES':
        this.drawRockSpikes(ctx);
        break;
      case 'FLYING':
        this.drawFlying(ctx);
        break;
      default:
        this.drawStone(ctx);
    }

    ctx.restore();
  }

  getRenderDimensions() {
    const scale = VISUAL_OBSTACLE_SCALE;

    switch (this.type) {
      case 'STONE':
        return { w: 44 * scale, h: 44 * scale };
      case 'CRYSTAL':
        return { w: 55 * scale, h: 50 * scale };
      case 'BUSH':
        return { w: 45 * scale, h: 55 * scale };
      case 'RUINS':
        return { w: 70 * scale, h: 60 * scale };
      case 'ROCK_SPIKES':
        return { w: 70 * scale, h: 55 * scale };
      case 'FLYING':
        return { w: 58 * scale, h: 46 * scale };
      default:
        return { w: this.width * scale, h: this.height * scale };
    }
  }

  // 1. STONE (44x26) — Rounded faceted boulder with side pebble and grass
  drawStone(ctx) {
    const w = this.width;
    const h = this.height;

    // Main boulder shadow underside
    ctx.fillStyle = '#22222a';
    ctx.beginPath();
    ctx.moveTo(w * 0.4, h * 0.15);
    ctx.lineTo(w * 0.72, h * 0.35);
    ctx.lineTo(w * 0.76, h);
    ctx.lineTo(w * 0.1, h);
    ctx.closePath();
    ctx.fill();

    // Main boulder light facet
    ctx.fillStyle = '#d4d4de';
    ctx.beginPath();
    ctx.moveTo(w * 0.35, 2);
    ctx.lineTo(w * 0.08, h * 0.6);
    ctx.lineTo(w * 0.15, h);
    ctx.lineTo(w * 0.55, h);
    ctx.lineTo(w * 0.45, h * 0.4);
    ctx.closePath();
    ctx.fill();

    // Top bright highlight facet
    ctx.fillStyle = '#f0f0f8';
    ctx.beginPath();
    ctx.moveTo(w * 0.35, 2);
    ctx.lineTo(w * 0.18, h * 0.35);
    ctx.lineTo(w * 0.45, h * 0.4);
    ctx.lineTo(w * 0.58, h * 0.2);
    ctx.closePath();
    ctx.fill();

    // Right smaller pebble
    ctx.fillStyle = '#888896';
    ctx.beginPath();
    ctx.ellipse(w * 0.82, h * 0.78, w * 0.12, h * 0.22, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#30303a';
    ctx.beginPath();
    ctx.ellipse(w * 0.84, h * 0.82, w * 0.09, h * 0.16, 0.2, 0, Math.PI);
    ctx.fill();

    // Outlines & cracks
    ctx.strokeStyle = '#121216';
    ctx.lineWidth = 1.8;
    // Boulder outline
    ctx.beginPath();
    ctx.moveTo(w * 0.08, h * 0.6);
    ctx.lineTo(w * 0.35, 2);
    ctx.lineTo(w * 0.58, h * 0.2);
    ctx.lineTo(w * 0.74, h * 0.5);
    ctx.lineTo(w * 0.75, h);
    ctx.lineTo(w * 0.1, h);
    ctx.closePath();
    ctx.stroke();

    // Small pebble outline
    ctx.beginPath();
    ctx.arc(w * 0.82, h * 0.78, w * 0.12, 0, Math.PI * 2);
    ctx.stroke();

    // Internal crack
    ctx.strokeStyle = '#282832';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(w * 0.35, 2);
    ctx.lineTo(w * 0.45, h * 0.4);
    ctx.lineTo(w * 0.38, h * 0.8);
    ctx.stroke();

    // Base grass tufts
    ctx.fillStyle = '#3e3e4a';
    ctx.beginPath();
    ctx.moveTo(0, h); ctx.lineTo(w * 0.06, h * 0.6); ctx.lineTo(w * 0.08, h);
    ctx.moveTo(w * 0.88, h); ctx.lineTo(w * 0.95, h * 0.55); ctx.lineTo(w, h);
    ctx.fill();

    // White rim highlight
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.12, h * 0.55);
    ctx.lineTo(w * 0.35, 3);
    ctx.lineTo(w * 0.55, h * 0.18);
    ctx.stroke();
  }

  // 2. CRYSTAL (50x45) — Central tall crystal spire with flanking crystals
  drawCrystal(ctx) {
    const w = this.width;
    const h = this.height;

    // Center tall crystal (apex at w*0.4, 2)
    ctx.fillStyle = '#f2f2fa';
    ctx.beginPath();
    ctx.moveTo(w * 0.4, 2);
    ctx.lineTo(w * 0.25, h * 0.4);
    ctx.lineTo(w * 0.35, h);
    ctx.lineTo(w * 0.4, h);
    ctx.fill();

    ctx.fillStyle = '#2c2c38';
    ctx.beginPath();
    ctx.moveTo(w * 0.4, 2);
    ctx.lineTo(w * 0.6, h * 0.35);
    ctx.lineTo(w * 0.5, h);
    ctx.lineTo(w * 0.4, h);
    ctx.fill();

    // Right smaller crystal (apex at w*0.75, h*0.3)
    ctx.fillStyle = '#c4c4d4';
    ctx.beginPath();
    ctx.moveTo(w * 0.75, h * 0.3);
    ctx.lineTo(w * 0.55, h * 0.6);
    ctx.lineTo(w * 0.65, h);
    ctx.fill();

    ctx.fillStyle = '#1e1e26';
    ctx.beginPath();
    ctx.moveTo(w * 0.75, h * 0.3);
    ctx.lineTo(w * 0.9, h * 0.65);
    ctx.lineTo(w * 0.75, h);
    ctx.fill();

    // Left smaller crystal (apex at w*0.15, h*0.4)
    ctx.fillStyle = '#8e8e9e';
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.4);
    ctx.lineTo(w * 0.05, h * 0.7);
    ctx.lineTo(w * 0.15, h);
    ctx.fill();

    ctx.fillStyle = '#3a3a46';
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.4);
    ctx.lineTo(w * 0.3, h * 0.6);
    ctx.lineTo(w * 0.2, h);
    ctx.fill();

    // Outlines & highlights
    ctx.strokeStyle = '#121216';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // center
    ctx.moveTo(w * 0.4, 2); ctx.lineTo(w * 0.25, h * 0.4); ctx.lineTo(w * 0.35, h);
    ctx.moveTo(w * 0.4, 2); ctx.lineTo(w * 0.6, h * 0.35); ctx.lineTo(w * 0.5, h);
    ctx.moveTo(w * 0.4, 2); ctx.lineTo(w * 0.4, h);
    // right
    ctx.moveTo(w * 0.75, h * 0.3); ctx.lineTo(w * 0.55, h * 0.6);
    ctx.moveTo(w * 0.75, h * 0.3); ctx.lineTo(w * 0.9, h * 0.65); ctx.lineTo(w * 0.75, h);
    ctx.moveTo(w * 0.75, h * 0.3); ctx.lineTo(w * 0.65, h);
    // left
    ctx.moveTo(w * 0.15, h * 0.4); ctx.lineTo(w * 0.05, h * 0.7); ctx.lineTo(w * 0.15, h);
    ctx.moveTo(w * 0.15, h * 0.4); ctx.lineTo(w * 0.3, h * 0.6);
    ctx.moveTo(w * 0.15, h * 0.4); ctx.lineTo(w * 0.2, h);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.39, 4); ctx.lineTo(w * 0.26, h * 0.4);
    ctx.moveTo(w * 0.74, h * 0.32); ctx.lineTo(w * 0.57, h * 0.6);
    ctx.stroke();
  }

  // 3. SINGLE SPIKE (40x50) (Replaces BUSH)
  drawSingleSpike(ctx) {
    const w = this.width;
    const h = this.height;

    // Main spike bright left facet
    ctx.fillStyle = '#d4d4de';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 2);
    ctx.lineTo(w * 0.2, h * 0.4);
    ctx.lineTo(w * 0.1, h);
    ctx.lineTo(w * 0.5, h);
    ctx.fill();

    // Main spike dark right facet
    ctx.fillStyle = '#30303a';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 2);
    ctx.lineTo(w * 0.8, h * 0.45);
    ctx.lineTo(w * 0.9, h);
    ctx.lineTo(w * 0.5, h);
    ctx.fill();

    // Base jagged rocks
    ctx.fillStyle = '#22222a';
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h);
    ctx.lineTo(w * 0.2, h * 0.8);
    ctx.lineTo(w * 0.4, h * 0.9);
    ctx.lineTo(w * 0.7, h * 0.75);
    ctx.lineTo(w * 0.95, h);
    ctx.fill();

    // Cracks & shading lines
    ctx.strokeStyle = '#121216';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    // Outline
    ctx.moveTo(w * 0.1, h);
    ctx.lineTo(w * 0.2, h * 0.4);
    ctx.lineTo(w * 0.5, 2);
    ctx.lineTo(w * 0.8, h * 0.45);
    ctx.lineTo(w * 0.9, h);
    
    // Center ridge
    ctx.moveTo(w * 0.5, 2);
    ctx.lineTo(w * 0.45, h * 0.4);
    ctx.lineTo(w * 0.5, h * 0.7);
    ctx.lineTo(w * 0.5, h);
    
    // Side cracks
    ctx.moveTo(w * 0.2, h * 0.4);
    ctx.lineTo(w * 0.35, h * 0.55);
    
    ctx.moveTo(w * 0.8, h * 0.45);
    ctx.lineTo(w * 0.65, h * 0.6);
    
    ctx.stroke();

    // White rim highlight
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.48, 4);
    ctx.lineTo(w * 0.22, h * 0.4);
    ctx.stroke();
  }

  // 4. RUINS (65x55)
  drawRuins(ctx) {
    const w = this.width;
    const h = this.height;

    // Pillar 1 (Left)
    ctx.fillStyle = '#d2d2dc'; // Light
    ctx.fillRect(w * 0.1, h * 0.3, w * 0.15, h * 0.7);
    ctx.fillStyle = '#303038'; // Dark
    ctx.fillRect(w * 0.25, h * 0.3, w * 0.05, h * 0.7);
    
    // Left broken top
    ctx.fillStyle = '#18181f';
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.3);
    ctx.lineTo(w * 0.15, h * 0.2);
    ctx.lineTo(w * 0.3, h * 0.3);
    ctx.fill();

    // Pillar 2 (Right)
    ctx.fillStyle = '#d2d2dc'; // Light
    ctx.fillRect(w * 0.65, h * 0.2, w * 0.15, h * 0.8);
    ctx.fillStyle = '#303038'; // Dark
    ctx.fillRect(w * 0.8, h * 0.2, w * 0.05, h * 0.8);

    // Arch/beam connecting them (partially broken)
    ctx.fillStyle = '#dcdce4'; // Light
    ctx.fillRect(w * 0.45, h * 0.1, w * 0.35, h * 0.15);
    ctx.fillStyle = '#2a2a32'; // Dark
    ctx.fillRect(w * 0.45, h * 0.25, w * 0.35, h * 0.05);

    // Middle small broken pillar
    ctx.fillStyle = '#7a7a88';
    ctx.fillRect(w * 0.4, h * 0.6, w * 0.15, h * 0.4);
    
    // Outlines & Masonry
    ctx.strokeStyle = '#121216';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Left pillar outline
    ctx.rect(w * 0.1, h * 0.3, w * 0.2, h * 0.7);
    // Right pillar outline
    ctx.rect(w * 0.65, h * 0.2, w * 0.2, h * 0.8);
    // Beam outline
    ctx.rect(w * 0.45, h * 0.1, w * 0.35, h * 0.2);
    // Mid pillar outline
    ctx.rect(w * 0.4, h * 0.6, w * 0.15, h * 0.4);
    
    // Cracks / block separators
    ctx.moveTo(w * 0.1, h * 0.5); ctx.lineTo(w * 0.3, h * 0.5);
    ctx.moveTo(w * 0.1, h * 0.75); ctx.lineTo(w * 0.3, h * 0.75);
    ctx.moveTo(w * 0.65, h * 0.45); ctx.lineTo(w * 0.85, h * 0.45);
    ctx.moveTo(w * 0.65, h * 0.7); ctx.lineTo(w * 0.85, h * 0.7);
    ctx.stroke();

    // White highlights
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(w * 0.46, h * 0.12); ctx.lineTo(w * 0.78, h * 0.12);
    ctx.stroke();
  }

  // 5. ROCK SPIKES (65x50)
  drawRockSpikes(ctx) {
    const w = this.width;
    const h = this.height;

    // 4 Spikes
    const spires = [
      { x1: 0, xPeak: w * 0.2, x2: w * 0.35, yPeak: h * 0.3 },
      { x1: w * 0.15, xPeak: w * 0.45, x2: w * 0.75, yPeak: 2 }, // Center tallest
      { x1: w * 0.5, xPeak: w * 0.7, x2: w * 0.85, yPeak: h * 0.25 },
      { x1: w * 0.7, xPeak: w * 0.9, x2: w, yPeak: h * 0.4 }
    ];

    for (const s of spires) {
      // Left bright facet
      ctx.fillStyle = '#ececf4';
      ctx.beginPath();
      ctx.moveTo(s.x1, h);
      ctx.lineTo(s.xPeak, s.yPeak);
      ctx.lineTo(s.xPeak, h);
      ctx.closePath();
      ctx.fill();

      // Right shadow facet
      ctx.fillStyle = '#24242e';
      ctx.beginPath();
      ctx.moveTo(s.xPeak, s.yPeak);
      ctx.lineTo(s.x2, h);
      ctx.lineTo(s.xPeak, h);
      ctx.closePath();
      ctx.fill();

      // Outline
      ctx.strokeStyle = '#121216';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(s.x1, h);
      ctx.lineTo(s.xPeak, s.yPeak);
      ctx.lineTo(s.x2, h);
      ctx.moveTo(s.xPeak, s.yPeak);
      ctx.lineTo(s.xPeak, h);
      ctx.stroke();

      // White ridge highlight
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(s.x1 + 2, h - 2);
      ctx.lineTo(s.xPeak, s.yPeak + 2);
      ctx.stroke();
    }
  }

  // 6. FLYING (58x34) — Winged dragon/drone soaring at altitude
  drawFlying(ctx) {
    const w = this.width;
    const h = this.height;
    const flap = Math.sin(this.flapTimer) * 5;

    // Wing Membrane (Bright Monochrome Fill)
    ctx.fillStyle = '#e8e8f2';
    ctx.beginPath();
    // Left Wing
    ctx.moveTo(w * 0.45, h * 0.45);
    ctx.lineTo(w * 0.08, h * 0.1 + flap);
    ctx.quadraticCurveTo(w * 0.18, h * 0.5 + flap, w * 0.35, h * 0.6);
    ctx.closePath();
    ctx.fill();

    // Right Wing
    ctx.beginPath();
    ctx.moveTo(w * 0.55, h * 0.45);
    ctx.lineTo(w * 0.95, h * 0.1 - flap);
    ctx.quadraticCurveTo(w * 0.85, h * 0.5 - flap, w * 0.65, h * 0.6);
    ctx.closePath();
    ctx.fill();

    // Dark Wing Underside Shadows
    ctx.fillStyle = '#262630';
    ctx.beginPath();
    ctx.moveTo(w * 0.45, h * 0.5);
    ctx.lineTo(w * 0.12, h * 0.25 + flap);
    ctx.lineTo(w * 0.35, h * 0.6);
    ctx.closePath();
    ctx.fill();

    // Dragon Body & Head
    ctx.fillStyle = '#484856';
    ctx.beginPath();
    // Head with snout & horns
    ctx.ellipse(w * 0.68, h * 0.5, w * 0.14, h * 0.22, 0.2, 0, Math.PI * 2);
    // Torso & curled tail
    ctx.ellipse(w * 0.48, h * 0.6, w * 0.16, h * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Horns
    ctx.fillStyle = '#dcdce8';
    ctx.beginPath();
    ctx.moveTo(w * 0.68, h * 0.35);
    ctx.lineTo(w * 0.6, h * 0.18);
    ctx.lineTo(w * 0.64, h * 0.38);
    ctx.fill();

    // Glowing Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w * 0.74, h * 0.46, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#121216';
    ctx.beginPath();
    ctx.arc(w * 0.75, h * 0.46, 1, 0, Math.PI * 2);
    ctx.fill();

    // Wing Bone Struts & Outlines
    ctx.strokeStyle = '#121216';
    ctx.lineWidth = 1.8;
    // Left wing strut
    ctx.beginPath();
    ctx.moveTo(w * 0.45, h * 0.45);
    ctx.lineTo(w * 0.08, h * 0.1 + flap);
    ctx.lineTo(w * 0.35, h * 0.6);
    ctx.stroke();
    // Right wing strut
    ctx.beginPath();
    ctx.moveTo(w * 0.55, h * 0.45);
    ctx.lineTo(w * 0.95, h * 0.1 - flap);
    ctx.lineTo(w * 0.65, h * 0.6);
    ctx.stroke();

    // White wing edge highlights
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(w * 0.45, h * 0.42);
    ctx.lineTo(w * 0.1, h * 0.12 + flap);
    ctx.moveTo(w * 0.55, h * 0.42);
    ctx.lineTo(w * 0.93, h * 0.12 - flap);
    ctx.stroke();
  }
}
