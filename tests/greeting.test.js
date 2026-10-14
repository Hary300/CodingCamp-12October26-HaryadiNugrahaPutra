// Feature: todo-life-dashboard, Property 1: Greeting is time-deterministic
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { getGreeting } from "../js/pure-functions.js";

// **Validates: Requirements 4.3, 4.4, 4.5, 4.6**
describe("Property 1: Greeting is time-deterministic", () => {
  it("always returns one of the four expected strings for any hour 0–23", () => {
    const VALID = ["Good morning", "Good afternoon", "Good evening", "Good night"];
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
        const result = getGreeting(hour);
        return VALID.includes(result);
      })
    );
  });
});
