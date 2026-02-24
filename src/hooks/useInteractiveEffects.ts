import { useEffect, useRef, useState, useCallback } from 'react';

// ─── BORDER BEAM ──────────────────────────────────────────────────────────────
// Adds animated conic-gradient border light on hover to cards.
// Returns a ref to attach to the parent grid/container.
// Cards inside must have the class `beam-card`.
// No JS needed — pure CSS (see App.css .beam-card rules).

// ─── 3D TILT / PERSPECTIVE TRACKING ──────────────────────────────────────────
// Returns handlers to add 3D perspective rotation to a card element.
export function useTiltCard(intensity = 15) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (y - 0.5) * -intensity;
      const rotateY = (x - 0.5) * intensity;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    },
    [intensity]
  );

  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
  }, []);

  return { cardRef, handleMouseMove, handleMouseLeave };
}

// ─── TYPING EFFECT HOOK ──────────────────────────────────────────────────────
// Cycles through phrases with typewriter animation.
// When Google Translate is active (non-English), disables animation to avoid flicker.
export function useTypingEffect(
  phrases: string[],
  typeSpeed = 55,
  deleteSpeed = 30,
  pauseMs = 2000
) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);

  // Watch for Google Translate activation (gt-translated class on <html>)
  useEffect(() => {
    const check = () => {
      setIsTranslated(document.documentElement.classList.contains('gt-translated'));
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // When translated, skip all animation
    if (isTranslated) return;

    const phrase = phrases[phraseIdx];
    const speed = deleting ? deleteSpeed : typeSpeed;

    if (!deleting && charIdx === phrase.length) {
      const timer = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(timer);
    }
    if (deleting && charIdx === 0) {
      setDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % phrases.length);
      return;
    }

    const timer = setTimeout(() => {
      setCharIdx((prev) => prev + (deleting ? -1 : 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [charIdx, deleting, phraseIdx, phrases, typeSpeed, deleteSpeed, pauseMs, isTranslated]);

  // When translated, show the first phrase fully (no typing animation)
  if (isTranslated) {
    return {
      displayText: phrases[0],
      isDeleting: false,
      isTranslated: true,
    };
  }

  return {
    displayText: phrases[phraseIdx].substring(0, charIdx),
    isDeleting: deleting,
    isTranslated: false,
  };
}

// ─── FLIP CARD STATE ─────────────────────────────────────────────────────────
export function useFlipCard() {
  const [flipped, setFlipped] = useState(false);
  const toggle = useCallback(() => setFlipped((f) => !f), []);
  return { flipped, toggle };
}

// ─── COUNT-UP STATS ──────────────────────────────────────────────────────────
// Parses stat strings like '50,000+', '120+', '14', '20' and animates them.
// Uses a single IntersectionObserver on the container ref so ALL stats animate together.
interface ParsedStat {
  numericValue: number;
  prefix: string;   // e.g. ''
  suffix: string;   // e.g. '+' or ''
  hasCommas: boolean;
}

function parseStat(raw: string): ParsedStat {
  const suffix = raw.endsWith('+') ? '+' : '';
  const cleaned = raw.replace(/[+,]/g, '');
  const numericValue = parseInt(cleaned, 10) || 0;
  const hasCommas = raw.includes(',');
  return { numericValue, prefix: '', suffix, hasCommas };
}

function formatStat(value: number, parsed: ParsedStat): string {
  const numStr = parsed.hasCommas ? value.toLocaleString() : String(value);
  return `${parsed.prefix}${numStr}${parsed.suffix}`;
}

export function useCountUpStats(
  rawValues: string[],
  duration = 2000
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayValues, setDisplayValues] = useState<string[]>(rawValues);
  const started = useRef(false);

  // Pre-compute final formatted values so we can reserve space for the widest string
  const parsed = rawValues.map(parseStat);
  const finalValues = parsed.map((p) => formatStat(p.numericValue, p));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const localParsed = rawValues.map(parseStat);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();

          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);

            setDisplayValues(
              localParsed.map((p) => formatStat(Math.round(eased * p.numericValue), p))
            );

            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rawValues, duration]);

  return { containerRef, displayValues, finalValues };
}
