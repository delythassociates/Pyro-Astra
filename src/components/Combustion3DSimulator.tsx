'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Wind,
  Flame,
  Gauge,
  RotateCcw,
  Sparkles,
  Layers,
  AlertTriangle,
  Info,
  Play,
  Pause,
} from 'lucide-react';
import { Val } from './Val';

export type FuelGeometryType = 'pmma_slab' | 'liquid_droplet';
export type GravityMode = '0g' | '1g';
export type FlowDirection = 'opposed' | 'concurrent';

export function Combustion3DSimulator() {
  const mountRef = useRef<HTMLDivElement>(null);

  // Simulation State
  const [gravity, setGravity] = useState<GravityMode>('0g');
  const [airflow, setAirflow] = useState<number>(5.0); // cm/s
  const [direction, setDirection] = useState<FlowDirection>('opposed');
  const [fuelType, setFuelType] = useState<FuelGeometryType>('pmma_slab');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Selected Educational Regime
  const [selectedRegime, setSelectedRegime] = useState<1 | 2 | 3>(2);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const flameMeshRef = useRef<THREE.Mesh | null>(null);
  const flameInnerRef = useRef<THREE.Mesh | null>(null);
  const fuelMeshRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const particleVelocitiesRef = useRef<Float32Array | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Set regime preset
  const applyRegime = (regime: 1 | 2 | 3) => {
    setSelectedRegime(regime);
    if (regime === 1) {
      setAirflow(0.5);
    } else if (regime === 2) {
      setAirflow(5.0);
    } else if (regime === 3) {
      setAirflow(22.0);
    }
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 4, 10);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181615); // Deep Charcoal Black for flame contrast
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4, 10);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 25;
    controls.minDistance = 3;
    controlsRef.current = controls;

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const flameLight = new THREE.PointLight(0xff7700, 2.5, 15);
    flameLight.position.set(0, 0.8, 0);
    scene.add(flameLight);

    // 6. Grid Ground Plane
    const gridHelper = new THREE.GridHelper(16, 16, 0x5a544a, 0x2a2723);
    gridHelper.position.y = -1.2;
    scene.add(gridHelper);

    // 7. Fuel Sample Mesh
    const fuelGroup = new THREE.Group();
    scene.add(fuelGroup);

    // PMMA Slab
    const slabGeo = new THREE.BoxGeometry(4.5, 0.3, 1.4);
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0xefece6,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const slabMesh = new THREE.Mesh(slabGeo, slabMat);
    slabMesh.position.set(0, -0.15, 0);
    slabMesh.castShadow = true;
    fuelGroup.add(slabMesh);
    fuelMeshRef.current = slabMesh;

    // 8. Flame Meshes
    // Outer Flame Mantle (Blue Chemiluminescent / Glowing)
    const flameGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
    });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.set(0, 0.8, 0);
    scene.add(flameMesh);
    flameMeshRef.current = flameMesh;

    // Inner Flame Core (Yellow/Orange Soot Reaction Zone)
    const innerGeo = new THREE.SphereGeometry(0.7, 24, 24);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf97316,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.8,
      roughness: 0.2,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.position.set(0, 0.7, 0);
    scene.add(innerMesh);
    flameInnerRef.current = innerMesh;

    // 9. Particle Streamlines (Airflow Velocity Visualization)
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12; // X
      positions[i * 3 + 1] = Math.random() * 3.5 - 0.5; // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4; // Z
      velocities[i] = 0.5 + Math.random() * 0.5;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleVelocitiesRef.current = velocities;

    const particleMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.08,
      transparent: true,
      opacity: 0.65,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 10. Resize Listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 560;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
    };
  }, []);

  // Update Fuel Geometry when fuelType changes
  useEffect(() => {
    if (!fuelMeshRef.current) return;
    fuelMeshRef.current.geometry.dispose();

    if (fuelType === 'pmma_slab') {
      fuelMeshRef.current.geometry = new THREE.BoxGeometry(4.5, 0.3, 1.4);
      fuelMeshRef.current.position.set(0, -0.15, 0);
    } else {
      fuelMeshRef.current.geometry = new THREE.SphereGeometry(0.45, 32, 32);
      fuelMeshRef.current.position.set(0, 0.1, 0);
    }
  }, [fuelType]);

  // Main Animation Loop with Dynamic Flame Physics Deformation
  useEffect(() => {
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (!isPlaying) return;

      const elapsed = clock.getElapsedTime();
      const controls = controlsRef.current;
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const flame = flameMeshRef.current;
      const inner = flameInnerRef.current;
      const particles = particlesRef.current;

      if (controls) controls.update();

      // Dynamic Flame Physics deformation based on Gravity & Airflow
      if (flame && inner) {
        const flicker = Math.sin(elapsed * 12) * 0.04 + Math.cos(elapsed * 19) * 0.02;

        if (gravity === '0g') {
          // Microgravity: Natural convection is zero
          if (airflow < 1.0) {
            // Stage 1: Stagnant Air / Suffocation
            // Spherical, dim, faint blue mantle
            flame.scale.set(1.1 + flicker, 1.1 + flicker, 1.1 + flicker);
            inner.scale.set(0.4 + flicker, 0.4 + flicker, 0.4 + flicker);
            (flame.material as THREE.MeshStandardMaterial).color.setHex(0x2563eb);
            (flame.material as THREE.MeshStandardMaterial).opacity = 0.35;
            (inner.material as THREE.MeshStandardMaterial).opacity = 0.25;
            flame.position.set(0, 0.7, 0);
          } else if (airflow <= 12.0) {
            // Stage 2: 1 - 10 cm/s PEAK HAZARD
            // Flame elongates downstream, bright yellow/orange core
            const stretch = (airflow / 10) * 0.8;
            const dirMultiplier = direction === 'opposed' ? -1 : 1;

            flame.scale.set(1.2 + stretch, 0.95 + flicker, 0.95 + flicker);
            inner.scale.set(0.85 + stretch * 0.7, 0.7 + flicker, 0.7 + flicker);
            flame.position.set(dirMultiplier * stretch * 0.6, 0.75, 0);
            inner.position.set(dirMultiplier * stretch * 0.5, 0.7, 0);

            (flame.material as THREE.MeshStandardMaterial).color.setHex(0x3b82f6);
            (flame.material as THREE.MeshStandardMaterial).opacity = 0.65;
            (inner.material as THREE.MeshStandardMaterial).opacity = 0.85;
          } else {
            // Stage 3: > 15 cm/s Strong Airflow Blowoff / Extinction
            // Flame stretched thin, wavering wildly, blown away
            const blowoffOffset = (airflow - 12) * 0.15;
            const dirMultiplier = direction === 'opposed' ? -1 : 1;
            const violentFlicker = Math.sin(elapsed * 35) * 0.15;

            flame.scale.set(1.9 + violentFlicker, 0.4 + violentFlicker * 0.5, 0.5);
            inner.scale.set(0.6 + violentFlicker, 0.3, 0.3);
            flame.position.set(dirMultiplier * (1.2 + blowoffOffset), 0.75, 0);
            inner.position.set(dirMultiplier * (1.0 + blowoffOffset), 0.7, 0);

            (flame.material as THREE.MeshStandardMaterial).opacity = Math.max(0.1, 0.55 - blowoffOffset * 0.25);
            (inner.material as THREE.MeshStandardMaterial).opacity = Math.max(0.1, 0.6 - blowoffOffset * 0.3);
          }
        } else {
          // 1g Earth Normal: Strong buoyant upward convection plume
          const buoyantStretch = 2.2 + flicker * 2;
          flame.scale.set(0.7 + flicker * 0.5, buoyantStretch, 0.7 + flicker * 0.5);
          inner.scale.set(0.45 + flicker * 0.3, buoyantStretch * 0.75, 0.45 + flicker * 0.3);
          flame.position.set(0, 1.2 + flicker * 0.1, 0);
          inner.position.set(0, 0.95 + flicker * 0.1, 0);

          (flame.material as THREE.MeshStandardMaterial).color.setHex(0xf59e0b);
          (flame.material as THREE.MeshStandardMaterial).opacity = 0.75;
          (inner.material as THREE.MeshStandardMaterial).opacity = 0.95;
        }
      }

      // Animate Airflow Streamline Particles
      if (particles && particleVelocitiesRef.current) {
        const posAttr = particles.geometry.getAttribute('position') as THREE.BufferAttribute;
        const positions = posAttr.array as Float32Array;
        const vels = particleVelocitiesRef.current;
        const speed = (airflow / 10) * 0.08;
        const flowDir = direction === 'opposed' ? -1 : 1;

        for (let i = 0; i < vels.length; i++) {
          if (airflow > 0.1) {
            positions[i * 3] += speed * vels[i] * flowDir;

            // Loop particles around
            if (flowDir < 0 && positions[i * 3] < -6) {
              positions[i * 3] = 6;
            } else if (flowDir > 0 && positions[i * 3] > 6) {
              positions[i * 3] = -6;
            }
          }
        }
        posAttr.needsUpdate = true;
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, gravity, airflow, direction]);

  return (
    <div className="w-full space-y-8 font-sans">
      {/* 70/30 Physics Studio Grid */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* 70% Left 3D WebGL Canvas (col-span-12 lg:col-span-8) */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="bg-[#FAF8F3] border border-[#D5CFC2] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-3">
            {/* 3D Header Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D5CFC2] pb-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#181615] uppercase tracking-wider">
                  Three.js 3D Combustion &amp; Boundary-Layer Engine
                </span>
                <span className="text-[#A8A296]">|</span>
                <span className="text-[#1D4ED8] font-bold">
                  {gravity === '0g' ? 'Microgravity (0g Diffusion)' : 'Earth Normal (1g Buoyant Plume)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-2 py-1 bg-[#EAE5DB] hover:bg-[#D5CFC2] border border-[#B8B0A0] text-[#181615] text-[11px] font-bold flex items-center gap-1"
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetCamera}
                  className="px-2 py-1 bg-[#EAE5DB] hover:bg-[#D5CFC2] border border-[#B8B0A0] text-[#181615] text-[11px] font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Camera</span>
                </button>
              </div>
            </div>

            {/* 3D WebGL Viewport */}
            <div
              ref={mountRef}
              className="relative w-full h-[520px] bg-[#181615] border border-[#33302C] overflow-hidden select-none cursor-grab active:cursor-grabbing"
            >
              {/* Overlay HUD Badges */}
              <div className="absolute top-3 left-3 z-10 space-y-1 font-mono text-[11px] pointer-events-none">
                <div className="px-2.5 py-1 bg-[#181615]/80 text-[#FAF8F3] border border-[#33302C] backdrop-blur-xs">
                  Airflow Velocity:{' '}
                  <strong className="text-[#93c5fd]">{airflow.toFixed(1)} cm/s</strong>
                </div>
                <div className="px-2.5 py-1 bg-[#181615]/80 text-[#FAF8F3] border border-[#33302C] backdrop-blur-xs">
                  Regime:{' '}
                  <strong
                    className={
                      airflow < 1.0
                        ? 'text-[#f59e0b]'
                        : airflow <= 12.0
                        ? 'text-[#ef4444]'
                        : 'text-[#93c5fd]'
                    }
                  >
                    {airflow < 1.0
                      ? 'Stagnant (Suffocation)'
                      : airflow <= 12.0
                      ? 'Peak Hazard (Max Spread)'
                      : 'Blowoff (Convective Cooling)'}
                  </strong>
                </div>
              </div>

              {/* Viewport Hint */}
              <div className="absolute bottom-3 right-3 z-10 text-[10px] font-mono text-[#A8A296] pointer-events-none bg-[#181615]/80 px-2 py-1 border border-[#33302C]">
                Left-Click + Drag: Rotate · Scroll: Zoom · Right-Click: Pan
              </div>
            </div>

            {/* Live Interactive Physics Controls Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-[#D5CFC2] text-xs font-mono">
              {/* Airflow Velocity Slider */}
              <div className="space-y-1.5 md:col-span-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#181615] uppercase text-[11px] flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-[#1D4ED8]" />
                    <span>Forced Airflow:</span>
                  </span>
                  <span className="font-bold text-[#1D4ED8]">{airflow.toFixed(1)} cm/s</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="30.0"
                  step="0.5"
                  value={airflow}
                  onChange={(e) => setAirflow(parseFloat(e.target.value))}
                  className="w-full accent-[#1D4ED8] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#736B5E]">
                  <span>0 cm/s</span>
                  <span>10 cm/s (Peak)</span>
                  <span>30 cm/s</span>
                </div>
              </div>

              {/* Gravity & Flow Direction Toggles */}
              <div className="space-y-1.5 md:col-span-1">
                <span className="font-bold text-[#181615] uppercase text-[11px] block">
                  Gravity Regime:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setGravity('0g')}
                    className={`p-1.5 text-center text-[11px] font-mono border transition-colors ${
                      gravity === '0g'
                        ? 'bg-[#181615] text-[#FAF8F3] border-[#181615] font-bold'
                        : 'bg-[#F4F1EA] hover:bg-[#EAE5DB] text-[#5A544A] border-[#D5CFC2]'
                    }`}
                  >
                    0g Microgravity
                  </button>
                  <button
                    type="button"
                    onClick={() => setGravity('1g')}
                    className={`p-1.5 text-center text-[11px] font-mono border transition-colors ${
                      gravity === '1g'
                        ? 'bg-[#181615] text-[#FAF8F3] border-[#181615] font-bold'
                        : 'bg-[#F4F1EA] hover:bg-[#EAE5DB] text-[#5A544A] border-[#D5CFC2]'
                    }`}
                  >
                    1g Earth Normal
                  </button>
                </div>
              </div>

              {/* Fuel Geometry & Direction */}
              <div className="space-y-1.5 md:col-span-1">
                <span className="font-bold text-[#181615] uppercase text-[11px] block">
                  Flow Direction &amp; Fuel:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDirection(direction === 'opposed' ? 'concurrent' : 'opposed')}
                    className="p-1.5 text-center text-[11px] font-mono border bg-[#F4F1EA] hover:bg-[#EAE5DB] text-[#181615] border-[#D5CFC2] font-semibold"
                  >
                    {direction === 'opposed' ? '← Opposed' : 'Concurrent →'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFuelType(fuelType === 'pmma_slab' ? 'liquid_droplet' : 'pmma_slab')}
                    className="p-1.5 text-center text-[11px] font-mono border bg-[#F4F1EA] hover:bg-[#EAE5DB] text-[#181615] border-[#D5CFC2] font-semibold"
                  >
                    {fuelType === 'pmma_slab' ? 'PMMA Slab' : 'Droplet'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 30% Right Educational Physics Guidance (col-span-12 lg:col-span-4) */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-[#FAF8F3] border border-[#D5CFC2] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4 text-xs font-mono">
            <div className="border-b border-[#D5CFC2] pb-3">
              <span className="font-bold text-[#181615] uppercase tracking-wider block text-sm">
                3-Stage Ventilation Regimes
              </span>
              <p className="text-[11px] text-[#5A544A] font-sans mt-0.5 leading-relaxed">
                Click any stage to configure the 3D physics simulator and observe how spacecraft ventilation governs microgravity combustion.
              </p>
            </div>

            {/* Stage 1 Card */}
            <div
              onClick={() => applyRegime(1)}
              className={`p-3.5 border cursor-pointer transition-all space-y-1.5 ${
                selectedRegime === 1 || airflow < 1.0
                  ? 'bg-[#EAE5DB] border-[#181615] shadow-xs'
                  : 'bg-[#F4F1EA] hover:bg-[#EAE5DB] border-[#D5CFC2]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#181615] text-[11px] uppercase">
                  Stage 1: 0 – 1 cm/s · Stagnant Air
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#FAF8F3] border border-[#D5CFC2] text-[#736B5E]">
                  Suffocation
                </span>
              </div>
              <p className="text-[11px] text-[#5A544A] font-sans leading-relaxed">
                Without buoyancy, combustion products (CO₂ and H₂O) accumulate around the flame zone. Lacking airflow to sweep them away, the flame dims into a faint blue sphere, experiences oxygen starvation, and naturally self-extinguishes.
              </p>
            </div>

            {/* Stage 2 Card (PEAK HAZARD) */}
            <div
              onClick={() => applyRegime(2)}
              className={`p-3.5 border cursor-pointer transition-all space-y-1.5 ${
                selectedRegime === 2 || (airflow >= 1.0 && airflow <= 12.0)
                  ? 'bg-[#FFF7ED] border-[#FDBA74] shadow-xs'
                  : 'bg-[#F4F1EA] hover:bg-[#EAE5DB] border-[#D5CFC2]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#C2410C] text-[11px] uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Stage 2: 1 – 10 cm/s · PEAK HAZARD</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#FDBA74] text-[#7C2D12] font-bold">
                  Maximum Spread
                </span>
              </div>
              <p className="text-[11px] text-[#7C2D12] font-sans leading-relaxed font-medium">
                The most dangerous regime in human spaceflight! Gentle forced ventilation (equivalent to cabin circulation vents) delivers a continuous supply of fresh oxygen to the reaction zone without blowing it out. Solid flame spread rates peak sharply in this velocity range!
              </p>
            </div>

            {/* Stage 3 Card */}
            <div
              onClick={() => applyRegime(3)}
              className={`p-3.5 border cursor-pointer transition-all space-y-1.5 ${
                selectedRegime === 3 || airflow > 12.0
                  ? 'bg-[#EAE5DB] border-[#181615] shadow-xs'
                  : 'bg-[#F4F1EA] hover:bg-[#EAE5DB] border-[#D5CFC2]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#181615] text-[11px] uppercase">
                  Stage 3: 15+ cm/s · Blowoff Limit
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#FAF8F3] border border-[#D5CFC2] text-[#1D4ED8]">
                  Extinction
                </span>
              </div>
              <p className="text-[11px] text-[#5A544A] font-sans leading-relaxed">
                Forced air sweeps away heat from the fuel pyrolysis boundary faster than exothermic chemical kinetics can produce it. Convective cooling exceeds heat release, causing the flame front to blow off and extinguish.
              </p>
            </div>

            {/* Empirical Grounding Note */}
            <div className="pt-3 border-t border-[#D5CFC2] text-[11px] text-[#5A544A] space-y-1 font-sans">
              <span className="font-mono font-bold text-[#181615] block uppercase text-[10px]">
                Spaceflight Flight Record Grounding:
              </span>
              <p>
                Observed aboard the International Space Station during BASS (PSI-102) and BASS-II (PSI-25) PMMA acrylic burns (NASA/TM-20210011385).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Combustion3DSimulator;
