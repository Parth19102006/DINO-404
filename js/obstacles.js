/**
 * Dragon Runner - Canvas-Drawn Obstacles
 * Renders six distinct monochrome obstacles programmatically:
 * STONE, CRYSTAL, BUSH, RUINS, ROCK SPIKES, and ARCHWAY.
 */

import { GROUND_Y } from './constants.js';

export class Obstacle {
  constructor(typeConfig, x) {
    this.type = typeConfig.type;
    this.width = typeConfig.w;
    this.height = typeConfig.h;
    this.x = x;
    this.y = GROUND_Y - this.height;
  }

  update(speed) {
    this.x -= speed;
  }

  /**
   * Returns inset collision box for fair AABB collision detection.
   */
  getCollisionBox() {
    const padX = 4;
    const padY = 4;
    return {
      x: this.x + padX,
      y: this.y + padY,
      w: this.width - (padX * 2),
      h: this.height - padY
    };
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    switch (this.type) {
      case 'STONE':
        this.drawStone(ctx);
        break;
      case 'CRYSTAL':
        this.drawCrystal(ctx);
        break;
      case 'BUSH':
        this.drawBush(ctx);
        break;
      case 'RUINS':
        this.drawRuins(ctx);
        break;
      case 'ROCK_SPIKES':
        this.drawRockSpikes(ctx);
        break;
      case 'ARCHWAY':
        this.drawArchway(ctx);
        break;
      default:
        this.drawStone(ctx);
    }

    ctx.restore();
  }

  // 1. STONE (40x30)
  drawStone(ctx) {
    const w = this.width;
    const h = this.height;

    // Dark shadow facet
    ctx.fillStyle = '#2d2d34';
    ctx.beginPath();
    ctx.moveTo(w * 0.4, 0);
    ctx.lineTo(w, h * 0.4);
    ctx.lineTo(w, h);
    ctx.lineTo(w * 0.45, h);
    ctx.closePath();
    ctx.fill();

    // Main light facet
    ctx.fillStyle = '#e0e0e6';
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h);
    ctx.lineTo(0, h * 0.6);
    ctx.lineTo(w * 0.4, 0);
    ctx.lineTo(w * 0.45, h);
    ctx.closePath();
    ctx.fill();

    // Crack detail lines
    ctx.strokeStyle = '#18181d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.6);
    ctx.lineTo(w * 0.4, 0);
    ctx.lineTo(w, h * 0.4);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = '#383840';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.25, h * 0.3);
    ctx.lineTo(w * 0.35, h * 0.7);
    ctx.stroke();

    // Top highlight
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.55);
    ctx.lineTo(w * 0.38, 2);
    ctx.stroke();
  }

  // 2. CRYSTAL (42x38)
  drawCrystal(ctx) {
    const w = this.width;
    const h = this.height;

    // Central tall crystal
    // Left bright facet
    ctx.fillStyle = '#e6e6f0';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 0);
    ctx.lineTo(w * 0.25, h * 0.4);
    ctx.lineTo(w * 0.45, h);
    ctx.lineTo(w * 0.5, h);
    ctx.closePath();
    ctx.fill();

    // Right dark facet
    ctx.fillStyle = '#30303c';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 0);
    ctx.lineTo(w * 0.75, h * 0.35);
    ctx.lineTo(w * 0.65, h);
    ctx.lineTo(w * 0.5, h);
    ctx.closePath();
    ctx.fill();

    // Left smaller crystal
    ctx.fillStyle = '#c5c5d0';
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.3);
    ctx.lineTo(0, h * 0.6);
    ctx.lineTo(w * 0.25, h);
    ctx.closePath();
    ctx.fill();

    // Right smaller crystal
    ctx.fillStyle = '#22222a';
    ctx.beginPath();
    ctx.moveTo(w * 0.8, h * 0.35);
    ctx.lineTo(w, h * 0.65);
    ctx.lineTo(w * 0.75, h);
    ctx.closePath();
    ctx.fill();

    // Outlines
    ctx.strokeStyle = '#141418';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Central crystal outline
    ctx.moveTo(w * 0.5, 0);
    ctx.lineTo(w * 0.25, h * 0.4);
    ctx.lineTo(w * 0.25, h);
    ctx.moveTo(w * 0.5, 0);
    ctx.lineTo(w * 0.75, h * 0.35);
    ctx.lineTo(w * 0.75, h);
    ctx.moveTo(w * 0.5, 0);
    ctx.lineTo(w * 0.5, h);
    // Left crystal outline
    ctx.moveTo(w * 0.2, h * 0.3);
    ctx.lineTo(0, h * 0.6);
    ctx.lineTo(0, h);
    // Right crystal outline
    ctx.moveTo(w * 0.8, h * 0.35);
    ctx.lineTo(w, h * 0.65);
    ctx.lineTo(w, h);
    ctx.stroke();

    // White highlights
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.48, 2);
    ctx.lineTo(w * 0.26, h * 0.38);
    ctx.moveTo(w * 0.19, h * 0.32);
    ctx.lineTo(2, h * 0.58);
    ctx.stroke();
  }

  // 3. BUSH (50x35)
  drawBush(ctx) {
    const w = this.width;
    const h = this.height;

    // Dark core shadow
    ctx.fillStyle = '#24242c';
    ctx.beginPath();
    ctx.arc(w * 0.3, h * 0.6, 14, 0, Math.PI * 2);
    ctx.arc(w * 0.7, h * 0.6, 14, 0, Math.PI * 2);
    ctx.arc(w * 0.5, h * 0.4, 16, 0, Math.PI * 2);
    ctx.fill();

    // Main foliage fill
    ctx.fillStyle = '#cfcfd8';
    ctx.beginPath();
    ctx.arc(w * 0.25, h * 0.55, 12, 0, Math.PI * 2);
    ctx.arc(w * 0.72, h * 0.55, 12, 0, Math.PI * 2);
    ctx.arc(w * 0.48, h * 0.38, 15, 0, Math.PI * 2);
    ctx.fill();

    // Outlines & leaf details
    ctx.strokeStyle = '#16161a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w * 0.25, h * 0.55, 12, Math.PI * 0.8, Math.PI * 1.8);
    ctx.arc(w * 0.48, h * 0.38, 15, Math.PI * 1.1, Math.PI * 1.9);
    ctx.arc(w * 0.72, h * 0.55, 12, Math.PI * 1.3, Math.PI * 2.2);
    ctx.stroke();

    // Base boundary line
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w, h);
    ctx.stroke();

    // Light top highlights
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w * 0.48, h * 0.38, 13, Math.PI * 1.25, Math.PI * 1.7);
    ctx.stroke();
  }

  // 4. RUINS (50x48)
  drawRuins(ctx) {
    const w = this.width;
    const h = this.height;

    // Pillar body - main light face
    ctx.fillStyle = '#d8d8e0';
    ctx.fillRect(0, 0, w * 0.7, h);

    // Pillar body - shadow face
    ctx.fillStyle = '#32323a';
    ctx.fillRect(w * 0.7, 0, w * 0.3, h);

    // Chipped top corner cutout
    ctx.fillStyle = '#18181f';
    ctx.beginPath();
    ctx.moveTo(w * 0.45, 0);
    ctx.lineTo(w * 0.7, h * 0.25);
    ctx.lineTo(w * 0.7, 0);
    ctx.closePath();
    ctx.fill();

    // Masonry brick lines
    ctx.strokeStyle = '#1a1a20';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);

    // Horizontal brick grooves
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.33);
    ctx.lineTo(w, h * 0.33);
    ctx.moveTo(0, h * 0.66);
    ctx.lineTo(w, h * 0.66);
    // Vertical mortar joints
    ctx.moveTo(w * 0.35, 0);
    ctx.lineTo(w * 0.35, h * 0.33);
    ctx.moveTo(w * 0.6, h * 0.33);
    ctx.lineTo(w * 0.6, h * 0.66);
    ctx.moveTo(w * 0.25, h * 0.66);
    ctx.lineTo(w * 0.25, h);
    ctx.stroke();

    // Top highlight
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2, 2);
    ctx.lineTo(w * 0.43, 2);
    ctx.stroke();
  }

  // 5. ROCK SPIKES (55x45)
  drawRockSpikes(ctx) {
    const w = this.width;
    const h = this.height;

    // 3 spikes: Spike 1 (left), Spike 2 (middle tall), Spike 3 (right)
    const spikes = [
      { x1: 0, xPeak: w * 0.2, x2: w * 0.38, peakY: h * 0.25 },
      { x1: w * 0.25, xPeak: w * 0.55, x2: w * 0.8, peakY: 0 },
      { x1: w * 0.65, xPeak: w * 0.85, x2: w, peakY: h * 0.3 }
    ];

    for (const s of spikes) {
      // Left bright facet
      ctx.fillStyle = '#e2e2ea';
      ctx.beginPath();
      ctx.moveTo(s.x1, h);
      ctx.lineTo(s.xPeak, s.peakY);
      ctx.lineTo(s.xPeak, h);
      ctx.closePath();
      ctx.fill();

      // Right shadow facet
      ctx.fillStyle = '#26262e';
      ctx.beginPath();
      ctx.moveTo(s.xPeak, s.peakY);
      ctx.lineTo(s.x2, h);
      ctx.lineTo(s.xPeak, h);
      ctx.closePath();
      ctx.fill();

      // Outline
      ctx.strokeStyle = '#141418';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x1, h);
      ctx.lineTo(s.xPeak, s.peakY);
      ctx.lineTo(s.x2, h);
      ctx.stroke();

      // Peak highlight
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(s.x1 + 2, h - 2);
      ctx.lineTo(s.xPeak, s.peakY + 2);
      ctx.stroke();
    }
  }

  // 6. ARCHWAY (60x50)
  drawArchway(ctx) {
    const w = this.width;
    const h = this.height;

    // Pillar left & right fill
    ctx.fillStyle = '#d4d4dc';
    ctx.fillRect(0, 0, w * 0.25, h);
    ctx.fillRect(w * 0.75, 0, w * 0.25, h);

    // Lintel top block
    ctx.fillRect(0, 0, w, h * 0.35);

    // Inner arch cutout shadow
    ctx.fillStyle = '#18181f';
    ctx.beginPath();
    ctx.moveTo(w * 0.25, h);
    ctx.lineTo(w * 0.25, h * 0.5);
    ctx.arc(w * 0.5, h * 0.5, w * 0.25, Math.PI, 0);
    ctx.lineTo(w * 0.75, h);
    ctx.closePath();
    ctx.fill();

    // Dark side shadows
    ctx.fillStyle = '#2e2e36';
    ctx.fillRect(w * 0.18, 0, w * 0.07, h);
    ctx.fillRect(w * 0.93, 0, w * 0.07, h);

    // Outlines
    ctx.strokeStyle = '#141418';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);

    // Inner arch stroke
    ctx.beginPath();
    ctx.moveTo(w * 0.25, h);
    ctx.lineTo(w * 0.25, h * 0.5);
    ctx.arc(w * 0.5, h * 0.5, w * 0.25, Math.PI, 0);
    ctx.lineTo(w * 0.75, h);
    ctx.stroke();

    // Top highlight
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2, 2);
    ctx.lineTo(w - 2, 2);
    ctx.stroke();
  }
}
