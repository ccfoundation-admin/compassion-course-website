import { useEffect, useRef } from 'react';

/**
 * Animated flowing gradient canvas — "mixing paint" effect.
 *
 * Renders a full-size canvas behind content using multiple drifting
 * colour blobs whose positions oscillate with sine-based noise.
 * Pure JS, no dependencies.
 */

interface Blob {
  x: number;
  y: number;
  radius: number;
  color: [number, number, number];
  /** Oscillation speeds / offsets */
  vx1: number;
  vy1: number;
  vx2: number;
  vy2: number;
  ox: number;
  oy: number;
}

const BLOB_CONFIG: Array<{ color: [number, number, number]; radius: number }> = [
  { color: [13, 148, 136], radius: 0.55 },   // teal — large, soft
  { color: [244, 63, 94], radius: 0.45 },     // coral / accent
  { color: [99, 102, 241], radius: 0.42 },    // indigo
  { color: [14, 165, 133], radius: 0.38 },    // emerald
  { color: [168, 85, 247], radius: 0.35 },    // purple
];

function createBlobs(): Blob[] {
  return BLOB_CONFIG.map((cfg, i) => ({
    x: 0.5,
    y: 0.5,
    radius: cfg.radius,
    color: cfg.color,
    // Very slow oscillation — dreamy, paint-like drift
    vx1: 0.00008 + i * 0.00003,
    vy1: 0.0001 + i * 0.000025,
    vx2: 0.00004 + i * 0.00002,
    vy2: 0.00006 + i * 0.000022,
    ox: i * 1.7,
    oy: i * 2.3,
  }));
}

const FluidGradient: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<Blob[]>(createBlobs());
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr * 0.5;   // render at half-res for perf
      canvas.height = h * dpr * 0.5;
      ctx.scale(dpr * 0.5, dpr * 0.5);
    };

    resize();
    window.addEventListener('resize', resize);

    const blobs = blobsRef.current;

    const draw = (t: number) => {
      // Dark base
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Update blob positions — gentle, slow drift
      for (const b of blobs) {
        b.x = 0.5 + 0.25 * Math.sin(t * b.vx1 + b.ox) * Math.cos(t * b.vx2 + b.ox * 0.7);
        b.y = 0.5 + 0.25 * Math.cos(t * b.vy1 + b.oy) * Math.sin(t * b.vy2 + b.oy * 0.6);
      }

      // Draw blobs as large, soft radial gradients
      ctx.globalCompositeOperation = 'lighter';

      for (const b of blobs) {
        const cx = b.x * w;
        const cy = b.y * h;
        const r = b.radius * Math.max(w, h);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        const [cr, cg, cb] = b.color;
        grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0.22)`);
        grad.addColorStop(0.35, `rgba(${cr}, ${cg}, ${cb}, 0.1)`);
        grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.globalCompositeOperation = 'source-over';

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="donate-gradient-canvas"
      aria-hidden="true"
    />
  );
};

export default FluidGradient;
