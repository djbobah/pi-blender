"use client";

import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  MathUtils,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
  type PointLight,
} from "three";
import { coreInput } from "./ai-core-input";

const MODEL_URL = "/models/ai-core.glb";
const MAX_DELTA = 1 / 20;
const AUTO_SPIN = 0.1;
const DRAG_SPEED = 0.0055;
const INERTIA = 0.94;
const POINTER_TILT_X = 0.06;
const POINTER_TILT_Z = 0.05;
const HOVER_SCALE = 1.04;
const IDLE_BOB = 0.03;
const TILT_LIMIT = 1.1;

// Reflections are dialled per material so the core reads as satin graphite and
// the emissive rings keep their saturation instead of turning pastel.
const ENV_INTENSITY: Record<string, number> = {
  AI_Core_Graphite: 0.45,
  AI_Core_Steel: 0.8,
  AI_Core_Cyan: 0.45,
  AI_Core_Violet: 0.5,
};

export function AiCoreScene({ animate }: { animate: boolean }) {
  const root = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const rim = useRef<PointLight>(null);
  const rotation = useRef({ x: -0.12, y: 0.5 });
  const velocity = useRef({ x: 0, y: 0 });

  const { scene } = useGLTF(MODEL_URL);
  const invalidate = useThree((state) => state.invalidate);

  // The DOM wrapper owns pointer events; it needs a way to request frames when
  // the scene is paused for reduced motion.
  useEffect(() => {
    coreInput.requestFrame = () => invalidate();
    return () => {
      coreInput.requestFrame = () => {};
    };
  }, [invalidate]);

  const model = useMemo(() => {
    scene.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const material of materials) {
        const standard = material as MeshStandardMaterial;
        const intensity = ENV_INTENSITY[standard.name];
        if (intensity === undefined) continue;
        standard.envMapIntensity = intensity;
        standard.needsUpdate = true;
      }
    });
    return scene;
  }, [scene]);

  useFrame((state, delta) => {
    const node = spin.current;
    const holder = root.current;
    if (!node || !holder) return;

    const dt = Math.min(delta, MAX_DELTA);
    const time = state.clock.elapsedTime;
    const dragging = coreInput.dragging;

    if (dragging) {
      rotation.current.y += coreInput.dragX * DRAG_SPEED;
      rotation.current.x = MathUtils.clamp(
        rotation.current.x + coreInput.dragY * DRAG_SPEED,
        -TILT_LIMIT,
        TILT_LIMIT,
      );
      velocity.current.y = coreInput.dragX * DRAG_SPEED;
      velocity.current.x = coreInput.dragY * DRAG_SPEED;
      coreInput.dragX = 0;
      coreInput.dragY = 0;
    } else {
      if (animate) rotation.current.y += dt * AUTO_SPIN;
      rotation.current.y += velocity.current.y;
      rotation.current.x = MathUtils.clamp(
        rotation.current.x + velocity.current.x,
        -TILT_LIMIT,
        TILT_LIMIT,
      );
      const decay = animate ? INERTIA : 0;
      velocity.current.y *= decay;
      velocity.current.x *= decay;
    }

    const tilt = animate && !dragging;
    const targetX = tilt
      ? rotation.current.x + coreInput.py * POINTER_TILT_X
      : rotation.current.x;
    const targetZ = tilt ? -coreInput.px * POINTER_TILT_Z : 0;

    node.rotation.y = rotation.current.y;
    node.rotation.x = MathUtils.damp(node.rotation.x, targetX, 4, dt);
    node.rotation.z = MathUtils.damp(node.rotation.z, targetZ, 4, dt);

    const hovering = coreInput.hovering && !dragging;
    const scale = MathUtils.damp(
      holder.scale.x,
      hovering && !coreInput.dragging ? HOVER_SCALE : 1,
      6,
      dt,
    );
    holder.scale.setScalar(scale);
    holder.position.y = animate ? Math.sin(time * 0.7) * IDLE_BOB : 0;

    if (rim.current) {
      rim.current.intensity = MathUtils.damp(
        rim.current.intensity,
        hovering ? 2.4 : 1.2,
        5,
        dt,
      );
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <hemisphereLight args={["#bfe6ff", "#20163a", 0.5]} />
      <directionalLight position={[3, 4, 4]} intensity={2.2} color="#e8fbff" />
      <directionalLight position={[-4, -2, 2]} intensity={1.1} color="#a78bfa" />
      <pointLight
        position={[0, 0, 2.6]}
        intensity={2.4}
        distance={9}
        decay={2}
        color="#35e0f5"
      />
      <pointLight
        ref={rim}
        position={[-2.8, 1.6, 2.2]}
        intensity={1.2}
        distance={8}
        decay={2}
        color="#8b7cf6"
      />

      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={3}
          position={[0, 3.2, 1.6]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[7, 4, 1]}
          color="#dff6ff"
        />
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[-3.4, 0.4, 1.2]}
          rotation={[0, Math.PI / 2.4, 0]}
          scale={[5, 5, 1]}
          color="#7dd3fc"
        />
        <Lightformer
          form="rect"
          intensity={1.8}
          position={[3.4, -0.6, 1.4]}
          rotation={[0, -Math.PI / 2.4, 0]}
          scale={[5, 5, 1]}
          color="#a78bfa"
        />
        <Lightformer
          form="ring"
          intensity={0.7}
          position={[0, -3, 1]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={6}
          color="#35e0f5"
        />
      </Environment>

      <group ref={root}>
        <group ref={spin}>
          <primitive object={model} />
        </group>
      </group>
    </>
  );
}

useGLTF.preload(MODEL_URL);
