import test from "node:test";
import assert from "node:assert/strict";
import { HoloCard } from "../dist/index.js";

test("HoloCard is exported as a function component", () => {
  assert.equal(typeof HoloCard, "function");
});

test("HoloCard has the expected arity (single props object)", () => {
  assert.equal(HoloCard.length, 1);
});
