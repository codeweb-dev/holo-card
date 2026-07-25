import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/**
 * Tracks pointer position over an element and writes the result as CSS
 * custom properties (--rx, --ry, --mx, --my, --distance) directly on the
 * node via the ref, so React never re-renders on mousemove.
 */
export function useHoloTilt(maxTiltDeg = 14) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const frame = useRef<number | null>(null);

  const apply = useCallback(
    (clientX: number, clientY: number) => {
      const el = elRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const px = clamp((clientX - rect.left) / rect.width, 0, 1);
      const py = clamp((clientY - rect.top) / rect.height, 0, 1);

      const rx = (0.5 - py) * maxTiltDeg;
      const ry = (px - 0.5) * maxTiltDeg;
      const dx = (px - 0.5) * 2;
      const dy = (py - 0.5) * 2;
      const distance = clamp(Math.sqrt(dx * dx + dy * dy), 0, 1);

      const style = el.style;
      style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      style.setProperty("--mx", `${(px * 100).toFixed(2)}%`);
      style.setProperty("--my", `${(py * 100).toFixed(2)}%`);
      style.setProperty("--distance", distance.toFixed(3));
      el.setAttribute("data-holo-active", "true");
    },
    [maxTiltDeg]
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const { clientX, clientY } = e;
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => apply(clientX, clientY));
    },
    [apply]
  );

  const onPointerLeave = useCallback(() => {
    const el = elRef.current;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    if (!el) return;
    const style = el.style;
    style.setProperty("--rx", "0deg");
    style.setProperty("--ry", "0deg");
    style.setProperty("--mx", "50%");
    style.setProperty("--my", "50%");
    style.setProperty("--distance", "0");
    el.removeAttribute("data-holo-active");
  }, []);

  return { elRef, onPointerMove, onPointerLeave };
}
