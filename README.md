# react-holo-card

A React component that renders a pointer-reactive holographic card effect —
tilt, glare, and an optional rainbow foil sparkle — the "Pokemon card" style
effect. 3D tilt is handled by
[`react-parallax-tilt`](https://github.com/mkosir/react-parallax-tilt); the
foil and glare are driven by CSS custom properties for smooth 60fps updates.

## Install

```
npm install react-holo-card
```

Peer dependencies: `react >= 17`, `react-dom >= 17`. `react-parallax-tilt`
comes along as a regular dependency — you don't install it yourself.

## Usage

```tsx
import { HoloCard } from "react-holo-card";

<HoloCard
  url="https://example.com/card-art.webp"
  width={320}           // optional, default 320
  height={446}          // optional, default 446
  radius="md"           // optional, "none" | "sm" | "md" | "lg" | "xl" | "full" | px number
  showSparkles={true}   // optional, default true
  maxTilt={30}          // optional, max rotation in degrees, default 30
  scale={1.04}          // optional, hover scale, default 1.04
  perspective={1200}    // optional, 3D depth in px, default 1200
  transitionSpeed={400} // optional, ease-back ms, default 400
  gyro={true}           // optional, tilt with the device gyroscope on mobile, default true
  alt="Card art"
/>
```

## How it works

Two systems, split by input:

**Pointer → `react-parallax-tilt`.** The card is wrapped in `<Tilt>`, which
owns the mouse/touch 3D transform, the hover scale, the perspective, and the
ease-back on leave. `maxTilt`, `scale`, `perspective`, and `transitionSpeed`
are forwarded to it. Its own `glareEnable` is off — the built-in glare is a
flat white sheen, and this package has a pointer-tracking one.

**Gyroscope + foil → `useHoloTilt`.** The hook tracks `pointermove` over the
card and writes the result straight onto the DOM node as CSS custom properties
(`--mx`, `--my`, `--distance` for the glare and foil; `--rx`/`--ry` for the
gyro tilt only) — no React re-render per mouse move, batched with
`requestAnimationFrame`.

`react-parallax-tilt` also ships a `gyroscope` prop, but this package leaves it
off and keeps its own:

```js
// react-parallax-tilt
if (!t.gamma || !t.beta || !this.props.gyroscope) return;
xPercentage = t.beta / tiltMaxAngleX * 100;
```

Raw `beta`/`gamma` gimbal-locks near vertical — the pose anyone actually holds
a phone in — where `gamma` flips sign on a tiny roll and sends the tilt the
wrong way. It also has no neutral baseline, no smoothing, and never calls
iOS's `requestPermission()`, so it is simply inert on iPhone. `useHoloTilt`
derives lean from the gravity vector instead, low-passes the readings, treats
the first reading as the neutral hold angle, and asks iOS for permission on
first tap. When the sensor takes over, `<Tilt>` is disabled via `tiltEnable`
so a dragging finger doesn't fight it.

The rest:

- A glare layer follows the pointer via `--mx`/`--my` — a specular hotspot
  under the cursor, blended with `screen` so it stays visible on light card
  art. Shows on `:hover`, so it's there before you move.
- An optional diagonal rainbow gradient (`showSparkles`) uses
  `mix-blend-mode: color-dodge` and shifts opacity/position with the pointer
  for the foil sparkle look.
- Styles are injected once into `<head>` on first mount; SSR-safe (the inject
  call is a no-op without `document`).

## Props

| Prop              | Type      | Default | Description                              |
| ----------------- | --------- | ------- | ----------------------------------------- |
| `url`             | `string`  | —       | Image URL rendered inside the card        |
| `width`           | `number`  | `320`   | Card width in px                          |
| `height`          | `number`  | `446`   | Card height in px                         |
| `radius`          | `"none" \| "sm" \| "md" \| "lg" \| "xl" \| "full" \| number` | `"md"` | Corner radius — presets are 0/8/14/20/28/9999px, or pass px |
| `showSparkles`    | `boolean` | `true`  | Show the rainbow foil sparkle layer       |
| `maxTilt`         | `number`  | `30`    | Max tilt rotation in degrees at the edge  |
| `scale`           | `number`  | `1.04`  | Scale while the pointer is over the card  |
| `perspective`     | `number`  | `1200`  | 3D depth in px — lower is more extreme    |
| `transitionSpeed` | `number`  | `400`   | Ease-back duration in ms on pointer leave |
| `gyro`            | `boolean` | `true`  | Tilt with the device gyroscope on mobile. iOS 13+ only grants orientation after a user gesture — the first tap on the card asks for it. Needs HTTPS. |
| `alt`             | `string`  | `""`    | Alt text for the image                    |
| `className`       | `string`  | —       | Extra class on the card element           |
| `style`           | `object`  | —       | Extra inline styles on the card element   |

## Styling and layout

The rendered tree is:

```html
<div class="holo-card__tilt">   <!-- react-parallax-tilt wrapper, carries width/height -->
  <div class="holo-card">        <!-- your className and style land here -->
    <div class="holo-card__inner">
      <img class="holo-card__image">
      <div class="holo-card__glare">
      <div class="holo-card__sparkle">
```

`width`/`height` size the outer wrapper so the hover `scale` has something to
scale. For margins or grid placement, target `.holo-card__tilt` — putting a
margin on `.holo-card` via `className` sits inside the tilted box.

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

## Credits

3D tilt by [react-parallax-tilt](https://github.com/mkosir/react-parallax-tilt).
Foil effect inspired by
[react-holo-card-effect](https://github.com/van123helsing/react-holo-card-effect).

## License

MIT
