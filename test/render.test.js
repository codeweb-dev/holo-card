import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HoloCard } from "../dist/index.js";

const html = (props) => renderToStaticMarkup(createElement(HoloCard, { url: "/a.png", ...props }));

test("renders inside the react-parallax-tilt wrapper, which carries the sizing", () => {
  const out = html({ width: 200, height: 300 });
  assert.match(out, /class="holo-card__tilt"/, "Tilt wrapper missing");
  assert.match(out, /width:200px/, "width not on the wrapper");
  assert.match(out, /height:300px/, "height not on the wrapper");
  // the card itself must not re-declare a fixed size or the wrapper's scale fights it
  assert.doesNotMatch(out.split('class="holo-card')[2] ?? "", /width:\d/);
});

test("card layers are intact and radius still applies", () => {
  const out = html({ radius: "xl" });
  assert.match(out, /border-radius:28px/);
  for (const cls of ["holo-card__inner", "holo-card__image", "holo-card__glare", "holo-card__sparkle"])
    assert.match(out, new RegExp(cls), `${cls} missing`);
});

test("showSparkles=false drops the foil layer only", () => {
  const out = html({ showSparkles: false });
  assert.doesNotMatch(out, /holo-card__sparkle/);
  assert.match(out, /holo-card__glare/);
});

test("SSR renders without a document", () => {
  assert.equal(typeof globalThis.document, "undefined", "test env is not SSR-like");
  assert.match(html(), /<img/);
});
