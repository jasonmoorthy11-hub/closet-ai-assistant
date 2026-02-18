import { useState, useEffect, useRef } from "react";

interface StreamingImageProps {
  src: string;
  isPartial: boolean;
  partialIndex: number;
  onLoad?: () => void;
  isUser: boolean;
}

/**
 * Progressive image reveal with placeholder support.
 *
 * Flow: placeholder (warm gradient) → partial 0 → partial 1 → partial 2 → final
 *
 * Animation uses a single rAF loop with two modes:
 *   - Fast exponential lerp (~700ms) when a new partial arrives
 *   - Gentle micro-drift (~0.12px/sec) between partials for subtle motion
 * Dual-layer <img> crossfade masks each src swap under the blur.
 */

// Stepped targets — each partial triggers a noticeable step improvement
const PHASE_TARGETS = [
  { blur: 12, brightness: 0.84, saturate: 0.84 },  // partial 0
  { blur: 5,  brightness: 0.92, saturate: 0.92 },   // partial 1
  { blur: 1.5, brightness: 0.97, saturate: 0.97 },  // partial 2
];
// User-photo placeholder gets lighter blur (photo is recognizable), gradient gets heavy blur
const PHOTO_PLACEHOLDER_TARGET = { blur: 3, brightness: 0.92, saturate: 0.85 };
const GRADIENT_PLACEHOLDER_TARGET = { blur: 14, brightness: 0.82, saturate: 0.82 };
const FINAL   = { blur: 0, brightness: 1, saturate: 1 };
const INITIAL = { blur: 16, brightness: 0.78, saturate: 0.76 };

export function StreamingImage({ src, isPartial, partialIndex, onLoad, isUser }: StreamingImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const imgARef = useRef<HTMLImageElement>(null);
  const imgBRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);

  const isStreamingRef = useRef(false);
  const activeLayerRef = useRef<"A" | "B">("A");
  const currentSrcRef = useRef(src);
  const animFrameRef = useRef<number>();
  const runningRef = useRef(false);
  const partialIndexRef = useRef(partialIndex);

  const currentRef = useRef({ ...INITIAL });
  const targetRef = useRef({ ...INITIAL });
  const stepTimeRef = useRef(0);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const finalLoadedRef = useRef(false);
  const [sweepPhase, setSweepPhase] = useState<"none" | "ready" | "sweeping" | "done">("none");
  const prevPartialIndexRef = useRef(partialIndex);

  if (isPartial) isStreamingRef.current = true;
  partialIndexRef.current = partialIndex;

  // --- Crossfade between src changes, coordinated with blur update ---
  // Blur is held steady during the crossfade; sharpening starts only after
  // the new content is fully faded in so the swap is invisible.
  const crossfadeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isStreamingRef.current) return;
    if (src === currentSrcRef.current) return;

    const isA = activeLayerRef.current === "A";
    const incoming = isA ? imgBRef.current : imgARef.current;
    const outgoing = isA ? imgARef.current : imgBRef.current;
    if (!incoming || !outgoing) return;

    const CROSSFADE_MS = 1200;

    const preload = new Image();
    preload.onload = () => {
      incoming.src = src;
      requestAnimationFrame(() => {
        incoming.style.transition = `opacity ${CROSSFADE_MS}ms ease-in-out`;
        incoming.style.opacity = "1";

        if (crossfadeTimerRef.current) clearTimeout(crossfadeTimerRef.current);
        crossfadeTimerRef.current = setTimeout(() => {
          outgoing.style.transition = "none";
          outgoing.style.opacity = "0";
          activeLayerRef.current = isA ? "B" : "A";
          currentSrcRef.current = src;

          // Crossfade done — NOW update blur target for the new content
          if (runningRef.current) {
            if (partialIndexRef.current === -2) {
              // Cleanup preview: snap to clear
              currentRef.current = { ...FINAL };
              targetRef.current = { ...FINAL };
              stepTimeRef.current = performance.now();
            } else if (partialIndexRef.current >= 0) {
              const idx = partialIndexRef.current;
              const t = PHASE_TARGETS[idx] || PHASE_TARGETS[PHASE_TARGETS.length - 1];
              const c = currentRef.current;
              targetRef.current = {
                blur: Math.min(t.blur, c.blur),
                brightness: Math.max(t.brightness, c.brightness),
                saturate: Math.max(t.saturate, c.saturate),
              };
              stepTimeRef.current = performance.now();
            }
          }
        }, CROSSFADE_MS + 50);
      });
    };
    preload.src = src;
  }, [src]);

  // --- Main animation loop (starts once on first ready, runs until final settles) ---
  useEffect(() => {
    if (!ready || !isStreamingRef.current || runningRef.current) return;
    runningRef.current = true;

    const idx = partialIndexRef.current;
    const isCleanupPreview = idx === -2;

    let startFilter: typeof INITIAL;
    let initialTarget: typeof INITIAL;

    if (isCleanupPreview) {
      // Cleanup preview: start crystal clear
      startFilter = { ...FINAL };
      initialTarget = { ...FINAL };
    } else {
      // Normal placeholder: start blurred
      const isGradient = currentSrcRef.current.startsWith("data:image/svg");
      const placeholderTarget = isGradient ? GRADIENT_PLACEHOLDER_TARGET : PHOTO_PLACEHOLDER_TARGET;
      initialTarget = idx < 0 ? placeholderTarget : (PHASE_TARGETS[idx] || PHASE_TARGETS[0]);
      startFilter = isGradient ? { ...INITIAL } : { blur: 6, brightness: 0.88, saturate: 0.8 };
    }

    currentRef.current = { ...startFilter };
    targetRef.current = { ...initialTarget };
    stepTimeRef.current = performance.now();

    if (containerRef.current) {
      containerRef.current.style.filter =
        `blur(${startFilter.blur}px) brightness(${startFilter.brightness}) saturate(${startFilter.saturate})`;
    }

    const animate = () => {
      if (!runningRef.current || !containerRef.current) return;
      const c = currentRef.current;
      const t = targetRef.current;
      const elapsed = (performance.now() - stepTimeRef.current) / 1000;

      if (elapsed < 0.8) {
        // Fast exponential lerp toward step target
        const f = 0.09;
        c.blur += (t.blur - c.blur) * f;
        c.brightness += (t.brightness - c.brightness) * f;
        c.saturate += (t.saturate - c.saturate) * f;
      } else {
        // Gentle drift — slow continuous improvement (~0.12px/sec blur)
        // Clamped: never drifts past the current target
        if (c.blur > t.blur) c.blur = Math.max(c.blur - 0.002, t.blur);
        if (c.brightness < t.brightness) c.brightness = Math.min(c.brightness + 0.00005, t.brightness);
        if (c.saturate < t.saturate) c.saturate = Math.min(c.saturate + 0.00005, t.saturate);
      }

      containerRef.current.style.filter =
        `blur(${c.blur.toFixed(1)}px) brightness(${c.brightness.toFixed(3)}) saturate(${c.saturate.toFixed(3)})`;

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      runningRef.current = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // --- Final image: frosted glass curtain reveal ---
  // Phase 1: hold blur steady during crossfade (content swap invisible)
  // Phase 2: mount frosted overlay, remove container blur, sweep overlay top→bottom
  useEffect(() => {
    if (!isPartial && runningRef.current) {
      // Phase 1: hold current blur during crossfade
      const holdBlur = Math.max(currentRef.current.blur, 1.5);
      targetRef.current = { blur: holdBlur, brightness: 1, saturate: 1 };
      stepTimeRef.current = performance.now();

      // Phase 2: after crossfade, switch to frosted sweep
      const phase2Timer = setTimeout(() => {
        // Stop rAF loop — sweep overlay takes over
        runningRef.current = false;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        // Mount frosted overlay (matches current blur visually)
        setSweepPhase("ready");

        // Next frame: remove container filter (overlay covers it), then start sweep
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.style.filter = "none";
          }
          // Double rAF ensures overlay is painted before sweep starts
          requestAnimationFrame(() => {
            setSweepPhase("sweeping");
            // Clean up after sweep animation completes
            stopTimerRef.current = setTimeout(() => {
              setSweepPhase("done");
            }, 3200);
          });
        });
      }, 1300);
      return () => {
        clearTimeout(phase2Timer);
        if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      };
    }
  }, [isPartial]);

  // --- Cleanup preview transitions: -1→-2 (snap to clear) and -2→-1 (blur up) ---
  useEffect(() => {
    const prev = prevPartialIndexRef.current;
    prevPartialIndexRef.current = partialIndex;

    if (!isStreamingRef.current || !runningRef.current) return;

    if (prev === -1 && partialIndex === -2) {
      // Placeholder → cleanup preview: snap to crystal clear immediately
      currentRef.current = { ...FINAL };
      targetRef.current = { ...FINAL };
      stepTimeRef.current = performance.now();
      if (containerRef.current) {
        containerRef.current.style.filter = "blur(0px) brightness(1) saturate(1)";
      }
    } else if (prev === -2 && partialIndex === -1) {
      // Cleanup preview period is over — smoothly blur up to await redesign
      targetRef.current = { ...PHOTO_PLACEHOLDER_TARGET };
      stepTimeRef.current = performance.now();
    }
  }, [partialIndex]);

  // --- Non-streaming: blur-up on load ---
  useEffect(() => {
    if (ready && !isPartial && !isStreamingRef.current && imgRef.current) {
      imgRef.current.style.filter = "blur(8px)";
      imgRef.current.style.transition = "filter 0.7s ease-out";
      requestAnimationFrame(() => {
        if (imgRef.current) imgRef.current.style.filter = "blur(0px)";
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const sizeClass = isUser
    ? "max-w-[200px] max-h-[260px]"
    : "w-full max-w-[400px] max-h-[60vh]";

  const showScanOverlay = isPartial && partialIndex === -1 && ready;

  if (isStreamingRef.current) {
    return (
      <div
        ref={containerRef}
        className={`relative ${sizeClass} rounded-xl shadow-sm mb-2 overflow-hidden ${
          isPartial ? "cursor-default" : "cursor-pointer hover:opacity-90"
        }`}
        style={{
          aspectRatio: "2/3",
          clipPath: "inset(0)",
          opacity: ready ? 1 : 0,
          transform: ready ? "scale(1)" : "scale(0.97)",
          transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
        }}
      >
        <img
          ref={imgARef}
          src={src}
          alt="AI-generated design"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 1 }}
          onLoad={() => {
            if (!ready) setReady(true);
            if (!isPartial && !finalLoadedRef.current) {
              finalLoadedRef.current = true;
              onLoad?.();
            }
          }}
        />
        <img
          ref={imgBRef}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0 }}
          onLoad={() => {
            if (!isPartial && !finalLoadedRef.current) {
              finalLoadedRef.current = true;
              onLoad?.();
            }
          }}
        />
        {/* Scanning overlay — visible during placeholder phase, fades out on first partial */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
            showScanOverlay ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-accent/10 to-accent/5 scan-pulse" />
          <div className="scan-line" />
        </div>
        {/* Frosted glass curtain — sweeps top→bottom to reveal sharp final image */}
        {sweepPhase !== "none" && sweepPhase !== "done" && (
          <div
            className="absolute inset-0 pointer-events-none frosted-sweep"
            style={{
              transform: sweepPhase === "sweeping" ? "translateY(110%)" : "translateY(0%)",
              transition: sweepPhase === "sweeping"
                ? "transform 3s cubic-bezier(0.22, 1, 0.36, 1)"
                : "none",
            }}
          />
        )}
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt="AI-generated design"
      className={`rounded-xl shadow-sm mb-2 object-cover ${sizeClass} cursor-pointer hover:opacity-90`}
      style={{
        clipPath: "inset(0)",
        opacity: ready ? 1 : 0,
        transform: ready ? "scale(1)" : "scale(0.97)",
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
      }}
      onLoad={() => {
        setReady(true);
        onLoad?.();
      }}
    />
  );
}
