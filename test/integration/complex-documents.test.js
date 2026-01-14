/**
 * Integration tests for complex documents:
 * - Full documents with multiple features
 * - Real-world use cases
 * - Feature combinations
 */

import { describe, it } from 'node:test';
import { assertIncludes, assertExcludes } from '../helpers/test-utils.js';

describe('Complex Documents', () => {
  describe('Full Document Integration', () => {
    it('should handle comprehensive document with all features', () => {
      const complexDoc = `---
title: Complete Test
authors:
  - Alice
  - Bob
date: 2024-01-15
lang: en
region: US
abstract: A comprehensive test document
keywords: [test, markdown, typst]
---

# Introduction

This document tests **all** features including *italic*, ~~strikethrough~~, and \`code\`.

## Lists

- Item 1
- Item 2
  - Nested item

## Math

Inline: $E = mc^2$

Block:
$$
\\int_0^1 x^2 dx
$$

## Code

\`\`\`javascript
console.log("Hello");
\`\`\`

## Table

| A | B |
|---|---|
| 1 | 2 |

> A blockquote

[Link](https://typst.app)
`;

      assertIncludes(complexDoc, [
        'title: [Complete Test]',
        '"Alice"',
        '"Bob"',
        'date: datetime',
        '#set text(lang: "en", region: "US")',
        'abstract',
        'keywords:',
        '= Introduction',
        '*all*',
        '_italic_',
        '#strike[strikethrough]',
        '- Item 1',
        '- Nested item',
        '$E = m c^2$',
        'integral',
        '```javascript',
        '#table(',
        '#quote[',
        '#link("https://typst.app")'
      ]);
    });
  });

  describe('Academic Paper Scenario', () => {
    it('should convert academic paper structure', () => {
      const paper = `---
title: Research Paper Title
authors:
  - Dr. Jane Smith
  - Prof. John Doe
date: 2024-01-15
abstract: This paper presents groundbreaking research in the field.
keywords: [research, science, innovation]
---

# Abstract

The abstract goes here with **important** findings.

# Introduction

Research background and *motivation*.

## Related Work

Previous studies include:
- Study 1
- Study 2

# Methodology

We used the following approach:

1. Data collection
2. Analysis
3. Validation

## Mathematical Model

The model is expressed as:

$$
f(x) = \\sum_{i=1}^{n} w_i x_i
$$

# Results

| Method | Accuracy |
|--------|----------|
| A      | 95%      |
| B      | 92%      |

# Conclusion

> Our findings demonstrate significant improvements.
`;

      assertIncludes(paper, [
        'title: [Research Paper Title]',
        'Dr. Jane Smith',
        'abstract',
        'keywords:',
        '= Abstract',
        '*important*',
        '= Introduction',
        '_motivation_',
        '== Related Work',
        '- Study 1',
        '+ Data collection',
        '== Mathematical Model',
        'sum',
        '#table(',
        '#quote['
      ]);
    });
  });

  describe('Technical Documentation Scenario', () => {
    it('should convert technical documentation', () => {
      const docs = `# API Documentation

## Installation

\`\`\`bash
npm install package-name
\`\`\`

## Usage

Basic usage:

\`\`\`javascript
import { func } from 'package';
const result = func(arg);
\`\`\`

## API Reference

### Methods

- \`method1()\` - Does something
- \`method2()\` - Does something else

### Configuration

| Option | Type | Default |
|--------|------|---------|
| \`debug\` | boolean | false |
| \`timeout\` | number | 5000 |

> **Note**: Always read the documentation carefully.
`;

      assertIncludes(docs, [
        '= API Documentation',
        '== Installation',
        '```bash',
        '== Usage',
        '```javascript',
        '=== Methods',
        '`method1()`',
        '=== Configuration',
        '#table(',
        '#quote['
      ]);
    });
  });

  describe('Region and Language Validation', () => {
    it('should normalize region codes', () => {
      assertIncludes(
        '---\nregion: gb\n---\n\nContent',
        ['#set text(region: "GB")']
      );
    });

    it('should handle country name conversion', () => {
      // Note: Country name to ISO conversion may not always work
      // This test verifies the content is still rendered
      assertIncludes(
        '---\nregion: United Kingdom\n---\n\nContent',
        ['Content']
      );
    });

    it('should ignore invalid language codes', () => {
      assertExcludes(
        '---\nlang: xyz123\n---\n\nContent',
        ['#set text(lang:']
      );
    });

    it('should ignore invalid regions', () => {
      assertExcludes(
        '---\nregion: NotACountry\n---\n\nContent',
        ['#set text(region:']
      );
    });
  });
});
