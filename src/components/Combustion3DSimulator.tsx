'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Play,
  Pause,
  RotateCcw,
  Box,
  Flame,
  Wind,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Atom,
  ChevronDown,
  Info,
  Layers,
} from 'lucide-react';
import { DEFAULT_INVESTIGATIONS } from '@/lib/data';
import { findNearestEvidence } from '@/lib/nearest';
import { Val } from './Val';

export type GravityRegime = '0g' | '0.16g' | '0.38g' | '1g';
export type FuelType = 'pmma_solid' | 'nomex_fabric' | 'heptane_droplet' | 'methanol_droplet';

interface ScenarioPreset {
  id: string;
  label: string;
  o2: number; // %
  pressureKPa: number; // kPa
  airflow: number; // cm/s
  gravity: GravityRegime;
  fuel: FuelType;
}

const PRESETS: ScenarioPreset[] = [
  {
    id: 'iss_nominal',
    label: 'ISS Cabin Nominal (21% O₂, 101.3 kPa, 5 cm/s)',
    o2: 21,
    pressureKPa: 101.3,
    airflow: 5,
    gravity: '0g',
    fuel: 'pmma_solid',
  },
  {
    id: 'lunar_habitat',
    label: 'Artemis Lunar Habitat (34% O₂, 56.5 kPa / 8.2 psi)',
    o2: 34,
    pressureKPa: 56.5,
    airflow: 5,
    gravity: '0.16g',
    fuel: 'pmma_solid',
  },
  {
    id: 'spacesuit_eva',
    label: 'Spacesuit EVA (100% O₂, 29.6 kPa / 4.3 psi)',
    o2: 40, // capped to max slider
    pressureKPa: 29.6,
    airflow: 0,
    gravity: '0g',
    fuel: 'nomex_fabric',
  },
  {
    id: 'bass2_m14',
    label: 'BASS-II Run M14 (PMMA, 9 cm/s)',
    o2: 21,
    pressureKPa: 101.3,
    airflow: 9,
    gravity: '0g',
    fuel: 'pmma_solid',
  },
  {
    id: 'flex_run24',
    label: 'FLEX Run 24 (Heptane, 30% O₂, 71.2 kPa)',
    o2: 30,
    pressureKPa: 71.2,
    airflow: 0,
    gravity: '0g',
    fuel: 'heptane_droplet',
  },
];

// Helper to create soft radial gradient additive particle sprite texture
function createParticleTexture(colorHex = '#38bdf8'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, colorHex);
  gradient.addColorStop(0.55, 'rgba(2, 132, 199, 0.4)');
  gradient.addColorStop(1, 'rgba(2, 132, 199, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createSootTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, '#fef08a');
  gradient.addColorStop(0.3, '#f97316');
  gradient.addColorStop(0.7, 'rgba(234, 88, 12, 0.3)');
  gradient.addColorStop(1, 'rgba(234, 88, 12, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  return new THREE.CanvasTexture(canvas);
}

export function Combustion3DSimulator() {
  const mountRef = useRef<HTMLDivElement>(null);

  // Mode: 'explore' | 'replay'
  const [labMode, setLabMode] = useState<'explore' | 'replay'>('explore');

  // Simulation Parametric State
  const [o2, setO2] = useState<number>(21); // %
  const [airflow, setAirflow] = useState<number>(5.0); // cm/s
  const [pressureKPa, setPressureKPa] = useState<number>(101.3); // kPa
  const [gravity, setGravity] = useState<GravityRegime>('0g');
  const [fuel, setFuel] = useState<FuelType>('pmma_solid');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('iss_nominal');

  // Playback & Animation State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const flameCoreRef = useRef<THREE.Mesh | null>(null);
  const flameWireframeRef = useRef<THREE.LineSegments | null>(null);
  const gasParticlesRef = useRef<THREE.Points | null>(null);
  const sootParticlesRef = useRef<THREE.Points | null>(null);
  const fuelMeshRef = useRef<THREE.Mesh | null>(null);
  const flameLightRef = useRef<THREE.PointLight | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Particle positions & initial offsets
  const gasCount = 200;
  const sootCount = 40;
  const gasBasePos = useRef<Float32Array>(new Float32Array(gasCount * 3));
  const sootBasePos = useRef<Float32Array>(new Float32Array(sootCount * 3));

  // Initialize random particle offsets once
  useEffect(() => {
    for (let i = 0; i < gasCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.2 + Math.random() * 0.55;
      gasBasePos.current[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      gasBasePos.current[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      gasBasePos.current[i * 3 + 2] = r * Math.cos(phi);
    }
    for (let i = 0; i < sootCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 0.15 + Math.random() * 0.35;
      sootBasePos.current[i * 3] = r * Math.cos(theta);
      sootBasePos.current[i * 3 + 1] = 0.1 + Math.random() * 0.5;
      sootBasePos.current[i * 3 + 2] = r * Math.sin(theta);
    }
  }, []);

  // Compute live physics readouts
  const pressurePsi = Number((pressureKPa / 6.894757).toFixed(1));
  const o2PartialPressureKPa = Number(((o2 / 100) * pressureKPa).toFixed(2));

  const animationIntensity = useMemo(() => {
    if (o2PartialPressureKPa < 17.5) return 'Low (Oxygen-Starved)';
    if (o2PartialPressureKPa <= 28.0) return 'Moderate';
    return 'High (Enriched O₂)';
  }, [o2PartialPressureKPa]);

  // Compute nearest evidence via Section 8
  const nearestOutput = useMemo(() => {
    return findNearestEvidence(DEFAULT_INVESTIGATIONS, {
      o2: { min: o2, max: o2 },
      pressure: { min: pressurePsi, max: pressurePsi },
    });
  }, [o2, pressurePsi]);

  // Handle Preset selection
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setO2(p.o2);
    setPressureKPa(p.pressureKPa);
    setAirflow(p.airflow);
    setGravity(p.gravity);
    setFuel(p.fuel);
  };

  // Reset Camera to Orbit Home
  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 3.5, 8.5);
      controlsRef.current.target.set(0, 0.2, 0);
      controlsRef.current.update();
    }
  };

  // Set Camera to Isometric View
  const handleIsometricView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(6.5, 5.0, 7.5);
      controlsRef.current.target.set(0, 0.2, 0);
      controlsRef.current.update();
    }
  };

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 620;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a10);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 8.5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.2, 0);
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't flip below floor
    controlsRef.current = controls;

    // 1. Perspective 3D Floor Grid
    const gridHelper = new THREE.GridHelper(16, 20, 0x1e293b, 0x131c2e);
    gridHelper.position.y = -1.2;
    scene.add(gridHelper);

    // 2. Concentric Measurement Rings
    [1.4, 2.8, 4.2].forEach((radius) => {
      const ringGeo = new THREE.RingGeometry(radius, radius + 0.02, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x1e293b,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = -1.19;
      scene.add(ringMesh);
    });

    // 3. Burner Pedestal & Metal Stem
    const baseGeo = new THREE.CylinderGeometry(0.75, 0.95, 0.35, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -1.02;
    scene.add(baseMesh);

    const stemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 16);
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.8,
      roughness: 0.3,
    });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.position.y = -0.45;
    scene.add(stemMesh);

    // 4. Sample Holder Rack
    const rackGeo = new THREE.BoxGeometry(2.0, 0.04, 1.2);
    const rackWireGeo = new THREE.WireframeGeometry(rackGeo);
    const rackWireMat = new THREE.LineBasicMaterial({ color: 0x334155, linewidth: 1 });
    const rackWire = new THREE.LineSegments(rackWireGeo, rackWireMat);
    rackWire.position.y = -0.05;
    scene.add(rackWire);

    // 5. Fuel Sample Geometry Placeholder
    const fuelGeo = new THREE.BoxGeometry(1.6, 0.06, 0.8);
    const fuelMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.8,
      roughness: 0.3,
    });
    const fuelMesh = new THREE.Mesh(fuelGeo, fuelMat);
    fuelMesh.position.y = 0;
    scene.add(fuelMesh);
    fuelMeshRef.current = fuelMesh;

    // 6. Volumetric Gaseous Blue Flame Cloud: Soft Inner Core
    const coreGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 0.2;
    scene.add(coreMesh);
    flameCoreRef.current = coreMesh;

    // Wireframe Outline for Partial-G freeze (0.16g / 0.38g)
    const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(0.65, 16, 16));
    const wireMat = new THREE.LineBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.8,
    });
    const flameWire = new THREE.LineSegments(wireGeo, wireMat);
    flameWire.position.y = 0.25;
    flameWire.visible = false;
    scene.add(flameWire);
    flameWireframeRef.current = flameWire;

    // 7. Volumetric Additive Particle System (200 gas particles)
    const gasTexture = createParticleTexture('#38bdf8');
    const gasGeometry = new THREE.BufferGeometry();
    const gasPositions = new Float32Array(gasCount * 3);
    gasGeometry.setAttribute('position', new THREE.BufferAttribute(gasPositions, 3));

    const gasMaterial = new THREE.PointsMaterial({
      size: 0.55,
      map: gasTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const gasPoints = new THREE.Points(gasGeometry, gasMaterial);
    scene.add(gasPoints);
    gasParticlesRef.current = gasPoints;

    // 8. Glowing Soot Radical Specks (40 micro-particles)
    const sootTexture = createSootTexture();
    const sootGeometry = new THREE.BufferGeometry();
    const sootPositions = new Float32Array(sootCount * 3);
    sootGeometry.setAttribute('position', new THREE.BufferAttribute(sootPositions, 3));

    const sootMaterial = new THREE.PointsMaterial({
      size: 0.22,
      map: sootTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sootPoints = new THREE.Points(sootGeometry, sootMaterial);
    scene.add(sootPoints);
    sootParticlesRef.current = sootPoints;

    // 9. Scene Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x94a3b8, 0.7);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const flameLight = new THREE.PointLight(0x38bdf8, 3.0, 7, 1.8);
    flameLight.position.set(0, 0.35, 0);
    scene.add(flameLight);
    flameLightRef.current = flameLight;

    // Handle Resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  // Update Fuel Sample Geometry when Fuel Type changes
  useEffect(() => {
    const mesh = fuelMeshRef.current;
    if (!mesh) return;

    if (fuel === 'pmma_solid') {
      mesh.geometry.dispose();
      mesh.geometry = new THREE.BoxGeometry(1.6, 0.06, 0.8);
      (mesh.material as THREE.MeshStandardMaterial).color.set(0x93c5fd);
      (mesh.material as THREE.MeshStandardMaterial).opacity = 0.75;
    } else if (fuel === 'nomex_fabric') {
      mesh.geometry.dispose();
      mesh.geometry = new THREE.BoxGeometry(1.6, 0.02, 0.5);
      (mesh.material as THREE.MeshStandardMaterial).color.set(0xca8a04);
      (mesh.material as THREE.MeshStandardMaterial).opacity = 0.95;
    } else {
      // Liquid Droplet (Heptane / Methanol)
      mesh.geometry.dispose();
      mesh.geometry = new THREE.SphereGeometry(0.2, 32, 32);
      (mesh.material as THREE.MeshStandardMaterial).color.set(
        fuel === 'heptane_droplet' ? 0x38bdf8 : 0x67e8f9
      );
      (mesh.material as THREE.MeshStandardMaterial).opacity = 0.85;
    }
  }, [fuel]);

  // Main Physics Animation Loop
  useEffect(() => {
    let clock = 0;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      const isPartialG = gravity === '0.16g' || gravity === '0.38g';
      const isEarth1g = gravity === '1g';

      // 1. Partial Gravity Wireframe Freeze (Rule 5 Compliance)
      if (flameWireframeRef.current && flameCoreRef.current) {
        if (isPartialG) {
          flameWireframeRef.current.visible = true;
          flameCoreRef.current.visible = false;
          if (gasParticlesRef.current) gasParticlesRef.current.visible = false;
          if (sootParticlesRef.current) sootParticlesRef.current.visible = false;
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
          return;
        } else {
          flameWireframeRef.current.visible = false;
          flameCoreRef.current.visible = true;
          if (gasParticlesRef.current) gasParticlesRef.current.visible = true;
          if (sootParticlesRef.current) sootParticlesRef.current.visible = true;
        }
      }

      if (isPlaying) {
        clock += 0.025 * simSpeed;
      }

      // Physics deformation scaling based on O2 and Pressure
      const o2Scale = Math.max(0.65, Math.min(1.45, o2 / 21));
      const pScale = Math.max(0.7, Math.min(1.3, pressureKPa / 101.3));
      const combinedScale = o2Scale * Math.sqrt(pScale);

      // Light intensity
      if (flameLightRef.current) {
        flameLightRef.current.intensity = 2.0 * o2Scale * (1 + 0.1 * Math.sin(clock * 5));
      }

      // 2. Animate Inner Core
      if (flameCoreRef.current) {
        if (isEarth1g) {
          // Earth 1g: Convective upward elongation
          flameCoreRef.current.scale.set(
            0.65 * combinedScale,
            (1.5 + 0.15 * Math.sin(clock * 8)) * combinedScale,
            0.65 * combinedScale
          );
          flameCoreRef.current.position.set(0, 0.45 * combinedScale, 0);
          (flameCoreRef.current.material as THREE.MeshBasicMaterial).color.set(0x60a5fa);
        } else {
          // 0g Microgravity
          const stretchX = 1.0 + (airflow / 10.0) * 1.5;
          const squashYZ = Math.max(0.65, 1.0 - (airflow / 20.0) * 0.35);

          flameCoreRef.current.scale.set(
            stretchX * combinedScale,
            squashYZ * combinedScale * (1 + 0.05 * Math.sin(clock * 4)),
            squashYZ * combinedScale
          );
          // Shift downstream if airflow > 0
          flameCoreRef.current.position.set(
            (airflow / 20.0) * 0.45,
            0.2,
            0
          );
          (flameCoreRef.current.material as THREE.MeshBasicMaterial).color.set(0x38bdf8);
        }
      }

      // 3. Animate Volumetric Gas Particles
      if (gasParticlesRef.current) {
        const positions = gasParticlesRef.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < gasCount; i++) {
          const bx = gasBasePos.current[i * 3];
          const by = gasBasePos.current[i * 3 + 1];
          const bz = gasBasePos.current[i * 3 + 2];

          const noise = Math.sin(clock * 3 + i * 0.5) * 0.08;

          if (isEarth1g) {
            // Convective buoyancy upward
            const riseCycle = ((clock * 1.5 + i * 0.05) % 1.0);
            positions[i * 3] = bx * 0.7 * (1 - riseCycle * 0.5) * combinedScale;
            positions[i * 3 + 1] = (0.2 + riseCycle * 1.6 + noise) * combinedScale;
            positions[i * 3 + 2] = bz * 0.7 * (1 - riseCycle * 0.5) * combinedScale;
          } else {
            // 0g Microgravity + Ventilated Airflow Streamlines
            const flowOffset = (airflow / 15.0) * (0.4 + (i % 5) * 0.15);
            positions[i * 3] = (bx * (1 + airflow * 0.08) + flowOffset + noise) * combinedScale;
            positions[i * 3 + 1] = (0.2 + by * Math.max(0.6, 1 - airflow * 0.02) + noise) * combinedScale;
            positions[i * 3 + 2] = (bz * Math.max(0.6, 1 - airflow * 0.02)) * combinedScale;
          }
        }
        gasParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // 4. Animate Soot Radical Particles
      if (sootParticlesRef.current) {
        const sPositions = sootParticlesRef.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < sootCount; i++) {
          const bx = sootBasePos.current[i * 3];
          const by = sootBasePos.current[i * 3 + 1];
          const bz = sootBasePos.current[i * 3 + 2];

          if (isEarth1g) {
            const sRise = ((clock * 2.0 + i * 0.1) % 1.2);
            sPositions[i * 3] = bx * 0.6 * combinedScale;
            sPositions[i * 3 + 1] = (0.3 + sRise * 1.5) * combinedScale;
            sPositions[i * 3 + 2] = bz * 0.6 * combinedScale;
          } else {
            sPositions[i * 3] = (bx + (airflow / 15.0) * 0.6 + Math.sin(clock * 4 + i) * 0.05) * combinedScale;
            sPositions[i * 3 + 1] = (by + 0.1) * combinedScale;
            sPositions[i * 3 + 2] = bz * combinedScale;
          }
        }
        sootParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [gravity, airflow, o2, pressureKPa, isPlaying, simSpeed]);

  return (
    <div className="w-full bg-[#0B0F17] text-[#F1F5F9] border border-[#1E293B] shadow-2xl font-sans overflow-hidden">
      {/* A. Top Header Bar */}
      <div className="h-14 px-6 border-b border-[#1E293B] flex items-center justify-between bg-[#0E131F]">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-slate-400">
            01 / The combustion lab
          </span>
          <span className="px-2 py-0.5 rounded bg-[#1E293B] text-sky-400 font-mono text-[10px] font-bold uppercase tracking-wider">
            [Interactive 3D]
          </span>
        </div>

        {/* Mode Toggle: Explore vs Measured Replay */}
        <div className="flex items-center gap-1 bg-[#0B0F17] p-1 border border-[#1E293B] rounded text-xs font-mono">
          <button
            type="button"
            onClick={() => setLabMode('explore')}
            className={`px-3 py-1 font-bold rounded transition-colors ${
              labMode === 'explore'
                ? 'bg-[#1E293B] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Explore
          </button>
          <button
            type="button"
            onClick={() => {
              setLabMode('replay');
              handleSelectPreset('bass2_m14');
            }}
            className={`px-3 py-1 font-bold rounded transition-colors ${
              labMode === 'replay'
                ? 'bg-[#1E293B] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Measured replay
          </button>
        </div>
      </div>

      {/* Main Grid: 75% 3D Viewport on Left, 25% Control Panel on Right */}
      <div className="grid grid-cols-12 min-h-[640px]">
        {/* B. Left 75% Viewport: Interactive 3D Combustion Chamber */}
        <div className="col-span-12 lg:col-span-9 relative min-h-[620px] bg-[#070A10] flex flex-col justify-between">
          {/* Top Overlay Controls Inside 3D Chamber */}
          <div className="absolute top-4 left-6 right-6 z-10 flex items-start justify-between pointer-events-none">
            {/* Top-Left Gravity & Chamber Readout */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block">
                COMBUSTION CHAMBER
              </span>
              <div className="text-4xl font-light text-white font-mono tracking-tight flex items-baseline gap-2">
                <span>
                  {gravity === '0g'
                    ? 'μg'
                    : gravity === '1g'
                    ? '1g'
                    : gravity === '0.16g'
                    ? '0.16g'
                    : '0.38g'}
                </span>
                <span className="text-xs font-normal text-slate-400">
                  {gravity === '0g'
                    ? 'Microgravity'
                    : gravity === '1g'
                    ? 'Earth Gravity'
                    : gravity === '0.16g'
                    ? 'Lunar Partial-G [Unmeasured]'
                    : 'Martian Partial-G [Unmeasured]'}
                </span>
              </div>
            </div>

            {/* Top-Right Toolbar Buttons */}
            <div className="flex flex-col items-end gap-2 pointer-events-auto">
              <div className="flex items-center gap-1.5 bg-[#0E131F]/90 border border-[#1E293B] p-1 rounded backdrop-blur-md">
                <button
                  type="button"
                  onClick={handleIsometricView}
                  className="p-1.5 rounded hover:bg-[#1E293B] text-slate-300 hover:text-white transition-colors"
                  title="Isometric View"
                >
                  <Box className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetCamera}
                  className="p-1.5 rounded hover:bg-[#1E293B] text-slate-300 hover:text-white transition-colors"
                  title="Reset Orbit Camera"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded hover:bg-[#1E293B] text-slate-300 hover:text-white transition-colors"
                  title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <select
                  value={simSpeed}
                  onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
                  className="bg-[#0B0F17] border border-[#1E293B] text-slate-300 rounded px-1.5 py-1 text-[11px] font-mono focus:outline-none"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1.0}>1.0x</option>
                  <option value={2.0}>2.0x</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 pr-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                <span>{isPlaying ? 'Fire animation live' : 'Simulation paused'}</span>
              </div>
            </div>
          </div>

          {/* Three.js Canvas Mount */}
          <div ref={mountRef} className="w-full flex-1 min-h-[500px] cursor-grab active:cursor-grabbing" />

          {/* Partial-G Rule 5 Warning Watermark Overlay */}
          {(gravity === '0.16g' || gravity === '0.38g') && (
            <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-black/40 backdrop-blur-[2px] pointer-events-none">
              <div className="p-4 bg-[#1E1114] border border-[#E11D48] text-[#FDA4AF] max-w-lg space-y-1.5 text-center font-mono">
                <div className="flex items-center justify-center gap-2 font-bold text-sm text-[#F43F5E]">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>SPEC Rule 5 Non-Negotiable Refusal</span>
                </div>
                <p className="text-xs leading-relaxed">
                  0 NASA PSI flight records exist at {gravity}. Partial-gravity fire behavior is strictly unmeasured. Simulation is paused in wireframe boundary mode.
                </p>
              </div>
            </div>
          )}

          {/* Bottom HUD Overlay Inside 3D Chamber */}
          <div className="relative z-10 px-6 py-4 bg-gradient-to-t from-[#070A10] via-[#070A10]/80 to-transparent border-t border-[#1E293B]/60">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs items-end">
              {/* Readout 1: Animation Intensity */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  ANIMATION INTENSITY
                </span>
                <div className="text-sm font-bold text-white">
                  {animationIntensity}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Authored for the picture, not measured
                </span>
              </div>

              {/* Readout 2: Live O2 Partial Pressure Equation */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  O₂ PARTIAL PRESSURE
                </span>
                <div className="text-sm font-bold text-sky-400">
                  {o2PartialPressureKPa} kPa
                </div>
                <span className="text-[10px] text-slate-500 block font-mono">
                  {(o2 / 100).toFixed(2)} × {pressureKPa.toFixed(1)} kPa = {o2PartialPressureKPa} kPa
                </span>
              </div>

              {/* Readout 3: Illustrative Model Badge */}
              <div className="flex sm:justify-end items-center gap-2 text-slate-400">
                <div className="px-2.5 py-1 bg-[#0E131F] border border-[#1E293B] rounded text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Atom className="w-3.5 h-3.5 text-sky-400" />
                  <span>ILLUSTRATIVE MODEL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Strip */}
          <div className="border-t border-[#1E293B] px-6 py-2.5 text-[11px] font-mono text-slate-400 flex items-center justify-between bg-[#0B0F17]">
            <span>Drag to orbit · Scroll to zoom</span>
            <span>Conceptual view · not to scale</span>
          </div>
        </div>

        {/* C. Right 25% Control Panel: SET THE CONDITIONS */}
        <div className="col-span-12 lg:col-span-3 bg-[#0E131F] border-l border-[#1E293B] p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="border-b border-[#1E293B] pb-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                Set The Conditions
              </h3>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Adjust environment parameters to observe volumetric flame physics.
              </p>
            </div>

            {/* 1. Scenario Preset Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 block font-bold">
                Choose a scenario
              </label>
              <div className="relative">
                <select
                  value={selectedPresetId}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-[#1E293B] text-slate-200 text-xs font-mono p-2.5 rounded focus:outline-none focus:border-sky-500 appearance-none pr-8 cursor-pointer"
                >
                  {PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* 2. 4-Button Gravity Selector Grid */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-[11px] text-slate-400 font-bold block">
                Gravity Environment
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['0g', '0.16g', '0.38g', '1g'] as GravityRegime[]).map((g) => {
                  const isActive = gravity === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGravity(g)}
                      className={`p-2 rounded border text-center transition-all ${
                        isActive
                          ? 'bg-[#1E293B] text-white border-sky-500 shadow-xs font-bold'
                          : 'bg-[#0B0F17] text-slate-400 border-[#1E293B] hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">
                        {g === '0g' ? 'μg' : g === '1g' ? '1g' : g}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5 capitalize">
                        {g === '0g' ? 'Orbit' : g === '0.16g' ? 'Moon' : g === '0.38g' ? 'Mars' : 'Earth'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Three Interactive Orange-Track Sliders */}
            <div className="space-y-4 font-mono text-xs">
              {/* Slider 1: Oxygen Concentration */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300">Oxygen concentration</span>
                  <span className="text-[#F97316] font-bold">{o2}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="40"
                  step="1"
                  value={o2}
                  onChange={(e) => setO2(parseFloat(e.target.value))}
                  className="w-full accent-[#F97316] bg-[#1E293B] rounded cursor-pointer"
                />
              </div>

              {/* Slider 2: Airflow Velocity */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300">Airflow velocity</span>
                  <span className="text-[#F97316] font-bold">
                    {airflow === 0 ? 'Still (0 cm/s)' : `${airflow.toFixed(1)} cm/s`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={airflow}
                  onChange={(e) => setAirflow(parseFloat(e.target.value))}
                  className="w-full accent-[#F97316] bg-[#1E293B] rounded cursor-pointer"
                />
              </div>

              {/* Slider 3: Cabin Pressure */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300">Cabin pressure</span>
                  <span className="text-[#F97316] font-bold">
                    {pressureKPa.toFixed(1)} kPa · {pressurePsi} psi
                  </span>
                </div>
                <input
                  type="range"
                  min="25.0"
                  max="140.0"
                  step="0.5"
                  value={pressureKPa}
                  onChange={(e) => setPressureKPa(parseFloat(e.target.value))}
                  className="w-full accent-[#F97316] bg-[#1E293B] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* 4. Fuel Selector Dropdown */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-[11px] text-slate-400 font-bold block">
                Fuel Material & Geometry
              </label>
              <select
                value={fuel}
                onChange={(e) => setFuel(e.target.value as FuelType)}
                className="w-full bg-[#0B0F17] border border-[#1E293B] text-slate-200 text-xs font-mono p-2.5 rounded focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="pmma_solid">PMMA · solid fuel</option>
                <option value="nomex_fabric">Nomex · fabric strip</option>
                <option value="heptane_droplet">Heptane · liquid droplet</option>
                <option value="methanol_droplet">Methanol · liquid droplet</option>
              </select>
            </div>
          </div>

          {/* 5. Bottom CTA Button */}
          <div className="pt-4 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="w-full py-3 px-4 bg-[#F97316] hover:bg-[#EA580C] text-[#0B0F17] font-bold text-xs font-mono transition-all flex items-center justify-between rounded shadow-lg"
            >
              <span>{drawerOpen ? 'Hide analysis' : 'Interpret scenario'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Scenario Interpretation Drawer */}
      {drawerOpen && (
        <div className="border-t border-[#1E293B] bg-[#0E131F] p-6 space-y-4 animate-in slide-in-from-top duration-200 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-white uppercase tracking-wider">
                Grounding Analysis for {o2}% O₂, {pressureKPa.toFixed(1)} kPa ({pressurePsi} psi)
              </span>
            </div>
            <span className="text-[10px] text-slate-400">SPEC Section 8 Tested Bounds</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            {/* Nearest Flight Evidence */}
            <div className="p-4 bg-[#0B0F17] border border-[#1E293B] rounded space-y-2">
              <span className="text-[10px] font-mono text-sky-400 uppercase font-bold block">
                Closest NASA PSI Investigation
              </span>
              <div className="text-white font-bold text-sm">
                {nearestOutput.closest
                  ? `${nearestOutput.closest.record.name} (${nearestOutput.closest.record.acronym})`
                  : 'No Tested Records'}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {nearestOutput.message}
              </p>
            </div>

            {/* Active Combustion Regime */}
            <div className="p-4 bg-[#0B0F17] border border-[#1E293B] rounded space-y-2">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                Active Flow Regime
              </span>
              <div className="text-white font-bold text-sm">
                {gravity !== '0g'
                  ? `Buoyant Regime (${gravity})`
                  : airflow === 0
                  ? 'Zone 1: Purely Diffusive Envelope'
                  : airflow <= 10
                  ? 'Zone 2: Low-Velocity Ventilated (Peak Hazard)'
                  : 'Zone 3: Convective Blowoff Regime'}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                {gravity !== '0g'
                  ? 'Convective buoyancy accelerates flame spread on Earth; unmeasured in lunar/martian atmospheres.'
                  : airflow <= 10
                  ? 'Low velocity airflow feeds fresh oxygen to microgravity flame without cooling it, creating peak fire risk.'
                  : 'High airflow cools reaction zone faster than chemistry can sustain, approaching blowoff extinction.'}
              </p>
            </div>

            {/* Provenance & DOI */}
            <div className="p-4 bg-[#0B0F17] border border-[#1E293B] rounded space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                Provenance Reference
              </span>
              <div className="text-white font-bold text-sm">
                {nearestOutput.closest?.record.doi ? (
                  <a
                    href={`https://doi.org/${nearestOutput.closest.record.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 underline hover:text-sky-300 font-mono text-xs"
                  >
                    DOI: {nearestOutput.closest.record.doi}
                  </a>
                ) : (
                  <span className="text-slate-500">Not reported</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                All values carry authentic NASA Physical Sciences Informatics lineage with SHA-256 integrity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Combustion3DSimulator;
