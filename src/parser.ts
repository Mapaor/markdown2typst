/**
 * Markdown parsing pipeline stage
 * @module parser
 */

import { unified } from 'unified';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import { remarkFixAdjacentMath } from './remark-fix-math.js';
import type { Root } from 'mdast';
import type { ErrorCallback } from './types.js';
import { ErrorSeverity } from './types.js';

/**
 * Parse Markdown text into an MDAST tree.
 * 
 * This is the first stage of the conversion pipeline. It uses remark plugins to:
 * - Parse basic Markdown syntax
 * - Extract YAML frontmatter
 * - Support GitHub Flavored Markdown (tables, strikethrough, etc.)
 * - Parse LaTeX math equations
 * 
 * @param markdown - The Markdown text to parse
 * @param onError - Optional error callback for logging parse issues
 * @returns The parsed MDAST tree
 */
export function parseMarkdown(markdown: string, onError?: ErrorCallback): Root {
	try {
		// remark-math requires a blank line before display math. Accept a
		// standalone $$ block immediately after a paragraph as well.
		const normalizedMarkdown = markdown.replace(
			/([^\n])\n(\$\$)/g,
			'$1\n\n$2'
		);
		const processor = unified()
			.use(remarkParse)
			.use(remarkFrontmatter, ['yaml'])
			.use(remarkGfm, { singleTilde: false })
			.use(remarkMath)
			.use(remarkFixAdjacentMath);

		const parsedTree = processor.parse(normalizedMarkdown);
		const tree = processor.runSync(parsedTree) as Root;
		
		return tree;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (onError) {
			onError({
				severity: ErrorSeverity.ERROR,
				message: `Failed to parse Markdown: ${errorMessage}`,
				context: 'markdown parsing',
				originalError: error
			});
		}
		// Rethrow the error after logging
		throw error;
	}
}
