/**
 * Advanced Options Example
 * 
 * Demonstrates how to use various options to customize the conversion process.
 * This includes metadata overrides, language settings, and frontmatter handling.
 * 
 * Run: node examples/03-advanced/advanced-options.js
 */

import { markdown2typst } from '../../dist/markdown2typst.js';

// Example 1: Basic options
console.log('\/\/ --------- Example 1: Basic Metadata Options ---------\n');

const markdown1 = `
# Introduction

This is a simple document.
`;

const typst1 = markdown2typst(markdown1, {
	title: 'My Technical Document',
	authors: ['Alice Johnson', 'Bob Smith'],
	date: '2026-01-14',
	lang: 'en'
});

console.log(typst1);

// Example 2: Overriding frontmatter
console.log('\n\/\/ --------- Example 2: Overriding Frontmatter ---------\n');

const markdown2 = `---
title: Original Title
authors: Charlie Brown
lang: fr
---

# Content

This document has frontmatter, but options will override it.
`;

const typst2 = markdown2typst(markdown2, {
	title: 'Overridden Title',
	authors: ['New Author'],
	lang: 'en'
});

console.log(typst2);

// Example 3: Respecting frontmatter
console.log('\n\/\/ --------- Example 3: Using Frontmatter Only ---------\n');

const markdown3 = `---
title: Document from Frontmatter
authors:
  - Diana Prince
  - Bruce Wayne
date: 2026-01-14
abstract: This abstract comes from the frontmatter.
keywords:
  - example
  - metadata
lang: en
---

# Main Content

When no options are provided, frontmatter values are used.
`;

const typst3 = markdown2typst(markdown3);

console.log(typst3);

// Example 4: All the front-matter keys
console.log('\n\/\/ ---------  Example 4: More Metadata Configuration ---------\n');

const markdown4 = `
## Introduction
This document has now some keywords and description as standard PDF document metadata.
`;

const typst4 = markdown2typst(markdown4, {
	title: 'Novel Research Findings',
	authors: ['Dr. Jane Smith', 'Prof. John Doe', 'Dr. Emily Clark'],
	date: '2026-01-14',
	description: 'A comprehensive study on advanced topics',
	keywords: ['research', 'science', 'innovation'],
	lang: 'en',
	abstract: 'This paper explores groundbreaking research in the field, presenting comprehensive analysis and novel methodologies that advance our understanding.'
});

console.log(typst4);

// Example 5: Using H1 as title
console.log('\n\/\/ --------- Example 5: Using Leading H1 as Title ---------\n');

const markdown5 = `
# This is first heading H1

There is no front-matter nor author defined here, the title appears because the \`useH1AsTitle\` custom option has been set to \`true\`.
`;

const typst5 = markdown2typst(markdown5, {useH1AsTitle: true});

console.log(typst5);

console.log('\n\/\/ ---------------- ALL EXAMPLES COMPLETED ----------------');
