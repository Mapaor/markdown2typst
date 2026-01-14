# Advanced Examples

These examples demonstrate advanced usage patterns, custom configurations, and integration strategies for markdown2typst.

## Best Practices

### Error Handling
Always implement error callbacks in production:
```javascript
markdown2typst(markdown, {
  onError: (error) => {
    // Log to your system
    logger.log(error);
  }
});
```

### Batch Processing
Process files efficiently:
```javascript
const files = getMarkdownFiles(directory);
files.forEach(file => {
  const markdown = readFileSync(file);
  const typst = markdown2typst(markdown, options);
  writeFileSync(outputPath, typst);
});
```

### Metadata Management
Prefer programmatic metadata over scattered frontmatter:
```javascript
const commonOptions = {
  authors: ['Team'],
  lang: 'en',
  // ... shared config
};

const typst = markdown2typst(markdown, {
  ...commonOptions,
  title: specificTitle
});
```
