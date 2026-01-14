/**
 * Definition and footnote collection pipeline stage
 * @module collectors
 */

import type { Root, Definition, FootnoteDefinition, Heading } from 'mdast';
import { plainTextFromPhrasing, normalizeText } from './utils.js';
import type { ErrorCallback } from './types.js';
import { ErrorSeverity } from './types.js';

/**
 * Collect all link and image reference definitions from the Markdown AST.
 * These are used to resolve reference-style links like [text][id].
 * 
 * @param root - The root node of the MDAST tree
 * @param onError - Optional error callback for logging collection issues
 * @returns Map of identifier to Definition node
 */
export function collectDefinitions(root: Root, onError?: ErrorCallback): Map<string, Definition> {
	const definitions = new Map<string, Definition>();
	try {
		for (const node of root.children) {
			if (node.type !== 'definition') continue;
			const def = node as Definition;
			const identifier = def.identifier.toLowerCase();
			
			// Warn if duplicate definition found
			if (definitions.has(identifier)) {
				if (onError) {
					onError({
						severity: ErrorSeverity.WARNING,
						message: `Duplicate link/image definition found: [${def.identifier}]`,
						context: 'definition collection',
						details: { identifier: def.identifier, url: def.url }
					});
				}
			}
			
			definitions.set(identifier, def);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (onError) {
			onError({
				severity: ErrorSeverity.ERROR,
				message: `Error collecting definitions: ${errorMessage}`,
				context: 'definition collection',
				originalError: error
			});
		}
		// Don't throw - return partial results
	}
	return definitions;
}

/**
 * Collect all footnote definitions from the Markdown AST.
 * These are rendered inline when referenced in the text.
 * 
 * @param root - The root node of the MDAST tree
 * @param onError - Optional error callback for logging collection issues
 * @returns Map of identifier to FootnoteDefinition node
 */
export function collectFootnotes(root: Root, onError?: ErrorCallback): Map<string, FootnoteDefinition> {
	const definitions = new Map<string, FootnoteDefinition>();
	try {
		for (const node of root.children) {
			if (node.type !== 'footnoteDefinition') continue;
			const def = node as FootnoteDefinition;
			const identifier = def.identifier.toLowerCase();
			
			// Warn if duplicate footnote found
			if (definitions.has(identifier)) {
				if (onError) {
					onError({
						severity: ErrorSeverity.WARNING,
						message: `Duplicate footnote definition found: [^${def.identifier}]`,
						context: 'footnote collection',
						details: { identifier: def.identifier }
					});
				}
			}
			
			definitions.set(identifier, def);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (onError) {
			onError({
				severity: ErrorSeverity.ERROR,
				message: `Error collecting footnotes: ${errorMessage}`,
				context: 'footnote collection',
				originalError: error
			});
		}
		// Don't throw - return partial results
	}
	return definitions;
}

/**
 * Find the first H1 heading in the document (ignoring frontmatter).
 * Used to extract document title when useH1AsTitle option is enabled.
 * 
 * @param root - The root node of the MDAST tree
 * @param definitions - Map of link reference definitions
 * @param onError - Optional error callback for logging extraction issues
 * @returns Title text and node index, or null if no H1 found
 */
export function findLeadingH1(
	root: Root,
	definitions: Map<string, Definition>,
	onError?: ErrorCallback
): { title: string; index: number } | null {
	try {
		for (let i = 0; i < root.children.length; i++) {
			const node = root.children[i];
			if (node.type === 'yaml' || node.type === 'definition') continue;
			if (node.type !== 'heading') return null;
			const heading = node as Heading;
			if (heading.depth !== 1) return null;
			const title = plainTextFromPhrasing(heading.children, definitions).trim();
			return title ? { title, index: i } : null;
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (onError) {
			onError({
				severity: ErrorSeverity.WARNING,
				message: `Error extracting leading H1 title: ${errorMessage}`,
				context: 'title extraction',
				originalError: error
			});
		}
		// Return null on error
	}
	return null;
}
