"use client";

import { Canvas } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { AiCoreFallback } from "./ai-core-fallback";
import { coreInput, resetCoreInput } from "./ai-core-input";
import { AiCoreScene } from "./ai-core-scene";

const MODEL_URL = "/models/ai-core.glb";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type ModelStatus = "loading" | "ready" | "failed";

const modelListeners = new Set<() => void>();
let modelStatus: ModelStatus = "loading";
let modelCheck: Promise<void> | null = null;
let cachedWebGL: boolean | undefined;

function emitModelStatus() {
  for (const listener of modelListeners) listener();
}

/**
 * Check the asset before mounting the renderer, so a missing or broken GLB
 * lands on the static fallback instead of throwing inside the canvas tree.
 */
function checkModel() {
  if (modelCheck) return;

  modelCheck = fetch(MODEL_URL, { method: "HEAD" })
    .then((response) => {
      modelStatus = response.ok ? "ready" : "failed";
    })
    .catch(() => {
      modelStatus = "failed";
    })
    .finally(emitModelStatus);
}

function subscribeToModel(onChange: () => void) {
  modelListeners.add(onChange);
  checkModel();
  return () => modelListeners.delete(onChange);
}

function supportsWebGL(): boolean {
  if (cachedWebGL !== undefined) return cachedWebGL;

  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    cachedWebGL = Boolean(window.WebGLRenderingContext && context);
  } catch {
    cachedWebGL = false;
  }

  return cachedWebGL;
}

function subscribeToWebGL() {
  return () => {};
}

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useWebGL(): boolean | null {
  return useSyncExternalStore(subscribeToWebGL, supportsWebGL, () => null);
}

function useModelStatus(): ModelStatus {
  return useSyncExternalStore(
    subscribeToModel,
    () => modelStatus,
    () => "loading",
  );
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

class SceneBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const staticPreview = (
  <AiCoreFallback caption="AI Core · static preview" />
);

export function AiCoreCanvas() {
  const webgl = useWebGL();
  const model = useModelStatus();
  const reducedMotion = useReducedMotion();
  const [dragging, setDragging] = useState(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  useEffect(() => resetCoreInput(), []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    lastPointer.current = { x: event.clientX, y: event.clientY };
    coreInput.dragging = true;
    setDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    coreInput.px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    coreInput.py = 1 - ((event.clientY - rect.top) / rect.height) * 2;

    if (coreInput.dragging) {
      coreInput.dragX += event.clientX - lastPointer.current.x;
      coreInput.dragY += event.clientY - lastPointer.current.y;
      lastPointer.current = { x: event.clientX, y: event.clientY };
    }

    coreInput.requestFrame();
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!coreInput.dragging) return;
    coreInput.dragging = false;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    coreInput.requestFrame();
  };

  if (webgl === null || model === "loading") {
    return <AiCoreFallback caption="AI Core" />;
  }

  if (!webgl || model === "failed") {
    return staticPreview;
  }

  return (
    <div
      className={`relative h-full w-full ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{ touchAction: "pan-y" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={() => {
        coreInput.hovering = true;
      }}
      onPointerLeave={() => {
        coreInput.hovering = false;
        coreInput.dragging = false;
        setDragging(false);
      }}
    >
      <SceneBoundary fallback={staticPreview}>
        <Suspense fallback={<AiCoreFallback caption="AI Core · loading" />}>
          <Canvas
            aria-hidden="true"
            dpr={[1, 2]}
            camera={{ position: [0, 0, 4.3], fov: 40, near: 0.1, far: 20 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
              toneMappingExposure: 1.08,
            }}
            frameloop={reducedMotion ? "demand" : "always"}
            onCreated={({ gl }) => {
              gl.setClearAlpha(0);
            }}
          >
            <AiCoreScene animate={!reducedMotion} />
          </Canvas>
        </Suspense>
      </SceneBoundary>
      <p className="pointer-events-none absolute inset-x-0 bottom-0 text-center font-mono text-[0.65rem] uppercase tracking-[0.22em] text-slate-600">
        Потяните, чтобы вращать
      </p>
    </div>
  );
}
