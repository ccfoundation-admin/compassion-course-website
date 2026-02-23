import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Observes all <video> elements on the page using IntersectionObserver.
 * - When a video scrolls into view (≥40% visible), it starts playing (muted).
 * - When it scrolls out of view (<40% visible), it pauses.
 * - Tracks whether the user has manually paused; if so, won't auto-resume.
 * - Videos that already have `autoplay` + `loop` (e.g., hero bg videos) are
 *   left alone since the browser handles them natively.
 * - Uses MutationObserver to pick up dynamically-added videos (SPA navigation).
 *
 * Call once in Layout so it covers all pages.
 */
export function useVideoAutoplay() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Set of videos the user has manually paused — we respect their choice
    const userPaused = new WeakSet<HTMLVideoElement>();
    // Track which videos we've already wired up
    const observed = new WeakSet<HTMLVideoElement>();

    /**
     * Distinguish user pauses from our programmatic pauses via a data attribute.
     */
    function handlePause(e: Event) {
      const video = e.target as HTMLVideoElement;
      if (video.dataset.autoplayPausing === 'true') return;
      userPaused.add(video);
    }

    function handlePlay(e: Event) {
      const video = e.target as HTMLVideoElement;
      if (video.dataset.autoplayStarting !== 'true') {
        userPaused.delete(video);
      }
    }

    function isNativeAutoplay(video: HTMLVideoElement) {
      return video.loop && video.autoplay;
    }

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (isNativeAutoplay(video)) return;

          if (entry.isIntersecting) {
            if (userPaused.has(video)) return;

            video.muted = true;
            video.dataset.autoplayStarting = 'true';
            video.play()
              .catch(() => {
                // Autoplay blocked — user can click play
              })
              .finally(() => {
                delete video.dataset.autoplayStarting;
              });
          } else {
            if (!video.paused) {
              video.dataset.autoplayPausing = 'true';
              video.pause();
              requestAnimationFrame(() => {
                delete video.dataset.autoplayPausing;
              });
            }
          }
        });
      },
      { threshold: 0.4 }
    );

    /** Wire up a single video element */
    function setupVideo(video: HTMLVideoElement) {
      if (observed.has(video) || isNativeAutoplay(video)) return;
      observed.add(video);
      video.addEventListener('pause', handlePause);
      video.addEventListener('play', handlePlay);
      intersectionObserver.observe(video);
    }

    /** Scan the DOM for any video elements and wire them up */
    function scanForVideos() {
      document.querySelectorAll('video').forEach((v) => setupVideo(v as HTMLVideoElement));
    }

    // Initial scan (small delay for React render)
    const timer = setTimeout(scanForVideos, 150);

    // Watch for dynamically added videos (SPA page transitions)
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLVideoElement) {
            setupVideo(node);
          }
          if (node instanceof HTMLElement) {
            node.querySelectorAll('video').forEach((v) => setupVideo(v as HTMLVideoElement));
          }
        }
      }
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
      document.querySelectorAll('video').forEach((video) => {
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('play', handlePlay);
      });
    };
  }, [pathname]); // Re-run when route changes
}
