/**
 * Basic Formatting Example
 * 
 * Demonstrates how to convert a Markdown file with basic formatting
 * features like headings, text styles, lists, links, and blockquotes.
 * 
 * Run: node examples/01-getting-started/basic-formatting.js
 */

import { markdown2typst } from '../../dist/markdown2typst.js';
import { readFileSync } from 'fs';

// Read the Markdown file
const markdown = readFileSync('./examples/01-getting-started/basic-formatting.md', 'utf-8');

// Convert to Typst
const typst = markdown2typst(markdown);

// Display the result
console.log('\/\/ ------------- Converted Typst Output -------------\n');
console.log(typst);
console.log('\n\/\/ ------------- Conversion Complete -------------');
