import { bind } from "./data-binding.engine.js";
/**
 * VIEW BASE CLASS
 */

export class View {
  constructor(bus, state, root) {
    this._bus = bus;
    this._state = state;
    this._root = root;
    this._teardowns = [];
    this._mounted = false;
  }

  mount() {
    if (this._mounted) return;
    this._mounted = true;
    this.render();
    this.bindEvents();
  }

  destroy() {
    this._teardowns.forEach((fn) => fn());
    this._teardowns = [];
    this._mounted = false;
  }

  subscribe(event, fn) {
    const unsub = this._bus.subscribe(event, fn);
    this._teardowns.push(unsub);
    return unsub;
  }

  bind(key, selector, transform) {
    const unsub = bind(this._bus, key, selector, transform);
    this._teardowns.push(unsub);
    return unsub;
  }

  on(el, event, fn) {
    el.addEventListener(event, fn);
    this._teardowns.push(() => el.removeEventListener(event, fn));
  }

  render() {
    throw new Error(`${this.constructor.name} must implement render()`);
  }

  bindEvents() {
    throw new Error(`${this.constructor.name} must implement bindEvents()`);
  }
}
