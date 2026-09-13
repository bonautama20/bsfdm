import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validate } from "../validate.js";

describe("validate()", () => {
  test("flags a missing required field", () => {
    const errors = validate({}, { name: { required: true } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /name is required/);
  });

  test("passes when required field is present", () => {
    const errors = validate({ name: "Rack A" }, { name: { required: true } });
    assert.deepEqual(errors, []);
  });

  test("skips optional fields that are absent", () => {
    const errors = validate({}, { phone: { maxLength: 30 } });
    assert.deepEqual(errors, []);
  });

  test("flags a value over maxLength", () => {
    const errors = validate({ name: "x".repeat(201) }, { name: { maxLength: 200 } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /200 characters or fewer/);
  });

  test("accepts a value at exactly maxLength", () => {
    const errors = validate({ name: "x".repeat(200) }, { name: { maxLength: 200 } });
    assert.deepEqual(errors, []);
  });

  test("rejects a malformed email", () => {
    const errors = validate({ email: "not-an-email" }, { email: { email: true } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /valid email/);
  });

  test("accepts a well-formed email", () => {
    const errors = validate({ email: "user@example.com" }, { email: { email: true } });
    assert.deepEqual(errors, []);
  });

  test("collects multiple errors across fields", () => {
    const errors = validate(
      { name: "", email: "bad" },
      { name: { required: true }, email: { email: true } }
    );
    assert.equal(errors.length, 2);
  });

  test("enforces min/max numeric bounds", () => {
    assert.equal(validate({ qty: 0 }, { qty: { min: 1 } }).length, 1);
    assert.equal(validate({ qty: 5 }, { qty: { min: 1, max: 10 } }).length, 0);
    assert.equal(validate({ qty: 11 }, { qty: { max: 10 } }).length, 1);
  });
});
