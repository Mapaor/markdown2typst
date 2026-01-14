# Architecture

## Overview
Here is an overview of the phases the library has when processing Markdown code to Typst code.

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
- **remark-frontmatter (and js-yaml)**: Parses YAML frontmatter

### 2. AST Processing

After parsing, we process the AST to:

1. **Extract Metadata**:
   - Parse YAML frontmatter for title, authors, date, language, region, description and abstract
   - Find leading H1 as potential title
   - Merge with custom options if provided and in case of conflict options override front-matter

2. **Collect Definitions**:
   - Link reference definitions: `[id]: url`
   - Footnote definitions: `[^id]: content`


### 3. Rendering
The rendering phase iterates the AST and converts each node to Typst syntax:

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


### Note on indentation handling

All rendering functions accept an `indentLevel` parameter for proper nesting:

```typescript
function renderBlock(node, indentLevel, definitions, footnotes) {
  // Render with indentation
  return indentLines(output, indentLevel);
}
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on extending the code.


### How to add new Markdown features

Here are some hints:

1. Add remark plugin to parser:
```typescript
const processor = unified()
  .use(remarkParse)
  .use(remarkNewFeature)
```

1. Define custom node type if needed:
```typescript
interface NewFeatureNode extends Literal {
  type: 'newFeature';
  // additional fields
}
```

1. Add rendering logic:
```typescript
function renderNewFeature(node: NewFeatureNode): string {
  // Convert to Typst
}
```

1. Update the main switch statement in `renderBlock` or `renderInline`
