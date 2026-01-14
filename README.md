# markdown2typst

A JavaScript library for converting Markdown to [Typst](https://typst.app/) code.

## Try it online (PENDING!!!)
See an example use case in this demo website: [https://markdown2typst.vercel.app](https://markdown2typst.vercel.app).

## Supported Markdown features
### GitHub Flavored Markdown (GFM)
- ✔ Headings
- ✔ Bold, italics, striketrought, code
- ✔ Bulleted lists, numbered lists
- ✔ Links
- ✔ Images (only local)
- ✔ Math (inline and block equations)
- ✔ Tables
- ✔ Quotes
- ✔ Code blocks (with highlighting)
- ✔ Dividers (horizontal rule)
- ✔ Footnotes
- ✔ Table of Contents (ToC)
- ✘ Mermaid diagrams --> Coming soon(!)
- ✘ Checklists --> Coming soon(!)
- ✘ HTML, GeoJSON, STL --> Not Typst compatible.

### Markdown Frontmatter
Only works with YAML  for now, TOML support is planned.

Currently supported keys:
- `title` (rich text string)
- `author` (string or array of strings)
- `description` (string)
- `keywords` (array of strings)
- `date` (YYYY-MM-DD string)
- `abstract` (rich text string)
- `lang` (string)
- `region` (string)

For more information see [Typst Document Function](https://typst.app/docs/reference/model/document/), [Jekyll Frontmatter Docs](https://jekyllrb.com/docs/front-matter/) or check the [examples](./examples/full-frontmatter.md).

<details>
<summary>Chosen display of the front-matter keys or custom options  parameters (example)</summary>

### Chosen design
By design the choice has been to support mainly the Typst document parameters, that in principle are just metadata. However the title, and author and date are also displayed. Those could be displayed in any way in Typst, the chosen one has  been the more basic and default way: simply non-style top-centered Title, author and date. With newlines between them. Support for setting the language and a custom abstract in the frontmatter (or custom options) has also been added.

### Example

The following is a complete Markdown example of all the supported front-matter keys:
```
---
title: The Fellowship of the Ring
author:
  - John Doe
  - Jack Doe
  - Jane Doe
description: This is just an example document, this information is in principle stored as metadata only but it can be displayed using context document.
keywords:
  - example
  - document
  - lotr
  - typst
date: 2026-01-12
abstract: In this paper we assess the impacts of the One Ring on Middle Earth and its inhabitants, analyzing both economic and social factors.
lang: en
region: gb
---
```

And the corresponding Typst output is:
```
// ===============  FRONTMATTER  ===============

#set document(
  title: [The Fellowship of the Ring],
  author: ("John Doe", "Jack Doe", "Jane Doe"),
  description: [This is just an example document, this information is in principle stored as metadata only but it can be displayed using context document.],
  keywords: ("example", "document", "lotr", "typst"),
  date: datetime(day: 12, month: 1, year: 2026)
)

#let abstract = [In this paper we assess the impacts of the One Ring on Middle Earth and its inhabitants, analyzing both economic and social factors.]

#align(center)[
  #title() \ \ #context document.author.join(", ", last: " & ") \ \ #context document.date.display() \ \  \ *Abstract* \ #abstract
]

#set text(lang: "en", region: "gb")

//  ============================================
```
</details>

<br>

Note: any non-standard key is simply ignored, all keys are optional. The front-matter as a whole is obviously also optional.

## Installation

### NPM package (for Node.js projects)
Package link:
![](https://www.npmjs.com/package/markdown2typst)

Install it:

```bash
npm install tex2typst
```

### JS Bundle -- PENDING!!!

Available both on JSDeliver and Unpkg.

#### JSDelivr

##### JSDelivr NPM 

```
<script src="https://cdn.jsdelivr.net/npm/..."></script>
```

##### JSDelivr GitHub Link

```
<script src="https://cdn.jsdelivr.net/gh/..."></script>
```

The link points to the `markdown2typst.min.js` file of this repository (inside the `dist` folder).

#### Unpkg (NPM link)

```
<script src="https://unpkg.com/..."></script>
```

### Build from source

```bash
# Clone the repository
git clone https://github.com/Mapaor/markdown2typst.git
cd markdown2typst

# Install dependencies
npm install
```
Make the desired changes to the library (`markdown2typst.ts` file) and then build from source
```bash
# Build the bundle
npm run build
```
The updated javascript bundle will appear in the `dist` folder.

## Usage

### Simple usage

#### Using the bundle

##### In Node.js (ESM) - Locally
```javascript
import { markdown2typst } from './dist/markdown2typst.min.js';

const markdown = '# Hello Typst\n\nThis is a **test**.';
const typst = markdown2typst(markdown);
console.log(typst);
```

##### In the browser - Locally
```html
<script type="module">
  import { markdown2typst } from './dist/markdown2typst.min.js';
  
  const markdown = '# Hello Typst';
  const typst = markdown2typst(markdown);
  console.log(typst);
</script>
```


#### Using the library - Locally

```typescript
import { markdown2typst } from './src/markdown2typst';

const markdown = `
# My Document

This is a paragraph with **bold** and *italic* text.

## Features

- Item 1
- Item 2
`;

const typst = markdown2typst(markdown);
console.log(typst);
```

### Advanced usage

See the [Examples](/examples/README.md) page for advanced examples on how to use the library.

## Internal architecture
Check the [Architecture](./ARCHITECTURE.md) doc for getting a better understanding of how the library works under the hood.

## Contributing
Contributions are more than welcome! See the [Contributing](./CONTRIBUTING.md) guide.

## License

[MIT License](LICENSE)

## Acknowledgments

Built thanks to the following open-source projects:
- [unified](https://unifiedjs.com/) - Text processing framework
- [remark](https://github.com/remarkjs/remark) - Markdown processor. Plugins used:
  - [remark-frontmatter](https://github.com/remarkjs/remark-frontmatter)
  - [remark-gfm](https://github.com/remarkjs/remark-gfm)
  - [remark-math](https://github.com/remarkjs/remark-math)
  - [remark-parse](https://github.com/remarkjs/remark/tree/main)
- [esbuild](https://esbuild.github.io/) - Fast bundler
- [tex2typst](https://github.com/qwinsi/tex2typst) - Typst conversion for LaTeX equations

This code is mainly based on the code by zhaoyiqun (@cosformula on GitHub), more specifically in his [markdownToTypst.ts](https://github.com/cosformula/mdxport/blob/main/src/lib/pipeline/markdownToTypst.ts) custom conversion library (renderer to Typst code) built for his open source project [MDXport](https://mdxport.com).

## Roadmap

- [X] Finish an initial working version
- [X] Add frontmatter support and also allow to pass the keys as custom options of the main function
- [ ] Publish to npm
- [ ] Add a comprehensive test suite
- [ ] Add CLI tool
- [ ] Support custom templates
- [ ] Support more Markdown extensions/flavors/specs