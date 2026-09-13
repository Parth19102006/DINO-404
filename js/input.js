/**
 * Dragon Runner - Input Handler
 * Captures keyboard (Space, ArrowUp, Enter) and touch/pointer events.
 * Separates jump inputs from start/restart triggers to prevent accidental auto-restarts.
 */

export class InputHandler {
  constructor() {
    this.jumpPressed = false;
    this.startOrRestartPressed = false;

    this.spaceDown = false;
    this.arrowUpDown = false;
    this.enterDown = false;
    this.touchActive = false;

    this.initListeners();
  }

  initListeners() {
    // Keyboard listeners
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
        // Prevent default browser page scrolling
        e.preventDefault();

        if (e.code === 'Space' && !this.spaceDown) {
          this.spaceDown = true;
          this.jumpPressed = true;
          this.startOrRestartPressed = true;
        }
        if (e.code === 'ArrowUp' && !this.arrowUpDown) {
          this.arrowUpDown = true;
          this.jumpPressed = true;
          this.startOrRestartPressed = true;
        }
        if (e.code === 'Enter' && !this.enterDown) {
          this.enterDown = true;
          this.startOrRestartPressed = true;
        }
      }
    }, { passive: false });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.spaceDown = false;
      }
      if (e.code === 'ArrowUp') {
        this.arrowUpDown = false;
      }
      if (e.code === 'Enter') {
        this.enterDown = false;
      }
    });

    // Touch listeners
    const handleTouchStart = (e) => {
      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
        e.preventDefault();
      }
      if (!this.touchActive) {
        this.touchActive = true;
        this.jumpPressed = true;
        this.startOrRestartPressed = true;
      }
    };

    const handleTouchEnd = () => {
      this.touchActive = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    // Pointer down for mouse clicks
    window.addEventListener('pointerdown', (e) => {
      if (e.target.tagName !== 'BUTTON' && (e.pointerType === 'touch' || e.button === 0)) {
        this.jumpPressed = true;
        this.startOrRestartPressed = true;
      }
    });
  }

  /**
   * Consumes jump command during RUNNING gameplay.
   */
  consumeJump() {
    if (this.jumpPressed) {
      this.jumpPressed = false;
      return true;
    }
    return false;
  }

  /**
   * Consumes start/restart command for READY and GAMEOVER states.
   */
  consumeStartOrRestart() {
    if (this.startOrRestartPressed) {
      this.startOrRestartPressed = false;
      return true;
    }
    return false;
  }

  /**
   * Resets all input triggers and key states.
   */
  reset() {
    this.jumpPressed = false;
    this.startOrRestartPressed = false;
    this.spaceDown = false;
    this.arrowUpDown = false;
    this.enterDown = false;
    this.touchActive = false;
  }
}
