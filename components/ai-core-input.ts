/**
 * Pointer state for the AI Core. The DOM wrapper in `ai-core-canvas.tsx` owns the
 * browser events, the scene inside the canvas reads this store on every frame.
 * A tiny module store keeps the render loop out of React state.
 */
export type CoreInput = {
  /** Accumulated pointer movement since the last consumed frame, in pixels. */
  dragX: number;
  dragY: number;
  /** Pointer position inside the viewport, normalised to -1..1. */
  px: number;
  py: number;
  dragging: boolean;
  hovering: boolean;
  /** Asks the renderer for one more frame (needed for `frameloop="demand"`). */
  requestFrame: () => void;
};

export const coreInput: CoreInput = {
  dragX: 0,
  dragY: 0,
  px: 0,
  py: 0,
  dragging: false,
  hovering: false,
  requestFrame: () => {},
};

export function resetCoreInput() {
  coreInput.dragX = 0;
  coreInput.dragY = 0;
  coreInput.px = 0;
  coreInput.py = 0;
  coreInput.dragging = false;
  coreInput.hovering = false;
}
