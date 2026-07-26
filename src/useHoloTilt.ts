import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/** ponytail: degrees of device pitch that sweep the card top-to-bottom. Bump if it feels twitchy. */
const GYRO_RANGE_DEG = 28;

/**
 * ponytail: same knob for left/right. Smaller because rolling a phone you are
 * holding upright barely changes where it faces - the geometry scales roll by
 * cos(beta), so it needs a tighter range to feel equal to pitch.
 */
const GYRO_ROLL_RANGE_DEG = 14;

/** ponytail: low-pass weight for each new sensor reading. Lower = smoother but laggier. */
const GYRO_SMOOTHING = 0.12;

const DEG = Math.PI / 180;

/**
 * Which way the phone is leaning, in degrees, as the direction gravity pulls
 * across the screen: x is the right edge dipping, y is the top edge dipping.
 *
 * Derived from the gravity vector rather than beta/gamma directly. Near-vertical
 * (beta ~= 90, i.e. how anyone actually holds a phone) gamma gimbal-locks and
 * flips sign on a tiny roll, which sent the tilt the wrong way. cos(beta)sin(gamma)
 * stays continuous through that pose.
 */
export function leanFromOrientation(beta: number, gamma: number) {
  const b = beta * DEG;
  const g = gamma * DEG;
  return {
    x: Math.asin(clamp(Math.cos(b) * Math.sin(g), -1, 1)) / DEG,
    y: Math.asin(clamp(-Math.sin(b), -1, 1)) / DEG,
  };
}

/** True only on iOS 13+, the one engine that gates orientation behind a gesture. */
const needsPermission = () =>
  typeof (window as any).DeviceOrientationEvent?.requestPermission === "function";

/**
 * Tracks pointer position (and, on mobile, device orientation) over an element
 * and writes the result as CSS custom properties (--rx, --ry, --mx, --my,
 * --distance) directly on the node via the ref, so React never re-renders.
 *
 * react-parallax-tilt owns the 3D transform for pointer input, so --rx/--ry are
 * only driven by the gyroscope - which the library reads too crudely to use
 * (raw beta/gamma, no baseline, and no iOS permission prompt at all).
 */
export function useHoloTilt(maxTiltDeg = 30, gyro = true) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const frame = useRef<number | null>(null);
  const pointing = useRef(false);
  const [permitted, setPermitted] = useState(false);
  // state, not a ref: <Tilt> has to stop tracking touch once the sensor takes over
  const [gyroLive, setGyroLive] = useState(false);

  /** px/py are normalized 0..1 coordinates across the card. */
  const write = useCallback(
    (px: number, py: number, tilt: boolean) => {
      const el = elRef.current;
      if (!el) return;

      const rx = tilt ? (0.5 - py) * maxTiltDeg : 0;
      const ry = tilt ? (px - 0.5) * maxTiltDeg : 0;
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

  const schedule = useCallback((px: number, py: number, tilt: boolean) => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => write(px, py, tilt));
  }, [write]);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const el = elRef.current;
      if (!el) return;
      // once the gyro is feeding, a dragging finger just fights it - let the sensor win
      if (gyroLive && e.pointerType !== "mouse") return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointing.current = true;
      // <Tilt> is already rotating the wrapper from this same pointer - glare only
      schedule(
        clamp((e.clientX - rect.left) / rect.width, 0, 1),
        clamp((e.clientY - rect.top) / rect.height, 0, 1),
        false
      );
    },
    [schedule, gyroLive]
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
    let base: { x: number; y: number } | null = null;
    let smooth: { x: number; y: number } | null = null;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      setGyroLive(true);
      if (pointing.current) return;
      const lean = leanFromOrientation(e.beta, e.gamma);
      if (!base) base = lean;
      // raw sensor readings jitter a few degrees at rest; low-pass them before tilting
      smooth = smooth
        ? {
            x: smooth.x + (lean.x - smooth.x) * GYRO_SMOOTHING,
            y: smooth.y + (lean.y - smooth.y) * GYRO_SMOOTHING,
          }
        : lean;
      schedule(
        0.5 + clamp((smooth.x - base.x) / (GYRO_ROLL_RANGE_DEG * 2), -0.5, 0.5),
        0.5 + clamp((smooth.y - base.y) / (GYRO_RANGE_DEG * 2), -0.5, 0.5),
        true
      );
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => {
      setGyroLive(false);
      window.removeEventListener("deviceorientation", onOrient);
    };
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

  return { elRef, onPointerMove, onPointerLeave, requestGyro, gyroLive };
}
