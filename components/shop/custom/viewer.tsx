"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import type { BufferGeometry } from "three";
import { BUILD_VOLUME_MM } from "@/lib/shop/quote";

/**
 * The model, on a bed.
 *
 * Scene units are millimetres and the grid is the real 350 × 350 build plate,
 * so scale is not an abstract percentage — the part visibly outgrows the
 * machine, and the cage appears the moment it does. That is the whole reason
 * this is a 3D view rather than a thumbnail.
 *
 * Geometry arrives already flattened, world-baked and centred from
 * `lib/shop/mesh.ts`, which is what lets every mesh here be declarative: no
 * traversing a prop to swap materials, no imperative camera work.
 *
 * Loaded through `next/dynamic` with `ssr: false` — three has no business
 * being rendered on a server.
 */

const [BED_X, BED_Z, BED_Y] = BUILD_VOLUME_MM;

export default function ModelViewer({
  geometries,
  height,
  scale,
  colour,
  roughness,
  metalness,
  wireframe,
  spin,
  oversize,
}: {
  geometries: BufferGeometry[];
  /** Unscaled model height in millimetres — used to sit it on the bed. */
  height: number;
  scale: number;
  colour: string;
  roughness: number;
  metalness: number;
  wireframe: boolean;
  spin: boolean;
  oversize: boolean;
}) {
  // Framing depends on the model's own height, not the chosen scale — so the
  // camera settles once per file and then stays put. Refitting on every scale
  // change would hide the one thing the bed is there to show.
  const view = useMemo(() => {
    const reach = Math.max(BED_X, height) * 1.5;
    return {
      camera: [reach * 0.72, reach * 0.6, reach * 0.92] as [number, number, number],
      target: [0, Math.max(height / 2, 40), 0] as [number, number, number],
    };
  }, [height]);

  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
      <PerspectiveCamera makeDefault fov={38} near={1} far={9000} position={view.camera} />

      <hemisphereLight intensity={0.55} color="#efede6" groundColor="#0a1220" />
      <directionalLight position={[300, 620, 420]} intensity={2.1} />
      {/* A gold kicker from behind — the site's lighting idea, in three. */}
      <directionalLight position={[-420, 260, -320]} intensity={1.1} color="#d4af37" />

      <group scale={scale}>
        <group position={[0, height / 2, 0]}>
          {geometries.map((geometry, i) => (
            <mesh key={i} geometry={geometry}>
              <meshStandardMaterial
                color={colour}
                roughness={roughness}
                metalness={metalness}
                wireframe={wireframe}
              />
            </mesh>
          ))}
        </group>
      </group>

      {oversize && (
        <group position={[0, BED_Y / 2, 0]}>
          <mesh>
            <boxGeometry args={[BED_X, BED_Y, BED_Z]} />
            <meshBasicMaterial color="#d4af37" wireframe transparent opacity={0.26} />
          </mesh>
        </group>
      )}

      <Grid
        args={[BED_X, BED_Z]}
        cellSize={10}
        cellThickness={0.6}
        cellColor="#5c6474"
        sectionSize={50}
        sectionThickness={1.1}
        sectionColor="#d4af37"
        fadeDistance={2200}
        fadeStrength={1.2}
        followCamera={false}
        infiniteGrid={false}
      />
      <ContactShadows
        position={[0, 0.5, 0]}
        opacity={0.42}
        scale={BED_X * 1.6}
        blur={2.4}
        far={400}
        color="#0a1220"
      />

      <OrbitControls
        makeDefault
        target={view.target}
        enablePan={false}
        autoRotate={spin}
        autoRotateSpeed={0.9}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2 - 0.02}
        minDistance={60}
        maxDistance={4000}
      />
    </Canvas>
  );
}
