# Error Handling

The markdown2typst library includes comprehensive error handling with an optional error callback for logging warnings and errors during conversion.

## Overview

Errors and warnings can occur during various stages of the conversion pipeline:
- **Markdown parsing** - Malformed markdown syntax
- **Frontmatter parsing** - Invalid YAML frontmatter
- **Definition collection** - Duplicate link/image definitions
- **Footnote collection** - Duplicate footnote definitions
- **Math conversion** - LaTeX to Typst conversion failures
- **Link resolution** - Unresolved link or footnote references
- **Table rendering** - Empty or malformed tables
- **Output building** - Date parsing errors

## Error Severity Levels

The library uses two severity levels:

- **`ErrorSeverity.WARNING`** - Issues that don't prevent conversion but may affect output quality (e.g., unresolved references, math conversion fallbacks)
- **`ErrorSeverity.ERROR`** - Serious issues that may result in incorrect or incomplete output (e.g., rendering failures, parse errors)

## Error Callback

Provide an `onError` callback in the options to receive error information:

```typescript
import { markdown2typst, ErrorSeverity } from 'markdown2typst';

const typst = markdown2typst(markdown, {
  onError: (error) => {
    console.log(`[${error.severity}] ${error.context}: ${error.message}`);
  }
});
```

### Error Object Properties

Each error object contains:

- `severity` - `ErrorSeverity.ERROR` or `ErrorSeverity.WARNING`
- `message` - Human-readable error description
- `context` - Where the error occurred (e.g., 'frontmatter parsing', 'inline rendering')
- `originalError?` - Original error object if available
- `details?` - Additional context-specific information (e.g., identifiers, values)

## Usage Examples

### Basic Error Logging

```typescript
const errors = [];
const typst = markdown2typst(markdown, {
  onError: (error) => {
    errors.push(error);
  }
});

console.log(`Conversion completed with ${errors.length} issues`);
```

### Filtering by Severity

```typescript
const errors = [];
const warnings = [];

const typst = markdown2typst(markdown, {
  onError: (error) => {
    if (error.severity === ErrorSeverity.ERROR) {
      errors.push(error);
    } else {
      warnings.push(error);
    }
  }
});
```

### Custom Error Logger

```typescript
class ErrorLogger {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  log(error) {
    const entry = {
      timestamp: new Date().toISOString(),
      severity: error.severity,
      context: error.context,
      message: error.message
    };

    if (error.severity === ErrorSeverity.ERROR) {
      this.errors.push(entry);
    } else {
      this.warnings.push(entry);
    }
  }

  report() {
    console.log(`Errors: ${this.errors.length}, Warnings: ${this.warnings.length}`);
  }
}

const logger = new ErrorLogger();
const typst = markdown2typst(markdown, {
  onError: (error) => logger.log(error)
});
logger.report();
```

### Silent Mode

If no `onError` callback is provided, the library operates in silent mode with no error reporting:

```typescript
// No error reporting
const typst = markdown2typst(markdown);
```

## Common Warnings

- **Unresolved link references** - `[text][missing-ref]`
- **Unresolved footnote references** - `[^missing]`
- **Duplicate definitions** - Multiple definitions with same identifier
- **Math conversion fallbacks** - When LaTeX to Typst conversion fails, original LaTeX is used
- **Invalid frontmatter fields** - Type mismatches in YAML frontmatter
- **Empty tables** - Tables with no rows or columns
- **Date parsing failures** - Invalid date formats (falls back to 'auto')

## Best Practices

1. **Always provide an error callback in production** to catch and log issues
2. **Filter errors by severity** to handle critical errors differently from warnings
3. **Include error context** in logs to help identify the source of issues
4. **Handle fatal errors** with try-catch around `markdown2typst()` calls
5. **Review warnings** during development to improve input quality

## Error Handling Behavior

- **Non-fatal errors** return partial results (e.g., empty string for failed table rendering)
- **Fatal errors** are thrown after logging to the error callback
- **Warnings** don't stop conversion and use sensible fallbacks
- **Errors** may result in missing or incorrect output sections

See [error-handling-example.js](./error-handling-example.js) for complete examples.
