import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/** ponytail: degrees of device tilt that sweep the card edge-to-edge. Bump if it feels twitchy. */
const GYRO_RANGE_DEG = 22;

/** True only on iOS 13+, the one engine that gates orientation behind a gesture. */
const needsPermission = () =>
  typeof (window as any).DeviceOrientationEvent?.requestPermission === "function";

/**
 * Tracks pointer position (and, on mobile, device orientation) over an element
 * and writes the result as CSS custom properties (--rx, --ry, --mx, --my,
 * --distance) directly on the node via the ref, so React never re-renders.
 */
export function useHoloTilt(maxTiltDeg = 14, gyro = true) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const frame = useRef<number | null>(null);
  const pointing = useRef(false);
  const [permitted, setPermitted] = useState(false);

  /** px/py are normalized 0..1 coordinates across the card. */
  const write = useCallback(
    (px: number, py: number) => {
      const el = elRef.current;
      if (!el) return;

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

  const schedule = useCallback((px: number, py: number) => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => write(px, py));
  }, [write]);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const el = elRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointing.current = true;
      schedule(
        clamp((e.clientX - rect.left) / rect.width, 0, 1),
        clamp((e.clientY - rect.top) / rect.height, 0, 1)
      );
    },
    [schedule]
  );

  const onPointerLeave = useCallback(() => {
    const el = elRef.current;
    pointing.current = false;
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

  useEffect(() => {
    if (!gyro || typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;
    // iOS 13+ withholds events until requestGyro() is granted; every other browser is open.
    if (needsPermission() && !permitted) return;
    // ponytail: first reading is the neutral hold angle, so it works lying flat or upright
    let base: { beta: number; gamma: number } | null = null;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (pointing.current || e.beta == null || e.gamma == null) return;
      if (!base) base = { beta: e.beta, gamma: e.gamma };
      schedule(
        0.5 + clamp((e.gamma - base.gamma) / (GYRO_RANGE_DEG * 2), -0.5, 0.5),
        0.5 + clamp((e.beta - base.beta) / (GYRO_RANGE_DEG * 2), -0.5, 0.5)
      );
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, [gyro, permitted, schedule]);

  /** iOS 13+ only hands out orientation after a user gesture asks for it. */
  const requestGyro = useCallback(() => {
    if (!gyro || permitted || !needsPermission()) return;
    (window as any).DeviceOrientationEvent.requestPermission()
      .then((state: string) => {
        setPermitted(state === "granted");
        if (state !== "granted") console.warn(`[holo-card] gyro permission ${state}`);
      })
      // rejects on an insecure origin - iOS needs https:// (or localhost), not http://192.168.x.x
      .catch((err: unknown) => console.warn("[holo-card] gyro unavailable, needs HTTPS:", err));
  }, [gyro, permitted]);

  return { elRef, onPointerMove, onPointerLeave, requestGyro };
}
