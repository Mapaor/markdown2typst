# Use Cases

Real-world examples demonstrating practical applications of markdown2typst.

## Examples

#### 1. Academic Paper ([academic-paper.md](academic-paper.md))


```bash
node examples/02-features/convert-feature.js ../04-use-cases/academic-paper.md
```

#### 2. Technical Documentation ([technical-documentation.md](technical-documentation.md))


```bash
node examples/02-features/convert-feature.js ../04-use-cases/technical-documentation.md
```

#### 3. Blog Post ([blog-post.md](blog-post.md))


```bash
node examples/02-features/convert-feature.js ../04-use-cases/blog-post.md
```

## Planned improvements

### Customizing links for your domain

Custom keys `domain` and `slug` for specifying your domain and a slug for your page will be added, that will override default relative links.

This will be added when the Typst HTML Export is  more mature and websites can be built from Typst files.