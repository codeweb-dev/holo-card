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
  maxTilt={30}         // optional, max rotation in degrees, default 30
  gyro={true}         // optional, tilt with the device gyroscope on mobile, default true
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
| `maxTilt`      | `number`  | `30`    | Max tilt rotation in degrees at the edge  |
| `gyro`         | `boolean` | `true`  | Tilt with the device gyroscope on mobile. iOS 13+ only grants orientation after a user gesture — the first tap on the card asks for it. Needs HTTPS. |
| `alt`          | `string`  | `""`    | Alt text for the image                    |
| `className`    | `string`  | —       | Extra class on the root element           |
| `style`        | `object`  | —       | Extra inline styles on the root element   |

## Gyro on mobile

Android and desktop browsers hand out `deviceorientation` freely. iOS 13+ does
not: it withholds motion data until a user gesture asks for permission, and
only over HTTPS (`localhost` counts, a `http://192.168.x.x` dev server does
not). The card asks on its own first click, so tapping the art is enough.

**Recommended:** give mobile users a visible button as well, so they know the
permission exists instead of tapping around hoping. Forward the click to the
card and iOS treats it as the same gesture:

```jsx
const stage = useRef(null);

<div ref={stage}>
  <HoloCard url="/card.png" />
</div>
<button onClick={() => stage.current.querySelector(".holo-card").click()}>
  Enable motion tilt
</button>
```

## Build locally

```
npm install
npm run build   # emits dist/index.js + dist/index.d.ts via tsup
npm test
```

## License

MIT
