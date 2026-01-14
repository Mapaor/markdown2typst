/**
 * Output building pipeline stage
 * @module output-builder
 */

import type { Root, Content } from 'mdast';
import type { DocumentMetadata, RenderContext } from './types.js';
import { renderBlock } from './block-renderer.js';
import { isNonEmpty, normalizeText, renderTypstArray, escapeTypstString } from './utils.js';
import { parseDate } from './frontmatter.js';
import { ErrorSeverity } from './types.js';

/**
 * Build the warnings section with custom functions for conversion issues.
 * 
 * @param context - Rendering context with warnings tracking
 * @returns Warnings section as string, or null if no warnings
 */
function buildWarningsSection(context: RenderContext): string | null {
	const { warnings } = context;
	const sections: string[] = [];

	// Add header if any warnings exist
	const hasWarnings = warnings.externalImages;
	if (!hasWarnings) return null;

	sections.push('// ========================= WARNINGS =========================');
	sections.push('');
	sections.push('// ------------------------------------------------------------');
	sections.push('// NOTE: The conversion did not work perfectly due to intrinsic');
	sections.push('// Markdown to Typst limitations. The following custom');
	sections.push('// functions, set or show rules are used to visually display');
	sections.push('// these minor conversion warnings to the user.');
	sections.push('// ------------------------------------------------------------');
	sections.push('');

	// Add external images function if needed
	if (warnings.externalImages) {
		sections.push('// EXTERNAL IMAGES WERE DETECTED!');
		sections.push('#let external-image(url) = {');
		sections.push('  rect(radius: 4pt, inset: 20pt,)[');
		sections.push('    #align(center)[');
		sections.push('      #text()[');
		sections.push('        External image detected: \\');
		sections.push('        #link(url)');
		sections.push('      ]');
		sections.push('    ]');
		sections.push('  ]');
		sections.push('}');
		sections.push('');
	}

	sections.push('// ============================================================');

	return sections.join('\n');
}

/**
 * Build the final Typst document output.
 * Combines metadata, frontmatter, and rendered body content.
 * 
 * @param tree - The parsed MDAST tree
 * @param metadata - Merged document metadata
 * @param leadingTitleIndex - Index of leading H1 (to skip in body), or null
 * @param context - Rendering context with definitions and footnotes
 * @returns Complete Typst document as string
 */
export function buildOutput(
	tree: Root,
	metadata: DocumentMetadata,
	leadingTitleIndex: number | null,
	context: RenderContext
): string {
	try {
		const { title, authors, description, keywords, date, abstract, lang, region } = metadata;

		// Filter out leading title if it matches the metadata title
		const nodesForBody =
			leadingTitleIndex !== null && normalizeText(title) !== ''
				? tree.children.filter((_, index) => index !== leadingTitleIndex)
				: tree.children;

		// Render body content
		const body = nodesForBody
			.map((node) => renderBlock(node, 0, context))
			.filter(isNonEmpty)
			.join('\n\n');

		// Build document metadata and configuration
		const parts: string[] = [];

		// Set document metadata if any metadata is available
		const hasMetadata = title || authors.length > 0 || description || date || (keywords && keywords.length > 0);
		if (hasMetadata) {
			try {
				parts.push('// ===============  FRONTMATTER  ===============');
				parts.push('');
				const docArgs: string[] = [];
				
				if (title) docArgs.push(`title: [${title}]`);
				
				if (authors.length > 0) {
					docArgs.push(`author: ${renderTypstArray(authors.map(a => `"${escapeTypstString(a)}"`))}`)
				}
				
				if (description) docArgs.push(`description: [${description}]`);
				
				if (keywords && keywords.length > 0) {
					docArgs.push(`keywords: ${renderTypstArray(keywords.map(k => `"${escapeTypstString(k)}"`))}`)
				}
				
				if (date) {
					try {
						const dateTypst = parseDate(date);
						docArgs.push(`date: ${dateTypst}`);
					} catch (error) {
						const errorMessage = error instanceof Error ? error.message : String(error);
						if (context.onError) {
							context.onError({
								severity: ErrorSeverity.WARNING,
								message: `Failed to parse date "${date}": ${errorMessage}`,
								context: 'output building',
								originalError: error
							});
						}
						// Use 'auto' as fallback
						docArgs.push(`date: auto`);
					}
				}
				
				parts.push(`#set document(`);
				for (let i = 0; i < docArgs.length; i++) {
					const isLast = i === docArgs.length - 1;
					parts.push(`  ${docArgs[i]}${isLast ? '' : ','}`);
				}
				parts.push(`)`);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				if (context.onError) {
					context.onError({
						severity: ErrorSeverity.ERROR,
						message: `Error building document metadata: ${errorMessage}`,
						context: 'output building',
						originalError: error
					});
				}
				// Continue without metadata
			}
		}

		// Add abstract variable if present
		if (abstract) {
			if (parts.length > 0) parts.push('');
			parts.push(`#let abstract = [${abstract}]`);
		}

		// Add title page if we have title or authors
		if ((title || authors.length > 0 || date || abstract) && hasMetadata) {
			parts.push('');
			const centerLines: string[] = [];
			
			if (title) {
				centerLines.push(`#title() \\ \\`);
			}
			
			if (authors.length > 0) {
				centerLines.push(`#context document.author.join(", ", last: " & ") \\ \\`);
			}
			
			if (date) {
				centerLines.push(`#context document.date.display() \\ \\ `);
			}
			
			if (abstract) {
				centerLines.push(`\\ *Abstract* \\`);
				centerLines.push(`#abstract`);
			}
			
			parts.push(`#align(center)[`);
			parts.push(`  ${centerLines.join(' ')}`);
			parts.push(`]`);
		}

		// Set text language and region if specified
		if (lang || region) {
			if (parts.length > 0) parts.push('');
			const textArgs: string[] = [];
			if (lang) textArgs.push(`lang: "${lang}"`);
			if (region) textArgs.push(`region: "${region}"`);
			parts.push(`#set text(${textArgs.join(', ')})`);
		}

		// Add closing comment for frontmatter section
		if (hasMetadata) {
			parts.push('');
			parts.push('//  ============================================');
		}

		// Add warnings section if any warnings were detected
		const warningsSection = buildWarningsSection(context);
		if (warningsSection) {
			parts.push('');
			parts.push(warningsSection);
		}

		// Add body content
		if (parts.length > 0 && body) {
			parts.push('');
		}
		if (body) {
			parts.push(body);
		}

		// Return body only if no metadata was set
		return parts.length > 0 ? parts.join('\n') : body;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (context.onError) {
			context.onError({
				severity: ErrorSeverity.ERROR,
				message: `Fatal error building output: ${errorMessage}`,
				context: 'output building',
				originalError: error
			});
		}
		// Rethrow fatal errors
		throw error;
	}
}
