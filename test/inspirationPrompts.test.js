import test from "node:test";
import assert from "node:assert/strict";
import {
  inspirationPrompts,
  createPromptSequence,
} from "../src/components/inspirationPrompts.js";
test("fifty distinct practical prompts rotate without repeats until the full set is used", () => {
  assert.equal(inspirationPrompts.length, 50);
  assert.equal(new Set(inspirationPrompts.map((p) => p.prompt)).size, 50);
  const sequence = createPromptSequence(inspirationPrompts.length);
  const first = Array.from({ length: 50 }, () => sequence.next());
  const second = Array.from({ length: 50 }, () => sequence.next());
  assert.equal(new Set(first).size, 50);
  assert.equal(new Set(second).size, 50);
  assert.notEqual(first.at(-1), second[0]);
});
