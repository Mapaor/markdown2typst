/**
 * Error Handling Example
 * 
 * Demonstrates how to use the error callback feature to capture and handle
 * warnings and errors during the Markdown to Typst conversion process.
 * 
 * Run: node examples/03-advanced/error-handling.js
 */

import { markdown2typst, ErrorSeverity } from '../../dist/markdown2typst.js';

// Example 1: Basic error logging
console.log('=== Example 1: Basic Error Logging ===\n');

const markdown1 = `
# Test Document

This has a [broken reference][missing-link] and a footnote[^missing].

Valid reference: [this works][valid-ref]

[valid-ref]: https://example.com
`;

const errors1 = [];

const typst1 = markdown2typst(markdown1, {
	onError: (error) => {
		errors1.push(error);
		const prefix = error.severity === ErrorSeverity.ERROR ? '❌' : '⚠️';
		console.log(`${prefix} [${error.severity}] ${error.context}: ${error.message}`);
	}
});

console.log(`\nFound ${errors1.length} issue(s)\n`);
console.log('Output preview:');
console.log(typst1.substring(0, 150) + '...\n');

// Example 2: Filtering by severity
console.log('=== Example 2: Filtering Errors by Severity ===\n');

const markdown2 = `
---
title: Test
author: [1, 2, 3]
date: not-a-valid-date
---

# Content

Another broken reference: [link][undefined]

Valid content here.
`;

const errors2 = [];
const warnings2 = [];

markdown2typst(markdown2, {
	onError: (error) => {
		if (error.severity === ErrorSeverity.ERROR) {
			errors2.push(error);
		} else if (error.severity === ErrorSeverity.WARNING) {
			warnings2.push(error);
		}
	}
});

console.log(`Errors (${errors2.length}):`);
errors2.forEach((err, i) => {
	console.log(`  ${i + 1}. [${err.context}] ${err.message}`);
});

console.log(`\nWarnings (${warnings2.length}):`);
warnings2.forEach((warn, i) => {
	console.log(`  ${i + 1}. [${warn.context}] ${warn.message}`);
});

// Example 3: Custom error handler with logging
console.log('\n=== Example 3: Custom Error Handler ===\n');

class ConversionLogger {
	constructor() {
		this.errors = [];
		this.warnings = [];
		this.startTime = Date.now();
	}

	log(error) {
		const entry = {
			timestamp: new Date().toISOString(),
			severity: error.severity,
			context: error.context,
			message: error.message,
			details: error.details
		};

		if (error.severity === ErrorSeverity.ERROR) {
			this.errors.push(entry);
		} else {
			this.warnings.push(entry);
		}
	}

	getSummary() {
		const duration = Date.now() - this.startTime;
		return {
			duration: `${duration}ms`,
			totalIssues: this.errors.length + this.warnings.length,
			errors: this.errors.length,
			warnings: this.warnings.length
		};
	}

	printReport() {
		const summary = this.getSummary();
		console.log('Conversion Report:');
		console.log(`  Duration: ${summary.duration}`);
		console.log(`  Total Issues: ${summary.totalIssues}`);
		console.log(`  Errors: ${summary.errors}`);
		console.log(`  Warnings: ${summary.warnings}`);

		if (this.errors.length > 0) {
			console.log('\nError Details:');
			this.errors.forEach((err, i) => {
				console.log(`  ${i + 1}. [${err.context}] ${err.message}`);
			});
		}
	}
}

const logger = new ConversionLogger();

const markdown3 = `
# Document with Issues

Missing reference [here][missing] and footnote[^gone].

Missing image: ![Alt text][missing-img]

Valid content follows...
`;

markdown2typst(markdown3, {
	title: 'Test Document',
	onError: (error) => logger.log(error)
});

logger.printReport();

// Example 4: Graceful degradation
console.log('\n=== Example 4: Graceful Degradation ===\n');

const markdown4 = `
# Production Document

This is critical content.

[This link might break][possibly-missing]

More important content here.

[possibly-missing]: https://example.com
`;

let hasErrors = false;

const typst4 = markdown2typst(markdown4, {
	onError: (error) => {
		if (error.severity === ErrorSeverity.ERROR) {
			hasErrors = true;
			console.log(`⚠️  Issue detected: ${error.message}`);
		}
	}
});

if (hasErrors) {
	console.log('\n⚠️  Conversion completed with issues. Review the output carefully.');
} else {
	console.log('\n✅ Conversion completed successfully!');
}

console.log('\n=== All Error Handling Examples Complete ===');
