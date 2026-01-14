/**
 * Block node rendering functions
 * @module block-renderer
 */

import { tex2typst } from 'tex2typst';
import type {
	Content,
	Heading,
	Paragraph,
	List,
	ListItem,
	Code,
	Blockquote,
	Table,
	TableRow,
	TableCell
} from 'mdast';
import type { MathNode, RenderContext } from './types.js';
import { renderInlines } from './inline-renderer.js';
import { indentLines, isNonEmpty, plainTextFromPhrasing, maxBacktickRun } from './utils.js';
import { ErrorSeverity } from './types.js';

/**
 * Render a block-level MDAST node to Typst markup.
 * Dispatches to appropriate renderer based on node type.
 * 
 * @param node - Block-level content node
 * @param indentLevel - Current indentation level
 * @param context - Rendering context with definitions and footnotes
 * @returns Rendered Typst string or null if node should be skipped
 */
export function renderBlock(
	node: Content,
	indentLevel: number,
	context: RenderContext
): string | null {
	try {
		switch (node.type) {
			case 'yaml':
			case 'definition':
			case 'footnoteDefinition':
				return null;
			case 'heading':
				return renderHeading(node as Heading, indentLevel, context);
			case 'paragraph':
				return indentLines(
					renderParagraph(node as Paragraph, context),
					indentLevel
				);
			case 'list':
				return renderList(node as List, indentLevel, context);
			case 'code':
				return renderCodeBlock(node as Code, indentLevel);
			case 'blockquote':
				return renderBlockquote(node as Blockquote, indentLevel, context);
			case 'thematicBreak':
				return indentLines('#line(length: 100%, stroke: 0.6pt)', indentLevel);
			case 'table':
				return renderTable(node as Table, indentLevel, context);
			case 'math':
				return renderMathBlock(node as MathNode, indentLevel, context);
			default:
				if (context.onError) {
					context.onError({
						severity: ErrorSeverity.WARNING,
						message: `Unknown block node type: ${node.type}`,
						context: 'block rendering',
						details: { nodeType: node.type }
					});
				}
				return null;
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (context.onError) {
			context.onError({
				severity: ErrorSeverity.ERROR,
				message: `Error rendering block node: ${errorMessage}`,
				context: 'block rendering',
				originalError: error,
				details: { nodeType: node.type }
			});
		}
		// Return empty string to continue rendering
		return null;
	}
}

/**
 * Render a block-level math equation to Typst.
 * Converts LaTeX math syntax to Typst math using tex2typst.
 * 
 * @param node - Math node
 * @param indentLevel - Current indentation level
 * @param context - Rendering context for error handling
 * @returns Rendered Typst math block
 */
function renderMathBlock(node: MathNode, indentLevel: number, context: RenderContext): string {
	// Convert LaTeX to Typst math syntax
	const value = node.value.trim();
	try {
		const typstMath = tex2typst(value);
		return indentLines(`$ ${typstMath} $`, indentLevel);
	} catch (error) {
		// Fallback: use original LaTeX if conversion fails
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (context.onError) {
			context.onError({
				severity: ErrorSeverity.WARNING,
				message: `Failed to convert block math LaTeX to Typst: ${errorMessage}`,
				context: 'block math rendering',
				originalError: error,
				details: { latex: value }
			});
		}
		return indentLines(`$ ${value} $`, indentLevel);
	}
}

/**
 * Render a heading to Typst markup.
 * Converts Markdown heading syntax (# ## ###) to Typst (= == ===).
 * 
 * @param node - Heading node
 * @param indentLevel - Current indentation level
 * @param context - Rendering context with definitions and footnotes
 * @returns Rendered Typst heading
 */
function renderHeading(
	node: Heading,
	indentLevel: number,
	context: RenderContext
): string {
	const level = Math.min(Math.max(node.depth, 1), 6);
	return indentLines(
		`${'='.repeat(level)} ${renderInlines(node.children, context)}`,
		indentLevel
	);
}

/**
 * Render a paragraph to Typst.
 * Handles special cases like [toc] for table of contents.
 * 
 * @param node - Paragraph node
 * @param context - Rendering context with definitions and footnotes
 * @returns Rendered Typst paragraph
 */
function renderParagraph(
	node: Paragraph,
	context: RenderContext
): string {
	// Check for [toc]
	const text = plainTextFromPhrasing(node.children, context.definitions).trim().toLowerCase();
	if (text === '[toc]') {
		return `#outline(title: auto, indent: auto)`;
	}
	return renderInlines(node.children, context);
}

/**
 * Render a list to Typst markup.
 * 
 * @param node - List node
 * @param indentLevel - Current indentation level
 * @param context - Rendering context with definitions and footnotes
 * @returns Rendered Typst list
 */
function renderList(
	node: List,
	indentLevel: number,
	context: RenderContext
): string {
	const marker = node.ordered ? '+' : '-';
	return node.children
		.map((item) => renderListItem(item, marker, indentLevel, context))
		.filter(isNonEmpty)
		.join('\n');
}

/**
 * Render a list item to Typst markup.
 * 
 * @param node - ListItem node
 * @param marker - List marker ('+' for ordered, '-' for unordered)
 * @param indentLevel - Current indentation level
 * @param context - Rendering context with definitions and footnotes
 * @returns Rendered Typst list item
 */
function renderListItem(
	node: ListItem,
	marker: string,
	indentLevel: number,
	context: RenderContext
): string {
	const baseIndent = '  '.repeat(indentLevel);
	const nestedIndentLevel = indentLevel + 1;

	const first = node.children[0];
	const lines: string[] = [];

	if (first?.type === 'paragraph') {
		lines.push(
			`${baseIndent}${marker} ${renderParagraph(first as Paragraph, context)}`
		);
		for (const child of node.children.slice(1)) {
			if (child.type === 'list') {
				lines.push(renderList(child as List, nestedIndentLevel, context));
				continue;
			}
			const rendered = renderBlock(child as Content, nestedIndentLevel, context);
			if (rendered) lines.push(rendered);
		}
		return lines.join('\n');
	}

	lines.push(`${baseIndent}${marker}`);
	for (const child of node.children) {
		if (child.type === 'list') {
			lines.push(renderList(child as List, nestedIndentLevel, context));
			continue;
		}
		const rendered = renderBlock(child as Content, nestedIndentLevel, context);
		if (rendered) lines.push(rendered);
	}
	return lines.join('\n');
}

/**
 * Render a code block to Typst markup.
 * 
 * @param node - Code node
 * @param indentLevel - Current indentation level
 * @returns Rendered Typst code block
 */
function renderCodeBlock(node: Code, indentLevel: number): string {
	const info = node.lang?.trim() ? node.lang.trim() : '';
	const value = node.value.replace(/\n$/, '');
	const fence = '`'.repeat(Math.max(3, maxBacktickRun(value) + 1));
	const open = info ? `${fence}${info}` : fence;
	const indentedCode = indentLines(value, indentLevel);
	return [indentLines(open, indentLevel), indentedCode, indentLines(fence, indentLevel)].join('\n');
}

/**
 * Render a table to Typst markup.
 * 
 * @param node - Table node
 * @param indentLevel - Current indentation level
 * @param context - Rendering context with definitions and footnotes
 * @returns Rendered Typst table
 */
function renderTable(
	node: Table,
	indentLevel: number,
	context: RenderContext
): string {
	try {
		const rows = node.children as TableRow[];
		if (rows.length === 0) {
			if (context.onError) {
				context.onError({
					severity: ErrorSeverity.WARNING,
					message: 'Empty table found (no rows)',
					context: 'table rendering'
				});
			}
			return '';
		}

		// Get column count from first row
		const headerRow = rows[0];
		const colCount = headerRow.children.length;

		if (colCount === 0) {
			if (context.onError) {
				context.onError({
					severity: ErrorSeverity.WARNING,
					message: 'Table has no columns',
					context: 'table rendering'
				});
			}
			return '';
		}

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
			const content = renderInlines(cell.children, context);
			headerCells.push(`[*${content}*]`);
		}

		const dataCells: string[] = [];
		for (let i = 1; i < rows.length; i++) {
			const row = rows[i];
			for (const cell of row.children as TableCell[]) {
				const content = renderInlines(cell.children, context);
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
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (context.onError) {
			context.onError({
				severity: ErrorSeverity.ERROR,
				message: `Error rendering table: ${errorMessage}`,
				context: 'table rendering',
				originalError: error
			});
		}
		return '';
	}
}

/**
 * Render a blockquote to Typst markup.
 * 
 * @param node - Blockquote node
 * @param indentLevel - Current indentation level
 * @param context - Rendering context with definitions and footnotes
 * @returns Rendered Typst blockquote
 */
function renderBlockquote(
	node: Blockquote,
	indentLevel: number,
	context: RenderContext
): string {
	const body = node.children
		.map((child) => renderBlock(child, 0, context))
		.filter(isNonEmpty)
		.join('\n\n');

	const open = indentLines('#quote[', indentLevel);
	if (!body.trim()) return `${open}\n${indentLines(']', indentLevel)}`;

	return [open, indentLines(body, indentLevel + 1), indentLines(']', indentLevel)].join('\n');
}
