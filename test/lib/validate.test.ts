import assert from "node:assert/strict";
import { assertItemName, ITEM_NAME_MAX_LENGTH } from "../../lib/validate";

describe("lib/validate.ts", () => {
  it("returns the trimmed name for valid input", () => {
    assert.equal(assertItemName("  Lamp  "), "Lamp");
  });

  it("rejects a non-string name", () => {
    assert.throws(() => assertItemName(42), /non-empty string/);
  });

  it("rejects null", () => {
    assert.throws(() => assertItemName(null), /non-empty string/);
  });

  it("rejects an empty string", () => {
    assert.throws(() => assertItemName(""), /non-empty string/);
  });

  it("accepts a name at exactly the max length", () => {
    const name = "x".repeat(ITEM_NAME_MAX_LENGTH);
    assert.equal(assertItemName(name), name);
  });

  it("rejects a name one character over the max length", () => {
    const name = "x".repeat(ITEM_NAME_MAX_LENGTH + 1);
    assert.throws(() => assertItemName(name), /200 characters or fewer/);
  });
});
