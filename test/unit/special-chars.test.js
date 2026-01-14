/**
 * Tests for special character handling:
 * - Typst special characters escaping
 * - URL escaping
 * - Unicode handling
 */

import { describe, it } from 'node:test';
import { assertIncludes } from '../helpers/test-utils.js';

describe('Special Characters', () => {
  describe('Typst Character Escaping', () => {
    it('should escape hash symbol', () => {
      assertIncludes(
        'Text with # symbol',
        ['\\#']
      );
    });

    it('should escape dollar sign', () => {
      assertIncludes(
        'Text with $ symbol',
        ['\\$']
      );
    });

    it('should escape at symbol', () => {
      assertIncludes(
        'Text with @ symbol',
        ['\\@']
      );
    });

    it('should escape multiple special characters', () => {
      assertIncludes(
        'Text with # and $ and @ symbols',
        ['\\#', '\\$', '\\@']
      );
    });
  });

  describe('URL Handling', () => {
    it('should preserve URLs in links', () => {
      assertIncludes(
        '[link](https://example.com/path?query=value&other=test)',
        ['#link("https://example.com/path?query=value&other=test")']
      );
    });

    it('should handle URLs with fragments', () => {
      assertIncludes(
        '[link](https://example.com#section)',
        ['#link("https://example.com#section")']
      );
    });

    it('should handle URLs with special characters', () => {
      assertIncludes(
        '[link](https://example.com/path?q=hello%20world&x=1)',
        ['#link("https://example.com/path?q=hello%20world&x=1")']
      );
    });
  });

  describe('Unicode Characters', () => {
    it('should preserve unicode characters', () => {
      assertIncludes(
        'Emoji: 🚀 and unicode: café',
        ['🚀', 'café']
      );
    });

    it('should handle CJK characters', () => {
      assertIncludes(
        '中文测试 テスト 한글',
        ['中文测试', 'テスト', '한글']
      );
    });

    it('should handle mathematical symbols', () => {
      assertIncludes(
        'Math symbols: ∑ ∫ π ∞',
        ['∑', '∫', 'π', '∞']
      );
    });
  });
});
