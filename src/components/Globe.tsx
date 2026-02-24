import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { clusterMarkers, type MarkerCluster } from '../data/markerPoints';

const PI = Math.PI;

// Auto-tour: min interval between auto-selections (ms)
const AUTO_SELECT_INTERVAL = 5000;
// After user interaction, wait this long before resuming auto-select
const AUTO_SELECT_RESUME_MS = 15000;
// How long each auto-selected tooltip stays visible
const AUTO_SELECT_DURATION = 3500;

// Convert lat/lon to 3D position on unit sphere
function latLonToVec3(lat: number, lon: number, radius = 1): THREE.Vector3 {
  const phi = (90 - lat) * (PI / 180);
  const theta = (lon + 180) * (PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Generate a clean marker texture with subtle outer ring
function createMarkerTexture(size = 64, color = '217, 174, 76'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const headR = size * 0.22;   // pin head radius
  const pinTip = size * 0.88;  // bottom tip Y
  const headCY = size * 0.30;  // pin head center Y

  // Subtle shadow/glow beneath pin
  const gradient = ctx.createRadialGradient(cx, pinTip - 2, 0, cx, pinTip - 2, headR * 0.8);
  gradient.addColorStop(0, `rgba(${color}, 0.35)`);
  gradient.addColorStop(1, `rgba(${color}, 0)`);
  ctx.beginPath();
  ctx.arc(cx, pinTip - 2, headR * 0.8, 0, PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Teardrop body: circle head + triangle taper to point
  ctx.beginPath();
  // Start at bottom tip
  // Left tangent from circle
  const tangentAngle = Math.asin((headR * 0.35) / (pinTip - headCY));
  ctx.moveTo(cx, pinTip);
  // Left side curve up to circle
  ctx.quadraticCurveTo(
    cx - headR * 0.5, headCY + headR * 1.2,
    cx - headR, headCY
  );
  // Arc around the top (circle head)
  ctx.arc(cx, headCY, headR, PI, 0, false);
  // Right side curve back down to tip
  ctx.quadraticCurveTo(
    cx + headR * 0.5, headCY + headR * 1.2,
    cx, pinTip
  );
  ctx.closePath();
  ctx.fillStyle = `rgba(${color}, 1)`;
  ctx.fill();

  // Inner highlight on head for 3D look
  const hlGrad = ctx.createRadialGradient(cx - headR * 0.25, headCY - headR * 0.25, 0, cx, headCY, headR);
  hlGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  hlGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  hlGrad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
  ctx.beginPath();
  ctx.arc(cx, headCY, headR * 0.9, 0, PI * 2);
  ctx.fillStyle = hlGrad;
  ctx.fill();

  // Dark center dot
  ctx.beginPath();
  ctx.arc(cx, headCY, headR * 0.2, 0, PI * 2);
  ctx.fillStyle = 'rgba(80, 50, 10, 0.7)';
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface TooltipData {
  visible: boolean;
  dotX: number;
  dotY: number;
  spriteIdx: number; // index of the selected sprite for live tracking
  dotBehind: boolean; // true when dot is on back side of globe
  names: string[];
  count: number;
}

const MOBILE_BREAKPOINT = 1080;

const Globe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cloudCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState(500);
  const [isMobile, setIsMobile] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipData>({
    visible: false, dotX: 0, dotY: 0, spriteIdx: -1, dotBehind: false, names: [], count: 0,
  });
  const [globeReady, setGlobeReady] = useState(false);

  // Refs for animation state
  const pointerDown = useRef(false);
  const lastPointerX = useRef(0);
  const pointerStartX = useRef(0);
  const pointerStartY = useRef(0);
  const pointerStartTime = useRef(0);
  const velocity = useRef(0);
  const targetPhi = useRef(0);
  const smoothPhi = useRef(0);

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const markersRef = useRef<THREE.Sprite[]>([]);
  const markerGroupRef = useRef<THREE.Group | null>(null);
  const clustersRef = useRef<MarkerCluster[]>([]);
  const cloudDrift = useRef(0);
  const frameId = useRef(0);
  const raycaster = useRef(new THREE.Raycaster());
  const tooltipRef = useRef(tooltip);
  tooltipRef.current = tooltip;
  const isMobileRef = useRef(isMobile);
  isMobileRef.current = isMobile;
  const hoveredIdx = useRef(-1);
  const baseScales = useRef<number[]>([]);

  // Passive auto-select state — selects markers as they cross the front of the globe
  const autoSelectEnabled = useRef(true);  // false after user clicks/drags
  const lastAutoSelectTime = useRef(0);
  const lastAutoSelectIdx = useRef(-1);    // avoid re-selecting the same marker
  const autoSelectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInteractionTime = useRef(0);
  const userHasSelected = useRef(false);   // true once user manually clicks a marker

  // Responsive sizing + mobile detection
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setCanvasSize(Math.min(width, 720));
      }
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle click on marker
  const handleMarkerClick = useCallback((event: PointerEvent) => {
    if (isMobileRef.current) return; // disable dot selection on mobile
    if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    raycaster.current.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.current.intersectObjects(markersRef.current);

    if (intersects.length > 0) {
      const sprite = intersects[0].object as THREE.Sprite;
      const idx = markersRef.current.indexOf(sprite);
      if (idx >= 0 && clustersRef.current[idx]) {
        // Don't allow clicking dots on the back side of the globe
        const worldPos = sprite.getWorldPosition(new THREE.Vector3());
        const camToOrigin = cameraRef.current.position.clone().negate().normalize();
        const markerDir = worldPos.clone().normalize();
        if (camToOrigin.dot(markerDir) > 0.15) return; // behind globe

        const cluster = clustersRef.current[idx];
        const projected = worldPos.clone().project(cameraRef.current);
        const screenX = (projected.x * 0.5 + 0.5) * rect.width;
        const screenY = (-projected.y * 0.5 + 0.5) * rect.height;

        setTooltip({
          visible: true,
          dotX: screenX,
          dotY: screenY,
          spriteIdx: idx,
          dotBehind: false,
          names: cluster.names,
          count: cluster.count,
        });
        return;
      }
    }

    setTooltip(prev => prev.visible ? { ...prev, visible: false, spriteIdx: -1, dotBehind: false } : prev);
  }, []);

  // Main Three.js setup
  useEffect(() => {
    if (!canvasRef.current || !cloudCanvasRef.current) return;

    const width = canvasSize;
    const dpr = Math.min(window.devicePixelRatio, 2);

    // --- Main Scene (earth + markers) ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // --- Cloud Scene (clouds only, rendered to separate canvas) ---
    const cloudScene = new THREE.Scene();

    // --- Camera (shared) ---
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 3.45);
    cameraRef.current = camera;

    // --- Main Renderer ---
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, width);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // --- Cloud Renderer (separate canvas, sits above hand overlay) ---
    const cloudRenderer = new THREE.WebGLRenderer({
      canvas: cloudCanvasRef.current,
      alpha: true,
      antialias: false,
    });
    cloudRenderer.setPixelRatio(dpr);
    cloudRenderer.setSize(width, width);
    cloudRenderer.outputColorSpace = THREE.SRGBColorSpace;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(2, 1, 3);
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xc4dff6, 0.3);
    fillLight.position.set(-2, -0.5, -1);
    scene.add(fillLight);

    // --- Texture Loader ---
    const loader = new THREE.TextureLoader();

    // --- Earth Sphere (antique map shader) ---
    // Uses earth-custom.jpg (antique outline map) as base structure,
    // blends earth-day.jpg detail for variance, tints to match logo_heart.png palette.
    const earthGeom = new THREE.SphereGeometry(1, 64, 64);

    const antiqueVert = `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const antiqueFrag = `
      uniform sampler2D customMap;   // earth-custom.jpg — antique outline map
      uniform sampler2D photoMap;    // earth-day.jpg — photorealistic for detail/variance
      uniform sampler2D waterTex;   // water-texture.jpg — cloud/parchment texture for water variance
      uniform vec3 lightDir;
      varying vec2 vUv;
      varying vec3 vNormal;

      // Hash for paper grain noise
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      // Multi-octave noise for parchment texture
      float parchmentNoise(vec2 uv, float scale) {
        float n = 0.0;
        n += hash(uv * scale) * 0.5;
        n += hash(uv * scale * 2.13 + 31.7) * 0.25;
        n += hash(uv * scale * 4.37 + 73.1) * 0.125;
        n += hash(uv * scale * 8.51 + 117.3) * 0.0625;
        return n / 0.9375;  // normalize to ~0-1
      }

      void main() {
        vec3 custom = texture2D(customMap, vUv).rgb;
        vec3 photo = texture2D(photoMap, vUv).rgb;

        float photoLum = dot(photo, vec3(0.299, 0.587, 0.114));
        float customLum = dot(custom, vec3(0.299, 0.587, 0.114));

        // --- Detect water vs land from the custom map ---
        float customBlue = custom.b - (custom.r + custom.g) * 0.45;
        float isWater = smoothstep(0.02, 0.12, customBlue);

        // Gold outlines: detect as darker yellowish pixels (narrow band = thinner line)
        float isOutline = smoothstep(0.48, 0.42, customLum)
                        * smoothstep(0.0, 0.06, custom.r - custom.b);

        // --- Water: parchment texture tinted to light dusty blue ---
        vec3 waterSample = texture2D(waterTex, vUv).rgb;
        float waterTexLum = dot(waterSample, vec3(0.299, 0.587, 0.114));

        // Light blue-gray palette (much lighter than before)
        vec3 waterLight = vec3(0.65, 0.72, 0.78);   // lighter areas
        vec3 waterMid   = vec3(0.55, 0.63, 0.70);   // mid tones
        vec3 waterDeep  = vec3(0.48, 0.56, 0.64);   // slightly deeper

        // Use parchment texture luminance to drive natural paper-like variance
        vec3 waterColor = mix(waterDeep, waterMid, smoothstep(0.3, 0.5, waterTexLum));
        waterColor = mix(waterColor, waterLight, smoothstep(0.5, 0.75, waterTexLum));

        // Preserve parchment texture grain/fiber detail as subtle color shifts
        vec3 texDetail = (waterSample - vec3(waterTexLum)) * 0.12;
        waterColor += texDetail;

        // A touch of photo detail for ocean depth variance
        vec3 photoDetail = (photo - vec3(photoLum)) * 0.08;
        waterColor += photoDetail;

        // Fine paper grain
        float grain = hash(vUv * 800.0) * 0.02 - 0.01;
        waterColor += vec3(grain * 0.8, grain * 0.9, grain);

        // --- Land: light manila/cream parchment ---
        vec3 landDark  = vec3(0.82, 0.78, 0.68);    // shadowed areas — still light
        vec3 landMid   = vec3(0.89, 0.85, 0.74);    // main manila parchment tone
        vec3 landLight = vec3(0.94, 0.91, 0.82);    // highlights — near white cream

        vec3 landColor = mix(landDark, landMid, smoothstep(0.2, 0.45, photoLum));
        landColor = mix(landColor, landLight, smoothstep(0.5, 0.75, photoLum));

        // Subtle terrain detail from photo (toned down to keep it light)
        landColor += (photo - vec3(photoLum)) * 0.08;

        // Very gentle green tint for vegetated areas
        float greenness = photo.g - max(photo.r, photo.b);
        vec3 oliveLight = vec3(0.78, 0.82, 0.68);
        landColor = mix(landColor, oliveLight, smoothstep(0.02, 0.10, greenness) * 0.2);

        // Warm desert tint (subtle)
        float arid = smoothstep(0.0, 0.06, photo.r - photo.g) * smoothstep(0.3, 0.5, photoLum);
        vec3 desertLight = vec3(0.92, 0.86, 0.72);
        landColor = mix(landColor, desertLight, arid * 0.2);

        // Parchment texture on land too
        float landParch = parchmentNoise(vUv + 10.0, 150.0);
        landColor *= 0.97 + landParch * 0.06;

        // Paper grain
        float grain2 = hash(vUv * 700.0 + 37.0) * 0.015 - 0.0075;
        landColor += vec3(grain2);

        // --- Gold coastline outlines from custom map --- #D9AE4C
        vec3 goldOutline = vec3(0.85, 0.68, 0.30);

        // --- Combine ---
        vec3 color = mix(landColor, waterColor, isWater);
        color = mix(color, goldOutline, isOutline * 0.8);

        // --- Lighting ---
        vec3 n = normalize(vNormal);
        float diff = max(dot(n, normalize(lightDir)), 0.0);
        float light = 0.38 + diff * 0.62;

        // Rim darkening for spherical depth
        float rim = 1.0 - max(dot(n, vec3(0.0, 0.0, 1.0)), 0.0);
        float edgeDarken = smoothstep(0.55, 1.0, rim) * 0.28;

        color *= light;
        color *= (1.0 - edgeDarken);

        // Warm gamma for aged feel
        color = pow(color, vec3(0.93));

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const earthUniforms = {
      customMap: { value: null as THREE.Texture | null },
      photoMap: { value: null as THREE.Texture | null },
      waterTex: { value: null as THREE.Texture | null },
      lightDir: { value: new THREE.Vector3(2, 1, 3).normalize() },
    };

    const earthMat = new THREE.ShaderMaterial({
      vertexShader: antiqueVert,
      fragmentShader: antiqueFrag,
      uniforms: earthUniforms,
    });

    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    scene.add(earthMesh);

    // Load all 3 textures — reveal globe when all are ready
    let texLoaded = 0;
    const checkReady = () => { if (++texLoaded >= 3) setGlobeReady(true); };

    loader.load('/textures/earth-custom.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      earthUniforms.customMap.value = tex;
      earthMat.needsUpdate = true;
      checkReady();
    });
    loader.load('/textures/earth-day.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      earthUniforms.photoMap.value = tex;
      earthMat.needsUpdate = true;
      checkReady();
    });
    loader.load('/textures/water-texture.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      earthUniforms.waterTex.value = tex;
      earthMat.needsUpdate = true;
      checkReady();
    });

    // --- Cloud Sphere (in cloud scene only) ---
    const cloudGeom = new THREE.SphereGeometry(1.02, 48, 48);
    const cloudMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeom, cloudMat);
    cloudScene.add(cloudMesh);

    loader.load('/images/earth-clouds.png', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      cloudMat.map = tex;
      cloudMat.needsUpdate = true;
    });

    // --- Density Markers ---
    const clusters = clusterMarkers(3);
    clustersRef.current = clusters;
    const markerTexture = createMarkerTexture(64, '217, 174, 76');     // gold #D9AE4C
    const hoverTexture = createMarkerTexture(64, '245, 200, 95');     // brighter gold hover
    const sprites: THREE.Sprite[] = [];
    const maxCount = Math.max(...clusters.map(c => c.count));

    const scales: number[] = [];
    for (const cluster of clusters) {
      const mat = new THREE.SpriteMaterial({
        map: markerTexture,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        sizeAttenuation: true,
      });
      const sprite = new THREE.Sprite(mat);

      const pos = latLonToVec3(cluster.lat, cluster.lon, 1.005);
      sprite.position.copy(pos);

      // Density sizing — small to medium dots with glow
      const normalizedCount = Math.log2(cluster.count + 1) / Math.log2(maxCount + 1);
      const scale = 0.022 + normalizedCount * 0.05;
      sprite.scale.set(scale, scale, 1);
      scales.push(scale);

      sprite.userData.clusterIndex = sprites.length;
      scene.add(sprite);
      sprites.push(sprite);
    }
    markersRef.current = sprites;
    baseScales.current = scales;

    // Tilt + marker group
    const thetaTilt = 0.25;
    earthMesh.rotation.x = thetaTilt;
    cloudMesh.rotation.x = thetaTilt;

    const markerGroup = new THREE.Group();
    markerGroup.rotation.x = thetaTilt;
    markerGroupRef.current = markerGroup;
    for (const s of sprites) {
      scene.remove(s);
      markerGroup.add(s);
    }
    scene.add(markerGroup);

    // --- Animation Loop ---
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);

      if (!pointerDown.current) {
        velocity.current *= 0.95;
        targetPhi.current += 0.0006 + velocity.current;
      }
      smoothPhi.current += (targetPhi.current - smoothPhi.current) * 0.15;
      cloudDrift.current += 0.00012; // slow independent drift

      earthMesh.rotation.y = smoothPhi.current;
      markerGroup.rotation.y = smoothPhi.current;
      // Clouds: slow horizontal drift + gentle vertical tilt that changes over time
      cloudMesh.rotation.y = smoothPhi.current * 0.25 + cloudDrift.current;
      cloudMesh.rotation.x = thetaTilt + Math.sin(cloudDrift.current * 0.8) * 0.06; // slow up-down drift
      cloudMesh.rotation.z = Math.sin(cloudDrift.current * 0.4) * 0.03; // subtle axial wobble

      renderer.render(scene, camera);
      cloudRenderer.render(cloudScene, camera);

      // Live-track the selected sprite for tooltip stem
      const tt = tooltipRef.current;
      if (tt.visible && tt.spriteIdx >= 0 && tt.spriteIdx < sprites.length) {
        const sprite = sprites[tt.spriteIdx];
        const worldPos = sprite.getWorldPosition(new THREE.Vector3());
        const projected = worldPos.clone().project(camera);
        const sx = (projected.x * 0.5 + 0.5) * width;
        const sy = (-projected.y * 0.5 + 0.5) * width;

        // Check if dot is on back side of globe
        const camToOrigin = camera.position.clone().negate().normalize();
        const markerDir = worldPos.clone().normalize();
        const facingDot = camToOrigin.dot(markerDir);
        const isBehind = facingDot > 0.15;

        setTooltip(prev => {
          if (!prev.visible || prev.spriteIdx !== tt.spriteIdx) return prev;
          const posChanged = Math.abs(prev.dotX - sx) >= 0.5 || Math.abs(prev.dotY - sy) >= 0.5;
          const behindChanged = prev.dotBehind !== isBehind;
          if (!posChanged && !behindChanged) return prev;
          return { ...prev, dotX: sx, dotY: sy, dotBehind: isBehind };
        });
      }

      // --- Passive auto-select: pick markers crossing the front center ---
      const now = Date.now();
      if (
        autoSelectEnabled.current &&
        !userHasSelected.current &&
        !pointerDown.current &&
        !isMobileRef.current &&
        !tt.visible &&
        now - lastAutoSelectTime.current > AUTO_SELECT_INTERVAL
      ) {
        // camToOrigin points from camera toward globe center: (0,0,-1)
        // For front-facing markers, camToOrigin.dot(markerDir) is negative
        // So we use -dot to get a positive value for front-facing markers
        const camToOrigin = camera.position.clone().negate().normalize();
        let bestIdx = -1;
        let bestScore = -Infinity;

        for (let i = 0; i < sprites.length; i++) {
          if (i === lastAutoSelectIdx.current) continue;
          const wp = sprites[i].getWorldPosition(new THREE.Vector3());
          const dir = wp.clone().normalize();
          const behindCheck = camToOrigin.dot(dir);
          // behindCheck > 0 means behind globe, < 0 means front-facing
          // We want front-facing markers: behindCheck should be well negative
          if (behindCheck > -0.3) continue; // skip anything not clearly front-facing
          const frontScore = -behindCheck; // higher = more directly facing camera
          if (frontScore > bestScore) {
            const cluster = clusters[i];
            if (cluster && cluster.count >= 3) {
              bestScore = frontScore;
              bestIdx = i;
            }
          }
        }

        if (bestIdx >= 0) {
          lastAutoSelectTime.current = now;
          lastAutoSelectIdx.current = bestIdx;
          const sprite = sprites[bestIdx];
          const worldPos = sprite.getWorldPosition(new THREE.Vector3());
          const projected = worldPos.clone().project(camera);
          const sx = (projected.x * 0.5 + 0.5) * width;
          const sy = (-projected.y * 0.5 + 0.5) * width;
          const cluster = clusters[bestIdx];

          setTooltip({
            visible: true,
            dotX: sx,
            dotY: sy,
            spriteIdx: bestIdx,
            dotBehind: false,
            names: cluster.names,
            count: cluster.count,
          });

          // Auto-dismiss after duration
          if (autoSelectTimer.current) clearTimeout(autoSelectTimer.current);
          autoSelectTimer.current = setTimeout(() => {
            setTooltip(prev =>
              prev.spriteIdx === bestIdx
                ? { ...prev, visible: false, spriteIdx: -1, dotBehind: false }
                : prev
            );
          }, AUTO_SELECT_DURATION);
        }
      }
    };
    animate();

    // --- Pointer Interaction (on cloud canvas since it's on top) ---
    const interactCanvas = cloudCanvasRef.current!;

    const onPointerDown = (e: PointerEvent) => {
      pointerDown.current = true;
      lastPointerX.current = e.clientX;
      pointerStartX.current = e.clientX;
      pointerStartY.current = e.clientY;
      pointerStartTime.current = Date.now();
      velocity.current = 0;
      interactCanvas.style.cursor = 'grabbing';
      // Pause auto-select, resume after inactivity
      autoSelectEnabled.current = false;
      lastInteractionTime.current = Date.now();
      if (autoSelectTimer.current) clearTimeout(autoSelectTimer.current);
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerStartX.current;
      const dy = e.clientY - pointerStartY.current;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const elapsed = Date.now() - pointerStartTime.current;

      pointerDown.current = false;
      interactCanvas.style.cursor = 'grab';

      if (dist < 5 && elapsed < 400) {
        handleMarkerClick(e);
        userHasSelected.current = true;  // user manually clicked
      }

      // Resume auto-select after inactivity
      setTimeout(() => {
        if (Date.now() - lastInteractionTime.current >= AUTO_SELECT_RESUME_MS - 100) {
          autoSelectEnabled.current = true;
          userHasSelected.current = false;
        }
      }, AUTO_SELECT_RESUME_MS);
    };

    const onPointerOut = () => {
      pointerDown.current = false;
      interactCanvas.style.cursor = 'grab';
      // Reset hover
      if (hoveredIdx.current >= 0) {
        const oldS = baseScales.current[hoveredIdx.current];
        if (oldS) sprites[hoveredIdx.current]?.scale.set(oldS, oldS, 1);
        (sprites[hoveredIdx.current]?.material as THREE.SpriteMaterial).map = markerTexture;
        hoveredIdx.current = -1;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (pointerDown.current) {
        // Dragging — rotate globe
        const delta = e.clientX - lastPointerX.current;
        lastPointerX.current = e.clientX;
        const dragSpeed = delta / 150;
        targetPhi.current += dragSpeed;
        velocity.current = dragSpeed;
        setTooltip(prev => prev.visible ? { ...prev, visible: false, spriteIdx: -1, dotBehind: false } : prev);
        // Reset hover during drag
        if (hoveredIdx.current >= 0) {
          const oldS = baseScales.current[hoveredIdx.current];
          if (oldS) sprites[hoveredIdx.current]?.scale.set(oldS, oldS, 1);
          (sprites[hoveredIdx.current]?.material as THREE.SpriteMaterial).map = markerTexture;
          hoveredIdx.current = -1;
          interactCanvas.style.cursor = 'grabbing';
        }
      } else {
        // Not dragging — check hover on markers (disabled on mobile)
        if (isMobileRef.current) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect || !cameraRef.current) return;
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        raycaster.current.setFromCamera(mouse, cameraRef.current);
        const intersects = raycaster.current.intersectObjects(sprites);

        let hitIdx = intersects.length > 0
          ? sprites.indexOf(intersects[0].object as THREE.Sprite)
          : -1;

        // Don't hover dots on back side of globe
        if (hitIdx >= 0) {
          const wp = sprites[hitIdx].getWorldPosition(new THREE.Vector3());
          const camToOrigin = camera.position.clone().negate().normalize();
          if (camToOrigin.dot(wp.clone().normalize()) > 0.15) hitIdx = -1;
        }

        if (hitIdx !== hoveredIdx.current) {
          // Unhover previous
          if (hoveredIdx.current >= 0) {
            const oldS = baseScales.current[hoveredIdx.current];
            if (oldS) sprites[hoveredIdx.current]?.scale.set(oldS, oldS, 1);
            (sprites[hoveredIdx.current]?.material as THREE.SpriteMaterial).map = markerTexture;
          }
          // Hover new — enlarge + swap to coral texture
          if (hitIdx >= 0) {
            const s = baseScales.current[hitIdx];
            if (s) sprites[hitIdx].scale.set(s * 1.6, s * 1.6, 1);
            (sprites[hitIdx].material as THREE.SpriteMaterial).map = hoverTexture;
            interactCanvas.style.cursor = 'pointer';
          } else {
            interactCanvas.style.cursor = 'grab';
          }
          hoveredIdx.current = hitIdx;
        }
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      pointerDown.current = true;
      lastPointerX.current = e.touches[0].clientX;
      pointerStartX.current = e.touches[0].clientX;
      pointerStartY.current = e.touches[0].clientY;
      pointerStartTime.current = Date.now();
      velocity.current = 0;
      autoSelectEnabled.current = false;
      lastInteractionTime.current = Date.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pointerDown.current || !e.touches[0]) return;
      const delta = e.touches[0].clientX - lastPointerX.current;
      lastPointerX.current = e.touches[0].clientX;
      const dragSpeed = delta / 150;
      targetPhi.current += dragSpeed;
      velocity.current = dragSpeed;
    };

    const onTouchEnd = () => {
      pointerDown.current = false;
      setTimeout(() => {
        if (Date.now() - lastInteractionTime.current >= AUTO_SELECT_RESUME_MS - 100) {
          autoSelectEnabled.current = true;
          userHasSelected.current = false;
        }
      }, AUTO_SELECT_RESUME_MS);
    };

    interactCanvas.addEventListener('pointerdown', onPointerDown);
    interactCanvas.addEventListener('pointerup', onPointerUp);
    interactCanvas.addEventListener('pointerout', onPointerOut);
    interactCanvas.addEventListener('pointermove', onPointerMove);
    interactCanvas.addEventListener('touchstart', onTouchStart, { passive: true });
    interactCanvas.addEventListener('touchmove', onTouchMove, { passive: true });
    interactCanvas.addEventListener('touchend', onTouchEnd);

    return () => {
      cancelAnimationFrame(frameId.current);
      interactCanvas.removeEventListener('pointerdown', onPointerDown);
      interactCanvas.removeEventListener('pointerup', onPointerUp);
      interactCanvas.removeEventListener('pointerout', onPointerOut);
      interactCanvas.removeEventListener('pointermove', onPointerMove);
      interactCanvas.removeEventListener('touchstart', onTouchStart);
      interactCanvas.removeEventListener('touchmove', onTouchMove);
      interactCanvas.removeEventListener('touchend', onTouchEnd);

      renderer.dispose();
      cloudRenderer.dispose();
      earthGeom.dispose();
      earthMat.dispose();
      cloudGeom.dispose();
      cloudMat.dispose();
      markerTexture.dispose();
      hoverTexture.dispose();
      for (const s of sprites) {
        (s.material as THREE.SpriteMaterial).dispose();
      }
    };
  }, [canvasSize, handleMarkerClick]);

  const tooltipName = tooltip.names.length > 0
    ? tooltip.names[0]
    : 'This region';
  const tooltipExtra = tooltip.names.length > 1
    ? ` +${tooltip.names.length - 1} more`
    : '';

  // Fixed tooltip anchor position (top-right area of the globe canvas)
  const tooltipAnchorX = canvasSize * 0.82;
  const tooltipAnchorY = canvasSize * 0.08;

  return (
    <div className="globe-container notranslate" translate="no" ref={containerRef}>
      <div
        className={`globe-canvas-wrap${globeReady ? ' globe-ready' : ''}`}
        style={{
          width: canvasSize,
          height: canvasSize,
          maxWidth: '100%',
          position: 'relative',
        }}
      >
        <div className="globe-glow" />
        {/* Main canvas: earth + markers */}
        <canvas
          ref={canvasRef}
          className="globe-canvas"
          style={{
            width: canvasSize,
            height: canvasSize,
          }}
        />
        {/* Cloud canvas: layered above hand (z-index 2) via CSS */}
        <canvas
          ref={cloudCanvasRef}
          className="globe-cloud-layer"
          style={{
            width: canvasSize,
            height: canvasSize,
            cursor: 'grab',
          }}
        />
        {/* SVG stem line connecting tooltip to dot — z-index drops behind globe when dot is on back */}
        {!isMobile && tooltip.visible && (
          <svg
            className="globe-tooltip-stem"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: canvasSize,
              height: canvasSize,
              pointerEvents: 'none',
              zIndex: tooltip.dotBehind ? -1 : 3,
            }}
          >
            <line
              x1={tooltipAnchorX}
              y1={tooltipAnchorY + 30}
              x2={tooltip.dotX}
              y2={tooltip.dotY}
              stroke="rgba(217, 174, 76, 0.7)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <circle
              cx={tooltip.dotX}
              cy={tooltip.dotY}
              r={tooltip.dotBehind ? 2.5 : 3.5}
              fill={tooltip.dotBehind ? 'none' : 'rgba(217, 174, 76, 0.9)'}
              stroke={tooltip.dotBehind ? 'rgba(217, 174, 76, 0.5)' : 'white'}
              strokeWidth={tooltip.dotBehind ? 1 : 1.5}
            />
          </svg>
        )}
        <div
          className={`globe-tooltip ${!isMobile && tooltip.visible ? 'visible' : ''}`}
          style={{ left: tooltipAnchorX, top: tooltipAnchorY }}
        >
          <div className="globe-tooltip-name">
            {tooltipName}{tooltipExtra}
          </div>
          <div className="globe-tooltip-count">
            {tooltip.count} participant{tooltip.count !== 1 ? 's' : ''} in this area
          </div>
        </div>
      </div>
    </div>
  );
};

export default Globe;
