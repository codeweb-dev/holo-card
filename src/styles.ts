let injected = false;

const CSS = `
.holo-card {
  --rx: 0deg;
  --ry: 0deg;
  --mx: 50%;
  --my: 50%;
  --distance: 0;
  position: relative;
  perspective: 1200px;
  border-radius: 14px;
  isolation: isolate;
}
.holo-card__inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  overflow: hidden;
  transform: rotateX(var(--rx)) rotateY(var(--ry));
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}
.holo-card[data-holo-active] .holo-card__inner {
  /* long enough that a dropped gyro frame gets interpolated instead of stepping */
  transition: transform 0.1s linear;
}
.holo-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
  -webkit-user-drag: none;
  user-select: none;
}
.holo-card__glare {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  /* specular hotspot under the pointer only - no sweeping sheen band */
  background-image: radial-gradient(
    circle at var(--mx) var(--my),
    rgba(255, 255, 255, 0.55) 0%,
    rgba(255, 255, 255, 0.18) 16%,
    rgba(255, 255, 255, 0) 38%
  );
  /* ponytail: screen, not overlay - overlay is invisible on light card art */
  mix-blend-mode: screen;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.holo-card__sparkle {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  /* fine foil grain over a soft rainbow, panned in opposite directions */
  background-image:
    repeating-linear-gradient(
      100deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.09) 1.2%,
      rgba(255, 255, 255, 0) 2.6%
    ),
    linear-gradient(
      115deg,
      rgba(255, 110, 150, 0.5) 8%,
      rgba(255, 220, 120, 0.5) 24%,
      rgba(120, 255, 190, 0.5) 40%,
      rgba(120, 190, 255, 0.5) 56%,
      rgba(200, 130, 255, 0.5) 72%,
      rgba(255, 110, 150, 0.5) 88%
    );
  background-size: 160% 160%, 260% 260%;
  background-position: var(--mx) var(--my), calc(100% - var(--mx)) calc(100% - var(--my));
  background-blend-mode: overlay;
  filter: brightness(1.05) contrast(1.3) saturate(1.7);
  mix-blend-mode: color-dodge;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.holo-card:hover .holo-card__glare,
.holo-card[data-holo-active] .holo-card__glare {
  opacity: 1;
}
.holo-card:hover .holo-card__sparkle,
.holo-card[data-holo-active] .holo-card__sparkle {
  opacity: calc(0.6 + var(--distance) * 0.35);
}
`;

/** Injects the component's stylesheet once per document. SSR-safe no-op. */
export function injectHoloStyles(): void {
  if (injected || typeof document === "undefined") return;
  injected = true;
  const style = document.createElement("style");
  style.setAttribute("data-holo-card", "");
  style.textContent = CSS;
  document.head.appendChild(style);
}
