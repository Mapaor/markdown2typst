# Tests

Tests use Node's native test runner (no dependencies needed).

## Running Tests

```bash
npm test                                    # Run all tests
node --test test/validate.js               # Same thing
node --test test/unit/basic-syntax.test.js # Run specific file
node --test --watch test/validate.js       # Watch mode (Node 19+)
```

## Structure

```
test/
├── validate.js              # Entry point
├── helpers/test-utils.js    # Test helpers
├── unit/                    # Unit tests
│   ├── basic-syntax.test.js
│   ├── lists.test.js
│   ├── links-images.test.js
│   ├── math.test.js
│   ├── tables.test.js
│   ├── other-elements.test.js
│   ├── frontmatter.test.js
│   ├── options.test.js
│   ├── error-handling.test.js
│   └── special-chars.test.js
└── integration/
    └── complex-documents.test.js
```

## Writing Tests

```javascript
import { describe, it } from 'node:test';
import { assertIncludes, assertExcludes, convert } from '../helpers/test-utils.js';

describe('My Feature', () => {
  it('converts markdown correctly', () => {
    assertIncludes('# Heading', ['= Heading']);
  });
});
```

**Test helpers:**
- `assertIncludes(markdown, expectedStrings, options)` - Check output includes strings
- `assertExcludes(markdown, notExpectedStrings, options)` - Check output excludes strings
- `convert(markdown, options)` - Get raw output for custom assertions

## Adding Tests

1. Create `test/unit/my-feature.test.js`
2. Write tests using `describe`/`it`
3. Import in `validate.js`: `import './unit/my-feature.test.js';`
4. Run `npm test`

## Why Node's Test Runner?

- Zero dependencies
- Built into Node 18+
- Fast and simple
- Native ESM support
