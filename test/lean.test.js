import test from "node:test";
import assert from "node:assert/strict";
import { leanFromOrientation } from "../src/useHoloTilt.ts";

const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 0.5, `${msg}: ${a} != ${b}`);

test("flat on a table is neutral", () => {
  const { x, y } = leanFromOrientation(0, 0);
  near(x, 0, "roll");
  near(y, 0, "pitch");
});

test("pitch tracks beta one-for-one while the screen faces you", () => {
  near(leanFromOrientation(30, 0).y, -30, "leaning back 30");
  near(leanFromOrientation(70, 0).y, -70, "held upright-ish");
});

test("rolling right dips the right edge, rolling left the left", () => {
  assert.ok(leanFromOrientation(20, 25).x > 0, "roll right is positive");
  assert.ok(leanFromOrientation(20, -25).x < 0, "roll left is negative");
});

// the bug: gamma flips sign on a tiny roll near beta 90, which sent the tilt
// the wrong way. Lean must stay continuous and small across that flip.
test("no sign flip through the near-vertical gimbal", () => {
  const before = leanFromOrientation(88, 5).x;
  const after = leanFromOrientation(92, 175).x; // same physical pose, mirrored euler
  assert.ok(Math.abs(before - after) < 1, `jumped ${before} -> ${after}`);
  assert.ok(Math.abs(before) < 1, "roll barely registers when held vertical");
});
