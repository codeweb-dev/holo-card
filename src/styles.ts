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
  background: radial-gradient(
    circle at var(--mx) var(--my),
    rgba(255, 255, 255, calc(0.45 * (1 - var(--distance)) + 0.05)) 0%,
    rgba(255, 255, 255, 0) 60%
  );
  mix-blend-mode: overlay;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.holo-card__sparkle {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-image: repeating-linear-gradient(
    115deg,
    rgba(255, 0, 170, 0.55) 0%,
    rgba(255, 240, 0, 0.55) 12%,
    rgba(0, 255, 200, 0.55) 24%,
    rgba(80, 90, 255, 0.55) 36%,
    rgba(255, 0, 170, 0.55) 48%
  );
  background-size: 300% 300%;
  background-position: var(--mx) var(--my);
  mix-blend-mode: color-dodge;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.holo-card[data-holo-active] .holo-card__glare {
  opacity: 1;
}
.holo-card[data-holo-active] .holo-card__sparkle {
  opacity: calc(0.28 + var(--distance) * 0.35);
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
