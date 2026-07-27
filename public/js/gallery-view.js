import { panelImage } from "./img.js";
import { View } from "./view.js";

/**
 * GALLERY VIEW  (extends View)
 *
 * The storefront thumbnail rail + main image. Delegates every mutation
 * back to the model via injected callbacks (onSelect, onOpen) — it never
 * calls model methods directly.
 */

export class GalleryView extends View {
  constructor(bus, state, callbacks) {
    super(bus, state, document.getElementById("gallery"));
    this._cb = callbacks;
    this._elRail = document.getElementById("gallery-thumb-rail");
    this._elMain = document.getElementById("gallery-main-viewer");
    this._elZoomCue = document.getElementById("zoom-cue");
  }

  render() {
    for (const [index, panel] of this._state.panels.entries()) {
      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "gallery__thumb";
      thumb.dataset.index = String(index);
      thumb.setAttribute("role", "tab");
      thumb.setAttribute("aria-label", panel.label);
      thumb.innerHTML = panelImage(panel, false);
      this._elRail.appendChild(thumb);

      const item = document.createElement("div");
      item.className = "gallery__main-item";
      item.dataset.index = String(index);
      item.innerHTML = panelImage(panel, false);
      this._elMain.insertBefore(item, this._elZoomCue);
    }

    this._syncActive(this._state.activeIndex);
  }

  bindEvents() {
    // ── Model → View
    this.subscribe("activeIndex", ({ value }) => this._syncActive(value));
    this.subscribe("highRes", ({ value }) => this._syncHighRes(value));

    // ── View → Model: thumbnail rail (event delegation)
    this.on(this._elRail, "click", (event) => {
      const btn = event.target.closest("[data-index]");
      if (btn) this._cb.onSelect(Number(btn.dataset.index));
    });

    // ── View → Model: click a main panel (or the aperture cue) to zoom
    this.on(this._elMain, "click", (event) => {
      const item = event.target.closest(".gallery__main-item");
      const trigger =
        item ??
        (event.target.closest("#zoom-cue") ? this._activeMainItem() : null);
      if (!trigger) return;
      this._cb.onOpen(
        Number(trigger.dataset.index),
        this._originFromEvent(trigger),
      );
    });
  }

  _activeMainItem() {
    return this._elMain.querySelector(
      `.gallery__main-item[data-index="${this._state.activeIndex}"]`,
    );
  }

  _originFromEvent(sourceEl) {
    const rect = sourceEl.getBoundingClientRect();
    return {
      x: ((rect.left + rect.width / 2) / window.innerWidth) * 100,
      y: ((rect.top + rect.height / 2) / window.innerHeight) * 100,
    };
  }

  _syncActive(index) {
    [...this._elRail.children].forEach((el) => {
      el.setAttribute(
        "aria-selected",
        String(Number(el.dataset.index) === index),
      );
    });
    [...this._elMain.querySelectorAll(".gallery__main-item")].forEach((el) => {
      el.dataset.active = String(Number(el.dataset.index) === index);
    });
  }

  _syncHighRes(flags) {
    flags.forEach((loaded, index) => {
      if (!loaded) return;
      const item = this._elMain.querySelector(
        `.gallery__main-item[data-index="${index}"]`,
      );
      if (item && item.dataset.hi !== "true") {
        item.innerHTML = panelImage(this._state.panels[index], true);
        item.dataset.hi = "true";
      }
    });
  }
}
