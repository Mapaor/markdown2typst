/**
 * Utility functions for text processing and formatting
 * @module utils
 */

import langs from 'langs';
import { getCode, getCodes } from 'country-list';
import type { Definition, PhrasingContent, Text, InlineCode, Strong, Link, LinkReference } from 'mdast';

/**
 * Escape special characters in Typst text content.
 * Escapes characters that have special meaning in Typst markup.
 * 
 * @param input - Raw text string
 * @returns Escaped text safe for Typst
 */
export function escapeTypstText(input: string): string {
	try {
		return input.replace(/[\\#*_`\[\]\$<>@]/g, (c) => `\\${c}`);
	} catch (error) {
		// Fallback: return original string if escaping fails
		return input;
	}
}

/**
 * Escape special characters in Typst string literals.
 * Used for strings within quotes (URLs, titles, etc.).
 * 
 * @param input - Raw string
 * @returns Escaped string safe for Typst string literals
 */
export function escapeTypstString(input: string): string {
	try {
		return input.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
	} catch (error) {
		// Fallback: return original string if escaping fails
		return input;
	}
}

/**
 * Indent all lines of text by a given level.
 * Each indent level adds 2 spaces.
 * 
 * @param text - Text to indent
 * @param indentLevel - Number of indent levels (0 = no indent)
 * @returns Indented text
 */
export function indentLines(text: string, indentLevel: number): string {
	if (!indentLevel) return text;
	const indent = '  '.repeat(indentLevel);
	return text
		.split('\n')
		.map((line) => `${indent}${line}`)
		.join('\n');
}

/**
 * Type guard to check if a value is a non-empty string.
 * Useful for filtering arrays.
 * 
 * @param value - Value to check
 * @returns True if value is a non-empty string
 */
export function isNonEmpty(value: string | null | undefined): value is string {
	return typeof value === 'string' && value.length > 0;
}

/**
 * Normalize text by trimming whitespace.
 * 
 * @param value - Text to normalize
 * @returns Trimmed text
 */
export function normalizeText(value: string | null): string {
	return (value ?? '').trim();
}

/**
 * Extract plain text content from phrasing nodes (inline content).
 * Strips all formatting and extracts text only.
 * 
 * @param nodes - Array of phrasing content nodes
 * @param definitions - Map of link reference definitions
 * @returns Plain text string
 */
export function plainTextFromPhrasing(nodes: PhrasingContent[], definitions: Map<string, Definition>): string {
	return nodes.map((node) => plainTextFromPhrasingNode(node, definitions)).join('');
}

function plainTextFromPhrasingNode(node: PhrasingContent, definitions: Map<string, Definition>): string {
	switch (node.type) {
		case 'text':
			return (node as Text).value;
		case 'strong':
		case 'emphasis':
			return plainTextFromPhrasing((node as Strong).children, definitions);
		case 'inlineCode':
			return (node as InlineCode).value;
		case 'link':
			return plainTextFromPhrasing((node as Link).children, definitions);
		case 'linkReference': {
			const lr = node as LinkReference;
			const label = plainTextFromPhrasing(lr.children, definitions);
			if (label.trim()) return label;
			const def = definitions.get(lr.identifier.toLowerCase());
			return def ? def.url : lr.label || lr.identifier;
		}
		case 'break':
			return '\n';
		default:
			return '';
	}
}

/**
 * Render a Typst-style tuple array.
 * Ensures proper syntax for single-element arrays (requires trailing comma).
 * 
 * @param items - Array items as strings
 * @returns Formatted Typst array syntax
 */
export function renderTypstArray(items: string[]): string {
	if (items.length === 1) return `(${items[0]},)`;
	return `(${items.join(', ')})`;
}

/**
 * Calculate the maximum consecutive backtick run in a string.
 * Used to determine the fence length for code blocks.
 * 
 * @param value - String to analyze
 * @returns Maximum consecutive backtick count
 */
export function maxBacktickRun(value: string): number {
	let maxRun = 0;
	let run = 0;
	for (let i = 0; i < value.length; i++) {
		if (value[i] === '`') {
			run++;
			if (run > maxRun) maxRun = run;
			continue;
		}
		run = 0;
	}
	return maxRun;
}

/**
 * Coerce language string to valid ISO 639 language code.
 * 
 * Validates and normalizes language codes using ISO 639-1 standard.
 * Supports various input formats:
 * - ISO 639-1 codes (e.g., 'en', 'zh', 'fr')
 * - Locale codes (e.g., 'en-US', 'zh-CN') - extracts language part
 * - Language names (e.g., 'English', 'Chinese') - looks up code
 * 
 * @param value - Language string or code
 * @returns Normalized ISO 639-1 language code or undefined if invalid
 */
export function coerceLanguage(value: string | undefined): string | undefined {
	if (!value) return undefined;
	
	const v = value.trim();
	if (!v) return undefined;
	
	// Extract language code from locale format (e.g., 'en-US' -> 'en', 'zh-CN' -> 'zh')
	const langPart = v.split(/[-_]/)[0].toLowerCase();
	
	// Try to validate as ISO 639-1 code (2-letter)
	const iso1Codes = langs.codes('1');
	if (iso1Codes.includes(langPart)) {
		return langPart;
	}
	
	// Try to look up by language name (case-insensitive)
	const allLangs = langs.all();
	for (const lang of allLangs) {
		if (lang.name && lang.name.toLowerCase() === v.toLowerCase() && lang['1']) {
			return lang['1'];
		}
		// Also check local name if available
		if (lang.local && lang.local.toLowerCase() === v.toLowerCase() && lang['1']) {
			return lang['1'];
		}
	}
	
	// Try ISO 639-2 or 639-3 codes and convert to ISO 639-1
	const langBy2 = langs.where('2', v.toLowerCase());
	if (langBy2 && langBy2['1']) {
		return langBy2['1'];
	}
	
	const langBy2B = langs.where('2B', v.toLowerCase());
	if (langBy2B && langBy2B['1']) {
		return langBy2B['1'];
	}
	
	const langBy3 = langs.where('3', v.toLowerCase());
	if (langBy3 && langBy3['1']) {
		return langBy3['1'];
	}
	
	// If no valid code found, return undefined
	return undefined;
}

/**
 * Coerce region string to valid ISO 3166 country code.
 * 
 * Validates and normalizes region/country codes using ISO 3166-1 alpha-2 standard.
 * Supports various input formats:
 * - ISO 3166-1 alpha-2 codes (e.g., 'US', 'CN', 'GB')
 * - Country names (e.g., 'United States', 'China') - looks up code
 * 
 * @param value - Region/country string or code
 * @returns Normalized ISO 3166-1 alpha-2 country code or undefined if invalid
 */
export function coerceRegion(value: string | undefined): string | undefined {
	if (!value) return undefined;
	
	const v = value.trim();
	if (!v) return undefined;
	
	// Check if it's already a valid ISO 3166-1 alpha-2 code
	const upperValue = v.toUpperCase();
	const validCodes = getCodes();
	if (validCodes.includes(upperValue)) {
		return upperValue;
	}
	
	// Try to look up by country name
	const code = getCode(v);
	if (code) {
		return code.toUpperCase();
	}
	
	// If no valid code found, return undefined
	return undefined;
}
