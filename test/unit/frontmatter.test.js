/**
 * Tests for YAML frontmatter parsing:
 * - Basic metadata (title, author, date)
 * - Language and region
 * - Abstract and keywords
 * - Multiple authors
 */

import { describe, it } from 'node:test';
import { assertIncludes } from '../helpers/test-utils.js';

describe('Frontmatter', () => {
  describe('Basic Metadata', () => {
    it('should parse title and author', () => {
      assertIncludes(
        '---\ntitle: My Document\nauthor: John Doe\n---\n\nContent',
        ['title: [My Document]', '"John Doe"', 'Content']
      );
    });

    it('should parse multiple authors', () => {
      assertIncludes(
        '---\nauthors:\n  - Alice\n  - Bob\n---\n\nText',
        ['"Alice"', '"Bob"']
      );
    });

    it('should parse date', () => {
      assertIncludes(
        '---\ndate: 2024-01-15\n---\n\nContent',
        ['date: datetime(day: 15, month: 1, year: 2024)']
      );
    });
  });

  describe('Language and Region', () => {
    it('should parse language ISO code', () => {
      assertIncludes(
        '---\nlang: es\n---\n\nContent',
        ['#set text(lang: "es")']
      );
    });

    it('should parse language in locale format', () => {
      assertIncludes(
        '---\nlanguage: en-US\n---\n\nContent',
        ['#set text(lang: "en")']
      );
    });

    it('should parse region', () => {
      assertIncludes(
        '---\nregion: FR\n---\n\nContent',
        ['#set text(region: "FR")']
      );
    });

    it('should parse language and region together', () => {
      assertIncludes(
        '---\nlang: de\nregion: Germany\n---\n\nContent',
        ['#set text(lang: "de", region: "DE")']
      );
    });

    it('should handle ISO 639-2 language code', () => {
      assertIncludes(
        '---\nlang: eng\n---\n\nContent',
        ['#set text(lang: "en")']
      );
    });

    it('should handle ISO 639-3 language code', () => {
      assertIncludes(
        '---\nlang: spa\n---\n\nContent',
        ['#set text(lang: "es")']
      );
    });

    it('should handle ISO 639-2B language code', () => {
      assertIncludes(
        '---\nlang: deu\n---\n\nContent',
        ['#set text(lang: "de")']
      );
    });
  });

  describe('Abstract and Keywords', () => {
    it('should parse abstract', () => {
      assertIncludes(
        '---\nabstract: This is the abstract\n---\n\nContent',
        ['#let abstract = [This is the abstract]']
      );
    });

    it('should parse keywords', () => {
      assertIncludes(
        '---\nkeywords: [markdown, typst, converter]\n---\n\nContent',
        ['keywords:', '"markdown"', '"typst"', '"converter"']
      );
    });

    it('should handle both abstract and keywords', () => {
      assertIncludes(
        '---\nabstract: Test abstract\nkeywords: [test, demo]\n---\n\nContent',
        ['#let abstract', 'keywords:', '"test"', '"demo"']
      );
    });
  });
});
