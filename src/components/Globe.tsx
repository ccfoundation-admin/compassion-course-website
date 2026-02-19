import { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';
import { MARKER_POINTS } from '../data/markerPoints';

const PI = Math.PI;
const TWO_PI = PI * 2;
const GLOBE_RADIUS = 0.8; // cobe's hardcoded sphere radius in normalized space

// Matches cobe's exact lat/lon → 3D → rotate → 2D projection
// Optional radiusMultiplier places points above the globe surface (1.0 = on surface)
function projectPoint(
  lat: number,
  lon: number,
  phi: number,
  theta: number,
  size: number,
  scale: number,
  radiusMultiplier = 1.0
): [number, number, boolean] {
  const latRad = lat * PI / 180;
  const lonRad = lon * PI / 180 - PI;
  const cosLat = Math.cos(latRad);
  const px3d = -cosLat * Math.cos(lonRad) * radiusMultiplier;
  const py3d = Math.sin(latRad) * radiusMultiplier;
  const pz3d = cosLat * Math.sin(lonRad) * radiusMultiplier;

  const cx = Math.cos(theta);
  const cy = Math.cos(phi);
  const sx = Math.sin(theta);
  const sy = Math.sin(phi);

  const rx = px3d * cy        + py3d * 0   + pz3d * sy;
  const ry = px3d * (sy * sx) + py3d * cx  + pz3d * (-cy * sx);
  const rz = px3d * (-sy * cx) + py3d * sx + pz3d * (cy * cx);

  const visible = rz > 0.05;

  const halfSize = size / 2;
  const pixelScale = halfSize * GLOBE_RADIUS * scale;
  const screenX = halfSize + rx * pixelScale;
  const screenY = halfSize - ry * pixelScale;

  return [screenX, screenY, visible];
}

const Globe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const cloudRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cloudDataRef = useRef<ImageData | null>(null);
  const [canvasSize, setCanvasSize] = useState(500);

  // Smooth drag state
  const pointerDown = useRef(false);
  const lastPointerX = useRef(0);
  const velocity = useRef(0);
  const targetPhi = useRef(0);
  const smoothPhi = useRef(0);

  // Separate cloud rotation — drifts slower than globe
  const cloudPhi = useRef(0);

  // Load cloud texture
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/images/earth-clouds.png';
    img.onload = () => {
      // Extract pixel data
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.drawImage(img, 0, 0);
      cloudDataRef.current = tempCtx.getImageData(0, 0, img.width, img.height);
    };
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setCanvasSize(Math.min(width, 600));
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !overlayRef.current || !cloudRef.current) return;

    const width = canvasSize;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const theta = 0.25;
    const globeScale = 1.05;

    // Setup overlay canvas (markers)
    const overlay = overlayRef.current;
    const ctx = overlay.getContext('2d')!;
    overlay.width = width * dpr;
    overlay.height = width * dpr;

    // Setup cloud canvas (separate layer)
    const cloudCanvas = cloudRef.current;
    const cloudCtx = cloudCanvas.getContext('2d')!;
    cloudCanvas.width = width * dpr;
    cloudCanvas.height = width * dpr;

    const CLOUD_RADIUS_MULT = 1.06; // clouds float 6% above surface
    const CLOUD_OPACITY = 0.4; // overall cloud opacity
    const CLOUD_SPEED_RATIO = 0.3; // clouds rotate at 30% of globe speed

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: dpr,
      width: width * dpr,
      height: width * dpr,
      phi: 0,
      theta: theta,
      dark: 0,
      diffuse: 1.4,
      mapSamples: 50000,
      mapBrightness: 4,
      baseColor: [0.96, 0.95, 0.93],
      markerColor: [0.059, 0.216, 0.376],
      glowColor: [0.9, 0.95, 0.92],
      markers: [],
      scale: globeScale,
      offset: [0, 0],
      onRender: (state) => {
        // Smooth rotation with momentum
        if (!pointerDown.current) {
          velocity.current *= 0.95;
          targetPhi.current += 0.0012 + velocity.current;
        }

        smoothPhi.current += (targetPhi.current - smoothPhi.current) * 0.15;

        // Clouds drift at a different (slower) rate
        cloudPhi.current += 0.0004; // slow independent drift

        state.phi = smoothPhi.current;
        state.width = width * dpr;
        state.height = width * dpr;

        // Clear both overlays
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        cloudCtx.clearRect(0, 0, cloudCanvas.width, cloudCanvas.height);

        const canvasPixels = width * dpr;
        const cloudData = cloudDataRef.current;

        // Draw cloud texture on a sphere slightly above the globe
        if (cloudData) {
          const halfSize = canvasPixels / 2;
          const cloudPixelScale = halfSize * GLOBE_RADIUS * globeScale * CLOUD_RADIUS_MULT;
          const imgW = cloudData.width;
          const imgH = cloudData.height;
          const pixels = cloudData.data;

          // Scan within the cloud sphere bounding box
          const minX = Math.max(0, Math.floor(halfSize - cloudPixelScale));
          const maxX = Math.min(canvasPixels, Math.ceil(halfSize + cloudPixelScale));
          const minY = Math.max(0, Math.floor(halfSize - cloudPixelScale));
          const maxY = Math.min(canvasPixels, Math.ceil(halfSize + cloudPixelScale));

          const regionW = maxX - minX;
          const regionH = maxY - minY;

          if (regionW > 0 && regionH > 0) {
            // Use ImageData buffer — pixel-perfect, single putImageData call
            const imgData = cloudCtx.createImageData(regionW, regionH);
            const buf = imgData.data;

            // Cloud rotation = globe rotation * speed ratio + independent drift
            const curCloudPhi = smoothPhi.current * CLOUD_SPEED_RATIO + cloudPhi.current;
            const cTheta = Math.cos(theta);
            const sTheta = Math.sin(theta);
            const cPhi = Math.cos(curCloudPhi);
            const sPhi = Math.sin(curCloudPhi);
            const invPixelScale = 1 / cloudPixelScale;

            for (let sy = minY; sy < maxY; sy++) {
              const ry = -(sy - halfSize) * invPixelScale;
              const ry2 = ry * ry;

              for (let sx = minX; sx < maxX; sx++) {
                const rx = (sx - halfSize) * invPixelScale;

                // Check if inside sphere
                const r2 = rx * rx + ry2;
                if (r2 > 1.0) continue;

                const rz = Math.sqrt(1.0 - r2);

                // Inverse rotation (inlined for performance)
                const px3d = rx * cPhi + ry * (sPhi * sTheta) + rz * (-sPhi * cTheta);
                const py3d = ry * cTheta + rz * sTheta;
                const pz3d = rx * sPhi + ry * (-cPhi * sTheta) + rz * (cPhi * cTheta);

                // 3D → lat/lon
                const lat = Math.asin(py3d > 1 ? 1 : py3d < -1 ? -1 : py3d);
                const lonRad = Math.atan2(pz3d, -px3d);

                // Map to texture UV
                let u = (lonRad + PI) / TWO_PI; // 0–1
                const v = 0.5 - lat / PI; // 0–1 (north pole = 0)
                if (u < 0) u += 1;
                else if (u >= 1) u -= 1;

                const texX = (u * imgW) | 0;
                const texY = (v * imgH) | 0;
                const idx = (texY * imgW + texX) * 4;

                // Use ALPHA channel for this RGBA cloud texture
                const alpha = pixels[idx + 3];
                if (alpha < 10) continue;

                const bi = ((sy - minY) * regionW + (sx - minX)) * 4;
                buf[bi] = 255;     // R
                buf[bi + 1] = 255; // G
                buf[bi + 2] = 255; // B
                buf[bi + 3] = (alpha * CLOUD_OPACITY) | 0; // A
              }
            }

            cloudCtx.putImageData(imgData, minX, minY);
          }
        }

        // Draw location dots on marker overlay
        for (let i = 0; i < MARKER_POINTS.length; i++) {
          const [lat, lon] = MARKER_POINTS[i];
          const [px, py, visible] = projectPoint(lat, lon, smoothPhi.current, theta, canvasPixels, globeScale);

          if (!visible) continue;

          ctx.beginPath();
          ctx.arc(px, py, 2 * dpr, 0, PI * 2);
          ctx.fillStyle = 'rgba(239, 142, 47, 0.9)';
          ctx.fill();
        }
      },
    });

    const onPointerDown = (e: PointerEvent) => {
      pointerDown.current = true;
      lastPointerX.current = e.clientX;
      velocity.current = 0;
      if (cloudRef.current) cloudRef.current.style.cursor = 'grabbing';
    };

    const onPointerUp = () => {
      pointerDown.current = false;
      if (cloudRef.current) cloudRef.current.style.cursor = 'grab';
    };

    const onPointerOut = () => {
      pointerDown.current = false;
      if (cloudRef.current) cloudRef.current.style.cursor = 'grab';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerDown.current) return;
      const delta = e.clientX - lastPointerX.current;
      lastPointerX.current = e.clientX;
      const dragSpeed = delta / 150;
      targetPhi.current += dragSpeed;
      velocity.current = dragSpeed;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pointerDown.current || !e.touches[0]) return;
      const delta = e.touches[0].clientX - lastPointerX.current;
      lastPointerX.current = e.touches[0].clientX;
      const dragSpeed = delta / 150;
      targetPhi.current += dragSpeed;
      velocity.current = dragSpeed;
    };

    // Attach events to cloud canvas (top-most interactive layer)
    const topCanvas = cloudRef.current;
    topCanvas.addEventListener('pointerdown', onPointerDown);
    topCanvas.addEventListener('pointerup', onPointerUp);
    topCanvas.addEventListener('pointerout', onPointerOut);
    topCanvas.addEventListener('pointermove', onPointerMove);
    topCanvas.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      globe.destroy();
      topCanvas.removeEventListener('pointerdown', onPointerDown);
      topCanvas.removeEventListener('pointerup', onPointerUp);
      topCanvas.removeEventListener('pointerout', onPointerOut);
      topCanvas.removeEventListener('pointermove', onPointerMove);
      topCanvas.removeEventListener('touchmove', onTouchMove);
    };
  }, [canvasSize]);

  return (
    <div className="globe-container" ref={containerRef}>
      <div className="globe-glow" />
      <div
        className="globe-canvas-wrap"
        style={{
          width: canvasSize,
          height: canvasSize,
          maxWidth: '100%',
          position: 'relative',
        }}
      >
        {/* Layer 1: cobe WebGL globe */}
        <canvas
          ref={canvasRef}
          className="globe-canvas"
          style={{
            width: canvasSize,
            height: canvasSize,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
        {/* Layer 2: marker dots overlay */}
        <canvas
          ref={overlayRef}
          className="globe-canvas"
          style={{
            width: canvasSize,
            height: canvasSize,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
        {/* Layer 3: cloud overlay — z-index set via CSS to go above hand image */}
        <canvas
          ref={cloudRef}
          className="globe-canvas globe-cloud-layer"
          style={{
            width: canvasSize,
            height: canvasSize,
            position: 'absolute',
            top: 0,
            left: 0,
            cursor: 'grab',
          }}
        />
      </div>
    </div>
  );
};

export default Globe;
