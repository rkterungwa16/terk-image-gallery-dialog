import { EventBus, reactive } from "./data-binding.engine.js";
/**
 * Owns the gallery's canonical state and knows nothing about the DOM.
 * Every mutation publishes on its own bus; any number of views can react.
 *
 * Responsibilities:
 * - Hold panel data + which panel is active
 * - Hold dialog open/closed state and the click-origin for the iris reveal
 * - Track which panels have had their "high resolution" image swapped in
 */

export class Model {
  /** @param {{id: string, label: string, tint: string}[]} panels */
  constructor(panels) {
    this.bus = new EventBus();
    this.state = reactive(
      {
        panels,
        activeIndex: 0,
        isOpen: false,
        originX: 50,
        originY: 50,
        highRes: panels.map(() => false),
      },
      this.bus,
    );
  }

  selectPanel(index) {
    if (index < 0 || index >= this.state.panels.length) return;
    this.state.activeIndex = index;
  }

  /**
   * Opens the dialog on a given panel, recording where on screen the user
   * clicked so the view can center the iris reveal there.
   * @param {number} index
   * @param {{x: number, y: number}} [origin] - percentages, 0-100
   */
  openDialog(index, origin = {}) {
    this.selectPanel(index);
    if (typeof origin.x === "number") this.state.originX = origin.x;
    if (typeof origin.y === "number") this.state.originY = origin.y;
    this.state.isOpen = true;
  }

  closeDialog() {
    this.state.isOpen = false;
  }

  markHighRes(index) {
    if (this.state.highRes[index]) return;
    const next = [...this.state.highRes];
    next[index] = true;
    this.state.highRes = next; // new array reference so reactive() detects the change
  }
}
