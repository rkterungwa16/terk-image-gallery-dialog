"use strict";

import { Model } from "./model.js";
import { GalleryView } from "./gallery-view.js";
import { ZoomDialogView } from "./dialog-view.js";

/**
 * BOOTSTRAP — wire model to views
 */
const PANELS = [
  {
    id: "1",
    alt: "wisola blue taffeta pleated corset front view",
    src: "public/assets/wisola-blue-taffeta-pleated-corset-1.webp",
  },
  {
    id: "2",
    alt: "wisola blue taffeta pleated corset back view",
    src: "public/assets/wisola-blue-taffeta-pleated-corset-2.webp",
  },
  {
    id: "3",
    alt: "wisola blue taffeta pleated corset side view",
    src: "public/assets/wisola-blue-taffeta-pleated-corset-3.webp",
  },
  {
    id: "4",
    alt: "wisola blue taffeta pleated corset closeup back view",
    src: "public/assets/wisola-blue-taffeta-pleated-corset-4.webp",
  },
];

const model = new Model(PANELS);

// GalleryView and ZoomDialogView are independent — each subscribes to
// model.bus on its own. Neither imports or references the other.
const galleryView = new GalleryView(model.bus, model.state, {
  onSelect: (index) => model.selectPanel(index),
  onOpen: (index, origin) => model.openDialog(index, origin),
});

const zoomDialogView = new ZoomDialogView(model.bus, model.state, {
  onSelect: (index) => model.selectPanel(index),
  onPreview: (index) => model.markHighRes(index),
  onClose: () => model.closeDialog(),
});

galleryView.mount();
zoomDialogView.mount();
