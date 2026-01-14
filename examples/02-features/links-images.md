# Links and Images

This example demonstrates different ways to include links and images in Markdown.

## Basic Links

Visit the [Typst website](https://typst.app/) for documentation.

Check out the [markdown2typst repository](https://github.com/username/markdown2typst) on GitHub.

## Reference-Style Links

You can use reference-style links for cleaner text[^1].

Here's [another reference][ref1] and [one more][ref2].

[ref1]: https://www.example.com
[ref2]: https://www.example.org

## Automatic Links

URLs are automatically converted: https://typst.app/

Email addresses too: user@example.com

## Local Images

Local images (relative or absolute paths) are converted to Typst's `#image()` function.

Example relative path JPG image:

![Local cat image](assets/cat.jpg)

Example absolute path SVG image:

![GitHub logo](./gh-logo.svg)

## External Images

External images (http/https URLs) are handled specially with a placeholder:

![External placeholder](https://picsum.photos/id/638/536/354.jpg)

![Another external image](https://picsum.photos/id/640/536/354.jpg "External Logo")

External images show a warning box with a link because Typst cannot directly embed remote images.

## Conversion Behavior

**Local images** → `#image("/assets/cat.jpg")`

**External images** → `#external-image("https://example.com/image.jpg")`

When external images are detected, the converter automatically adds an `#external-image()` function definition to display a visual placeholder with a clickable link.

## Notes

- Local images use Typst's `#image()` function
- External images use a custom `#external-image()` placeholder
- Links use Typst's `#link()` function
- Reference-style syntax images support is planned

[^1]: Reference-style links keep the text readable while allowing reusable link definitions.
