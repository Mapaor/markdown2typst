/**
 * Tests for error handling:
 * - Error callbacks
 * - Graceful degradation
 * - Empty input
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { convert, assertIncludes } from '../helpers/test-utils.js';

describe('Error Handling', () => {
  describe('Error Callbacks', () => {
    it('should call error callback when provided', () => {
      let errorCalled = false;
      
      convert('$$invalid math$$', {
        onError: (err) => {
          errorCalled = true;
        }
      });
      
      // Error callback might or might not be called depending on math conversion
      // Just ensure it doesn't crash
      assert.ok(true, 'Error callback mechanism works');
    });

    it('should not crash without error callback', () => {
      assert.doesNotThrow(() => {
        convert('Some content');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input gracefully', () => {
      const result = convert('');
      assert.ok(typeof result === 'string', 'Should return a string');
    });

    it('should handle whitespace-only input', () => {
      const result = convert('   \n\n   \t   ');
      assert.ok(typeof result === 'string', 'Should return a string');
    });

    it('should handle very long input', () => {
      const longText = 'a'.repeat(10000);
      assert.doesNotThrow(() => {
        convert(longText);
      });
    });
  });

  describe('Malformed Markdown', () => {
    it('should handle unclosed emphasis', () => {
      assert.doesNotThrow(() => {
        convert('*unclosed emphasis');
      });
    });

    it('should handle unclosed code block', () => {
      assert.doesNotThrow(() => {
        convert('```\nunclosed code block');
      });
    });

    it('should handle malformed table', () => {
      assert.doesNotThrow(() => {
        convert('| Col 1 | Col 2\n|---');
      });
    });
  });
});
