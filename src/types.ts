/**
 * Type definitions for the markdown2typst library
 * @module types
 */

import type {
	Definition,
	FootnoteDefinition,
	Literal,
	PhrasingContent
} from 'mdast';

/** Error severity levels for conversion warnings and errors */
export enum ErrorSeverity {
	/** Warning that doesn't prevent conversion but may affect output quality */
	WARNING = 'warning',
	/** Error that may result in incorrect or incomplete output */
	ERROR = 'error'
}

/** Error information passed to error callback */
export type ConversionError = {
	/** Severity level of the error */
	severity: ErrorSeverity;
	/** Error message describing what went wrong */
	message: string;
	/** Context about where the error occurred (e.g., 'frontmatter parsing', 'math conversion') */
	context: string;
	/** Original error object if available */
	originalError?: unknown;
	/** Additional metadata about the error */
	details?: Record<string, any>;
};

/** Callback function for handling conversion errors and warnings */
export type ErrorCallback = (error: ConversionError) => void;

/** Extended MDAST node type for marked/highlighted text */
export interface Mark extends Literal {
	type: 'mark';
	children: PhrasingContent[];
}

/** Extended MDAST node type for superscript text */
export interface SuperScript extends Literal {
	type: 'superscript';
	children: PhrasingContent[];
}

/** Extended MDAST node type for subscript text */
export interface SubScript extends Literal {
	type: 'subscript';
	children: PhrasingContent[];
}

/** Extended MDAST node type for block-level math equations */
export interface MathNode extends Literal {
	type: 'math';
}

/** Extended MDAST node type for inline math equations */
export interface InlineMathNode extends Literal {
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
	/** Document language code (ISO 639 standard) (overrides frontmatter) */
	lang?: string;
	/** Alternative language field name (overrides frontmatter) */
	language?: string;
	/** Text region code (overrides frontmatter) */
	region?: string;
	/** Use leading H1 heading as document title (default: false) */
	useH1AsTitle?: boolean;
	/** Callback function for handling errors and warnings during conversion */
	onError?: ErrorCallback;
};

/**
 * Metadata extracted from YAML frontmatter.
 * Follows Typst document() parameters specification.
 * All fields are optional. Unknown fields are ignored.
 */
export type Frontmatter = {
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
 * Merged document metadata after combining options and frontmatter
 */
export type DocumentMetadata = {
	title: string;
	authors: string[];
	description?: string;
	keywords?: string[];
	date?: string;
	abstract?: string;
	lang?: string;
	region?: string;
};

/**
 * Warnings that can be tracked during conversion
 */
export type ConversionWarnings = {
	/** Whether external images were detected */
	externalImages: boolean;
};

/**
 * Context for rendering nodes
 */
export type RenderContext = {
	definitions: Map<string, Definition>;
	footnoteDefinitions: Map<string, FootnoteDefinition>;
	onError?: ErrorCallback;
	/** Track conversion warnings for generating helper functions */
	warnings: ConversionWarnings;
};
