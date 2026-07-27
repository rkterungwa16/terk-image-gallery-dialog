

export function panelImage(panel, detailed) {
  return `
  <img src="${panel.src}" alt="${panel.alt}" fetchpriority="high" style="width:100%;" />`;
}
