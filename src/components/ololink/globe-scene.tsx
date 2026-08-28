'use client';

import { Canvas, useFrame, useLoader, type ThreeEvent } from '@react-three/fiber';
import { Html, OrbitControls, Stars } from '@react-three/drei';
import { Suspense, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import earthMap from '@/assets/earth-map.jpg';
import {
  ASSET_BY_ID,
  ASSETS,
  TECH_META,
  geoToVec,
  type Asset,
  type LinkState,
  type ScenarioProfile,
  type WeatherCell,
} from '@/lib/ololink';
import type { OloLinkState, Selection } from '@/hooks/use-ololink';

const CYAN = '#38bdf8';

function vec(a: Asset) {
  return new THREE.Vector3(...geoToVec(a.lat, a.lon, a.altKm));
}

function curveFor(from: Asset, to: Asset) {
  const a = vec(from);
  const b = vec(to);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const lift = 1 + a.distanceTo(b) * 0.16;
  mid.setLength(Math.max(a.length(), b.length()) * lift);
  return new THREE.QuadraticBezierCurve3(a, mid, b);
}

/* ---------------------------------------------------------------- Earth */

function Earth() {
  const texture = useLoader(THREE.TextureLoader, earthMap);
  texture.colorSpace = THREE.SRGBColorSpace;
  const ref = useRef<THREE.Group>(null);

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial map={texture} metalness={0.15} roughness={0.85} />
      </mesh>
      {/* graticule */}
      <mesh>
        <sphereGeometry args={[1.001, 36, 18]} />
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.045} />
      </mesh>
      {/* inner atmosphere */}
      <mesh>
        <sphereGeometry args={[1.015, 64, 64]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
      {/* outer halo */}
      <mesh>
        <sphereGeometry args={[1.09, 64, 64]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------ orbit rings */

function OrbitRing({ radius, tilt, spin }: { radius: number; tilt: number; spin: number }) {
  const geometry = useMemo(() => {
    const pts = Array.from({ length: 129 }, (_, i) => {
      const a = (i / 128) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    });
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);
  const ref = useRef<THREE.Line>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += d * spin;
  });
  return (
    // @ts-expect-error three line primitive
    <line ref={ref} geometry={geometry} rotation={[tilt, 0, tilt * 0.4]}>
      <lineBasicMaterial color={CYAN} transparent opacity={0.14} />
    </line>
  );
}

/* ---------------------------------------------------------------- links */

function LinkPath({
  link,
  selected,
  onSelect,
}: {
  link: LinkState;
  selected: boolean;
  onSelect: (s: Selection) => void;
}) {
  const from = ASSET_BY_ID[link.segment.from]!;
  const to = ASSET_BY_ID[link.segment.to]!;
  const curve = useMemo(() => curveFor(from, to), [from, to]);
  const geometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)),
    [curve]
  );
  const pulse = useRef<THREE.Mesh>(null);
  const t = useRef(Math.random());
  const meta = TECH_META[link.segment.tech];
  const active = link.status === 'ACTIVE';
  const blocked = link.status === 'BLOCKED';

  useFrame((_, d) => {
    if (!pulse.current || !active) return;
    t.current = (t.current + d * (meta.family === 'optical' ? 0.5 : 0.28)) % 1;
    pulse.current.position.copy(curve.getPointAt(t.current));
  });

  const color = blocked ? '#64748b' : meta.color;
  const opacity = blocked ? 0.12 : active ? (selected ? 1 : 0.85) : 0.22;

  return (
    <group>
      {/* @ts-expect-error three line primitive */}
      <line geometry={geometry}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          linewidth={1}
          {...(blocked ? {} : {})}
        />
      </line>
      {/* wider click target */}
      <mesh
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect({ type: 'link', id: link.segment.id });
        }}
      >
        <tubeGeometry args={[curve, 24, 0.012, 6, false]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? (selected ? 0.28 : 0.12) : 0.02}
        />
      </mesh>
      {active && (
        <mesh ref={pulse}>
          <sphereGeometry args={[meta.family === 'optical' ? 0.016 : 0.013, 12, 12]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}
    </group>
  );
}

/* --------------------------------------------------------------- assets */

const KIND_COLOR: Record<Asset['kind'], string> = {
  satellite: '#7dd3fc',
  haps: '#38bdf8',
  drone: '#a5b4fc',
  ground: '#34d399',
  customer: '#e2e8f0',
};

function AssetNode({
  asset,
  selected,
  onSelect,
  showLabel,
}: {
  asset: Asset;
  selected: boolean;
  onSelect: (s: Selection) => void;
  showLabel: boolean;
}) {
  const [hover, setHover] = useState(false);
  const position = useMemo(() => vec(asset), [asset]);
  const ring = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const color = KIND_COLOR[asset.kind];

  useFrame(({ clock, camera }) => {
    const s = 1 + Math.sin(clock.elapsedTime * 2 + position.x * 4) * 0.12;
    if (core.current) core.current.scale.setScalar(selected ? s * 1.5 : s);
    if (ring.current) {
      ring.current.lookAt(camera.position);
      const p = ((clock.elapsedTime * 0.6) % 1);
      ring.current.scale.setScalar(1 + p * 2.4);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - p) * (selected ? 0.5 : 0.22);
    }
  });

  const size = asset.kind === 'satellite' ? 0.02 : asset.kind === 'haps' ? 0.017 : 0.013;

  return (
    <group position={position}>
      <mesh
        ref={core}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect({ type: 'asset', id: asset.id });
        }}
      >
        {asset.kind === 'satellite' ? (
          <octahedronGeometry args={[size, 0]} />
        ) : asset.kind === 'ground' ? (
          <cylinderGeometry args={[size, size * 1.5, size * 1.2, 6]} />
        ) : asset.kind === 'customer' ? (
          <boxGeometry args={[size * 1.4, size * 1.4, size * 1.4]} />
        ) : (
          <tetrahedronGeometry args={[size * 1.3, 0]} />
        )}
        <meshBasicMaterial color={selected || hover ? '#ffffff' : color} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[size * 1.8, size * 2.1, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      {(showLabel || hover || selected) && (
        <Html center distanceFactor={7} position={[0, size * 4, 0]} zIndexRange={[20, 0]}>
          <div
            className={`pointer-events-none select-none whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.18em] transition-opacity ${
              selected || hover ? 'text-foreground' : 'text-foreground/55'
            }`}
          >
            {asset.name}
          </div>
        </Html>
      )}
    </group>
  );
}

/* -------------------------------------------------------------- weather */

function WeatherBlob({ cell }: { cell: WeatherCell }) {
  const position = useMemo(
    () => new THREE.Vector3(...geoToVec(cell.lat, cell.lon, 4)),
    [cell]
  );
  const ref = useRef<THREE.Group>(null);
  const color = cell.kind === 'STORM' ? '#f43f5e' : cell.kind === 'RAIN' ? '#38bdf8' : '#cbd5e1';

  useFrame(({ clock }) => {
    if (ref.current) {
      const p = 1 + Math.sin(clock.elapsedTime * 1.2 + cell.lat) * 0.06;
      ref.current.scale.setScalar(p);
      ref.current.rotation.y += 0.0008;
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[cell.size * 0.5, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.05 + cell.severity / 2200}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[cell.size * 0.3, 20, 20]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* --------------------------------------------------------- camera focus */

function CameraRig({
  target,
  controls,
}: {
  target: THREE.Vector3 | null;
  controls: React.RefObject<any>;
}) {
  const desired = useRef(new THREE.Vector3());
  useFrame(({ camera }, d) => {
    const c = controls.current;
    if (!c) return;
    const k = 1 - Math.exp(-2.4 * d);
    if (target) {
      c.target.lerp(target, k);
      const dist = Math.max(1.62, target.length() + 0.9);
      desired.current.copy(target).setLength(dist);
      camera.position.lerp(desired.current, k * 0.9);
    } else {
      c.target.lerp(new THREE.Vector3(0, 0, 0), k * 0.6);
    }
    c.update();
  });
  return null;
}

/* ------------------------------------------------------------ the scene */

function SceneContent({ state }: { state: OloLinkState }) {
  const { profile, links, selection, select, layers } = state;
  const controls = useRef<any>(null);

  const focus = useMemo(() => {
    if (!selection) return null;
    if (selection.type === 'asset') {
      const a = ASSET_BY_ID[selection.id];
      return a ? vec(a) : null;
    }
    const l = links.find((x) => x.segment.id === selection.id);
    if (!l) return null;
    const a = ASSET_BY_ID[l.segment.from]!;
    const b = ASSET_BY_ID[l.segment.to]!;
    return vec(a).add(vec(b)).multiplyScalar(0.5);
  }, [selection, links]);

  const routeAssets = useMemo(() => new Set(profile.route), [profile]);

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 3, 5]} intensity={1.5} color="#dbeafe" />
      <directionalLight position={[-5, -2, -4]} intensity={0.35} color="#1e40af" />
      <Stars radius={90} depth={40} count={2600} factor={3.2} saturation={0} fade speed={0.4} />

      <Suspense fallback={null}>
        <Earth />
      </Suspense>

      {layers.orbits && (
        <>
          <OrbitRing radius={1.16} tilt={0.42} spin={0.02} />
          <OrbitRing radius={1.22} tilt={-0.6} spin={-0.015} />
          <OrbitRing radius={1.28} tilt={0.18} spin={0.01} />
        </>
      )}

      {layers.routes &&
        links.map((l) => (
          <LinkPath
            key={l.segment.id}
            link={l}
            selected={selection?.type === 'link' && selection.id === l.segment.id}
            onSelect={select}
          />
        ))}

      {ASSETS.map((a) => (
        <AssetNode
          key={a.id}
          asset={a}
          selected={selection?.type === 'asset' && selection.id === a.id}
          onSelect={select}
          showLabel={layers.labels && routeAssets.has(a.id)}
        />
      ))}

      {layers.weather && profile.weather.map((c) => <WeatherBlob key={c.id} cell={c} />)}

      <OrbitControls
        ref={controls}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.45}
        minDistance={1.3}
        maxDistance={5}
        autoRotate={!selection && state.running}
        autoRotateSpeed={0.22}
      />
      <CameraRig target={focus} controls={controls} />
    </>
  );
}

export function GlobeScene({ state }: { state: OloLinkState }) {
  return (
    <Canvas
      camera={{ position: [0, 1.1, 3.1], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
      onPointerMissed={() => state.select(null)}
      className="!absolute inset-0"
    >
      <color attach="background" args={['#05070e']} />
      <fog attach="fog" args={['#05070e', 8, 24]} />
      <SceneContent state={state} />
    </Canvas>
  );
}

export type { ScenarioProfile };
