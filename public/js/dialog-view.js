import { View } from "./view.js";
import { debounce } from "./dom-utilities.js";
import { panelImage } from "./img.js";
import {
  supportsViewTransitions,
  prefersReducedMotion,
  isClickedOutside,
  getMostVisibleElement,
} from "./dom-utilities.js";

/**
 * ZOOM DIALOG VIEW  (extends View)
 *
 * A second, independent view on the *same* model bus. It never talks to
 * GalleryView directly — selecting a thumbnail in here updates the model,
 * and GalleryView's own subscription is what keeps the storefront image
 * in sync behind the dialog.
 */

export class ZoomDialogView extends View {
  constructor(bus, state, callbacks) {
    super(bus, state, document.getElementById("zoom-dialog"));
    this._cb = callbacks;
    this._elDialog = document.getElementById("zoom-dialog");
    this._elLayout = this._elDialog.querySelector(".zoom-dialog__layout");
    this._elMediaRail = document.getElementById("zoom-media-rail");
    this._elThumbs = document.getElementById("zoom-thumbnails");
    this._elClose = document.getElementById("zoom-close");
    this._elLabel = document.getElementById("zoom-current-label");
    this._previousScrollY = 0;
  }

  render() {
    for (const [index, panel] of this._state.panels.entries()) {
      const item = document.createElement("div");
      item.className = "zoom-dialog__media-item";
      item.dataset.index = String(index);
      item.innerHTML = panelImage(panel, false);
      this._elMediaRail.appendChild(item);

      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "zoom-dialog__thumb";
      thumb.dataset.index = String(index);
      thumb.setAttribute("role", "tab");
      thumb.setAttribute("aria-label", panel.label);
      thumb.innerHTML = panelImage(panel, false);
      this._elThumbs.appendChild(thumb);
    }

    // Simple textContent bind: label swaps in lockstep with activeIndex.
    // bind() only reacts to *future* publishes, so paint the current value first.
    this._elLabel.textContent =
      this._state.panels[this._state.activeIndex]?.label ?? "";
    this.bind(
      "activeIndex",
      this._elLabel,
      (index) => this._state.panels[index]?.label ?? "",
    );

    this._syncActive(this._state.activeIndex);
  }

  bindEvents() {
    // ── Model → View
    this.subscribe("activeIndex", ({ value }) => this._syncActive(value));
    this.subscribe("highRes", ({ value }) => this._syncHighRes(value));
    this.subscribe("isOpen", ({ value }) => value && this._handleOpen());
    this.subscribe("originX", ({ value }) =>
      this._elDialog.style.setProperty("--origin-x", `${value}%`),
    );
    this.subscribe("originY", ({ value }) =>
      this._elDialog.style.setProperty("--origin-y", `${value}%`),
    );

    // ── View → Model
    this.on(this._elClose, "click", () => this._requestClose());

    this.on(this._elDialog, "click", (event) => {
      if (isClickedOutside(event, this._elLayout)) this._requestClose();
    });

    this.on(this._elDialog, "keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      this._requestClose();
    });

    this.on(this._elThumbs, "click", (event) => {
      const btn = event.target.closest("[data-index]");
      if (!btn) return;
      const index = Number(btn.dataset.index);
      this._cb.onSelect(index);
      this._scrollToActive(index, "smooth");
    });

    // pointerover bubbles (pointerenter doesn't), so delegation works here
    this.on(this._elThumbs, "pointerover", (event) => {
      const btn = event.target.closest("[data-index]");
      if (btn) this._cb.onPreview(Number(btn.dataset.index));
    });

    // Scroll-to-select: whichever media panel is most visible becomes active,
    // without re-triggering a scroll (that would fight the user's own scroll).
    this.on(this._elMediaRail, "scroll", this._handleMediaScroll);
  }

  _handleMediaScroll = debounce(async () => {
    const items = [
      ...this._elMediaRail.querySelectorAll(".zoom-dialog__media-item"),
    ];
    const mostVisible = await getMostVisibleElement(items);
    const index = Number(mostVisible.dataset.index);
    this._cb.onSelect(index);
    this._cb.onPreview(index);
  }, 50);

  _handleOpen() {
    this._previousScrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${this._previousScrollY}px`;
    document.body.style.width = "100%";

    const openNow = () => {
      this._elDialog.showModal();
      this._scrollToActive(this._state.activeIndex, "instant");
      this._cb.onPreview(this._state.activeIndex);
    };

    if (!supportsViewTransitions() || prefersReducedMotion()) {
      openNow();
      return;
    }
    document.startViewTransition(openNow);
  }

  async _requestClose() {
    if (!this._elDialog.open) return;
    const reducedMotion = prefersReducedMotion();
    console.log("REDUCED_MOTION__", reducedMotion);
    if (reducedMotion) return this._finishClose();

    this._elDialog.classList.add("dialog--closing");
    await new Promise((resolve) =>
      this._elDialog.addEventListener("animationend", resolve, { once: true }),
    );
    this._elDialog.classList.remove("dialog--closing");
    this._finishClose();
  }

  _finishClose() {
    this._elDialog.close();
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo({
      top: this._previousScrollY,
      behavior: "instant",
    });
    this._cb.onClose(); // flips model.isOpen back to false for any other listeners
  }

  _scrollToActive(index, behavior = "smooth") {
    this._elMediaRail
      .querySelector(`.zoom-dialog__media-item[data-index="${index}"]`)
      ?.scrollIntoView({ behavior, block: "center" });
    this._elThumbs.querySelector(`[data-index="${index}"]`)?.scrollIntoView({
      behavior,
      block: "nearest",
      inline: "center",
    });
  }

  _syncActive(index) {
    [...this._elThumbs.children].forEach((el) => {
      el.setAttribute(
        "aria-selected",
        String(Number(el.dataset.index) === index),
      );
    });
  }

  _syncHighRes(flags) {
    flags.forEach((loaded, index) => {
      if (!loaded) return;
      const panel = this._state.panels[index];

      const mediaItem = this._elMediaRail.querySelector(
        `.zoom-dialog__media-item[data-index="${index}"]`,
      );
      if (mediaItem && mediaItem.dataset.hi !== "true") {
        mediaItem.innerHTML = panelImage(panel, true);
        mediaItem.dataset.hi = "true";
      }

      const thumb = this._elThumbs.querySelector(`[data-index="${index}"]`);
      if (thumb && thumb.dataset.hi !== "true") {
        thumb.innerHTML = panelImage(panel, false); // thumbnails stay small, no need for the detailed variant
        thumb.dataset.hi = "true";
      }
    });
  }
}
