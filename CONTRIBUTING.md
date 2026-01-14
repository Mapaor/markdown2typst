# Contributing to markdown2typst

Thank you for considering contributing to markdown2typst! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, constructive, and professional in all interactions.

## How Can I Contribute?

### Reporting Bugs

No specific requirements for submitting an issue. As this project is very  new, all issues are welcome, with no standardized format.

But to be as helpful as possible, provide all the necessary information to reproduce the issue you're getting. So please add some code samples or a screenshot. 

### Suggesting Features

Feature suggestions are welcome! Anything you think could me improved say it!

### Pull Requests

All pull requests will be carefully reviewed and  tested but please do not hesitate to make one!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/markdown2typst.git
cd markdown2typst

# Install dependencies
npm install

# Build the project
npm run build

# Run type checking
npm run typecheck

# Or...
npx tsc --noEmit
```

## Guidelines

### Contributing guidelines

- Use TypeScript and prefer explicit types over `any`
- Follow existing 2-space indentation
- Add JSDoc comments for public functions
- Use meaningful variable and function names
- Provide usage examples if you add a new feature

#### Example:

```typescript
/**
 * Convert Markdown text to Typst markup.
 * 
 * @param markdown - The Markdown text to convert
 * @param options - Optional configuration for the conversion
 * @returns The converted Typst markup as a string
 * 
 * @example
 * ```typescript
 * const typst = markdown2typst('# Hello\n\nThis is **bold**.');
 * ```
 */
export function markdown2typst(markdown: string, options?: Options): string {
  // Implementation
}
```

### Testing guidelines
When adding new features:

  - Test with various Markdown inputs
  - Verify Typst output is syntactically correct
  -  Check edge cases (empty strings, special characters, etc.)

### Documentation guidelines
If you add a new features or make important changes to the code

1. Update the main README.md documenting it
2. If possible add examples to the `examples/` directory

## Questions?

Feel free to open an issue with your question or reach out to pardo.marti@gmail.com.

