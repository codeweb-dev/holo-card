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
  transition: transform 0.05s linear;
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
  /* specular hotspot under the pointer + a sheen band that sweeps the other way */
  background-image:
    radial-gradient(
      circle at var(--mx) var(--my),
      rgba(255, 255, 255, 0.5) 0%,
      rgba(255, 255, 255, 0.15) 25%,
      rgba(255, 255, 255, 0) 55%
    ),
    linear-gradient(
      105deg,
      rgba(255, 255, 255, 0) 42%,
      rgba(255, 255, 255, 0.16) 50%,
      rgba(255, 255, 255, 0) 58%
    );
  background-size: 100% 100%, 220% 100%;
  background-position: 0 0, calc(100% - var(--mx)) 0;
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
      rgba(255, 110, 150, 0.28) 8%,
      rgba(255, 220, 120, 0.28) 24%,
      rgba(120, 255, 190, 0.28) 40%,
      rgba(120, 190, 255, 0.28) 56%,
      rgba(200, 130, 255, 0.28) 72%,
      rgba(255, 110, 150, 0.28) 88%
    );
  background-size: 160% 160%, 260% 260%;
  background-position: var(--mx) var(--my), calc(100% - var(--mx)) calc(100% - var(--my));
  background-blend-mode: overlay;
  filter: brightness(0.92) contrast(1.45) saturate(1.5);
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
  opacity: calc(0.35 + var(--distance) * 0.3);
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
