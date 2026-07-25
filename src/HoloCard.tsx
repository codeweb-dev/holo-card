import { useEffect } from "react";
import type { CSSProperties } from "react";
import { useHoloTilt } from "./useHoloTilt.js";
import { injectHoloStyles } from "./styles.js";

export interface HoloCardProps {
  /** Image URL rendered inside the card. */
  url: string;
  /** Card width in px. Default 320. */
  width?: number;
  /** Card height in px. Default 446. */
  height?: number;
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
      style={{ width, height, ...style }}
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
