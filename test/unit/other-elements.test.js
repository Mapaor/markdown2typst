/**
 * Tests for other Markdown elements:
 * - Blockquotes
 * - Horizontal rules
 * - Line breaks
 * - Table of contents
 */

import { describe, it } from 'node:test';
import { assertIncludes } from '../helpers/test-utils.js';

describe('Other Elements', () => {
  describe('Blockquotes', () => {
    it('should convert single-line blockquote', () => {
      assertIncludes(
        '> This is a quote',
        ['#quote[', 'This is a quote']
      );
    });

    it('should convert multi-line blockquote', () => {
      assertIncludes(
        '> This is a quote\n> on multiple lines',
        ['#quote[', 'This is a quote']
      );
    });

    it('should handle nested blockquotes', () => {
      assertIncludes(
        '> Outer quote\n>> Inner quote',
        ['#quote[']
      );
    });
  });

  describe('Horizontal Rules', () => {
    it('should convert horizontal rule with dashes', () => {
      assertIncludes(
        'Before\n\n---\n\nAfter',
        ['#line(length: 100%, stroke: 0.6pt)']
      );
    });

    it('should convert horizontal rule with asterisks', () => {
      assertIncludes(
        'Before\n\n***\n\nAfter',
        ['#line(length: 100%, stroke: 0.6pt)']
      );
    });

    it('should convert horizontal rule with underscores', () => {
      assertIncludes(
        'Before\n\n___\n\nAfter',
        ['#line(length: 100%, stroke: 0.6pt)']
      );
    });
  });

  describe('Line Breaks', () => {
    it('should convert hard line break', () => {
      assertIncludes(
        'Line 1\\\nLine 2',
        ['Line 1\\\n', 'Line 2']
      );
    });

    it('should handle multiple line breaks', () => {
      assertIncludes(
        'First\\\nSecond\\\nThird',
        ['First\\\n', 'Second\\\n', 'Third']
      );
    });
  });

  describe('Table of Contents', () => {
    it('should convert [toc] to outline', () => {
      assertIncludes(
        '[toc]\n\n# Section 1',
        ['#outline(title: auto, indent: auto)']
      );
    });

    it('should handle TOC with sections', () => {
      assertIncludes(
        '[toc]\n\n# First\n## Second\n### Third',
        ['#outline(title: auto, indent: auto)', '= First']
      );
    });
  });
});
