# Architecture

This document explains the internal architecture of the markdown2typst.

## Overview

```
Markdown Input
    ↓
Unified/Remark Parser (AST)
    ↓
Process Frontmatter / Custom Options
    ↓
Collect Definitions & Footnotes
    ↓
Render AST to Typst (main code of this library)
    ↓
Typst Output
```

## Core Components

### 1. Parser

The converter uses the unified/remark ecosystem to parse Markdown:

- **unified**: The core processing framework
- **remark-parse**: Parses Markdown to MDAST (Markdown Abstract Syntax Tree)
- **remark-gfm**: Adds GitHub Flavored Markdown support (tables, strikethrough, code blocks...)
- **remark-math**: Adds math equation support
- **remark-frontmatter**: Parses YAML frontmatter

### 2. AST Processing

After parsing, we process the AST to:

1. **Extract Metadata**:
   - Parse YAML frontmatter for title, authors, date, language, region, description and abstract
   - Find leading H1 as potential title (metadata only in that case)
   - Merge with user-provided options and in case of conflict options override front-matter

2. **Collect Definitions**:
   - Link reference definitions: `[id]: url`
   - Footnote definitions: `[^id]: content`


### 3. Rendering
The rendering phase walks the AST and converts each node to Typst syntax:

#### Block-Level Rendering

- **Headings**: Convert `#` to `=` (Markdown → Typst)
- **Paragraphs**: Render inline content
- **Lists**: Handle ordered (`+`) and unordered (`-`) with proper nesting
- **Code Blocks**: Preserve with backtick fences and language tags
- **Tables**: Generate `#table()` with alignment
- **Blockquotes**: Use `#quote[]` function
- **Math Blocks**: Wrap in `$ ... $`

#### Inline Rendering

- **Text**: Escape special Typst characters (`#`, `*`, `_`, etc.)
- **Strong/Bold**: Use `#strong[]` function form
- **Emphasis/Italic**: Use `#emph[]` function form
- **Strikethrough**: Use `#strike[]`
- **Inline Code**: Escape backticks
- **Links**: Generate `#link(url)[label]`
- **Images**: Generate `#image(url)`
- **Math**: Wrap in `$...$`
- **Footnotes**: Inline with `#footnote[]`


## Key Design Decisions

### 1. Function Form for Formatting

We use Typst function forms (`#strong[]`, `#emph[]`) instead of markup forms (`*text*`, `_text_`):

**Advantages**:
- Unambiguous parsing (no conflicts with `*` in comments or math)
- Consistent with other Typst features
- Easier to nest and compose

**Trade-off**: Slightly more verbose output

### 2. Reference Resolution

Link and footnote references are resolved at render time:

```typescript
const definitions = collectDefinitions(tree);
const footnoteDefinitions = collectFootnotes(tree);
// Later, during rendering:
const def = definitions.get(identifier);
```

This allows reference-style links to work correctly.

### 3. Indentation Handling

All rendering functions accept an `indentLevel` parameter for proper nesting:

```typescript
function renderBlock(node, indentLevel, definitions, footnotes) {
  // Render with indentation
  return indentLines(output, indentLevel);
}
```

This ensures nested lists and blockquotes are properly formatted.

### 4. Type Safety

The codebase uses TypeScript with strict mode for maximum type safety:

- All MDAST node types are imported from `@types/mdast`
- Custom node types (math, mark, etc.) extend standard types
- Exported options are fully typed

## Extension Points

### Adding New Markdown Features

1. Add remark plugin to parser:
```typescript
const processor = unified()
  .use(remarkParse)
  .use(remarkNewFeature)
```

2. Define custom node type if needed:
```typescript
interface NewFeatureNode extends Literal {
  type: 'newFeature';
  // additional fields
}
```

3. Add rendering logic:
```typescript
function renderNewFeature(node: NewFeatureNode): string {
  // Convert to Typst
}
```

4. Update the main switch statement in `renderBlock` or `renderInline`

## Performance Considerations

### Current Performance

The converter is designed for **clarity over performance**, suitable for:
- Interactive editors (sub-second conversion for typical documents)
- Build processes (hundreds of documents per minute)
- Browser environments (client-side conversion)

### Optimization Opportunities

If performance becomes critical:

1. **Memoization**: Cache rendered subtrees
2. **Streaming**: Process large documents in chunks
3. **Worker Threads**: Parallelize conversion of multiple files
4. **AST Caching**: Cache parsed AST for unchanged documents

## Testing Strategy

Currently, the project focuses on:

1. **Manual Testing**: Example files in `examples/`
2. **Type Checking**: TypeScript used for type safety
3. **Visual Inspection**: Compare Markdown input with Typst output

### Future Testing

Recommended additions:

1. **Unit Tests**: Test individual rendering functions
2. **Integration Tests**: Full Markdown → Typst conversion
3. **Snapshot Tests**: Compare against known-good outputs
4. **Fuzz Testing**: Random/malformed input handling
5. **Users Testing**: In the work in progress demo website

## Build System

The build system uses esbuild for fast bundling:

### Output Formats

1. **dist/markdown2typst.min.js**: Production bundle (minified)
2. **dist/markdown2typst.js**: Development bundle (readable)
3. **Source maps**: For debugging bundled code

### Configuration

```javascript
{
  format: "esm",           // ES modules
  target: ["es2020"],      // Modern JavaScript
  platform: "browser",     // Browser-compatible
  bundle: true             // Single file output
}
```

## Dependencies

### Runtime Dependencies

- **unified**: Text processing framework
- **remark-parse**: Markdown parser
- **remark-gfm**: GitHub Flavored Markdown
- **remark-math**: Math equation support
- **remark-frontmatter**: YAML frontmatter parser

### Development Dependencies

- **typescript**: Type checking and definitions
- **esbuild**: Fast bundler
- **@types/mdast**: MDAST type definitions

## Future Enhancements

Potential improvements:

1. **CLI Tool**: Command-line interface for file conversion
2. **VS Code Extension**: Live preview and conversion
3. **Custom Templates**: User-provided template system
4. **Plugin System**: Allow third-party extensions
5. **Caching**: Improve performance for large documents
6. **Validation**: Verify Typst output syntax
7. **Source Maps**: Map Typst back to Markdown for errors

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on extending the codebase.
