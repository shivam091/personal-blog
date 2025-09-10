export const BASE_FRAMES = {
  closed: [
    { x1: 3, y1: 5, x2: 21, y2: 5, opacity: 1 },
    { x1: 3, y1: 12, x2: 21, y2: 12, opacity: 1 },
    { x1: 3, y1: 19, x2: 21, y2: 19, opacity: 1 }
  ],
  open: [
    { x1: 5, y1: 5, x2: 19, y2: 19, opacity: 1 },
    { x1: 3, y1: 12, x2: 21, y2: 12, opacity: 0 },
    { x1: 5, y1: 19, x2: 19, y2: 5, opacity: 1 }
  ]
};

export const HOVER_FRAMES = {
  closed: [
    { x1: 3, y1: 7, x2: 21, y2: 7, opacity: 1 },
    { x1: 3, y1: 12, x2: 21, y2: 12, opacity: 1 },
    { x1: 3, y1: 17, x2: 21, y2: 17, opacity: 1 }
  ],
  open: [
    { x1: 5, y1: 7, x2: 19, y2: 17, opacity: 1 },
    { x1: 3, y1: 12, x2: 21, y2: 12, opacity: 0 },
    { x1: 5, y1: 17, x2: 19, y2: 7, opacity: 1 }
  ]
};

export const PRESSED_FRAME = [
  { x1: 3, y1: 12, x2: 21, y2: 12, opacity: 1 },
  { x1: 3, y1: 12, x2: 21, y2: 12, opacity: 1 },
  { x1: 3, y1: 12, x2: 21, y2: 12, opacity: 1 }
];
