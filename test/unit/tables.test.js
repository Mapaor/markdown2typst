/**
 * Tests for table rendering:
 * - Simple tables
 * - Tables with alignment
 * - Complex tables
 */

import { describe, it } from 'node:test';
import { assertIncludes } from '../helpers/test-utils.js';

describe('Tables', () => {
  describe('Simple Tables', () => {
    it('should convert simple 2x2 table', () => {
      assertIncludes(
        '| Col A | Col B |\n|-------|-------|\n| 1 | 2 |\n| 3 | 4 |',
        ['#table(', '[*Col A*]', '[*Col B*]', '[1]', '[2]', '[3]', '[4]']
      );
    });

    it('should convert table with multiple rows', () => {
      const table = '| Name | Age |\n|------|-----|\n| Alice | 30 |\n| Bob | 25 |\n| Carol | 35 |';
      assertIncludes(table, ['#table(', '[*Name*]', '[*Age*]', '[Alice]', '[Bob]', '[Carol]']);
    });
  });

  describe('Table Alignment', () => {
    it('should handle left-aligned columns', () => {
      assertIncludes(
        '| Left |\n|:-----|\n| L |',
        ['#table(', 'left']
      );
    });

    it('should handle center-aligned columns', () => {
      assertIncludes(
        '| Center |\n|:------:|\n| C |',
        ['#table(', 'center']
      );
    });

    it('should handle right-aligned columns', () => {
      assertIncludes(
        '| Right |\n|------:|\n| R |',
        ['#table(', 'right']
      );
    });

    it('should handle mixed alignment', () => {
      assertIncludes(
        '| Left | Center | Right |\n|:-----|:------:|------:|\n| L | C | R |',
        ['#table(', 'align: (left, center, right)']
      );
    });
  });

  describe('Complex Tables', () => {
    it('should handle tables with formatted content', () => {
      assertIncludes(
        '| **Bold** | *Italic* |\n|----------|----------|\n| `code` | text |',
        ['#table(', '**Bold**', '`code`']
      );
    });
  });
});
