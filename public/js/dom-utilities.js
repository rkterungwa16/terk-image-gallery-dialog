/**
 * DOM / TIMING UTILITIES  (framework-agnostic helpers, no model/view deps)
 */

export function prefersReducedMotion() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function supportsViewTransitions() {
  return typeof document.startViewTransition === "function";
}

export function debounce(fn, wait) {
  let timeout;
  function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  }
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
}

export function isClickedOutside(event, element) {
  if (
    event.target instanceof HTMLDialogElement ||
    !(event.target instanceof Element)
  ) {
    const { left, right, top, bottom } = element.getBoundingClientRect();
    return !(
      event.clientX >= left &&
      event.clientX <= right &&
      event.clientY >= top &&
      event.clientY <= bottom
    );
  }
  return !element.contains(event.target);
}

/**
 * Resolves with whichever element in `elements` has the greatest
 * intersection ratio with the viewport.
 * @param {HTMLElement[]} elements
 * @returns {Promise<HTMLElement>}
 */
export function getMostVisibleElement(elements) {
  return new Promise((resolve) => {
    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries.reduce((prev, current) =>
          current.intersectionRatio > prev.intersectionRatio ? current : prev,
        );
        observer.disconnect();
        resolve(mostVisible.target);
      },
      {
        threshold: Array.from({ length: 100 }, (_, i) => i / 100),
      },
    );
    for (const element of elements) observer.observe(element);
  });
}
