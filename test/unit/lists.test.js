/**
 * Tests for list rendering:
 * - Unordered lists
 * - Ordered lists
 * - Nested lists
 */

import { describe, it } from 'node:test';
import { assertIncludes } from '../helpers/test-utils.js';

describe('Lists', () => {
  describe('Unordered Lists', () => {
    it('should convert simple unordered list', () => {
      assertIncludes(
        '- Item 1\n- Item 2\n- Item 3',
        ['- Item 1', '- Item 2', '- Item 3']
      );
    });

    it('should handle bullet lists with asterisks', () => {
      assertIncludes(
        '* First\n* Second\n* Third',
        ['- First', '- Second', '- Third']
      );
    });
  });

  describe('Ordered Lists', () => {
    it('should convert ordered list to numbered format', () => {
      assertIncludes(
        '1. First\n2. Second\n3. Third',
        ['+ First', '+ Second', '+ Third']
      );
    });

    it('should handle lists starting with different numbers', () => {
      assertIncludes(
        '5. Fifth item\n6. Sixth item',
        ['+ Fifth item', '+ Sixth item']
      );
    });
  });

  describe('Nested Lists', () => {
    it('should convert nested unordered list', () => {
      assertIncludes(
        '- Parent\n  - Child 1\n  - Child 2',
        ['- Parent', '- Child 1', '- Child 2']
      );
    });

    it('should convert deeply nested lists', () => {
      assertIncludes(
        '- Level 1\n  - Level 2\n    - Level 3',
        ['- Level 1', '- Level 2', '- Level 3']
      );
    });

    it('should convert mixed nested lists', () => {
      assertIncludes(
        '1. Ordered parent\n   - Unordered child\n   - Another child',
        ['+ Ordered parent', '- Unordered child', '- Another child']
      );
    });
  });
});
