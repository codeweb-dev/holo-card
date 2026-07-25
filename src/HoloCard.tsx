import { useEffect } from "react";
import type { CSSProperties } from "react";
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
  /** Max tilt rotation in degrees at the card's edge. Default 14. */
  maxTilt?: number;
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
  maxTilt = 14,
  alt = "",
  className,
  style,
}: HoloCardProps) {
  useEffect(() => {
    injectHoloStyles();
  }, []);

  const { elRef, onPointerMove, onPointerLeave } = useHoloTilt(maxTilt);

  return (
    <div
      ref={elRef}
      className={["holo-card", className].filter(Boolean).join(" ")}
      style={{
        width,
        height,
        borderRadius: typeof radius === "number" ? radius : RADII[radius],
        ...style,
      }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="holo-card__inner">
        <img className="holo-card__image" src={url} alt={alt} draggable={false} />
        <div className="holo-card__glare" />
        {showSparkles && <div className="holo-card__sparkle" />}
      </div>
    </div>
  );
}
