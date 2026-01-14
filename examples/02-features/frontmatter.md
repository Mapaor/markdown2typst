---
title: Understanding YAML Frontmatter
authors:
  - Jane Doe
  - John Smith
date: 2026-01-14
description: A comprehensive guide to using YAML frontmatter with markdown2typst
keywords:
  - markdown
  - typst
  - frontmatter
  - metadata
lang: en
abstract: This document demonstrates how to use YAML frontmatter to add metadata to your Markdown documents. The metadata is extracted and can be used to configure the Typst document.
---

# Introduction

YAML frontmatter is a block of metadata at the beginning of a Markdown file, enclosed by triple dashes (`---`).

## Supported Fields

The markdown2typst library supports the following frontmatter fields:

### Document Information

- **title**: The document title
- **authors**: List of authors (can be a single name or array)
- **date**: Publication or creation date
- **description**: Brief description of the document

### Content Metadata

- **abstract**: Document abstract or summary
- **keywords**: List of keywords or tags

### Localization

- **lang**: Language code (e.g., `en`, `es`, `de`, `fr`, `zh`)
- **region**: Optional region code (e.g., `us`, `gb`, `cn`)

## Benefits

Using frontmatter provides several advantages:

1. **Separation of Concerns**: Keep metadata separate from content
2. **Consistency**: Standardized format for document information
3. **Automation**: Metadata can be used for document generation
4. **Flexibility**: Easy to extend with custom fields

## Example Usage

The frontmatter at the top of this document will be converted to appropriate Typst metadata commands, making it easy to style and format your documents consistently.
