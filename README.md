# react-holo-card

A React component that renders a pointer-reactive holographic card effect —
tilt, glare, and an optional rainbow foil sparkle — the "Pokemon card" style
effect, driven entirely by CSS custom properties for smooth 60fps updates.

## Install

```
npm install react-holo-card
```

Peer dependency: `react >= 17`.

## Usage

```tsx
import { HoloCard } from "react-holo-card";

<HoloCard
  url="https://example.com/card-art.webp"
  width={320}        // optional, default 320
  height={446}        // optional, default 446
  radius="md"         // optional, "none" | "sm" | "md" | "lg" | "xl" | "full" | px number
  showSparkles={true} // optional, default true
  maxTilt={14}         // optional, max rotation in degrees, default 14
  alt="Card art"
/>
```

## How it works

- A `useHoloTilt` hook tracks `pointermove` over the card and writes the
  result straight onto the DOM node as CSS custom properties
  (`--rx`, `--ry`, `--mx`, `--my`, `--distance`) — no React re-render per
  mouse move, batched with `requestAnimationFrame`.
- The 3D tilt is a `rotateX/rotateY` transform driven by `--rx`/`--ry`.
- A glare layer follows the pointer via `--mx`/`--my` — a specular hotspot
  under the cursor plus a sheen band sweeping the opposite way, blended with
  `screen` so it stays visible on light card art. Shows on `:hover`, so it's
  there before you move.
- An optional diagonal rainbow gradient (`showSparkles`) uses
  `mix-blend-mode: color-dodge` and shifts opacity/position with the
  pointer for the foil sparkle look.
- On pointer leave, everything eases back to resting state via CSS
  transitions — no JS animation loop needed at rest.
- Styles are injected once into `<head>` on first mount; SSR-safe (the
  inject call is a no-op without `document`).

## Props

| Prop           | Type      | Default | Description                              |
| -------------- | --------- | ------- | ----------------------------------------- |
| `url`          | `string`  | —       | Image URL rendered inside the card        |
| `width`        | `number`  | `320`   | Card width in px                          |
| `height`       | `number`  | `446`   | Card height in px                         |
| `radius`       | `"none" \| "sm" \| "md" \| "lg" \| "xl" \| "full" \| number` | `"md"` | Corner radius — presets are 0/8/14/20/28/9999px, or pass px |
| `showSparkles` | `boolean` | `true`  | Show the rainbow foil sparkle layer       |
| `maxTilt`      | `number`  | `14`    | Max tilt rotation in degrees at the edge  |
| `alt`          | `string`  | `""`    | Alt text for the image                    |
| `className`    | `string`  | —       | Extra class on the root element           |
| `style`        | `object`  | —       | Extra inline styles on the root element   |

## Build locally

```
npm install
npm run build   # emits dist/index.js + dist/index.d.ts via tsup
npm test
```

## License

MIT
