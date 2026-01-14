/**
 * Test utilities and helpers for markdown2typst testing
 */

import assert from 'node:assert';
import { markdown2typst } from '../../dist/markdown2typst.js';

/**
 * Assert that the Typst output includes all expected strings
 */
export function assertIncludes(markdown, expectedIncludes, options = {}) {
  const result = markdown2typst(markdown, options);
  
  for (const expected of expectedIncludes) {
    assert.ok(
      result.includes(expected),
      `Expected output to include: "${expected}"\nGot: ${result.substring(0, 300)}...`
    );
  }
  
  return result;
}

/**
 * Assert that the Typst output excludes all specified strings
 */
export function assertExcludes(markdown, notExpected, options = {}) {
  const result = markdown2typst(markdown, options);
  
  for (const unexpected of notExpected) {
    assert.ok(
      !result.includes(unexpected),
      `Expected output NOT to include: "${unexpected}"\nGot: ${result.substring(0, 300)}...`
    );
  }
  
  return result;
}

/**
 * Assert that conversion throws an error
 */
export function assertThrows(markdown, options = {}) {
  assert.throws(
    () => markdown2typst(markdown, options),
    'Expected conversion to throw an error'
  );
}

/**
 * Assert exact match for small outputs
 */
export function assertExactOutput(markdown, expected, options = {}) {
  const result = markdown2typst(markdown, options);
  assert.strictEqual(result.trim(), expected.trim());
  return result;
}

/**
 * Convert markdown and return result (for custom assertions)
 */
export function convert(markdown, options = {}) {
  return markdown2typst(markdown, options);
}
