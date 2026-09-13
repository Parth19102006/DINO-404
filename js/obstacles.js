/**
 * Dragon Runner - Redesigned Canvas-Drawn Obstacles
 * Faithfully matches the provided visual reference for all 6 obstacles:
 * 1. STONE (44x26) - Rounded boulder with side pebble and grass sprigs (+10 pts)
 * 2. CRYSTAL (44x42) - Central tall crystal spire with flanking crystals & shards (+20 pts)
 * 3. BUSH (52x34) - Fan-shaped radiating pointed foliage cluster (+30 pts)
 * 4. RUINS (58x46) - Broken left column, fallen fragment, right pillar with lintel (+40 pts)
 * 5. ROCK SPIKES (60x44) - Five sharp triangular spires in stepped row (+50 pts)
 * 6. FLYING (58x34) - Winged dragon/drone soaring at altitude (+30 pts)
 */

import { GROUND_Y } from './constants.js';

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

  update(speed) {
    this.x -= speed;
    if (this.isFlying) {
      this.flapTimer += 0.09;
    }
  }

  /**
   * Inset collision box for fair AABB collision detection.
   */
  getCollisionBox() {
    const padX = this.isFlying ? 5 : 4;
    const padY = this.isFlying ? 4 : 3;
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
      case 'FLYING':
        this.drawFlying(ctx);
        break;
      default:
        this.drawStone(ctx);
    }

    ctx.restore();
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

  // 2. CRYSTAL (44x42) — Central tall crystal spire with flanking crystals & shards
  drawCrystal(ctx) {
    const w = this.width;
    const h = this.height;

    // 1. Center Tall Spire (Apex at w*0.5, 2)
    // Bright left facet
    ctx.fillStyle = '#f2f2fa';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 2);
    ctx.lineTo(w * 0.34, h * 0.38);
    ctx.lineTo(w * 0.46, h);
    ctx.lineTo(w * 0.5, h);
    ctx.closePath();
    ctx.fill();

    // Dark right facet
    ctx.fillStyle = '#2c2c38';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 2);
    ctx.lineTo(w * 0.66, h * 0.34);
    ctx.lineTo(w * 0.58, h);
    ctx.lineTo(w * 0.5, h);
    ctx.closePath();
    ctx.fill();

    // 2. Left Angled Crystal (Apex at w*0.18, h*0.28)
    ctx.fillStyle = '#c4c4d4';
    ctx.beginPath();
    ctx.moveTo(w * 0.18, h * 0.28);
    ctx.lineTo(w * 0.06, h * 0.55);
    ctx.lineTo(w * 0.22, h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3a3a46';
    ctx.beginPath();
    ctx.moveTo(w * 0.18, h * 0.28);
    ctx.lineTo(w * 0.34, h * 0.48);
    ctx.lineTo(w * 0.24, h);
    ctx.closePath();
    ctx.fill();

    // 3. Right Angled Crystal (Apex at w*0.82, h*0.32)
    ctx.fillStyle = '#8e8e9e';
    ctx.beginPath();
    ctx.moveTo(w * 0.82, h * 0.32);
    ctx.lineTo(w * 0.68, h * 0.52);
    ctx.lineTo(w * 0.74, h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1e1e26';
    ctx.beginPath();
    ctx.moveTo(w * 0.82, h * 0.32);
    ctx.lineTo(w * 0.94, h * 0.6);
    ctx.lineTo(w * 0.82, h);
    ctx.closePath();
    ctx.fill();

    // Outlines
    ctx.strokeStyle = '#121216';
    ctx.lineWidth = 1.8;
    // Central spire
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 2); ctx.lineTo(w * 0.34, h * 0.38); ctx.lineTo(w * 0.34, h);
    ctx.moveTo(w * 0.5, 2); ctx.lineTo(w * 0.66, h * 0.34); ctx.lineTo(w * 0.66, h);
    ctx.moveTo(w * 0.5, 2); ctx.lineTo(w * 0.5, h);
    // Left crystal
    ctx.moveTo(w * 0.18, h * 0.28); ctx.lineTo(w * 0.06, h * 0.55); ctx.lineTo(w * 0.06, h);
    ctx.moveTo(w * 0.18, h * 0.28); ctx.lineTo(w * 0.34, h * 0.48);
    // Right crystal
    ctx.moveTo(w * 0.82, h * 0.32); ctx.lineTo(w * 0.68, h * 0.52);
    ctx.moveTo(w * 0.82, h * 0.32); ctx.lineTo(w * 0.94, h * 0.6); ctx.lineTo(w * 0.94, h);
    ctx.stroke();

    // Base crystal shards & grass
    ctx.fillStyle = '#4a4a58';
    ctx.beginPath();
    ctx.moveTo(w * 0.02, h); ctx.lineTo(w * 0.12, h * 0.75); ctx.lineTo(w * 0.18, h);
    ctx.moveTo(w * 0.84, h); ctx.lineTo(w * 0.92, h * 0.72); ctx.lineTo(w * 0.98, h);
    ctx.fill();

    // White edge highlights
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.49, 4); ctx.lineTo(w * 0.35, h * 0.36);
    ctx.moveTo(w * 0.17, h * 0.3); ctx.lineTo(w * 0.08, h * 0.54);
    ctx.stroke();
  }

  // 3. BUSH (52x34) — Fan-shaped radiating pointed foliage cluster
  drawBush(ctx) {
    const w = this.width;
    const h = this.height;

    // Radiating leaf petal helper
    const drawLeaf = (cx, cy, length, angle, fill, outline = true) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(length * 0.3, -length * 0.22, length, 0);
      ctx.quadraticCurveTo(length * 0.3, length * 0.22, 0, 0);
      ctx.closePath();
      ctx.fill();
      if (outline) {
        ctx.strokeStyle = '#121216';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      ctx.restore();
    };

    const rootX = w * 0.5;
    const rootY = h;

    // Back dark leaves
    const backAngles = [-1.4, -1.1, -0.8, -0.5, -0.2, 0.1, 0.4, 0.7, 1.0, 1.3];
    for (const a of backAngles) {
      drawLeaf(rootX, rootY, h * 0.95, a - Math.PI / 2, '#202028');
    }

    // Mid-tone leaves
    const midAngles = [-1.2, -0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9, 1.2];
    for (const a of midAngles) {
      drawLeaf(rootX, rootY, h * 0.85, a - Math.PI / 2, '#7a7a8a');
    }

    // Front light leaves
    const frontAngles = [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9];
    for (const a of frontAngles) {
      drawLeaf(rootX, rootY, h * 0.75, a - Math.PI / 2, '#dedee8');
    }

    // Top bright highlight tips
    ctx.fillStyle = '#ffffff';
    for (const a of [-0.6, -0.3, 0, 0.3, 0.6]) {
      const angle = a - Math.PI / 2;
      const tx = rootX + Math.cos(angle) * (h * 0.68);
      const ty = rootY + Math.sin(angle) * (h * 0.68);
      ctx.beginPath();
      ctx.arc(tx, ty, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Base soil mound
    ctx.fillStyle = '#18181f';
    ctx.beginPath();
    ctx.ellipse(rootX, h, w * 0.46, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. RUINS (58x46) — Broken left column, fallen stone, right pillar with lintel
  drawRuins(ctx) {
    const w = this.width;
    const h = this.height;

    // 1. Left Pillar (Broken Column)
    // Light front
    ctx.fillStyle = '#d2d2dc';
    ctx.fillRect(w * 0.08, h * 0.22, w * 0.18, h * 0.78);
    // Dark shadow side
    ctx.fillStyle = '#303038';
    ctx.fillRect(w * 0.26, h * 0.22, w * 0.08, h * 0.78);
    // Left pillar stepped base
    ctx.fillStyle = '#e0e0ea';
    ctx.fillRect(w * 0.05, h * 0.88, w * 0.32, h * 0.12);

    // Broken top of left pillar
    ctx.fillStyle = '#18181f';
    ctx.beginPath();
    ctx.moveTo(w * 0.08, h * 0.22);
    ctx.lineTo(w * 0.18, h * 0.32);
    ctx.lineTo(w * 0.34, h * 0.22);
    ctx.lineTo(w * 0.34, h * 0.22);
    ctx.closePath();
    ctx.fill();

    // 2. Fallen Stone Fragment in Middle
    ctx.fillStyle = '#7a7a88';
    ctx.fillRect(w * 0.38, h * 0.72, w * 0.12, h * 0.28);

    // 3. Right Pillar with Lintel Capstone
    // Pillar body
    ctx.fillStyle = '#dcdce4';
    ctx.fillRect(w * 0.62, h * 0.28, w * 0.18, h * 0.72);
    ctx.fillStyle = '#2a2a32';
    ctx.fillRect(w * 0.8, h * 0.28, w * 0.08, h * 0.72);
    // Stepped base
    ctx.fillStyle = '#e0e0ea';
    ctx.fillRect(w * 0.58, h * 0.88, w * 0.32, h * 0.12);

    // Horizontal Lintel Capstone resting on top
    ctx.fillStyle = '#f0f0f8';
    ctx.fillRect(w * 0.52, 2, w * 0.42, h * 0.26);
    ctx.fillStyle = '#3a3a44';
    ctx.fillRect(w * 0.88, 2, w * 0.06, h * 0.26);
    ctx.fillStyle = '#22222a';
    ctx.fillRect(w * 0.52, h * 0.22, w * 0.42, h * 0.06);

    // Outlines & Masonry Lines
    ctx.strokeStyle = '#121216';
    ctx.lineWidth = 1.8;
    // Left column outline
    ctx.strokeRect(w * 0.08, h * 0.22, w * 0.26, h * 0.78);
    ctx.strokeRect(w * 0.05, h * 0.88, w * 0.32, h * 0.12);
    // Right pillar outline
    ctx.strokeRect(w * 0.62, h * 0.28, w * 0.26, h * 0.72);
    ctx.strokeRect(w * 0.58, h * 0.88, w * 0.32, h * 0.12);
    // Lintel outline
    ctx.strokeRect(w * 0.52, 2, w * 0.42, h * 0.26);
    // Middle stone outline
    ctx.strokeRect(w * 0.38, h * 0.72, w * 0.12, h * 0.28);

    // Brick mortar lines
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(w * 0.08, h * 0.55); ctx.lineTo(w * 0.34, h * 0.55);
    ctx.moveTo(w * 0.62, h * 0.58); ctx.lineTo(w * 0.88, h * 0.58);
    ctx.stroke();

    // White highlights
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.54, 4); ctx.lineTo(w * 0.88, 4);
    ctx.stroke();
  }

  // 5. ROCK SPIKES (60x44) — Five sharp triangular spires in a stepped row
  drawRockSpikes(ctx) {
    const w = this.width;
    const h = this.height;

    // 5 Spikes from left to right: (x1, apexX, x2, apexY)
    const spires = [
      { x1: 0, xPeak: w * 0.12, x2: w * 0.25, yPeak: h * 0.45 },
      { x1: w * 0.15, xPeak: w * 0.32, x2: w * 0.48, yPeak: h * 0.2 },
      { x1: w * 0.32, xPeak: w * 0.52, x2: w * 0.72, yPeak: 2 }, // Center tallest
      { x1: w * 0.58, xPeak: w * 0.74, x2: w * 0.88, yPeak: h * 0.24 },
      { x1: w * 0.76, xPeak: w * 0.9, x2: w, yPeak: h * 0.48 }
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
      ctx.stroke();

      // White ridge highlight
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(s.x1 + 2, h - 2);
      ctx.lineTo(s.xPeak, s.yPeak + 2);
      ctx.stroke();
    }

    // Base rock rubble
    ctx.fillStyle = '#3c3c48';
    ctx.beginPath();
    ctx.arc(w * 0.25, h - 2, 4, 0, Math.PI * 2);
    ctx.arc(w * 0.65, h - 2, 4, 0, Math.PI * 2);
    ctx.fill();
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
