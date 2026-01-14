/**
 * Tests for API options:
 * - Custom title and authors
 * - Language and region options
 * - useH1AsTitle option
 * - Options override frontmatter
 */

import { describe, it } from 'node:test';
import { assertIncludes, assertExcludes } from '../helpers/test-utils.js';

describe('Options', () => {
  describe('Metadata Options', () => {
    it('should set custom title via options', () => {
      assertIncludes(
        'Content here',
        ['title: [Custom Title]'],
        { title: 'Custom Title' }
      );
    });

    it('should set custom authors via options', () => {
      assertIncludes(
        'Content',
        ['"Author One"', '"Author Two"'],
        { authors: ['Author One', 'Author Two'] }
      );
    });

    it('should override frontmatter with options', () => {
      assertIncludes(
        '---\ntitle: Original\n---\n\nContent',
        ['title: [Overridden]'],
        { title: 'Overridden' }
      );
    });
  });

  describe('Language Options', () => {
    it('should set language via ISO 639-1 code', () => {
      assertIncludes(
        'Content',
        ['#set text(lang: "en")'],
        { lang: 'en' }
      );
    });

    it('should set language via locale format', () => {
      assertIncludes(
        'Content',
        ['#set text(lang: "zh")'],
        { lang: 'zh-CN' }
      );
    });

    it('should set language via language name', () => {
      assertIncludes(
        'Content',
        ['#set text(lang: "fr")'],
        { lang: 'French' }
      );
    });

    it('should ignore invalid language code', () => {
      assertExcludes(
        'Content',
        ['#set text(lang:'],
        { lang: 'invalid-lang-xyz' }
      );
    });
  });

  describe('Region Options', () => {
    it('should set region via ISO 3166 code', () => {
      assertIncludes(
        'Content',
        ['#set text(region: "US")'],
        { region: 'US' }
      );
    });

    it('should set region via country name', () => {
      assertIncludes(
        'Content',
        ['#set text(region: "CN")'],
        { region: 'China' }
      );
    });

    it('should ignore invalid region', () => {
      assertExcludes(
        'Content',
        ['#set text(region:'],
        { region: 'InvalidCountry123' }
      );
    });

    it('should set both language and region', () => {
      assertIncludes(
        'Content',
        ['#set text(lang: "en", region: "GB")'],
        { lang: 'en-GB', region: 'GB' }
      );
    });
  });

  describe('useH1AsTitle Option', () => {
    it('should use H1 as title when enabled', () => {
      assertIncludes(
        '# My Title\n\nContent',
        ['title: [My Title]', 'Content'],
        { useH1AsTitle: true }
      );
    });

    it('should keep H1 in body when disabled', () => {
      assertIncludes(
        '# My Title\n\nContent',
        ['= My Title', 'Content'],
        { useH1AsTitle: false }
      );
    });

    it('should not duplicate H1 when used as title', () => {
      assertExcludes(
        '# My Title\n\nContent after',
        ['= My Title'],
        { useH1AsTitle: true }
      );
    });
  });
});
