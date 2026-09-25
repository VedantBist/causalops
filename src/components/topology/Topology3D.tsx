import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SERVICES, TOPOLOGY_EDGES } from '../../data/mockData';
import { ServiceNode } from '../../types';

interface Topology3DProps {
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  isIncidentIsolated: boolean;
  onToggleIncidentIsolation: () => void;
  viewMode: '3d' | '2d';
  onToggleViewMode: (mode: '3d' | '2d') => void;
  onInvestigate?: () => void;
  compact?: boolean;
}

export const Topology3D: React.FC<Topology3DProps> = ({
  selectedNodeId,
  onSelectNode,
  isIncidentIsolated,
  onToggleIncidentIsolation,
  viewMode,
  onToggleViewMode,
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<ServiceNode | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const cameraSphericalRef = useRef({ radius: 24, theta: Math.PI / 4, phi: Math.PI / 3 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const particleGroupRef = useRef<THREE.Points | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0d0e);

    // Subtle atmospheric fog
    scene.fog = new THREE.FogExp2(0x0a0d0e, 0.025);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xadedfc, 1.2);
    dirLight1.position.set(15, 20, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff9999, 0.6);
    dirLight2.position.set(-15, -10, -10);
    scene.add(dirLight2);

    // 5. Architectural Tier Grid Planes (Floor levels)
    const gridHelper = new THREE.GridHelper(40, 40, 0x1d2832, 0x141f28);
    gridHelper.position.y = -8;
    scene.add(gridHelper);

    // Tier 1 Ingress Sub-Plane
    const tier1Geo = new THREE.PlaneGeometry(8, 20);
    const tier1Mat = new THREE.MeshBasicMaterial({
      color: 0x11181b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const tier1Plane = new THREE.Mesh(tier1Geo, tier1Mat);
    tier1Plane.rotation.x = -Math.PI / 2;
    tier1Plane.position.set(-6, -7.8, 0);
    scene.add(tier1Plane);

    // Tier 2 Compute Sub-Plane
    const tier2Geo = new THREE.PlaneGeometry(10, 20);
    const tier2Mat = new THREE.MeshBasicMaterial({
      color: 0x0f1517,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const tier2Plane = new THREE.Mesh(tier2Geo, tier2Mat);
    tier2Plane.rotation.x = -Math.PI / 2;
    tier2Plane.position.set(-1, -7.8, 0);
    scene.add(tier2Plane);

    // Tier 3 Storage Sub-Plane
    const tier3Geo = new THREE.PlaneGeometry(8, 20);
    const tier3Mat = new THREE.MeshBasicMaterial({
      color: 0x11181b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const tier3Plane = new THREE.Mesh(tier3Geo, tier3Mat);
    tier3Plane.rotation.x = -Math.PI / 2;
    tier3Plane.position.set(5, -7.8, 0);
    scene.add(tier3Plane);

    // 6. Build Node Meshes
    nodeMeshesRef.current.clear();
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    SERVICES.forEach((service) => {
      const group = new THREE.Group();
      group.name = service.id;

      // Base Box Dimensions
      const isRoot = service.id === 'inventory-db';
      const isCrit = service.status === 'critical' || service.status === 'degraded';
      const width = isRoot ? 3.0 : 2.6;
      const height = isRoot ? 1.4 : 1.1;
      const depth = 0.5;

      const boxGeo = new THREE.BoxGeometry(width, height, depth);

      // Node color
      let baseColor = 0x131b1e;
      let edgeColor = 0x232f34;
      if (service.status === 'critical') {
        baseColor = 0x2b1013;
        edgeColor = 0xb83a3a;
      } else if (service.status === 'degraded') {
        baseColor = 0x22180d;
        edgeColor = 0xd9822b;
      } else if (service.status === 'predicted') {
        baseColor = 0x171524;
        edgeColor = 0x7c6fa8;
      } else {
        baseColor = 0x10171d;
        edgeColor = 0x2f7d5c;
      }

      const boxMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.35,
        metalness: 0.6,
      });

      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      group.add(boxMesh);

      // Outer outline wireframe / border
      const edgesGeo = new THREE.EdgesGeometry(boxGeo);
      const lineMat = new THREE.LineBasicMaterial({
        color: edgeColor,
        linewidth: isRoot ? 2 : 1,
      });
      const wireframe = new THREE.LineSegments(edgesGeo, lineMat);
      group.add(wireframe);

      // Status indicator sphere
      const sphereGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const sphereMat = new THREE.MeshBasicMaterial({
        color:
          service.status === 'critical'
            ? 0xb83a3a
            : service.status === 'degraded'
            ? 0xd9822b
            : service.status === 'predicted'
            ? 0x7c6fa8
            : 0x2f7d5c,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(-width / 2 + 0.3, height / 2 - 0.25, depth / 2 + 0.05);
      group.add(sphere);

      // If Root Cause, add pulsing outer halo ring
      if (isRoot) {
        const ringGeo = new THREE.RingGeometry(1.9, 2.05, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xb83a3a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.z = depth / 2 + 0.02;
        group.add(ring);
      }

      // Position group in 3D space
      group.position.set(service.pos3D[0], service.pos3D[1], service.pos3D[2]);
      nodeGroup.add(group);
      nodeMeshesRef.current.set(service.id, group);
    });

    // 7. Topology Edges (Connecting Tubes / Lines)
    const edgeGroup = new THREE.Group();
    scene.add(edgeGroup);

    TOPOLOGY_EDGES.forEach((edge) => {
      const srcNode = SERVICES.find((s) => s.id === edge.source);
      const tgtNode = SERVICES.find((s) => s.id === edge.target);
      if (!srcNode || !tgtNode) return;

      const p1 = new THREE.Vector3(srcNode.pos3D[0], srcNode.pos3D[1], srcNode.pos3D[2]);
      const p2 = new THREE.Vector3(tgtNode.pos3D[0], tgtNode.pos3D[1], tgtNode.pos3D[2]);

      const points = [p1, p2];
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 16, edge.isIncidentPath ? 0.06 : 0.025, 8, false);

      let edgeMatColor = 0x222f35;
      if (edge.isIncidentPath) {
        edgeMatColor = edge.status === 'critical' ? 0xb83a3a : 0xd9822b;
      } else if (edge.type === 'predicted') {
        edgeMatColor = 0x7c6fa8;
      }

      const tubeMat = new THREE.MeshBasicMaterial({
        color: edgeMatColor,
        transparent: true,
        opacity: edge.isIncidentPath ? 0.95 : 0.4,
      });

      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      tubeMesh.name = `edge-${edge.id}`;
      edgeGroup.add(tubeMesh);
    });

    // 8. Animated causal flow particles along the active incident path
    const particleCount = 40;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = 0;
      particlePositions[i * 3 + 1] = 0;
      particlePositions[i * 3 + 2] = 0;

      // Deep Red / Orange for active incident
      particleColors[i * 3] = 0.95;
      particleColors[i * 3 + 1] = 0.25;
      particleColors[i * 3 + 2] = 0.25;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particleGroupRef.current = particles;

    // 9. Resize listener
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Pulse incident root node
      const rootMesh = nodeMeshesRef.current.get('inventory-db');
      if (rootMesh) {
        const pulse = 1 + Math.sin(elapsedTime * 4) * 0.05;
        rootMesh.scale.set(pulse, pulse, pulse);
      }

      // Animate particles along the incident path:
      // Path: inventory-db -> inventory-service -> order-service -> api-gateway
      if (particleGroupRef.current) {
        const positions = particleGroupRef.current.geometry.attributes.position.array as Float32Array;

        const pathPoints = [
          new THREE.Vector3(5, -0.5, 0), // inventory-db
          new THREE.Vector3(-1, -0.5, 0), // inventory-service
          new THREE.Vector3(-1, 2, 0), // order-service
          new THREE.Vector3(-6, 2, 0), // api-gateway
        ];

        for (let i = 0; i < particleCount; i++) {
          const t = (elapsedTime * 0.4 + i / particleCount) % 1;
          const currentPointIndex = Math.min(Math.floor(t * 3), 2);
          const localT = (t * 3) % 1;

          const pStart = pathPoints[currentPointIndex];
          const pEnd = pathPoints[currentPointIndex + 1];

          positions[i * 3] = THREE.MathUtils.lerp(pStart.x, pEnd.x, localT);
          positions[i * 3 + 1] = THREE.MathUtils.lerp(pStart.y, pEnd.y, localT);
          positions[i * 3 + 2] = THREE.MathUtils.lerp(pStart.z, pEnd.z, localT) + Math.sin(t * Math.PI) * 0.2;
        }

        particleGroupRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
    };
  }, []);

  // Update camera based on spherical coords
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSphericalRef.current;
    const target = cameraTargetRef.current;

    cameraRef.current.position.x = target.x + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.y = target.y + radius * Math.cos(phi);
    cameraRef.current.position.z = target.z + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.lookAt(target);
  };

  // Adjust for 2D vs 3D view modes
  useEffect(() => {
    if (!cameraRef.current) return;
    if (viewMode === '2d') {
      cameraSphericalRef.current = { radius: 22, theta: Math.PI / 2, phi: Math.PI / 2 };
      cameraTargetRef.current.set(0, 0, 0);
    } else {
      cameraSphericalRef.current = { radius: 24, theta: Math.PI / 4, phi: Math.PI / 3 };
      cameraTargetRef.current.set(0, 0, 0);
    }
    updateCameraPosition();
  }, [viewMode]);

  // Adjust for incident isolation mode
  useEffect(() => {
    nodeMeshesRef.current.forEach((mesh, id) => {
      const service = SERVICES.find((s) => s.id === id);
      if (!service) return;

      if (isIncidentIsolated) {
        if (service.isIncidentPath) {
          mesh.visible = true;
        } else {
          mesh.visible = false;
        }
      } else {
        mesh.visible = true;
      }
    });
  }, [isIncidentIsolated]);

  // Mouse interaction handlers for orbit, pan, zoom, click
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    if (isDraggingRef.current) {
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;

      if (e.shiftKey || e.button === 2) {
        // Pan
        const factor = 0.025;
        cameraTargetRef.current.x -= deltaX * factor;
        cameraTargetRef.current.y += deltaY * factor;
      } else {
        // Orbit
        cameraSphericalRef.current.theta -= deltaX * 0.008;
        cameraSphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraSphericalRef.current.phi - deltaY * 0.008));
      }

      updateCameraPosition();
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Raycast hover check
    if (!cameraRef.current || !sceneRef.current || !containerRef.current) return;
    const canvasRect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - canvasRect.left) / canvasRect.width) * 2 - 1,
      -((e.clientY - canvasRect.top) / canvasRect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const interactiveObjects: THREE.Object3D[] = [];
    nodeMeshesRef.current.forEach((group) => {
      interactiveObjects.push(...group.children);
    });

    const intersects = raycaster.intersectObjects(interactiveObjects, false);
    if (intersects.length > 0) {
      const parentGroup = intersects[0].object.parent;
      if (parentGroup && parentGroup.name) {
        const found = SERVICES.find((s) => s.id === parentGroup.name);
        setHoveredNode(found || null);
        return;
      }
    }
    setHoveredNode(null);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * 0.02;
    cameraSphericalRef.current.radius = Math.max(8, Math.min(50, cameraSphericalRef.current.radius + delta));
    updateCameraPosition();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!cameraRef.current || !sceneRef.current || !containerRef.current) return;
    const canvasRect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - canvasRect.left) / canvasRect.width) * 2 - 1,
      -((e.clientY - canvasRect.top) / canvasRect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const interactiveObjects: THREE.Object3D[] = [];
    nodeMeshesRef.current.forEach((group) => {
      interactiveObjects.push(...group.children);
    });

    const intersects = raycaster.intersectObjects(interactiveObjects, false);
    if (intersects.length > 0) {
      const parentGroup = intersects[0].object.parent;
      if (parentGroup && parentGroup.name) {
        onSelectNode(parentGroup.name);
      }
    }
  };

  const handleResetCamera = () => {
    cameraSphericalRef.current = { radius: 24, theta: Math.PI / 4, phi: Math.PI / 3 };
    cameraTargetRef.current.set(0, 0, 0);
    updateCameraPosition();
  };

  const handleFocusNode = (nodeId: string) => {
    const node = SERVICES.find((s) => s.id === nodeId);
    if (!node) return;
    cameraTargetRef.current.set(node.pos3D[0], node.pos3D[1], node.pos3D[2]);
    cameraSphericalRef.current.radius = 12;
    updateCameraPosition();
    onSelectNode(nodeId);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col bg-[#0D1113] overflow-hidden select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Isometric Micro Grid Pattern Overlay for Depth */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="spatial-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="14" r="0.65" fill="#243137" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#spatial-grid)" />
      </svg>

      {/* TOP STREAMLINED HUD CONTROLS */}
      <div className="relative z-10 flex flex-wrap items-center justify-between px-4 py-2 bg-[#0A0D0E]/90 border-b border-[#1E2428] backdrop-blur-sm pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* 3D vs 2D Toggle */}
          <div className="inline-flex rounded-[3px] border border-[#232F34] bg-[#0A0D0E] p-0.5 text-[11px] font-code">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleViewMode('3d');
              }}
              className={`px-2 py-0.5 rounded-[2px] transition-colors ${
                viewMode === '3d' ? 'bg-[#286B78] text-white font-medium' : 'text-[#7A8A92] hover:text-white'
              }`}
            >
              3D Spatial
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleViewMode('2d');
              }}
              className={`px-2 py-0.5 rounded-[2px] transition-colors ${
                viewMode === '2d' ? 'bg-[#286B78] text-white font-medium' : 'text-[#7A8A92] hover:text-white'
              }`}
            >
              2D Flat
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleResetCamera();
            }}
            className="h-6 px-2 rounded-[3px] bg-[#141B1E] border border-[#232F34] text-[#8C9CA4] hover:text-white font-code text-[10.5px] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">refresh</span>
            <span>Reset View</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleIncidentIsolation();
            }}
            className={`h-6 px-2.5 rounded-[3px] border font-code text-[10.5px] font-medium flex items-center gap-1.5 transition-colors ${
              isIncidentIsolated
                ? 'bg-[#B83A3A]/30 border-[#B83A3A] text-white'
                : 'bg-[#B83A3A]/15 border-[#B83A3A]/50 text-[#FFA4A4] hover:bg-[#B83A3A]/25'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#B83A3A] animate-ping"></span>
            <span>Isolate Incident (4 nodes)</span>
          </button>

          {!compact && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFocusNode('inventory-db');
              }}
              className="h-6 px-2 rounded-[3px] bg-[#141B1E] border border-[#232F34] text-[#8C9CA4] hover:text-white font-code text-[10.5px] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px]">my_location</span>
              <span>Focus: inventory-db</span>
            </button>
          )}
        </div>

        {/* Quiet Readout Right */}
        <div className="flex items-center gap-3 text-[11px] font-code text-[#7A8A92]">
          <span className="hidden sm:inline">47 nodes · 183 edges</span>
          <div className="text-[#FFA4A4] bg-[#B83A3A]/15 px-1.5 py-0.5 rounded-[2px] border border-[#B83A3A]/40 font-semibold text-[10px]">
            ANOMALOUS CLUSTER: #1
          </div>
        </div>
      </div>

      {/* NAVIGATION HELPER TEXT */}
      <div className="absolute top-12 left-4 z-10 pointer-events-none font-code text-[10px] text-[#4A5D6B] tracking-wider uppercase">
        DRAG TO ORBIT · SCROLL TO ZOOM · SHIFT+DRAG TO PAN · CLICK NODE TO INSPECT
      </div>

      {/* TIER PLANE LABELS */}
      <div className="absolute left-4 top-20 text-[9px] font-code tracking-widest text-[#2A3C4D] uppercase border-l border-[#1D2C39] pl-2 pointer-events-none">
        TIER 01 · INGRESS &amp; ROUTING
      </div>
      <div className="absolute left-1/3 top-20 text-[9px] font-code tracking-widest text-[#2A3C4D] uppercase border-l border-[#1D2C39] pl-2 pointer-events-none">
        TIER 02 · COMPUTATION SERVICES
      </div>
      <div className="absolute right-32 top-20 text-[9px] font-code tracking-widest text-[#2A3C4D] uppercase border-l border-[#1D2C39] pl-2 pointer-events-none">
        TIER 03 · PERSISTENCE &amp; STORAGE
      </div>

      {/* HOVER TOOLTIP */}
      {hoveredNode && (
        <div
          className="absolute z-30 pointer-events-none p-2 rounded-[3px] bg-[#0E1419]/95 border border-[#203140] text-white shadow-xl max-w-xs"
          style={{
            left: `${mousePos.x + 12}px`,
            top: `${mousePos.y + 12}px`,
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-[#1E2832] pb-1 mb-1">
            <span className="font-code font-bold text-[12px] text-white">{hoveredNode.displayName}</span>
            <span
              className={`font-code text-[9px] uppercase px-1 py-0.2 rounded ${
                hoveredNode.status === 'critical'
                  ? 'bg-[#B83A3A] text-white font-bold'
                  : hoveredNode.status === 'degraded'
                  ? 'bg-[#D9822B] text-black font-semibold'
                  : 'bg-[#2F7D5C] text-white'
              }`}
            >
              {hoveredNode.status}
            </span>
          </div>
          <div className="font-code text-[10px] text-[#A5B7C6] space-y-0.5">
            <div>Type: {hoveredNode.type} ({hoveredNode.tech})</div>
            <div>P99 Latency: <span className="font-bold text-white">{hoveredNode.latencyP99}ms</span></div>
            <div>Error Rate: <span className="font-bold text-white">{hoveredNode.errorRate}%</span></div>
            {hoveredNode.incidentStatusText && (
              <div className="text-[#FFA4A4] pt-0.5 font-semibold">Incident: {hoveredNode.incidentStatusText}</div>
            )}
          </div>
        </div>
      )}

      {/* MINIMAP (LOWER LEFT) */}
      <div className="absolute bottom-10 left-4 z-20 p-1.5 bg-[#0E1419]/90 border border-[#1E2B38] rounded-[2px] backdrop-blur pointer-events-auto">
        <div className="w-24 h-12 bg-[#080B0E] relative border border-[#16212B]">
          <div className="absolute left-3 top-2 w-1.5 h-1 bg-[#476785]" title="auth-gateway"></div>
          <div className="absolute left-3 top-5 w-2 h-1 bg-[#B83A3A]" title="api-gateway"></div>
          <div className="absolute left-3 top-8 w-1.5 h-1 bg-[#476785]" title="web-gateway"></div>
          <div className="absolute left-10 top-2 w-1.5 h-1 bg-[#476785]" title="auth-service"></div>
          <div className="absolute left-10 top-5 w-2 h-1 bg-[#D9822B]" title="order-service"></div>
          <div className="absolute left-10 top-7 w-2 h-1 bg-[#D9822B]" title="inventory-service"></div>
          <div className="absolute left-18 top-6 w-2.5 h-1.5 bg-[#B83A3A] animate-ping" title="inventory-db (ROOT)"></div>
          <div className="absolute inset-0.5 border border-[#3E6585]/40 pointer-events-none"></div>
        </div>
      </div>

      {/* BOTTOM EPISTEMIC GRAMMAR LEGEND */}
      <div className="absolute bottom-2.5 left-4 flex flex-wrap items-center gap-4 sm:gap-6 font-code text-[10px] text-[#7A8A92] select-none pointer-events-none bg-[#0D1113]/80 px-2 py-1 rounded">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-[1.5px] bg-[#3B4D56]"></span>
          <span>Observed Telemetry</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-[1.5px] border-b border-dashed border-[#B83A3A]"></span>
          <span className="text-[#FFA4A4]">Active Incident Propagation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-[1.5px] border-b border-dotted border-[#7565B0]"></span>
          <span className="text-[#B9ADEE]">Predicted Impact</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-[1.5px] border-b border-dashed border-[#286B78]"></span>
          <span className="text-[#55A5B5]">Simulated</span>
        </div>
      </div>
    </div>
  );
};
