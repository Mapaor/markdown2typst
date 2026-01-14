---
title: API Reference Documentation
authors:
  - Development Team
date: 2026-01-14
description: Complete technical documentation for the markdown2typst API
keywords:
  - API
  - documentation
  - markdown
  - typst
  - converter
lang: en
---

# markdown2typst API Reference

Version 1.0.0 | Last Updated: January 14, 2026

## Overview

`markdown2typst` is a comprehensive library for converting Markdown documents to Typst markup language. It supports GitHub Flavored Markdown (GFM), math equations, tables, footnotes, and extensive metadata handling.

## Installation

```bash
npm install markdown2typst
```

## Quick Start

```javascript
import { markdown2typst } from 'markdown2typst';

const markdown = '# Hello\n\nThis is **bold**.';
const typst = markdown2typst(markdown);
console.log(typst);
```

## API Reference

### Main Function

#### `markdown2typst(markdown, options?)`

Converts Markdown text to Typst markup.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `markdown` | `string` | Yes | The Markdown text to convert |
| `options` | `Markdown2TypstOptions` | No | Configuration options |

**Returns:** `string` - The converted Typst markup

**Example:**

```javascript
const typst = markdown2typst(markdown, {
  title: 'My Document',
  authors: ['John Doe'],
  lang: 'en'
});
```

### Options Interface

#### `Markdown2TypstOptions`

Configuration object for customizing the conversion process.

**Properties:**

```typescript
interface Markdown2TypstOptions {
  // Document metadata
  title?: string;
  authors?: string | string[];
  date?: string;
  description?: string;
  abstract?: string;
  keywords?: string[];
  
  // Localization
  lang?: string;
  region?: string;
  
  // Error handling
  onError?: ErrorCallback;
}
```

**Metadata Fields:**

- **title** (`string`): Document title
  - Default: Extracted from first H1 heading or frontmatter
  - Example: `"Research Paper"`

- **authors** (`string | string[]`): Document author(s)
  - Accepts single string or array of strings
  - Example: `["Alice", "Bob"]` or `"Alice"`

- **date** (`string`): Publication or creation date
  - Format: ISO 8601 recommended (YYYY-MM-DD)
  - Example: `"2026-01-14"`

- **description** (`string`): Brief document description
  - Used for metadata purposes
  - Example: `"Technical documentation for API v1.0"`

- **abstract** (`string`): Document abstract or summary
  - Typically used in academic papers
  - Supports multiline text

- **keywords** (`string[]`): List of keywords or tags
  - Example: `["markdown", "typst", "conversion"]`

**Localization:**

- **lang** (`string`): ISO 639-1 language code
  - Example: `"en"`, `"es"`, `"de"`, `"fr"`, `"zh"`

- **region** (`string`): ISO 3166-1 alpha-2 region code
  - Example: `"us"`, `"gb"`, `"cn"`

**Error Handling:**

- **onError** (`ErrorCallback`): Callback function for handling errors
  - See [Error Handling](#error-handling) section

### Error Handling

#### `ErrorCallback`

Function signature for error handling:

```typescript
type ErrorCallback = (error: ConversionError) => void;
```

#### `ConversionError`

Error object passed to the error callback:

```typescript
interface ConversionError {
  severity: ErrorSeverity;
  message: string;
  context: string;
  details?: any;
  originalError?: Error;
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `severity` | `ErrorSeverity` | Error severity level |
| `message` | `string` | Human-readable error message |
| `context` | `string` | Context where error occurred |
| `details` | `any` | Optional additional details |
| `originalError` | `Error` | Original error object if available |

#### `ErrorSeverity`

Enumeration of error severity levels:

```typescript
enum ErrorSeverity {
  WARNING = 'warning',  // Non-critical issues
  ERROR = 'error'       // Critical issues
}
```

**Usage Example:**

```javascript
import { markdown2typst, ErrorSeverity } from 'markdown2typst';

const errors = [];

markdown2typst(markdown, {
  onError: (error) => {
    errors.push(error);
    
    if (error.severity === ErrorSeverity.ERROR) {
      console.error(`Error in ${error.context}: ${error.message}`);
    } else {
      console.warn(`Warning in ${error.context}: ${error.message}`);
    }
  }
});
```

## Supported Markdown Features

### Basic Syntax

- **Headings**: `#` through `######`
- **Emphasis**: `*italic*`, `**bold**`, `***both***`
- **Strikethrough**: `~~text~~`
- **Lists**: Ordered and unordered, with nesting
- **Links**: Inline and reference-style
- **Images**: Inline and reference-style
- **Code**: Inline and fenced blocks with syntax highlighting
- **Blockquotes**: Single and nested
- **Horizontal Rules**: `---`, `***`, `___`

### Extended Syntax (GFM)

- **Tables**: With column alignment
- **Task Lists**: `- [ ]` and `- [x]`
- **Strikethrough**: `~~text~~`
- **Automatic URL Linking**: Raw URLs converted to links

### Advanced Features

- **Math Equations**: Inline `$...$` and block `$$...$$` using LaTeX syntax
- **Footnotes**: `[^identifier]` with definitions
- **YAML Frontmatter**: Metadata block at document start
- **Reference Links**: `[text][ref]` with `[ref]: url` definitions

## YAML Frontmatter

Documents can include YAML frontmatter for metadata:

```yaml
---
title: Document Title
authors:
  - Author One
  - Author Two
date: 2026-01-14
abstract: Document abstract goes here
keywords:
  - keyword1
  - keyword2
lang: en
---
```

**Precedence:** Options passed to `markdown2typst()` override frontmatter values.

## Return Format

The function returns a string containing Typst markup. The structure is:

1. **Metadata declarations** (if provided)
2. **Document body** converted from Markdown
3. **Footnote definitions** (if any)

## Error Handling Strategy

The library uses a non-throwing error handling approach:

1. **Warnings**: Non-critical issues (missing references, etc.)
   - Conversion continues
   - Partial output may be affected

2. **Errors**: Critical issues (invalid syntax, etc.)
   - Conversion continues with best effort
   - Output may be incomplete

3. **Fatal Errors**: Exceptional cases
   - Conversion fails and throws exception
   - Usually indicates programming errors

**Best Practice:**

Always implement an error callback in production:

```javascript
const logger = new ErrorLogger();

markdown2typst(markdown, {
  onError: (error) => logger.log(error)
});

if (logger.hasErrors()) {
  // Handle errors appropriately
}
```

## Performance Considerations

- **Memory**: Processes entire document in memory
- **Speed**: Typically < 100ms for documents < 1MB
- **Concurrency**: Thread-safe, can be used in parallel

**Optimization Tips:**

1. Reuse options objects for batch processing
2. Process files in parallel when converting multiple documents
3. Consider streaming for very large files (> 10MB)

## Browser Support

The library can be used in browsers when bundled appropriately:

```html
<script type="module">
  import { markdown2typst } from './dist/markdown2typst.min.js';
  
  const markdown = '# Hello\n\nBrowser test!';
  const typst = markdown2typst(markdown);
  console.log(typst);
</script>
```

**Requirements:**
- ES6 module support
- Modern browser (Chrome 61+, Firefox 60+, Safari 11+, Edge 79+)

## TypeScript Support

The library includes full TypeScript definitions:

```typescript
import { 
  markdown2typst, 
  Markdown2TypstOptions,
  ConversionError,
  ErrorSeverity 
} from 'markdown2typst';

const options: Markdown2TypstOptions = {
  title: 'Type-Safe Document',
  authors: ['TypeScript User'],
  onError: (error: ConversionError) => {
    console.log(error.message);
  }
};

const result: string = markdown2typst('# Title', options);
```

## Examples

See the `examples/` directory for comprehensive usage examples:

- **Getting Started**: Basic usage and common patterns
- **Features**: Individual feature demonstrations
- **Advanced**: Custom configurations and workflows
- **Use Cases**: Real-world application examples

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: [GitHub Issues](https://github.com/username/markdown2typst/issues)
- **Documentation**: [GitHub Wiki](https://github.com/username/markdown2typst/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/username/markdown2typst/discussions)
