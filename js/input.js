/**
 * Dragon Runner - Input Handler
 * Captures keyboard (Space, ArrowUp) and touch/pointer events.
 * Prevents default browser scrolling and enforces single-jump per press.
 */

export class InputHandler {
  constructor() {
    this.jumpPressed = false;
    this.spaceDown = false;
    this.arrowUpDown = false;
    this.touchActive = false;

    this.initListeners();
  }

  initListeners() {
    // Keyboard listeners
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        // Prevent page scrolling on Space and ArrowUp
        e.preventDefault();

        if (e.code === 'Space' && !this.spaceDown) {
          this.spaceDown = true;
          this.jumpPressed = true;
        }
        if (e.code === 'ArrowUp' && !this.arrowUpDown) {
          this.arrowUpDown = true;
          this.jumpPressed = true;
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
    });

    // Touch and Pointer listeners for mobile support
    const handleTouchStart = (e) => {
      // Prevent default gesture scrolling/zooming during gameplay
      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
        e.preventDefault();
      }
      if (!this.touchActive) {
        this.touchActive = true;
        this.jumpPressed = true;
      }
    };

    const handleTouchEnd = () => {
      this.touchActive = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    // Also support mouse click / pointerdown for testing mobile emulation
    window.addEventListener('pointerdown', (e) => {
      // Only handle primary button / touches
      if (e.pointerType === 'touch' || e.button === 0) {
        if (!this.touchActive && e.target.tagName !== 'BUTTON') {
          this.jumpPressed = true;
        }
      }
    });
  }

  /**
   * Consumes and returns true if a jump was requested this frame.
   */
  consumeJump() {
    if (this.jumpPressed) {
      this.jumpPressed = false;
      return true;
    }
    return false;
  }
}
