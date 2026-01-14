/**
 * Tests for basic Markdown syntax:
 * - Headings (H1-H6)
 * - Text formatting (bold, italic, strikethrough)
 * - Code (inline and blocks)
 */

import { describe, it } from 'node:test';
import { assertIncludes } from '../helpers/test-utils.js';

describe('Basic Markdown Syntax', () => {
  describe('Headings', () => {
    it('should convert H1-H3 headings', () => {
      assertIncludes(
        '# H1\n## H2\n### H3',
        ['= H1', '== H2', '=== H3']
      );
    });

    it('should convert all heading levels H1-H6', () => {
      assertIncludes(
        '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6',
        ['= H1', '== H2', '=== H3', '==== H4', '===== H5', '====== H6']
      );
    });
  });

  describe('Text Formatting', () => {
    it('should convert bold text', () => {
      assertIncludes(
        '**bold text**',
        ['*bold text*']
      );
    });

    it('should convert italic text', () => {
      assertIncludes(
        '*italic text*',
        ['_italic text_']
      );
    });

    it('should convert bold and italic together', () => {
      assertIncludes(
        '**bold** and *italic* and ***both***',
        ['*bold*', '_italic_', '_*both*_']
      );
    });

    it('should convert strikethrough (GFM)', () => {
      assertIncludes(
        '~~deleted text~~',
        ['#strike[deleted text]']
      );
    });
  });

  describe('Code', () => {
    it('should preserve inline code', () => {
      assertIncludes(
        'Use `code` here',
        ['`code`']
      );
    });

    it('should convert code block with language', () => {
      assertIncludes(
        '```typescript\nconst x: number = 42;\n```',
        ['```typescript', 'const x: number = 42;', '```']
      );
    });

    it('should convert code block without language', () => {
      assertIncludes(
        '```\nplain code\n```',
        ['```', 'plain code']
      );
    });

    it('should handle multi-line code blocks', () => {
      const code = '```javascript\nfunction test() {\n  return 42;\n}\n```';
      assertIncludes(code, ['```javascript', 'function test()', 'return 42;']);
    });
  });
});
