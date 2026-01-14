/**
 * Tests for math expressions:
 * - Inline math
 * - Block/display math
 * - LaTeX to Typst conversion
 */

import { describe, it } from 'node:test';
import { assertIncludes } from '../helpers/test-utils.js';

describe('Math', () => {
  describe('Inline Math', () => {
    it('should preserve inline math', () => {
      assertIncludes(
        'Formula: $E = mc^2$ here',
        ['$E = m c^2$']
      );
    });

    it('should handle multiple inline math expressions', () => {
      assertIncludes(
        'First $x + y$ and second $a^2 + b^2 = c^2$',
        ['$x + y$', '$a^2 + b^2 = c^2$']
      );
    });
  });

  describe('Block Math', () => {
    it('should convert block math', () => {
      assertIncludes(
        '$$\n\\int_0^1 x^2 dx\n$$',
        ['$', 'integral']
      );
    });

    it('should handle complex block math', () => {
      const math = '$$\n\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}\n$$';
      assertIncludes(math, ['$', 'sum']);
    });

    it('should preserve display math formatting', () => {
      assertIncludes(
        '$$\nx = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\n$$',
        ['$']
      );
    });
  });
});
