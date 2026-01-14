/**
 * Hello World - The Simplest Example
 * 
 * This is the minimal example to get started with markdown2typst.
 * It demonstrates the basic conversion from Markdown to Typst.
 * 
 * Run: node examples/01-getting-started/hello-world.js
 */

import { markdown2typst } from '../../dist/markdown2typst.js';

// Simple Markdown text
const markdown = '# Hello Typst\n\nWelcome to **markdown2typst**!';

// Convert to Typst
const typst = markdown2typst(markdown);

// Display the result
console.log(typst);
