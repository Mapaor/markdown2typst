/**
 * Main test runner for markdown2typst
 * 
 * Uses Node.js native test runner (node:test)
 * 
 * Run with: npm test
 * Or: node --test test/validate.js
 */

import { test } from 'node:test';

// Import all test files
// Unit tests
import './unit/basic-syntax.test.js';
import './unit/lists.test.js';
import './unit/links-images.test.js';
import './unit/math.test.js';
import './unit/tables.test.js';
import './unit/other-elements.test.js';
import './unit/frontmatter.test.js';
import './unit/options.test.js';
import './unit/error-handling.test.js';
import './unit/special-chars.test.js';

// Integration tests
import './integration/complex-documents.test.js';

console.log('✅ All test files loaded. Run with: node --test test/validate.js');

// Print success message at the very end if all tests pass
process.on('exit', (code) => {
  if (code === 0) {
    console.log('\n✅ ALL TESTS PASSED!\n');
  }
});
