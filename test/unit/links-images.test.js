/**
 * Tests for links and images:
 * - Inline links
 * - Reference-style links
 * - Images
 * - URL escaping
 */

import { describe, it } from 'node:test';
import { assertIncludes } from '../helpers/test-utils.js';

describe('Links and Images', () => {
  describe('Links', () => {
    it('should convert inline link', () => {
      assertIncludes(
        '[Typst](https://typst.app/)',
        ['#link("https://typst.app/")[Typst]']
      );
    });

    it('should convert reference-style link', () => {
      assertIncludes(
        '[text][ref]\n\n[ref]: https://example.com',
        ['#link("https://example.com")[text]']
      );
    });

    it('should handle links with query parameters', () => {
      assertIncludes(
        '[link](https://example.com/path?query=value&other=test)',
        ['#link("https://example.com/path?query=value&other=test")']
      );
    });

    it('should handle links with special characters in URL', () => {
      assertIncludes(
        '[link](https://example.com/path?q=hello%20world)',
        ['#link("https://example.com/path?q=hello%20world")']
      );
    });
  });

  describe('Images', () => {
    it('should convert image with alt text', () => {
      assertIncludes(
        '![Alt text](image.png)',
        ['#image("image.png")']
      );
    });

    it('should convert image without alt text', () => {
      assertIncludes(
        '![](photo.jpg)',
        ['#image("photo.jpg")']
      );
    });

    it('should handle images with relative paths', () => {
      assertIncludes(
        '![Logo](./assets/logo.svg)',
        ['#image("./assets/logo.svg")']
      );
    });

    it('should handle images with URLs', () => {
      assertIncludes(
        '![Remote](https://example.com/image.png)',
        ['#external-image']
      );
    });
  });
});
