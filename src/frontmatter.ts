/**
 * Frontmatter parsing and custom options metadata handling pipeline stage
 * @module frontmatter
 */

import { load as parseYaml } from 'js-yaml';
import type { Root, Yaml } from 'mdast';
import type { Frontmatter, Markdown2TypstOptions, DocumentMetadata, ErrorCallback } from './types.js';
import { ErrorSeverity } from './types.js';
import { coerceLanguage, coerceRegion } from './utils.js';

/**
 * Parse YAML frontmatter from the document.
 * Supports title, authors (single or array), and language fields.
 * 
 * @param root - The root node of the MDAST tree
 * @param onError - Optional error callback for logging parse issues
 * @returns Parsed frontmatter metadata
 */
export function parseFrontmatter(root: Root, onError?: ErrorCallback): Frontmatter {
	const yamlNode = root.children.find((node) => node.type === 'yaml') as Yaml | undefined;
	if (!yamlNode?.value) return {};
	return parseFrontmatterYaml(yamlNode.value, onError);
}

/**
 * Parse YAML frontmatter string into structured metadata.
 * Handles standard Markdown/Pandoc frontmatter fields using js-yaml.
 * 
 * @param yaml - Raw YAML string from frontmatter
 * @param onError - Optional error callback for logging parse issues
 * @returns Parsed frontmatter object
 */
function parseFrontmatterYaml(yaml: string, onError?: ErrorCallback): Frontmatter {
	try {
		const parsed = parseYaml(yaml) as Record<string, any>;
		if (!parsed || typeof parsed !== 'object') {
			if (onError) {
				onError({
					severity: ErrorSeverity.WARNING,
					message: 'YAML frontmatter is empty or not an object',
					context: 'frontmatter parsing'
				});
			}
			return {};
		}

		const result: Frontmatter = {};

		// Extract and normalize all supported fields
		if ('title' in parsed && typeof parsed.title === 'string') {
			result.title = parsed.title;
		}

		// Handle author field (can be string or array)
		if ('author' in parsed) {
			if (typeof parsed.author === 'string') {
				result.author = parsed.author;
			} else if (Array.isArray(parsed.author)) {
				result.author = parsed.author.filter(a => typeof a === 'string');
			} else if (onError) {
				onError({
					severity: ErrorSeverity.WARNING,
					message: 'Frontmatter "author" field must be a string or array of strings',
					context: 'frontmatter parsing',
					details: { fieldType: typeof parsed.author }
				});
			}
		}

		// Handle authors field (array)
		if ('authors' in parsed && Array.isArray(parsed.authors)) {
			result.authors = parsed.authors.filter(a => typeof a === 'string');
		}

		// Description
		if ('description' in parsed && typeof parsed.description === 'string') {
			result.description = parsed.description;
		}

		// Keywords (array)
		if ('keywords' in parsed && Array.isArray(parsed.keywords)) {
			result.keywords = parsed.keywords.filter(k => typeof k === 'string');
		}

		// Date (string or Date object)
		if ('date' in parsed) {
			if (typeof parsed.date === 'string') {
				result.date = parsed.date;
			} else if (parsed.date instanceof Date) {
				result.date = parsed.date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
			}
		}

		// Abstract
		if ('abstract' in parsed && typeof parsed.abstract === 'string') {
			result.abstract = parsed.abstract;
		}

		// Language (lang or language)
		if ('lang' in parsed && typeof parsed.lang === 'string') {
			result.lang = parsed.lang;
		}
		if ('language' in parsed && typeof parsed.language === 'string') {
			result.language = parsed.language;
		}

		// Region
		if ('region' in parsed && typeof parsed.region === 'string') {
			result.region = parsed.region;
		}

		return result;
	} catch (error) {
		// If YAML parsing fails, return empty frontmatter
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (onError) {
			onError({
				severity: ErrorSeverity.WARNING,
				message: `Failed to parse YAML frontmatter: ${errorMessage}`,
				context: 'frontmatter parsing',
				originalError: error
			});
		}
		return {};
	}
}

/**
 * Parse date string into Typst date format.
 * Supports 'auto', 'none', and ISO date formats (YYYY-MM-DD).
 * 
 * @param value - Date string from frontmatter
 * @returns Typst date expression
 */
export function parseDate(value: string): string {
	const v = value.trim().toLowerCase();
	
	// Handle special values
	if (v === 'auto') return 'auto';
	if (v === 'none') return 'none';
	
	// Try to parse ISO date format (YYYY-MM-DD)
	const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value.trim());
	if (isoMatch) {
		const year = parseInt(isoMatch[1], 10);
		const month = parseInt(isoMatch[2], 10);
		const day = parseInt(isoMatch[3], 10);
		return `datetime(day: ${day}, month: ${month}, year: ${year})`;
	}
	
	// Default to auto if we can't parse the date
	return 'auto';
}

/**
 * Merge options with frontmatter to create final document metadata.
 * Options take precedence over frontmatter values.
 * 
 * @param options - User-provided options
 * @param frontmatter - Parsed frontmatter
 * @param leadingTitle - Title from leading H1, if any
 * @returns Merged document metadata
 */
export function mergeMetadata(
	options: Markdown2TypstOptions,
	frontmatter: Frontmatter,
	leadingTitle: string | null
): DocumentMetadata {
	const title = options.title ?? frontmatter.title ?? leadingTitle ?? '';
	
	// Normalize authors from options and frontmatter (all optional)
	const optionsAuthors = options.authors ?? 
		(typeof options.author === 'string' ? [options.author] : options.author) ?? [];
	const frontmatterAuthors = frontmatter.authors ?? 
		(typeof frontmatter.author === 'string' ? [frontmatter.author] : frontmatter.author) ?? [];
	const authors = optionsAuthors.length > 0 ? optionsAuthors : frontmatterAuthors;
	
	// Use options as overrides for all other fields
	const lang = coerceLanguage(options.lang ?? options.language ?? frontmatter.lang ?? frontmatter.language);
	const region = coerceRegion(options.region ?? frontmatter.region);
	const date = options.date ?? frontmatter.date;
	const description = options.description ?? frontmatter.description;
	const keywords = options.keywords ?? frontmatter.keywords;
	const abstract = options.abstract ?? frontmatter.abstract;

	return {
		title,
		authors,
		description,
		keywords,
		date,
		abstract,
		lang,
		region
	};
}
