"use strict";

/**
 * PUB/SUB DATA BINDING ENGINE
 */

export class EventBus {
  constructor() {
    this._subs = {};
    this._nextId = 0;
  }
  subscribe(event, fn) {
    if (!this._subs[event]) this._subs[event] = new Map();
    const id = this._nextId++;
    this._subs[event].set(id, fn);
    return () => this._subs[event].delete(id); // O(1) teardown
  }
  publish(event, payload) {
    this._subs[event]?.forEach((fn) => fn(payload));
  }
}

export function shallowEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;
  const ka = Object.keys(a),
    kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => a[k] === b[k]);
}

export function reactive(initial, bus) {
  const target = { ...initial };
  const _pending = new Set();
  let _scheduled = false;

  function flush() {
    _scheduled = false;
    for (const key of _pending) {
      bus.publish(key, {
        key,
        value: target[key],
        prev: target[`_prev_${key}`],
      });
    }
    _pending.clear();
  }

  return new Proxy(target, {
    set(t, key, value) {
      if (key.startsWith("_prev_")) {
        t[key] = value;
        return true;
      }
      const prev = t[key];
      if (shallowEqual(prev, value)) return true;
      t[`_prev_${key}`] = prev;
      t[key] = value;
      _pending.add(key);
      if (!_scheduled) {
        _scheduled = true;
        requestAnimationFrame(flush);
      }
      return true;
    },
  });
}

/** One-way reactive bind: model key → DOM element textContent/value. */
export function bind(bus, key, selector, transform = (v) => v) {
  const el =
    typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!el) return () => {};
  const isInput =
    el instanceof HTMLInputElement || el instanceof HTMLSelectElement;
  const ref = new WeakRef(el);
  let unsub;
  unsub = bus.subscribe(key, ({ value }) => {
    const node = ref.deref();
    if (!node) return unsub?.();
    isInput
      ? (node.value = transform(value))
      : (node.textContent = transform(value));
  });
  return unsub;
}
