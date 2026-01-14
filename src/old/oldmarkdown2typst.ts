/**
 * markdown2typst - Convert Markdown to Typst (OLD SINGLE FILE VERSION)
 * 
 * A comprehensive library for converting Markdown documents to Typst markup language.
 * Supports GitHub Flavored Markdown, math equations, tables, footnotes, and more
 * 
 * This code is inspired by the original work of zhaoyiqun (Creator of MDXport; 'cosformula' on GitHub).
 * Documented, modified, extended and maintained by Mapaor.
 * 
 * @module markdown2typst
 * @license MIT
 */

import { unified } from 'unified';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import { tex2typst } from 'tex2typst';
import type {
	Blockquote,
	Code,
	Content,
	Delete,
	Definition,
	Emphasis,
	FootnoteDefinition,
	FootnoteReference,
	Heading,
	Html,
	Image,
	InlineCode,
	Link,
	LinkReference,
	List,
	ListItem,
	Literal,
	Paragraph,
	PhrasingContent,
	Root,
	Strong,
	Table,
	TableCell,
	TableRow,
	Text,
	Yaml
} from 'mdast';

/** Extended MDAST node type for marked/highlighted text */
interface Mark extends Literal {
	type: 'mark';
	children: PhrasingContent[];
}

/** Extended MDAST node type for superscript text */
interface SuperScript extends Literal {
	type: 'superscript';
	children: PhrasingContent[];
}

/** Extended MDAST node type for subscript text */
interface SubScript extends Literal {
	type: 'subscript';
	children: PhrasingContent[];
}

/** Extended MDAST node type for block-level math equations */
interface MathNode extends Literal {
	type: 'math';
}

/** Extended MDAST node type for inline math equations */
interface InlineMathNode extends Literal {
	type: 'inlineMath';
}

/**
 * Options for configuring the Markdown to Typst conversion.
 * All fields override corresponding frontmatter values if specified.
 */
export type Markdown2TypstOptions = {
	/** Document title (overrides frontmatter) */
	title?: string;
	/** Document author(s) - single string or array (overrides frontmatter) */
	author?: string | string[];
	/** Document authors - alternative field name (overrides frontmatter) */
	authors?: string[];
	/** Document description (overrides frontmatter) */
	description?: string;
	/** Document keywords - array (overrides frontmatter) */
	keywords?: string[];
	/** Document date - string, 'auto', or ISO date (overrides frontmatter) */
	date?: string;
	/** Document abstract - rendered on title page (overrides frontmatter) */
	abstract?: string;
	/** Document language code (zh for Chinese, en for English) (overrides frontmatter) */
	lang?: string;
	/** Alternative language field name (overrides frontmatter) */
	language?: string;
	/** Text region code (overrides frontmatter) */
	region?: string;
};

/**
 * Convert Markdown text to Typst markup.
 * 
 * This is the main entry point for the library. It parses the Markdown using remark,
 * processes frontmatter and metadata, and converts the AST to Typst syntax.
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
	const processor = unified()
		.use(remarkParse)
		.use(remarkFrontmatter, ['yaml'])
		.use(remarkGfm, { singleTilde: false })
		.use(remarkMath)
		//.use(remarkMark)

	const parsedTree = processor.parse(markdown);
	const tree = processor.runSync(parsedTree) as Root;
	const definitions = collectDefinitions(tree);
	const footnoteDefinitions = collectFootnotes(tree);
	const frontmatter = parseFrontmatter(tree);
	const { title: leadingTitle, index: leadingTitleIndex } = findLeadingH1(tree, definitions) ?? {
		title: null,
		index: null
	};

	const title = options.title ?? frontmatter.title ?? leadingTitle ?? '';
	
	// Normalize authors from options and frontmatter (all optional)
	const optionsAuthors = options.authors ?? 
		(typeof options.author === 'string' ? [options.author] : options.author) ?? [];
	const frontmatterAuthors = frontmatter.authors ?? 
		(typeof frontmatter.author === 'string' ? [frontmatter.author] : frontmatter.author) ?? [];
	const authors = optionsAuthors.length > 0 ? optionsAuthors : frontmatterAuthors;
	
	// Use options as overrides for all other fields
	const lang = coerceLanguage(options.lang ?? options.language ?? frontmatter.lang ?? frontmatter.language);
	const region = options.region ?? frontmatter.region;
	const date = options.date ?? frontmatter.date;
	const description = options.description ?? frontmatter.description;
	const keywords = options.keywords ?? frontmatter.keywords;
	const abstract = options.abstract ?? frontmatter.abstract;

	const nodesForBody =
		leadingTitleIndex !== null && normalizeText(title) === normalizeText(leadingTitle)
			? tree.children.filter((_, index) => index !== leadingTitleIndex)
			: tree.children;

	const body = nodesForBody
		.map((node) => renderBlock(node, 0, definitions, footnoteDefinitions))
		.filter(isNonEmpty)
		.join('\n\n');

	// Build document metadata and configuration
	const parts: string[] = [];

	// Set document metadata if any metadata is available
	const hasMetadata = title || authors.length > 0 || description || date || (keywords && keywords.length > 0);
	if (hasMetadata) {
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
			const dateTypst = parseDate(date);
			docArgs.push(`date: ${dateTypst}`);
		}
		
		parts.push(`#set document(`);
		for (let i = 0; i < docArgs.length; i++) {
			const isLast = i === docArgs.length - 1;
			parts.push(`  ${docArgs[i]}${isLast ? '' : ','}`);
		}
		parts.push(`)`);
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

	// Add body content
	if (parts.length > 0 && body) {
		parts.push('');
	}
	if (body) {
		parts.push(body);
	}

	// Return body only if no metadata was set
	return parts.length > 0 ? parts.join('\n') : body;
}

/**
 * Render a TypeScript-style tuple array for Typst.
 * Ensures proper syntax for single-element arrays (requires trailing comma).
 * 
 * @param items - Array items as strings
 * @returns Formatted Typst array syntax
 */
function renderTypstArray(items: string[]): string {
	if (items.length === 1) return `(${items[0]},)`;
	return `(${items.join(', ')})`;
}

/**
 * Collect all link and image reference definitions from the Markdown AST.
 * These are used to resolve reference-style links like [text][id].
 * 
 * @param root - The root node of the MDAST tree
 * @returns Map of identifier to Definition node
 */
function collectDefinitions(root: Root): Map<string, Definition> {
	const definitions = new Map<string, Definition>();
	for (const node of root.children) {
		if (node.type !== 'definition') continue;
		const def = node as Definition;
		definitions.set(def.identifier.toLowerCase(), def);
	}
	return definitions;
}

/**
 * Collect all footnote definitions from the Markdown AST.
 * These are rendered inline when referenced in the text.
 * 
 * @param root - The root node of the MDAST tree
 * @returns Map of identifier to FootnoteDefinition node
 */
function collectFootnotes(root: Root): Map<string, FootnoteDefinition> {
	const definitions = new Map<string, FootnoteDefinition>();
	for (const node of root.children) {
		if (node.type !== 'footnoteDefinition') continue;
		const def = node as FootnoteDefinition;
		definitions.set(def.identifier.toLowerCase(), def);
	}
	return definitions;
}

/**
 * Metadata extracted from YAML frontmatter.
 * Follows Typst document() parameters specification.
 * All fields are optional. Unknown fields are ignored.
 */
type Frontmatter = {
	/** Document title (maps to document.title) */
	title?: string;
	/** Document author(s) - single string or array (maps to document.author) */
	author?: string | string[];
	/** Document authors - alternative field name (maps to document.author) */
	authors?: string[];
	/** Document description (maps to document.description) */
	description?: string;
	/** Document keywords - array (maps to document.keywords) */
	keywords?: string[];
	/** Document date - string, 'auto', or ISO date (maps to document.date) */
	date?: string;
	/** Document abstract - rendered on title page */
	abstract?: string;
	/** Document language code (maps to text.lang, not document parameter) */
	lang?: string;
	/** Alternative language field name */
	language?: string;
	/** Text region code (maps to text.region) */
	region?: string;
};

/**
 * Parse YAML frontmatter from the document.
 * Supports title, authors (single or array), and language fields.
 * 
 * @param root - The root node of the MDAST tree
 * @returns Parsed frontmatter metadata
 */
function parseFrontmatter(root: Root): Frontmatter {
	const yamlNode = root.children.find((node) => node.type === 'yaml') as Yaml | undefined;
	if (!yamlNode?.value) return {};
	return parseFrontmatterYaml(yamlNode.value);
}

/**
 * Parse YAML frontmatter string into structured metadata.
 * Handles standard Markdown/Pandoc frontmatter fields.
 * 
 * @param yaml - Raw YAML string from frontmatter
 * @returns Parsed frontmatter object
 */
function parseFrontmatterYaml(yaml: string): Frontmatter {
	const lines = yaml.split(/\r?\n/);
	const result: Frontmatter = {};

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Language (lang or language)
		const langMatch = /^\s*lang(?:uage)?\s*:\s*(.+?)\s*$/.exec(line);
		if (langMatch && !result.lang && !result.language) {
			result.lang = stripYamlScalar(langMatch[1]);
			continue;
		}

		// Title
		const titleMatch = /^\s*title\s*:\s*(.+?)\s*$/.exec(line);
		if (titleMatch && !result.title) {
			result.title = stripYamlScalar(titleMatch[1]);
			continue;
		}

		// Date
		const dateMatch = /^\s*date\s*:\s*(.+?)\s*$/.exec(line);
		if (dateMatch && !result.date) {
			result.date = stripYamlScalar(dateMatch[1]);
			continue;
		}

		// Description
		const descriptionMatch = /^\s*description\s*:\s*(.+?)\s*$/.exec(line);
		if (descriptionMatch && !result.description) {
			result.description = stripYamlScalar(descriptionMatch[1]);
			continue;
		}

		// Abstract
		const abstractMatch = /^\s*abstract\s*:\s*(.+?)\s*$/.exec(line);
		if (abstractMatch && !result.abstract) {
			result.abstract = stripYamlScalar(abstractMatch[1]);
			continue;
		}

		// Region
		const regionMatch = /^\s*region\s*:\s*(.+?)\s*$/.exec(line);
		if (regionMatch && !result.region) {
			result.region = stripYamlScalar(regionMatch[1]);
			continue;
		}

		// Single author field (can be single value or array)
		const authorMatch = /^\s*author\s*:\s*(.*?)\s*$/.exec(line);
		if (authorMatch && !result.author && !result.authors) {
			const rest = authorMatch[1].trim();
			if (rest) {
				// Inline value or array
				const parsed = parseInlineYamlList(rest);
				result.author = parsed.length === 1 ? parsed[0] : parsed;
				continue;
			}

			// Multi-line author array
			const list: string[] = [];
			for (let j = i + 1; j < lines.length; j++) {
				const itemMatch = /^\s*-\s*(.+?)\s*$/.exec(lines[j]);
				if (!itemMatch) break;
				list.push(stripYamlScalar(itemMatch[1]));
				i = j;
			}
			if (list.length > 0) result.author = list.filter(Boolean);
			continue;
		}

		// Authors array
		const authorsMatch = /^\s*authors\s*:\s*(.*?)\s*$/.exec(line);
		if (authorsMatch && !result.authors) {
			const rest = authorsMatch[1].trim();
			if (rest) {
				result.authors = parseInlineYamlList(rest);
				continue;
			}

			// Multi-line authors array
			const list: string[] = [];
			for (let j = i + 1; j < lines.length; j++) {
				const itemMatch = /^\s*-\s*(.+?)\s*$/.exec(lines[j]);
				if (!itemMatch) break;
				list.push(stripYamlScalar(itemMatch[1]));
				i = j;
			}
			if (list.length > 0) result.authors = list.filter(Boolean);
			continue;
		}

		// Keywords
		const keywordsMatch = /^\s*keywords\s*:\s*(.*?)\s*$/.exec(line);
		if (keywordsMatch && !result.keywords) {
			const rest = keywordsMatch[1].trim();
			if (rest) {
				result.keywords = parseInlineYamlList(rest);
				continue;
			}

			// Multi-line keywords array
			const list: string[] = [];
			for (let j = i + 1; j < lines.length; j++) {
				const itemMatch = /^\s*-\s*(.+?)\s*$/.exec(lines[j]);
				if (!itemMatch) break;
				list.push(stripYamlScalar(itemMatch[1]));
				i = j;
			}
			if (list.length > 0) result.keywords = list.filter(Boolean);
		}
	}

	return result;
}

/**
 * Parse inline YAML list values (e.g., [item1, item2] or single value).
 * 
 * @param value - Inline YAML list string
 * @returns Array of parsed items
 */
function parseInlineYamlList(value: string): string[] {
	const v = value.trim();
	if (!v) return [];
	if (v.startsWith('[') && v.endsWith(']')) {
		const inner = v.slice(1, -1);
		return inner
			.split(',')
			.map((s) => stripYamlScalar(s))
			.filter(Boolean);
	}
	return [stripYamlScalar(v)].filter(Boolean);
}

/**
 * Strip quotes and whitespace from a YAML scalar value.
 * 
 * @param value - Raw YAML scalar string
 * @returns Cleaned string value
 */
function stripYamlScalar(value: string): string {
	let v = value.trim();
	if (
		(v.startsWith('"') && v.endsWith('"') && v.length >= 2) ||
		(v.startsWith("'") && v.endsWith("'") && v.length >= 2)
	) {
		v = v.slice(1, -1);
	}
	return v.trim();
}

/**
 * Coerce language string to supported language code.
 * 
 * @param value - Language string (e.g., 'zh-CN', 'en-US', 'english')
 * @returns Normalized language code ('zh' or 'en') or undefined
 */
function coerceLanguage(value: string | undefined): 'zh' | 'en' | undefined {
	const v = (value ?? '').trim().toLowerCase();
	if (v.startsWith('zh')) return 'zh';
	if (v.startsWith('en')) return 'en';
	return undefined;
}

/**
 * Parse date string into Typst date format.
 * Supports 'auto', 'none', and ISO date formats (YYYY-MM-DD).
 * 
 * @param value - Date string from frontmatter
 * @returns Typst date expression
 */
function parseDate(value: string): string {
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
 * Find the first H1 heading in the document (ignoring frontmatter).
 * Used to extract document title if not specified in frontmatter or options.
 * 
 * @param root - The root node of the MDAST tree
 * @param definitions - Map of link reference definitions
 * @returns Title text and node index, or null if no H1 found
 */
function findLeadingH1(
	root: Root,
	definitions: Map<string, Definition>
): { title: string; index: number } | null {
	for (let i = 0; i < root.children.length; i++) {
		const node = root.children[i];
		if (node.type === 'yaml' || node.type === 'definition') continue;
		if (node.type !== 'heading') return null;
		const heading = node as Heading;
		if (heading.depth !== 1) return null;
		const title = plainTextFromPhrasing(heading.children, definitions).trim();
		return title ? { title, index: i } : null;
	}
	return null;
}

/**
 * Extract plain text content from phrasing nodes (inline content).
 * Strips all formatting and extracts text only.
 * 
 * @param nodes - Array of phrasing content nodes
 * @param definitions - Map of link reference definitions
 * @returns Plain text string
 */
function plainTextFromPhrasing(nodes: PhrasingContent[], definitions: Map<string, Definition>): string {
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

function normalizeText(value: string | null): string {
	return (value ?? '').trim();
}

/**
 * Render a block-level MDAST node to Typst markup.
 * Dispatches to appropriate renderer based on node type.
 * 
 * @param node - Block-level content node
 * @param indentLevel - Current indentation level
 * @param definitions - Map of link reference definitions
 * @param footnoteDefinitions - Map of footnote definitions
 * @returns Rendered Typst string or null if node should be skipped
 */
function renderBlock(
	node: Content,
	indentLevel: number,
	definitions: Map<string, Definition>,
	footnoteDefinitions: Map<string, FootnoteDefinition>
): string | null {
	switch (node.type) {
		case 'yaml':
		case 'definition':
		case 'footnoteDefinition':
			return null;
		case 'heading':
			return renderHeading(node as Heading, indentLevel, definitions, footnoteDefinitions);
		case 'paragraph':
			return indentLines(
				renderParagraph(node as Paragraph, definitions, footnoteDefinitions),
				indentLevel
			);
		case 'list':
			return renderList(node as List, indentLevel, definitions, footnoteDefinitions);
		case 'code':
			return renderCodeBlock(node as Code, indentLevel);
		case 'blockquote':
			return renderBlockquote(node as Blockquote, indentLevel, definitions, footnoteDefinitions);
		case 'thematicBreak':
			return indentLines('#line(length: 100%, stroke: 0.6pt)', indentLevel);
		case 'table':
			return renderTable(node as Table, indentLevel, definitions, footnoteDefinitions);
		case 'math':
			return renderMathBlock(node as MathNode, indentLevel);
		default:
			return null;
	}
}

/**
 * Render a block-level math equation to Typst.
 * Converts LaTeX math syntax to Typst math using tex2typst.
 * 
 * @param node - Math node
 * @param indentLevel - Current indentation level
 * @returns Rendered Typst math block
 */
function renderMathBlock(node: MathNode, indentLevel: number): string {
	// Convert LaTeX to Typst math syntax
	try {
		const typstMath = tex2typst(node.value.trim());
		return indentLines(`$ ${typstMath} $`, indentLevel);
	} catch (error) {
		// Fallback: use original LaTeX if conversion fails
		return indentLines(`$ ${node.value.trim()} $`, indentLevel);
	}
}

/**
 * Render a heading to Typst markup.
 * Converts Markdown heading syntax (# ## ###) to Typst (= == ===).
 * 
 * @param node - Heading node
 * @param indentLevel - Current indentation level
 * @param definitions - Map of link reference definitions
 * @param footnoteDefinitions - Map of footnote definitions
 * @returns Rendered Typst heading
 */
function renderHeading(
	node: Heading,
	indentLevel: number,
	definitions: Map<string, Definition>,
	footnoteDefinitions: Map<string, FootnoteDefinition>
): string {
	const level = Math.min(Math.max(node.depth, 1), 6);
	return indentLines(
		`${'='.repeat(level)} ${renderInlines(node.children, definitions, footnoteDefinitions)}`,
		indentLevel
	);
}

/**
 * Render a paragraph to Typst.
 * Handles special cases like [toc] for table of contents.
 * 
 * @param node - Paragraph node
 * @param definitions - Map of link reference definitions
 * @param footnoteDefinitions - Map of footnote definitions
 * @returns Rendered Typst paragraph
 */
function renderParagraph(
	node: Paragraph,
	definitions: Map<string, Definition>,
	footnoteDefinitions: Map<string, FootnoteDefinition>
): string {
	// Check for [toc]
	const text = plainTextFromPhrasing(node.children, definitions).trim().toLowerCase();
	if (text === '[toc]') {
		return `#outline(title: auto, indent: auto)`;
	}
	return renderInlines(node.children, definitions, footnoteDefinitions);
}

function renderList(
	node: List,
	indentLevel: number,
	definitions: Map<string, Definition>,
	footnoteDefinitions: Map<string, FootnoteDefinition>
): string {
	const marker = node.ordered ? '+' : '-';
	return node.children
		.map((item) => renderListItem(item, marker, indentLevel, definitions, footnoteDefinitions))
		.filter(isNonEmpty)
		.join('\n');
}

function renderListItem(
	node: ListItem,
	marker: string,
	indentLevel: number,
	definitions: Map<string, Definition>,
	footnoteDefinitions: Map<string, FootnoteDefinition>
): string {
	const baseIndent = '  '.repeat(indentLevel);
	const nestedIndentLevel = indentLevel + 1;

	const first = node.children[0];
	const lines: string[] = [];

	if (first?.type === 'paragraph') {
		lines.push(
			`${baseIndent}${marker} ${renderParagraph(first as Paragraph, definitions, footnoteDefinitions)}`
		);
		for (const child of node.children.slice(1)) {
			if (child.type === 'list') {
				lines.push(renderList(child as List, nestedIndentLevel, definitions, footnoteDefinitions));
				continue;
			}
			const rendered = renderBlock(child as Content, nestedIndentLevel, definitions, footnoteDefinitions);
			if (rendered) lines.push(rendered);
		}
		return lines.join('\n');
	}

	lines.push(`${baseIndent}${marker}`);
	for (const child of node.children) {
		if (child.type === 'list') {
			lines.push(renderList(child as List, nestedIndentLevel, definitions, footnoteDefinitions));
			continue;
		}
		const rendered = renderBlock(child as Content, nestedIndentLevel, definitions, footnoteDefinitions);
		if (rendered) lines.push(rendered);
	}
	return lines.join('\n');
}

function renderCodeBlock(node: Code, indentLevel: number): string {
	const info = node.lang?.trim() ? node.lang.trim() : '';
	const value = node.value.replace(/\n$/, '');
	const fence = '`'.repeat(Math.max(3, maxBacktickRun(value) + 1));
	const open = info ? `${fence}${info}` : fence;
	const indentedCode = indentLines(value, indentLevel);
	return [indentLines(open, indentLevel), indentedCode, indentLines(fence, indentLevel)].join('\n');
}

function maxBacktickRun(value: string): number {
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

function renderTable(
	node: Table,
	indentLevel: number,
	definitions: Map<string, Definition>,
	footnoteDefinitions: Map<string, FootnoteDefinition>
): string {
	const rows = node.children as TableRow[];
	if (rows.length === 0) return '';

	// Get column count from first row
	const headerRow = rows[0];
	const colCount = headerRow.children.length;

	// Get alignment from node.align
	const alignMap: Record<string, string> = {
		left: 'left',
		right: 'right',
		center: 'center'
	};
	const aligns = (node.align ?? []).map((a) => alignMap[a ?? 'left'] ?? 'left');

	// Build column specification
	const columns = Array(colCount).fill('1fr').join(', ');

	// Build table content
	const headerCells: string[] = [];
	for (const cell of headerRow.children as TableCell[]) {
		const content = renderInlines(cell.children, definitions, footnoteDefinitions);
		headerCells.push(`[*${content}*]`);
	}

	const dataCells: string[] = [];
	for (let i = 1; i < rows.length; i++) {
		const row = rows[i];
		for (const cell of row.children as TableCell[]) {
			const content = renderInlines(cell.children, definitions, footnoteDefinitions);
			dataCells.push(`[${content}]`);
		}
	}

	// Build align argument
	const alignArgs = aligns.slice(0, colCount).map((a) => a).join(', ');

	const lines = [
		`#table(`,
		`  columns: (${columns}),`,
		`  align: (${alignArgs}),`,
		`  table.header(${headerCells.join(', ')}),`,
		`  ${dataCells.join(', ')}`,
		`)`
	];

	return indentLines(lines.join('\n'), indentLevel);
}

function renderBlockquote(
	node: Blockquote,
	indentLevel: number,
	definitions: Map<string, Definition>,
	footnoteDefinitions: Map<string, FootnoteDefinition>
): string {
	const body = node.children
		.map((child) => renderBlock(child, 0, definitions, footnoteDefinitions))
		.filter(isNonEmpty)
		.join('\n\n');

	const open = indentLines('#quote[', indentLevel);
	if (!body.trim()) return `${open}\n${indentLines(']', indentLevel)}`;

	return [open, indentLines(body, indentLevel + 1), indentLines(']', indentLevel)].join('\n');
}

function renderInlines(
	nodes: PhrasingContent[],
	definitions: Map<string, Definition>,
	footnoteDefinitions: Map<string, FootnoteDefinition>
): string {
	return nodes
		.map((node) => renderInline(node, definitions, footnoteDefinitions))
		.filter(isNonEmpty)
		.join('');
}

/**
 * Render an inline phrasing node to Typst markup.
 * Handles text, emphasis, strong, code, links, images, math, etc.
 * 
 * @param node - Phrasing content node
 * @param definitions - Map of link reference definitions
 * @param footnoteDefinitions - Map of footnote definitions
 * @returns Rendered Typst string or null if node should be skipped
 */
function renderInline(
	node: PhrasingContent,
	definitions: Map<string, Definition>,
	footnoteDefinitions: Map<string, FootnoteDefinition>
): string | null {
	switch ((node as any).type) {
		case 'text':
			return escapeTypstText((node as Text).value);
		case 'strong':
			// Use #strong[] function form to avoid ambiguity with /* comments and other edge cases
			return `#strong[${renderInlines((node as Strong).children, definitions, footnoteDefinitions)}]`;
		case 'emphasis':
			// Use #emph[] function form to avoid potential parsing issues
			return `#emph[${renderInlines((node as Emphasis).children, definitions, footnoteDefinitions)}]`;
		case 'delete':
			return `#strike[${renderInlines((node as unknown as Delete).children, definitions, footnoteDefinitions)}]`;
		case 'mark':
			return `#highlight[${renderInlines((node as unknown as Mark).children, definitions, footnoteDefinitions)}]`;
		case 'subscript':
			return `#sub[${renderInlines((node as unknown as SubScript).children, definitions, footnoteDefinitions)}]`;
		case 'superscript':
			return `#super[${renderInlines((node as unknown as SuperScript).children, definitions, footnoteDefinitions)}]`;
		case 'footnoteReference': {
			const ref = node as FootnoteReference;
			const def = footnoteDefinitions.get(ref.identifier.toLowerCase());
			if (!def) return ''; // Or render failure?
			// Render footnote content inline
			const content = def.children
				.map((child) => renderBlock(child, 0, definitions, footnoteDefinitions))
				.filter(isNonEmpty)
				.join(' '); // Join blocks with space for inline footnote
			return `#footnote[${content.trim()}]`;
		}
		case 'inlineCode':
			return renderInlineCode(node as InlineCode);
		case 'inlineMath': {
			// Convert LaTeX to Typst math syntax
			// Note: remark-math parses both $...$ (inline) and $$...$$ (block) as inlineMath
			// We distinguish them by checking the source length: $x$ has length value.length+2, $$x$$ has value.length+4
			const mathNode = node as InlineMathNode;
			const value = mathNode.value.trim();
			
			try {
				const typstMath = tex2typst(value);
				
				// Check if this was originally $$...$$ (display/block math) or $...$ (inline math)
				// by examining the position in the source
				const isDisplayMath = mathNode.position?.end?.offset != null && 
					mathNode.position?.start?.offset != null &&
					(mathNode.position.end.offset - mathNode.position.start.offset) >= value.length + 4;
				
				// Display math ($$): use spaces for block-style rendering
				// Inline math ($): no spaces for inline rendering
				return isDisplayMath ? `$ ${typstMath} $` : `$${typstMath}$`;
			} catch (error) {
				// Fallback: use original LaTeX if conversion fails
				const isDisplayMath = mathNode.position?.end?.offset != null && 
					mathNode.position?.start?.offset != null &&
					(mathNode.position.end.offset - mathNode.position.start.offset) >= value.length + 4;
				return isDisplayMath ? `$ ${value} $` : `$${value}$`;
			}
		}
		case 'image':
			return renderImage(node as Image);
		case 'link':
			return renderLink(node as Link, definitions, footnoteDefinitions);
		case 'linkReference':
			return renderLinkReference(node as LinkReference, definitions, footnoteDefinitions);
		case 'break':
			return '\\\n';
		case 'html':
			// Treat inline HTML as literal text, escape it for Typst
			return escapeTypstText((node as Html).value);
		default:
			return null;
	}
}

/**
 * Render inline code to Typst.
 * Escapes backticks within the code.
 * 
 * @param node - InlineCode node
 * @returns Rendered Typst inline code
 */
function renderInlineCode(node: InlineCode): string {
	const value = node.value.replace(/`/g, '\\`');
	return `\`${value}\``;
}

/**
 * Render an image to Typst.
 * Uses Typst's #image() function with the image URL.
 * 
 * @param node - Image node
 * @returns Rendered Typst image function
 */
function renderImage(node: Image): string {
	// Basic image support. 
	// If alt text exists, we could use it for accessibility or caption, but Typst #image doesn't strictly require it.
	// We'll just output the image function.
	return `#image("${escapeTypstString(node.url)}")`;
}

/**
 * Render a link to Typst.
 * Uses Typst's #link() function with URL and label.
 * 
 * @param node - Link node
 * @param definitions - Map of link reference definitions
 * @param footnoteDefinitions - Map of footnote definitions
 * @returns Rendered Typst link
 */
function renderLink(
	node: Link,
	definitions: Map<string, Definition>,
	footnoteDefinitions: Map<string, FootnoteDefinition>
): string {
	const url = escapeTypstString(node.url);
	const label = renderInlines(node.children, definitions, footnoteDefinitions);
	if (!label.trim()) return `#link("${url}")[${escapeTypstText(node.url)}]`;
	return `#link("${url}")[${label}]`;
}

/**
 * Render a reference-style link to Typst.
 * Resolves the reference to get the URL, then renders like a normal link.
 * 
 * @param node - LinkReference node
 * @param definitions - Map of link reference definitions
 * @param footnoteDefinitions - Map of footnote definitions
 * @returns Rendered Typst link or fallback text
 */
function renderLinkReference(
	node: LinkReference,
	definitions: Map<string, Definition>,
	footnoteDefinitions: Map<string, FootnoteDefinition>
): string | null {
	const def = definitions.get(node.identifier.toLowerCase());
	const label = renderInlines(node.children, definitions, footnoteDefinitions);
	if (!def) return label || escapeTypstText(node.label || node.identifier);
	const url = escapeTypstString(def.url);
	if (!label.trim()) return `#link("${url}")[${escapeTypstText(def.url)}]`;
	return `#link("${url}")[${label}]`;
}

/**
 * Escape special characters in Typst text content.
 * Escapes characters that have special meaning in Typst markup.
 * 
 * @param input - Raw text string
 * @returns Escaped text safe for Typst
 */
function escapeTypstText(input: string): string {
	return input.replace(/[\\#*_`\[\]\$<>@]/g, (c) => `\\${c}`);
}

/**
 * Escape special characters in Typst string literals.
 * Used for strings within quotes (URLs, titles, etc.).
 * 
 * @param input - Raw string
 * @returns Escaped string safe for Typst string literals
 */
function escapeTypstString(input: string): string {
	return input.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

/**
 * Indent all lines of text by a given level.
 * Each indent level adds 2 spaces.
 * 
 * @param text - Text to indent
 * @param indentLevel - Number of indent levels (0 = no indent)
 * @returns Indented text
 */
function indentLines(text: string, indentLevel: number): string {
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
function isNonEmpty(value: string | null | undefined): value is string {
	return typeof value === 'string' && value.length > 0;
}
