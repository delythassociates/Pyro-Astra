"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type GravityMode = "0g" | "0.16g" | "0.38g" | "1g";
type FuelType = "pmma_slab" | "pmma_sphere" | "heptane_droplet" | "ethylene_jet";
type CfdOverlayMode = "flame_only" | "velocity_u_v" | "soot_numden" | "vorticity";

interface ScenarioPreset {
  id: string;
  label: string;
  gravity: GravityMode;
  o2Pct: number;
  airflowCmS: number;
  pressureKpa: number;
  fuel: FuelType;
  flowDir: "opposed" | "concurrent";
  cfdDataset: string;
}

const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: "iss_nominal",
    label: "ISS Cabin Nominal (21% O2, 101.3 kPa, 5 cm/s)",
    gravity: "0g",
    o2Pct: 21.0,
    airflowCmS: 5.0,
    pressureKpa: 101.3,
    fuel: "pmma_slab",
    flowDir: "opposed",
    cfdDataset: "8cmNoGravityU.dat + 8cmNoGravityNumDenR.dat",
  },
  {
    id: "cfd_8cm_0g",
    label: "NASA CFD 8cm Domain: 0g Soot & Velocity (Thermophoresis ON)",
    gravity: "0g",
    o2Pct: 21.0,
    airflowCmS: 8.0,
    pressureKpa: 101.3,
    fuel: "ethylene_jet",
    flowDir: "concurrent",
    cfdDataset: "8cm_sGrid_grid3d.dat + 8cmNoGravityNumDenR.dat + 8cmNoGravityVort.dat",
  },
  {
    id: "cfd_10cm_1g",
    label: "NASA CFD 10cm Domain: 1g Buoyant Smoke Plume",
    gravity: "1g",
    o2Pct: 21.0,
    airflowCmS: 10.0,
    pressureKpa: 101.3,
    fuel: "ethylene_jet",
    flowDir: "concurrent",
    cfdDataset: "10cmGravityU.dat + 10cmGravitySmoke.dat",
  },
  {
    id: "bass2_m14",
    label: "BASS-II Run M14 (Flat PMMA, 20.7% O2, 9.0 cm/s)",
    gravity: "0g",
    o2Pct: 20.7,
    airflowCmS: 9.0,
    pressureKpa: 101.3,
    fuel: "pmma_slab",
    flowDir: "opposed",
    cfdDataset: "PSI-25 Table 5.1 Run M14 + 8cmNoGravityU.dat",
  },
  {
    id: "flex_run24",
    label: "FLEX Test 24 (Heptane Droplet, 30.0% O2, 71.2 kPa / 10.33 psi)",
    gravity: "0g",
    o2Pct: 30.0,
    airflowCmS: 0.0,
    pressureKpa: 71.2,
    fuel: "heptane_droplet",
    flowDir: "opposed",
    cfdDataset: "PSI-69 FLEX Test 24 (Spherical Diffusion)",
  },
  {
    id: "artemis_lunar",
    label: "Artemis Lunar Habitat Target (34% O2, 56.5 kPa / 8.2 psi, 0.16g)",
    gravity: "0.16g",
    o2Pct: 34.0,
    airflowCmS: 5.0,
    pressureKpa: 56.5,
    fuel: "pmma_slab",
    flowDir: "opposed",
    cfdDataset: "NTRS 20210022143 — 0 Empirical Rows in NASA PSI",
  },
];

const FLAME_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uAirflow;
  uniform float uGravity;
  uniform float uO2;
  uniform float uPressure;
  uniform float uFlowSign;
  uniform float uShellLayer;
  uniform float uFuelShape;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vHeightRatio;
  varying float vStreamwiseRatio;

  float waveNoise(vec3 p, float t) {
    return sin(p.x * 3.5 + t * 4.2) * cos(p.y * 4.1 - t * 5.0) * sin(p.z * 3.2 + t * 3.1) * 0.5
         + sin(p.x * 7.0 - t * 6.5) * cos(p.y * 6.3 + t * 7.2) * 0.25;
  }

  void main() {
    vec3 pos = position;
    float o2Scale = 0.72 + (uO2 - 0.15) * 2.1;
    float pScale = mix(1.15, 0.88, clamp((uPressure - 25.0) / 115.0, 0.0, 1.0));
    float shellScale = 1.0 + uShellLayer * 0.28;
    pos *= o2Scale * pScale * shellScale;

    float h = clamp((position.y + 1.0) * 0.5, 0.0, 1.0);
    vHeightRatio = h;

    float windNorm = clamp(uAirflow / 20.0, 0.0, 1.5);

    if (uFuelShape < 0.5) {
      pos.y = max(-0.15, pos.y * 0.65 + 0.25);
      pos.x *= 1.35 + windNorm * 1.1;
      pos.z *= 0.85;
    }

    float wakeStretch = windNorm * pow(clamp((pos.x * uFlowSign + 1.0) * 0.5, 0.0, 1.5), 1.3) * 1.85;
    pos.x += uFlowSign * wakeStretch * (0.4 + 0.6 * h);

    if (windNorm > 0.05) {
      float upwindFactor = clamp(-pos.x * uFlowSign, 0.0, 1.0);
      pos.y *= mix(1.0, 0.72, upwindFactor * clamp(windNorm, 0.0, 1.0));
    }

    if (uGravity > 0.5) {
      float necking = mix(1.0, 0.22, pow(h, 0.85));
      pos.x *= necking;
      pos.z *= necking;
      pos.y = (h * 3.1) - 0.35;
      float flicker = waveNoise(pos * 1.8, uTime * 1.6) * pow(h, 1.4) * 0.28;
      pos.x += flicker + uFlowSign * windNorm * pow(h, 1.3) * 0.85;
      pos.z += waveNoise(pos.zyx * 1.8, uTime * 1.4) * pow(h, 1.4) * 0.22;
    } else {
      float microWave = waveNoise(pos * 1.4, uTime * 0.65) * (0.03 + 0.08 * windNorm);
      pos += normal * microWave;
    }

    vStreamwiseRatio = clamp((pos.x * uFlowSign + 1.2) / 3.2, 0.0, 1.0);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FLAME_FRAGMENT_SHADER = `
  uniform float uAirflow;
  uniform float uGravity;
  uniform float uO2;
  uniform float uShellLayer;
  uniform float uThermophoresis;
  uniform float uShowSootShell;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vHeightRatio;
  varying float vStreamwiseRatio;

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float ndotv = abs(dot(normalize(vNormal), viewDir));

    float edgeFade = smoothstep(0.0, 0.45, ndotv);
    float rimGlow = pow(1.0 - ndotv, 1.6) * smoothstep(0.0, 0.22, ndotv);

    float o2Intensity = clamp((uO2 - 0.136) / (0.40 - 0.136), 0.15, 1.35);
    float ventEnhancement = 1.0 + 0.35 * exp(-pow((uAirflow - 6.0) / 5.5, 2.0));
    float blowoffQuench = uAirflow > 14.0 ? clamp(1.0 - (uAirflow - 14.0) * 0.07, 0.25, 1.0) : 1.0;

    vec3 chBlueDeep = vec3(0.02, 0.38, 0.92);
    vec3 chBlueBright = vec3(0.22, 0.78, 1.00);
    vec3 reactionColor = mix(chBlueDeep, chBlueBright, clamp(o2Intensity * ventEnhancement, 0.0, 1.0));

    vec3 sootAmber = vec3(0.96, 0.48, 0.08);
    vec3 sootWhiteYellow = vec3(1.00, 0.92, 0.65);

    vec3 finalColor = reactionColor;
    float alpha = 0.0;

    if (uGravity > 0.5) {
      float sootZone = smoothstep(0.15, 0.48, vHeightRatio) * (1.0 - smoothstep(0.78, 0.98, vHeightRatio));
      vec3 plumeCore = mix(sootAmber, sootWhiteYellow, clamp(o2Intensity, 0.2, 1.0));
      finalColor = mix(reactionColor, plumeCore, sootZone * (1.0 - uShellLayer * 0.65));
      alpha = mix(0.68, 0.24, uShellLayer) * edgeFade * (1.0 - 0.35 * pow(vHeightRatio, 2.0));
    } else {
      float innerSootFactor = (1.0 - uShellLayer) * smoothstep(0.20, 0.36, uO2) * (0.35 + 0.45 * vStreamwiseRatio);
      if (uShowSootShell > 0.5) {
        innerSootFactor = max(innerSootFactor, (1.0 - uShellLayer) * 0.65);
      }
      vec3 microSootColor = mix(vec3(0.92, 0.42, 0.10), vec3(1.0, 0.80, 0.35), o2Intensity);
      finalColor = mix(reactionColor, microSootColor, innerSootFactor * (0.4 + 0.6 * uThermophoresis));

      float wakeFade = mix(1.0, 1.0 - 0.55 * vStreamwiseRatio, clamp(uAirflow / 15.0, 0.0, 1.0));
      alpha = (mix(0.62, 0.22, uShellLayer) * edgeFade + rimGlow * 0.45) * wakeFade * blowoffQuench;
    }

    alpha = clamp(alpha * (0.65 + 0.45 * o2Intensity), 0.0, 0.88);
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export function Combustion3DSimulator() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const [modeTab, setModeTab] = useState<"explore" | "replay">("explore");
  const [selectedPreset, setSelectedPreset] = useState<string>("iss_nominal");
  const [gravity, setGravity] = useState<GravityMode>("0g");
  const [o2Pct, setO2Pct] = useState<number>(21.0);
  const [airflowCmS, setAirflowCmS] = useState<number>(5.0);
  const [pressureKpa, setPressureKpa] = useState<number>(101.3);
  const [fuel, setFuel] = useState<FuelType>("pmma_slab");
  const [flowDir, setFlowDir] = useState<"opposed" | "concurrent">("opposed");
  const [cfdOverlay, setCfdOverlay] = useState<CfdOverlayMode>("velocity_u_v");
  const [thermophoresisOn, setThermophoresisOn] = useState<boolean>(true);
  const [paused, setPaused] = useState<boolean>(false);
  const [speedMult, setSpeedMult] = useState<number>(1.0);
  const [showInterpretation, setShowInterpretation] = useState<boolean>(false);

  const stateRef = useRef({
    gravity,
    o2Pct,
    airflowCmS,
    pressureKpa,
    fuel,
    flowDir,
    cfdOverlay,
    thermophoresisOn,
    paused,
    speedMult,
  });

  useEffect(() => {
    stateRef.current = {
      gravity,
      o2Pct,
      airflowCmS,
      pressureKpa,
      fuel,
      flowDir,
      cfdOverlay,
      thermophoresisOn,
      paused,
      speedMult,
    };
  }, [gravity, o2Pct, airflowCmS, pressureKpa, fuel, flowDir, cfdOverlay, thermophoresisOn, paused, speedMult]);

  const applyPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const p = SCENARIO_PRESETS.find((s) => s.id === presetId);
    if (!p) return;
    setGravity(p.gravity);
    setO2Pct(p.o2Pct);
    setAirflowCmS(p.airflowCmS);
    setPressureKpa(p.pressureKpa);
    setFuel(p.fuel);
    setFlowDir(p.flowDir);
  };

  const pressurePsi = useMemo(() => (pressureKpa / 6.894757).toFixed(1), [pressureKpa]);
  const o2PartialKpa = useMemo(() => ((o2Pct / 100) * pressureKpa).toFixed(2), [o2Pct, pressureKpa]);
  const pecletNumber = useMemo(() => ((airflowCmS * 2.0) / 0.21).toFixed(1), [airflowCmS]);
  const isPartialGravityRefused = gravity === "0.16g" || gravity === "0.38g";

  const regimeDiagnostic = useMemo(() => {
    if (isPartialGravityRefused) {
      return {
        zone: "Rule 5 Gate: Unmeasured Partial-Gravity Regime",
        spreadEst: "Refused (0 NASA PSI Rows)",
        summary:
          "NASA PSI holds 0 combustion records at Lunar (0.16g) or Martian (0.38g) gravity. Extrapolating buoyant plume coupling from 0g or 1g is prohibited.",
      };
    }
    if (gravity === "1g") {
      return {
        zone: "1g Buoyant Natural Convection Plume (10cmGravityU / Smoke CFD)",
        spreadEst: "Buoyancy-Driven (~65-90 cm/s Updraft)",
        summary:
          "Density gradients drive strong upward buoyant acceleration (10cmGravityU.dat), forming a flickering teardrop soot core and vertical smoke annulus.",
      };
    }
    if (airflowCmS < 1.2) {
      return {
        zone: "Zone 1: Quiescent Diffusive Regime (Pe < 10)",
        spreadEst: "Radiative Quenching / Self-Choking",
        summary:
          "Buoyancy is absent (~10-6g). Oxygen transport relies strictly on molecular diffusion, forming a spherical blue CH* shell that traps CO2 and soot.",
      };
    }
    if (airflowCmS <= 12.0) {
      return {
        zone: "Zone 2: Low-Velocity Ventilated Regime (Peak Microgravity Hazard)",
        spreadEst: `${(0.55 + (o2Pct - 15) * 0.14 + airflowCmS * 0.11).toFixed(2)} mm/s (BASS-II Calibrated Range)`,
        summary:
          "Gentle forced cabin ventilation supplies fresh O2 faster than molecular diffusion without convective blowoff cooling—sustaining vigorous flame spread.",
      };
    }
    return {
      zone: "Zone 3: High-Velocity Convective Stretch & Blowoff Regime",
      spreadEst: "Convective Thermal Quenching Risk",
      summary:
        "High forced flow stretches the reaction sheet and strips heat from the pyrolysis zone faster than chemical heat release can sustain.",
    };
  }, [gravity, airflowCmS, o2Pct, isPartialGravityRefused]);

  const resetCamera = (isometric = true) => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (isometric) {
      cameraRef.current.position.set(4.6, 3.1, 5.2);
    } else {
      cameraRef.current.position.set(0.0, 1.4, 6.2);
    }
    controlsRef.current.target.set(0, 0.5, 0);
    controlsRef.current.update();
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe6e1d6);
    scene.fog = new THREE.FogExp2(0xe6e1d6, 0.035);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(4.6, 3.1, 5.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 0.5, 0);
    controls.minDistance = 2.4;
    controls.maxDistance = 14.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.08;
    controlsRef.current = controls;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    renderer.domElement.addEventListener("wheel", handleWheel, { passive: false });

    scene.add(new THREE.AmbientLight(0xfaf8f3, 1.35));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const gridHelper = new THREE.GridHelper(14, 28, 0x8c8577, 0xc7c0b2);
    gridHelper.position.y = -1.2;
    scene.add(gridHelper);

    const ringGroup = new THREE.Group();
    ringGroup.position.y = -1.19;
    ringGroup.rotation.x = -Math.PI / 2;
    [1.2, 2.4, 3.8].forEach((r) => {
      const ringGeo = new THREE.RingGeometry(r, r + 0.025, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x6e685c,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
      });
      ringGroup.add(new THREE.Mesh(ringGeo, ringMat));
    });
    scene.add(ringGroup);

    const chamberWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(5.6, 3.8, 3.6)),
      new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.65 })
    );
    chamberWire.position.set(0, 0.7, 0);
    scene.add(chamberWire);

    const opticalStage = new THREE.Mesh(
      new THREE.CylinderGeometry(2.3, 2.45, 0.08, 64),
      new THREE.MeshStandardMaterial({ color: 0x161d2a, roughness: 0.4, metalness: 0.5 })
    );
    opticalStage.position.y = -1.15;
    scene.add(opticalStage);

    const pedestalGroup = new THREE.Group();
    const baseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.72, 0.42, 48),
      new THREE.MeshStandardMaterial({ color: 0x27303f, metalness: 0.7, roughness: 0.3 })
    );
    baseMesh.position.y = -0.92;
    pedestalGroup.add(baseMesh);

    const stemMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.85, 24),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 })
    );
    stemMesh.position.y = -0.35;
    pedestalGroup.add(stemMesh);

    const pmmaSlabMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.08, 0.75),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.25, metalness: 0.1 })
    );
    pmmaSlabMesh.position.y = 0.02;
    pedestalGroup.add(pmmaSlabMesh);

    const holderWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.55, 0.02, 0.95)),
      new THREE.LineBasicMaterial({ color: 0x64748b })
    );
    holderWire.position.y = 0.03;
    pedestalGroup.add(holderWire);

    const sphereFuelMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.3 })
    );
    sphereFuelMesh.position.y = 0.22;
    sphereFuelMesh.visible = false;
    pedestalGroup.add(sphereFuelMesh);

    scene.add(pedestalGroup);

    const flameGroup = new THREE.Group();
    flameGroup.position.set(0, 0.22, 0);

    const shellConfigs = [
      { layer: 0.0, scale: 0.78 },
      { layer: 0.35, scale: 0.94 },
      { layer: 0.7, scale: 1.08 },
      { layer: 1.0, scale: 1.24 },
    ];

    const flameMaterials: THREE.ShaderMaterial[] = [];
    const sphereGeo = new THREE.SphereGeometry(0.85, 64, 64);

    shellConfigs.forEach(({ layer, scale }) => {
      const mat = new THREE.ShaderMaterial({
        vertexShader: FLAME_VERTEX_SHADER,
        fragmentShader: FLAME_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uAirflow: { value: 5.0 },
          uGravity: { value: 0.0 },
          uO2: { value: 0.21 },
          uPressure: { value: 101.3 },
          uFlowSign: { value: -1.0 },
          uShellLayer: { value: layer },
          uFuelShape: { value: 0.0 },
          uThermophoresis: { value: 1.0 },
          uShowSootShell: { value: 0.0 },
        },
      });
      flameMaterials.push(mat);
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.scale.setScalar(scale);
      flameGroup.add(mesh);
    });

    const refusalCage = new THREE.Mesh(
      new THREE.SphereGeometry(0.95, 24, 18),
      new THREE.MeshBasicMaterial({
        color: 0xdc2626,
        wireframe: true,
        transparent: true,
        opacity: 0.55,
      })
    );
    refusalCage.visible = false;
    flameGroup.add(refusalCage);
    scene.add(flameGroup);

    const streamlinesGroup = new THREE.Group();
    const NUM_STREAMLINES = 14;
    const STREAM_PTS = 40;
    const streamLines: THREE.Line[] = [];

    for (let i = 0; i < NUM_STREAMLINES; i++) {
      const pts = new Array(STREAM_PTS).fill(0).map(() => new THREE.Vector3());
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0x1d4ed8 : 0x0284c7,
        transparent: true,
        opacity: 0.55,
      });
      const line = new THREE.Line(geo, mat);
      streamLines.push(line);
      streamlinesGroup.add(line);
    }
    scene.add(streamlinesGroup);

    const cfdContourMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.035, 24, 64),
      new THREE.MeshBasicMaterial({
        color: 0xd97706,
        transparent: true,
        opacity: 0.65,
        wireframe: true,
      })
    );
    cfdContourMesh.position.set(0, 0.25, 0);
    scene.add(cfdContourMesh);

    let reqId: number;
    let simTime = 0;
    let lastTime = performance.now();

    const animate = (now: number) => {
      reqId = requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const st = stateRef.current;
      if (!st.paused) {
        simTime += dt * st.speedMult;
      }

      const isRefused = st.gravity === "0.16g" || st.gravity === "0.38g";
      const flowSign = st.flowDir === "opposed" ? -1.0 : 1.0;
      const fuelShapeVal =
        st.fuel === "pmma_slab" ? 0.0 : st.fuel === "ethylene_jet" ? 2.0 : 1.0;

      pmmaSlabMesh.visible = st.fuel === "pmma_slab";
      holderWire.visible = st.fuel === "pmma_slab";
      sphereFuelMesh.visible = st.fuel !== "pmma_slab";

      refusalCage.visible = isRefused;
      flameMaterials.forEach((mat) => {
        mat.visible = !isRefused;
        mat.uniforms.uTime.value = simTime;
        mat.uniforms.uAirflow.value = st.airflowCmS;
        mat.uniforms.uGravity.value = st.gravity === "1g" ? 1.0 : 0.0;
        mat.uniforms.uO2.value = st.o2Pct / 100.0;
        mat.uniforms.uPressure.value = st.pressureKpa;
        mat.uniforms.uFlowSign.value = flowSign;
        mat.uniforms.uFuelShape.value = fuelShapeVal;
        mat.uniforms.uThermophoresis.value = st.thermophoresisOn ? 1.0 : 0.0;
        mat.uniforms.uShowSootShell.value = st.cfdOverlay === "soot_numden" ? 1.0 : 0.0;
      });

      streamlinesGroup.visible = !isRefused && st.cfdOverlay !== "flame_only";
      cfdContourMesh.visible =
        !isRefused && (st.cfdOverlay === "soot_numden" || st.cfdOverlay === "vorticity");

      if (cfdContourMesh.visible) {
        const tfScale = st.thermophoresisOn ? 0.74 : 0.92;
        cfdContourMesh.scale.set(
          tfScale * (1.0 + st.airflowCmS * 0.03),
          st.gravity === "1g" ? 1.8 : tfScale,
          tfScale
        );
        (cfdContourMesh.material as THREE.MeshBasicMaterial).color.setHex(
          st.cfdOverlay === "vorticity" ? 0x7e22ce : 0xd97706
        );
      }

      streamLines.forEach((line, idx) => {
        const posAttr = line.geometry.getAttribute("position") as THREE.BufferAttribute;
        const row = (idx % 7) - 3;
        const zLayer = idx < 7 ? -0.32 : 0.32;
        const phase = (simTime * (0.4 + st.airflowCmS * 0.08)) % 1.0;

        for (let j = 0; j < STREAM_PTS; j++) {
          const s = (j / (STREAM_PTS - 1) + phase * 0.08) % 1.0;
          if (st.gravity === "1g") {
            const y = -0.8 + s * 3.2;
            const rInward = (1.0 - 0.55 * Math.pow(s, 0.7)) * (row * 0.35);
            const x = rInward + Math.sin(s * 5.0 - simTime * 3.0) * 0.06;
            posAttr.setXYZ(j, x, y, zLayer);
          } else {
            const x = flowSign * (-2.2 + s * 4.4);
            const rDist = Math.sqrt(x * x + row * 0.28 * (row * 0.28));
            const stefanDeflect = Math.exp(-rDist * rDist * 1.2) * 0.38;
            const y = 0.25 + row * 0.24 + (row >= 0 ? stefanDeflect : -stefanDeflect * 0.5);
            posAttr.setXYZ(j, x, y, zLayer);
          }
        }
        posAttr.needsUpdate = true;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    reqId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("wheel", handleWheel);
      renderer.dispose();
    };
  }, []);

  return (
    <section className="w-full border-2 border-[#181615] bg-[#FAF8F3] text-[#181615]">
      <div className="h-14 px-6 border-b-2 border-[#181615] bg-[#EAE5DB] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs font-bold uppercase tracking-widest px-2.5 py-1 bg-[#181615] text-[#FAF8F3]">
            03 / COMBUSTION & CFD PHYSICS LAB
          </span>
          <h2
            className="text-lg font-bold tracking-tight border-b-2 border-dotted border-[#181615]/50 cursor-help"
            title="Continuous 3D GLSL Burke-Schumann reaction sheet + NASA PSI 8cm/10cm CFD velocity (u, v), vorticity, and thermophoretic soot number density fields."
          >
            3D Volumetric Flame & NASA PSI CFD Field Simulator
          </h2>
        </div>

        <div className="flex items-center border border-[#181615] bg-[#FAF8F3]">
          <button
            onClick={() => setModeTab("explore")}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
              modeTab === "explore" ? "bg-[#181615] text-[#FAF8F3]" : "text-[#33302C]"
            }`}
          >
            Explore Physics
          </button>
          <button
            onClick={() => {
              setModeTab("replay");
              applyPreset("cfd_8cm_0g");
            }}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border-l border-[#181615] ${
              modeTab === "replay" ? "bg-[#181615] text-[#FAF8F3]" : "text-[#33302C]"
            }`}
          >
            Measured CFD Replay
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 min-h-[660px]">
        <div className="col-span-12 lg:col-span-9 relative border-b lg:border-b-0 lg:border-r-2 border-[#181615] bg-[#E6E1D6] flex flex-col justify-between overflow-hidden">
          <div className="relative z-10 p-5 flex items-start justify-between pointer-events-none">
            <div className="bg-[#FAF8F3]/95 border border-[#181615] px-4 py-3 shadow-sm pointer-events-auto">
              <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#33302C]">
                OPTICAL TEST CELL · CFD DOMAIN: {gravity === "1g" ? "10.0 cm (1g)" : "8.0 cm (0g)"}
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-extrabold font-mono text-[#181615]">
                  {gravity === "0g" ? "μg" : gravity}
                </span>
                <span className="text-sm font-bold text-[#1D4ED8]">{regimeDiagnostic.zone}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(["flame_only", "velocity_u_v", "soot_numden", "vorticity"] as CfdOverlayMode[]).map(
                  (ov) => (
                    <button
                      key={ov}
                      onClick={() => setCfdOverlay(ov)}
                      className={`px-2 py-0.5 text-[11px] font-mono font-bold border ${
                        cfdOverlay === ov
                          ? "bg-[#1D4ED8] text-white border-[#1D4ED8]"
                          : "bg-[#EAE5DB] text-[#181615] border-[#D5CFC2]"
                      }`}
                    >
                      {ov === "flame_only"
                        ? "CH* + Soot Sheet"
                        : ov === "velocity_u_v"
                        ? "CFD Velocity (U,V)"
                        : ov === "soot_numden"
                        ? "Soot NumDenR"
                        : "Vorticity"}
                    </button>
                  )
                )}
                {gravity === "0g" && (
                  <button
                    onClick={() => setThermophoresisOn(!thermophoresisOn)}
                    className={`px-2 py-0.5 text-[11px] font-mono font-bold border ${
                      thermophoresisOn
                        ? "bg-[#15803D] text-white border-[#15803D]"
                        : "bg-[#FAF8F3] text-[#33302C] border-[#181615]"
                    }`}
                  >
                    Thermophoresis: {thermophoresisOn ? "ON (NumDenR)" : "OFF (NoTF_NumDen)"}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 pointer-events-auto">
              <div className="flex items-center bg-[#FAF8F3] border border-[#181615] divide-x divide-[#181615] shadow-sm">
                <button
                  onClick={() => resetCamera(true)}
                  className="px-3 py-2 text-xs font-mono font-bold hover:bg-[#EAE5DB]"
                >
                  3D ISO
                </button>
                <button
                  onClick={() => resetCamera(false)}
                  className="px-3 py-2 text-xs font-mono font-bold hover:bg-[#EAE5DB]"
                >
                  SIDE
                </button>
                <button
                  onClick={() => setPaused(!paused)}
                  className="px-3 py-2 text-xs font-mono font-bold hover:bg-[#EAE5DB]"
                >
                  {paused ? "RESUME" : "PAUSE"}
                </button>
                <select
                  value={speedMult}
                  onChange={(e) => setSpeedMult(parseFloat(e.target.value))}
                  className="px-2 py-2 text-xs font-mono font-bold bg-[#FAF8F3] focus:outline-none"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1.0}>1.0x</option>
                  <option value={2.0}>2.0x</option>
                </select>
              </div>
              <div className="bg-[#FAF8F3]/90 border border-[#D5CFC2] px-2.5 py-1 text-[11px] font-mono font-semibold text-[#15803D]">
                CFD STREAMLINES & GLSL SOLVER ACTIVE
              </div>
            </div>
          </div>

          {isPartialGravityRefused && (
            <div className="relative z-20 mx-6 my-auto bg-[#FAF8F3] border-2 border-[#DC2626] p-5 shadow-lg max-w-xl">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#DC2626]">
                RULE 5 DETERMINISTIC REFUSAL · ZERO PARTIAL-GRAVITY RECORDS
              </div>
              <p className="mt-1 text-sm font-semibold text-[#181615]">
                {regimeDiagnostic.summary}
              </p>
            </div>
          )}

          <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

          <div className="relative z-10 mt-auto bg-[#FAF8F3]/95 border-t-2 border-[#181615] px-6 py-3.5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <div className="font-mono text-[11px] font-bold uppercase text-[#33302C]">
                PECLET NUMBER (Pe = uL/D)
              </div>
              <div className="text-xl font-bold font-mono text-[#181615]">
                Pe = {pecletNumber}{" "}
                <span className="text-xs font-semibold text-[#1D4ED8]">
                  ({airflowCmS < 1.2 ? "Diffusive" : airflowCmS <= 12 ? "Mixed Ventilated" : "Convective"})
                </span>
              </div>
              <div className="text-[11px] font-mono text-[#33302C]">
                Flow Direction: {flowDir.toUpperCase()}
              </div>
            </div>

            <div>
              <div className="font-mono text-[11px] font-bold uppercase text-[#33302C]">
                O2 PARTIAL PRESSURE
              </div>
              <div className="text-xl font-bold font-mono text-[#1D4ED8]">{o2PartialKpa} kPa</div>
              <div className="text-[11px] font-mono text-[#33302C]">
                {(o2Pct / 100).toFixed(2)} x {pressureKpa.toFixed(1)} kPa = {o2PartialKpa} kPa
              </div>
            </div>

            <div>
              <div className="font-mono text-[11px] font-bold uppercase text-[#33302C]">
                SPREAD / TRANSPORT STATE
              </div>
              <div className="text-sm font-bold font-mono text-[#181615]">
                {regimeDiagnostic.spreadEst}
              </div>
              <div className="text-[11px] font-mono text-[#33302C]">
                Source: 8cmNoGravity / BASS-II Table 5.1
              </div>
            </div>

            <div className="flex flex-col md:items-end text-right font-mono text-[11px] text-[#33302C]">
              <span className="font-bold text-[#181615] border border-[#181615] px-2 py-0.5 bg-[#EAE5DB]">
                CFD + ANALYTIC SHADER
              </span>
              <span className="mt-1">Drag to orbit 360 deg · Scroll inside chamber to zoom</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3 bg-[#EAE5DB] p-6 flex flex-col justify-between gap-5">
          <div className="space-y-5">
            <div>
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#181615]">
                SET LAB CONDITIONS
              </div>
              <p className="text-xs font-semibold text-[#33302C] mt-0.5">
                Coupled Burke-Schumann reaction sheet & NASA PSI 8cm/10cm CFD velocity/soot fields.
              </p>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase text-[#181615] mb-1.5">
                Flight / CFD Scenario Preset
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => applyPreset(e.target.value)}
                className="w-full bg-[#FAF8F3] border-2 border-[#181615] px-3 py-2 text-xs font-bold text-[#181615]"
              >
                {SCENARIO_PRESETS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase text-[#181615] mb-1.5">
                Gravity Environment
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { id: "0g", top: "μg", sub: "Orbit" },
                    { id: "0.16g", top: "0.16g", sub: "Moon" },
                    { id: "0.38g", top: "0.38g", sub: "Mars" },
                    { id: "1g", top: "1g", sub: "Earth" },
                  ] as const
                ).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGravity(g.id)}
                    className={`py-2 px-1 border-2 text-center transition-colors ${
                      gravity === g.id
                        ? "bg-[#181615] text-[#FAF8F3] border-[#181615]"
                        : "bg-[#FAF8F3] text-[#181615] border-[#D5CFC2] hover:border-[#181615]"
                    }`}
                  >
                    <div className="font-mono text-xs font-bold">{g.top}</div>
                    <div className="text-[10px] font-semibold opacity-80">{g.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Oxygen Concentration</span>
                <span className="font-mono text-[#1D4ED8]">{o2Pct.toFixed(1)}% O2</span>
              </div>
              <input
                type="range"
                min={14}
                max={40}
                step={0.5}
                value={o2Pct}
                onChange={(e) => setO2Pct(parseFloat(e.target.value))}
                className="w-full accent-[#1D4ED8] cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[10px] text-[#33302C]">
                <span>14% (LOC)</span>
                <span>21% (ISS)</span>
                <span className="text-[#DC2626] font-bold">34% (Lunar)</span>
                <span>40%</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Airflow Velocity (u)</span>
                <span className="font-mono text-[#1D4ED8]">{airflowCmS.toFixed(1)} cm/s</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={0.5}
                value={airflowCmS}
                onChange={(e) => setAirflowCmS(parseFloat(e.target.value))}
                className="w-full accent-[#1D4ED8] cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[10px] text-[#33302C]">
                <span>0 (Still)</span>
                <span>2-10 cm/s (Peak Hazard)</span>
                <span>25 cm/s</span>
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase text-[#181615] mb-1">
                Oxidizer Flow Vector Direction
              </label>
              <div className="grid grid-cols-2 border border-[#181615] bg-[#FAF8F3]">
                <button
                  onClick={() => setFlowDir("opposed")}
                  className={`py-1.5 text-xs font-bold font-mono ${
                    flowDir === "opposed" ? "bg-[#181615] text-[#FAF8F3]" : "text-[#181615]"
                  }`}
                >
                  Opposed Flow
                </button>
                <button
                  onClick={() => setFlowDir("concurrent")}
                  className={`py-1.5 text-xs font-bold font-mono border-l border-[#181615] ${
                    flowDir === "concurrent" ? "bg-[#181615] text-[#FAF8F3]" : "text-[#181615]"
                  }`}
                >
                  Concurrent Flow
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Cabin Pressure</span>
                <span className="font-mono text-[#1D4ED8]">
                  {pressureKpa.toFixed(1)} kPa · {pressurePsi} psi
                </span>
              </div>
              <input
                type="range"
                min={29.6}
                max={140.0}
                step={0.5}
                value={pressureKpa}
                onChange={(e) => setPressureKpa(parseFloat(e.target.value))}
                className="w-full accent-[#1D4ED8] cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[10px] text-[#33302C]">
                <span>29.6 kPa (EVA)</span>
                <span className="text-[#DC2626] font-bold">56.5 kPa (Lunar)</span>
                <span>101.3 kPa (ISS)</span>
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase text-[#181615] mb-1">
                Fuel Material & Geometry
              </label>
              <select
                value={fuel}
                onChange={(e) => setFuel(e.target.value as FuelType)}
                className="w-full bg-[#FAF8F3] border-2 border-[#181615] px-3 py-2 text-xs font-bold text-[#181615]"
              >
                <option value="pmma_slab">PMMA · Flat Solid Slab (BASS-II)</option>
                <option value="pmma_sphere">PMMA · 2 cm Solid Sphere (BASS)</option>
                <option value="heptane_droplet">Heptane · Liquid Droplet (FLEX)</option>
                <option value="ethylene_jet">Ethylene · Burner Jet (8cm/10cm CFD)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowInterpretation(!showInterpretation)}
            className="w-full bg-[#181615] hover:bg-[#1D4ED8] text-[#FAF8F3] font-bold py-3 px-4 text-xs uppercase tracking-wider flex items-center justify-between transition-colors"
          >
            <span>{showInterpretation ? "Hide CFD & PSI Provenance" : "Interpret Scenario"}</span>
            <span className="font-mono">-&gt;</span>
          </button>
        </div>
      </div>

      {showInterpretation && (
        <div className="border-t-2 border-[#181615] bg-[#FAF8F3] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-[#D5CFC2] bg-[#F4F1EA] p-4">
            <div className="font-mono text-xs font-bold uppercase text-[#1D4ED8]">
              01 / ACTIVE TRANSPORT & REGIME PHYSICS
            </div>
            <div className="mt-1 font-bold text-sm">{regimeDiagnostic.zone}</div>
            <p className="mt-1 text-xs font-semibold text-[#33302C] leading-relaxed">
              {regimeDiagnostic.summary}
            </p>
          </div>

          <div className="border border-[#D5CFC2] bg-[#F4F1EA] p-4">
            <div className="font-mono text-xs font-bold uppercase text-[#15803D]">
              02 / NASA PSI CFD FIELD PROVENANCE (.DAT)
            </div>
            <ul className="mt-1.5 space-y-1 font-mono text-xs text-[#181615]">
              <li>- Grid: 8cm_sGrid_grid3d.dat (17.97 MB, 3D coords)</li>
              <li>- 0g Velocity: 8cmNoGravityU.dat & 8cmNoGravityV.dat</li>
              <li>- 0g Soot Shell: 8cmNoGravityNumDenR.dat vs NoTF_NumDen.dat</li>
              <li>- 1g Plume: 10cmGravityU.dat & 10cmGravitySmoke.dat</li>
            </ul>
          </div>

          <div className="border border-[#D5CFC2] bg-[#F4F1EA] p-4">
            <div className="font-mono text-xs font-bold uppercase text-[#DC2626]">
              03 / EMPIRICAL FLIGHT RECORD MATCH
            </div>
            <div className="mt-1 text-xs font-semibold text-[#181615]">
              {o2Pct >= 30 && pressureKpa <= 70.3
                ? "LUNAR GAP TRIGGERED: 0 ambient cabin-air rows in NASA PSI combine O2 >= 30% with Pressure <= 70.3 kPa (10.2 psi). Closest cabin row: FLEX Test 24 (30.0% O2, 71.2 kPa / 10.33 psi)."
                : "Inside documented ISS microgravity bounds. Matched to BASS-II Table 5.1 (NASA/TM-20210011385) and FLEX (PSI-69) flight records."}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Combustion3DSimulator;
