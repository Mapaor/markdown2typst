import esbuild from "esbuild";
import { existsSync, mkdirSync } from "fs";

const isDev = process.argv.includes('--dev');

if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
}

const commonOptions = {
  entryPoints: ["src/markdown2typst.ts"],
  bundle: true,
  target: ["es2020"],
  platform: "neutral", // Works in both Node.js and browser
  mainFields: ["module", "main"],
  conditions: ["import", "default"],
  external: [], // Bundle all dependencies
};

async function build() {
  try {
    // ESM format - for modern Node.js and bundlers
    if (!isDev) {
      await esbuild.build({
        ...commonOptions,
        format: "esm",
        outfile: "dist/markdown2typst.min.js",
        minify: true,
        sourcemap: false,
      });
      console.log('✓ Built: dist/markdown2typst.min.js (ESM, minified)');
    }

    // Non-minified version with source map (for development)
    await esbuild.build({
      ...commonOptions,
      format: "esm",
      outfile: "dist/markdown2typst.js",
      minify: false,
      sourcemap: isDev ? 'inline' : true,
    });
    console.log(`✓ Built: dist/markdown2typst.js (ESM)${isDev ? ' with inline sourcemap' : ''}`);

    // IIFE format - for direct browser usage and Firefox extensions
    // Explicitly assigns to window in browsers, works in Node.js VM contexts
    if (!isDev) {
      await esbuild.build({
        ...commonOptions,
        format: "iife",
        globalName: "markdown2typstLib",
        outfile: "dist/markdown2typst.browser.min.js",
        minify: true,
        sourcemap: false,
        banner: {
          js: '(function(global) {',
        },
        footer: {
          js: 'if (typeof window !== "undefined") { window.markdown2typst = markdown2typstLib.default || markdown2typstLib; }' +
              'if (typeof module !== "undefined") { module.exports = markdown2typstLib.default || markdown2typstLib; }' +
              '})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this);',
        },
      });
      console.log('✓ Built: dist/markdown2typst.browser.min.js (UMD-style)');
    }

    await esbuild.build({
      ...commonOptions,
      format: "iife",
      globalName: "markdown2typstLib",
      outfile: "dist/markdown2typst.browser.js",
      minify: false,
      sourcemap: isDev ? 'inline' : true,
      banner: {
        js: '(function(global) {',
      },
      footer: {
        js: 'if (typeof window !== "undefined") { window.markdown2typst = markdown2typstLib.default || markdown2typstLib; }' +
            'if (typeof module !== "undefined") { module.exports = markdown2typstLib.default || markdown2typstLib; }' +
            '})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this);',
      },
    });
    console.log(`✓ Built: dist/markdown2typst.browser.js (UMD-style)${isDev ? ' with inline sourcemap' : ''}`);

    console.log('\n Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
