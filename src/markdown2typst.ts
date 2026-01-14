/**
 * markdown2typst - Convert Markdown to Typst
 * 
 * A comprehensive library for converting Markdown documents to Typst markup language.
 * Supports GitHub Flavored Markdown, math equations, tables, footnotes, and more
 * 
 * This code is inspired by the original work of zhaoyiqun (Creator of MDXport; 'cosformula' on GitHub).
 * Refactored, documented, modified and extended by Mapaor.
 * 
 * @module markdown2typst
 * @license MIT
 */

import { ErrorSeverity, type Markdown2TypstOptions } from './types.js';
import { parseMarkdown } from './parser.js';
import { collectDefinitions, collectFootnotes, findLeadingH1 } from './collectors.js';
import { parseFrontmatter, mergeMetadata } from './frontmatter.js';
import { buildOutput } from './output-builder.js';

// Re-export types for public API
export type { Markdown2TypstOptions, ConversionError, ErrorCallback } from './types.js';
export { ErrorSeverity } from './types.js';

/**
 * Convert Markdown text to Typst markup.
 * 
 * This is the main entry point for the library. It parses the Markdown using remark,
 * processes frontmatter and metadata, and converts the AST to Typst syntax.
 * 
 * The conversion pipeline consists of several stages:
 * 1. Parse Markdown into an AST (Abstract Syntax Tree)
 * 2. Collect link/image definitions and footnotes
 * 3. Parse YAML frontmatter and merge with options
 * 4. Render AST nodes to Typst markup
 * 5. Build final output with metadata and body
 * 
 * @param markdown - The Markdown text to convert
 * @param options - Optional configuration for the conversion
 * @returns The converted Typst markup as a string
 * 
 * @example
 * ```typescript
 * const typst = markdown2typst('# Hello\n\nThis is **bold**.');
 * console.log(typst);
 * ```
 * 
 * @example
 * ```typescript
 * const typst = markdown2typst(markdown, {
 *   title: 'My Document',
 *   authors: ['John Doe'],
 *   lang: 'en'
 * });
 * ```
 */
export function markdown2typst(markdown: string, options: Markdown2TypstOptions = {}): string {
	try {
		// Stage 1: Parse Markdown into AST
		const tree = parseMarkdown(markdown, options.onError);

		// Stage 2: Collect definitions and footnotes from the AST
		const definitions = collectDefinitions(tree, options.onError);
		const footnoteDefinitions = collectFootnotes(tree, options.onError);

		// Stage 3: Parse frontmatter and extract leading title (if enabled)
		const frontmatter = parseFrontmatter(tree, options.onError);
		const leadingH1 = options.useH1AsTitle
			? findLeadingH1(tree, definitions, options.onError)
			: null;

		// Stage 4: Merge metadata from options, frontmatter, and leading H1
		const metadata = mergeMetadata(options, frontmatter, leadingH1?.title ?? null);

		// Stage 5: Build final Typst output
		const context = {
			definitions,
			footnoteDefinitions,
			onError: options.onError,
			warnings: { externalImages: false }
		};
		return buildOutput(tree, metadata, leadingH1?.index ?? null, context);
	} catch (error) {
		// Handle unexpected fatal errors
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (options.onError) {
			options.onError({
				severity: ErrorSeverity.ERROR,
				message: `Fatal error during conversion: ${errorMessage}`,
				context: 'markdown2typst',
				originalError: error
			});
		}
		// Rethrow fatal errors after logging
		throw error;
	}
}

// Export as default for convenience (allows: import markdown2typst from 'markdown2typst')
export default markdown2typst;
