import { useEffect } from "react";
import type { CSSProperties } from "react";
import Tilt from "react-parallax-tilt";
import { useHoloTilt } from "./useHoloTilt.js";
import { injectHoloStyles } from "./styles.js";

const RADII = { none: 0, sm: 8, md: 14, lg: 20, xl: 28, full: 9999 } as const;

/** Named corner-radius preset, or a raw px value. */
export type HoloRadius = keyof typeof RADII | number;

export interface HoloCardProps {
  /** Image URL rendered inside the card. */
  url: string;
  /** Card width in px. Default 320. */
  width?: number;
  /** Card height in px. Default 446. */
  height?: number;
  /** Corner radius: "none" | "sm" | "md" | "lg" | "xl" | "full", or px. Default "md". */
  radius?: HoloRadius;
  /** Show the rainbow foil sparkle layer on top of the glare. Default true. */
  showSparkles?: boolean;
  /** Max tilt rotation in degrees at the card's edge. Default 30. */
  maxTilt?: number;
  /** Scale the card while the pointer is over it. Default 1.04. */
  scale?: number;
  /** Perspective depth in px — lower is a more extreme 3D. Default 1200. */
  perspective?: number;
  /** Ease-back duration in ms when the pointer leaves. Default 400. */
  transitionSpeed?: number;
  /** Tilt with the device gyroscope on mobile. iOS needs one tap to grant it. Default true. */
  gyro?: boolean;
  /** Alt text for the image. */
  alt?: string;
  className?: string;
  style?: CSSProperties;
}

export function HoloCard({
  url,
  width = 320,
  height = 446,
  radius = "md",
  showSparkles = true,
  maxTilt = 30,
  scale = 1.04,
  perspective = 1200,
  transitionSpeed = 400,
  gyro = true,
  alt = "",
  className,
  style,
}: HoloCardProps) {
  useEffect(() => {
    injectHoloStyles();
  }, []);

  const { elRef, onPointerMove, onPointerLeave, requestGyro, gyroLive } = useHoloTilt(
    maxTilt,
    gyro
  );

  return (
    <Tilt
      className="holo-card__tilt"
      style={{ width, height }}
      tiltMaxAngleX={maxTilt}
      tiltMaxAngleY={maxTilt}
      scale={scale}
      perspective={perspective}
      transitionSpeed={transitionSpeed}
      // its glare is a flat white sheen; .holo-card__glare is the pointer-tracking one
      glareEnable={false}
      // its gyro reads raw beta/gamma and never asks iOS for permission - useHoloTilt does both
      gyroscope={false}
      // once the sensor is driving, a dragging finger would fight it
      tiltEnable={!gyroLive}
    >
      <div
        ref={elRef}
        className={["holo-card", className].filter(Boolean).join(" ")}
        style={{
          borderRadius: typeof radius === "number" ? radius : RADII[radius],
          ...style,
        }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onClick={requestGyro}
      >
        <div className="holo-card__inner">
          <img className="holo-card__image" src={url} alt={alt} draggable={false} />
          <div className="holo-card__glare" />
          {showSparkles && <div className="holo-card__sparkle" />}
        </div>
      </div>
    </Tilt>
  );
}
