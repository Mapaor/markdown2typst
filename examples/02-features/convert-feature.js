/**
 * Feature Converter
 * 
 * A generic script to convert any feature example Markdown file to Typst.
 * 
 * Usage: node examples/02-features/convert-feature.js <filename.md>
 * Example: node examples/02-features/convert-feature.js math.md
 */

import { markdown2typst } from '../../dist/markdown2typst.js';
import { readFileSync } from 'fs';
import { basename } from 'path';

// Get filename from command line arguments
const filename = process.argv[2];

if (!filename) {
	console.error('Error: Please provide a Markdown filename');
	console.error('Usage: node convert-feature.js <filename.md>');
	console.error('\nAvailable examples:');
	console.error('  - math.md');
	console.error('  - tables.md');
	console.error('  - code-blocks.md');
	console.error('  - footnotes.md');
	console.error('  - frontmatter.md');
	console.error('  - links-images.md');
	process.exit(1);
}

try {
	// Read the Markdown file
	const filepath = `./examples/02-features/${filename}`;
	const markdown = readFileSync(filepath, 'utf-8');

	// Convert to Typst
	const typst = markdown2typst(markdown);

	// Display the result
	console.log(`// ------------- Converting \`${basename(filename)}\` to Typst -------------\n`);
	console.log(typst);
	console.log('\n\/\/ ------------- Conversion Complete -------------');
} catch (error) {
	console.error(`Error: ${error.message}`);
	process.exit(1);
}
