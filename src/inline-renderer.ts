/**
 * Inline node rendering functions
 * @module inline-renderer
 */

import { tex2typst } from 'tex2typst';
import type {
	PhrasingContent,
	Text,
	Strong,
	Emphasis,
	Delete,
	InlineCode,
	Link,
	LinkReference,
	Image,
	FootnoteReference,
	Html
} from 'mdast';
import type { Mark, SuperScript, SubScript, InlineMathNode, RenderContext } from './types.js';
import { escapeTypstText, escapeTypstString, isNonEmpty } from './utils.js';
import { ErrorSeverity } from './types.js';

/**
 * Render inline phrasing nodes to Typst markup.
 * 
 * @param nodes - Array of phrasing content nodes
 * @param context - Rendering context with definitions and footnotes
 * @returns Rendered Typst string
 */
export function renderInlines(
	nodes: PhrasingContent[],
	context: RenderContext
): string {
	return nodes
		.map((node) => renderInline(node, context))
		.filter(isNonEmpty)
		.join('');
}

/**
 * Render an inline phrasing node to Typst markup.
 * Handles text, emphasis, strong, code, links, images, math, etc.
 * 
 * @param node - Phrasing content node
 * @param context - Rendering context with definitions and footnotes
 * @returns Rendered Typst string or null if node should be skipped
 */
function renderInline(
	node: PhrasingContent,
	context: RenderContext
): string | null {
	const { definitions, footnoteDefinitions } = context;

	switch ((node as any).type) {
		case 'text':
			return escapeTypstText((node as Text).value);
		case 'strong':
		return `*${renderInlines((node as Strong).children, context)}*`;
		case 'emphasis':
		return `_${renderInlines((node as Emphasis).children, context)}_`;
		case 'delete':
			return `#strike[${renderInlines((node as unknown as Delete).children, context)}]`;
		case 'mark':
			return `#highlight[${renderInlines((node as unknown as Mark).children, context)}]`;
		case 'subscript':
			return `#sub[${renderInlines((node as unknown as SubScript).children, context)}]`;
		case 'superscript':
			return `#super[${renderInlines((node as unknown as SuperScript).children, context)}]`;
		case 'footnoteReference': {
			const ref = node as FootnoteReference;
			const def = footnoteDefinitions.get(ref.identifier.toLowerCase());
			if (!def) {
				if (context.onError) {
					context.onError({
						severity: ErrorSeverity.WARNING,
						message: `Footnote reference [^${ref.identifier}] has no matching definition`,
						context: 'inline rendering',
						details: { identifier: ref.identifier }
					});
				}
				return ''; // Or render as plain text?
			}
			// Render footnote content inline
			try {
				const content = def.children
					.map((child) => {
						// Import renderBlock only when needed to avoid circular dependencies
						const { renderBlock } = require('./block-renderer.js');
						return renderBlock(child, 0, context);
					})
					.filter(isNonEmpty)
					.join(' '); // Join blocks with space for inline footnote
				return `#footnote[${content.trim()}]`;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				if (context.onError) {
					context.onError({
						severity: ErrorSeverity.ERROR,
						message: `Error rendering footnote [^${ref.identifier}]: ${errorMessage}`,
						context: 'inline rendering',
						originalError: error
					});
				}
				return '';
			}
		}
		case 'inlineCode':
			return renderInlineCode(node as InlineCode);
		case 'inlineMath': {
			// Convert LaTeX to Typst math syntax
			const mathNode = node as InlineMathNode;
			const value = mathNode.value.trim();
			
			try {
				const typstMath = tex2typst(value);
				
				// Check if this was originally $$...$$ (display/block math) or $...$ (inline math)
				const isDisplayMath = mathNode.position?.end?.offset != null && 
					mathNode.position?.start?.offset != null &&
					(mathNode.position.end.offset - mathNode.position.start.offset) >= value.length + 4;
				
				// Display math ($$): use spaces for block-style rendering
				// Inline math ($): no spaces for inline rendering
				return isDisplayMath ? `$ ${typstMath} $` : `$${typstMath}$`;
			} catch (error) {
				// Fallback: use original LaTeX if conversion fails
				const errorMessage = error instanceof Error ? error.message : String(error);
				if (context.onError) {
					context.onError({
						severity: ErrorSeverity.WARNING,
						message: `Failed to convert inline math LaTeX to Typst: ${errorMessage}`,
						context: 'inline math rendering',
						originalError: error,
						details: { latex: value }
					});
				}
				const isDisplayMath = mathNode.position?.end?.offset != null && 
					mathNode.position?.start?.offset != null &&
					(mathNode.position.end.offset - mathNode.position.start.offset) >= value.length + 4;
				return isDisplayMath ? `$ ${value} $` : `$${value}$`;
			}
		}
		case 'image':
			return renderImage(node as Image, context);
		case 'link':
			return renderLink(node as Link, context);
		case 'linkReference':
			return renderLinkReference(node as LinkReference, context);
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
 * Uses Typst's #image() function for local images,
 * and #external-image() for external (http/https) images.
 * 
 * @param node - Image node
 * @param context - Rendering context with warnings tracking
 * @returns Rendered Typst image function
 */
function renderImage(node: Image, context: RenderContext): string {
	// Check if image is external (starts with http:// or https://)
	const isExternal = /^https?:\/\//i.test(node.url);
	
	if (isExternal) {
		// Mark that external images were detected
		context.warnings.externalImages = true;
		
		try {
			return `#external-image(\n  "${escapeTypstString(node.url)}"\n)`;
		} catch (error) {
			// Return unescaped URL if escaping fails
			return `#external-image(\n  "${node.url}"\n)`;
		}
	} else {
		// Local image - use standard #image() function
		try {
			return `#image("${escapeTypstString(node.url)}")`;
		} catch (error) {
			// Return unescaped URL if escaping fails
			return `#image("${node.url}")`;
		}
	}
}

/**
 * Render a link to Typst.
 * Uses Typst's #link() function with URL and label.
 * 
 * @param node - Link node
 * @param context - Rendering context with definitions and footnotes
 * @returns Rendered Typst link
 */
function renderLink(
	node: Link,
	context: RenderContext
): string {
	const url = escapeTypstString(node.url);
	const label = renderInlines(node.children, context);
	if (!label.trim()) return `#link("${url}")[${escapeTypstText(node.url)}]`;
	return `#link("${url}")[${label}]`;
}

/**
 * Render a reference-style link to Typst.
 * Resolves the reference to get the URL, then renders like a normal link.
 * 
 * @param node - LinkReference node
 * @param context - Rendering context with definitions and footnotes
 * @returns Rendered Typst link or fallback text
 */
function renderLinkReference(
	node: LinkReference,
	context: RenderContext
): string | null {
	const { definitions } = context;
	const def = definitions.get(node.identifier.toLowerCase());
	const label = renderInlines(node.children, context);
	if (!def) {
		if (context.onError) {
			context.onError({
				severity: ErrorSeverity.WARNING,
				message: `Link reference [${node.identifier}] has no matching definition`,
				context: 'inline rendering',
				details: { identifier: node.identifier }
			});
		}
		return label || escapeTypstText(node.label || node.identifier);
	}
	try {
		const url = escapeTypstString(def.url);
		if (!label.trim()) return `#link("${url}")[${escapeTypstText(def.url)}]`;
		return `#link("${url}")[${label}]`;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (context.onError) {
			context.onError({
				severity: ErrorSeverity.ERROR,
				message: `Error rendering link reference [${node.identifier}]: ${errorMessage}`,
				context: 'inline rendering',
				originalError: error
			});
		}
		return label || escapeTypstText(node.label || node.identifier);
	}
}
