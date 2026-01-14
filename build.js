import esbuild from "esbuild";
import { existsSync, mkdirSync } from "fs";

const isDev = process.argv.includes('--dev');

if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
}

const commonOptions = {
  entryPoints: ["src/markdown2typst.ts"],
  bundle: true,
  format: "esm",
  target: ["es2020"],
  platform: "neutral", // Works in both Node.js and browser
  mainFields: ["module", "main"],
  conditions: ["import", "default"],
  external: [], // Bundle all dependencies
};

async function build() {
  try {
    // Minified version (for production)
    if (!isDev) {
      await esbuild.build({
        ...commonOptions,
        outfile: "dist/markdown2typst.min.js",
        minify: true,
        sourcemap: false,
      });
      console.log('✓ Built: dist/markdown2typst.min.js (minified)');
    }

    // Non-minified version with source map (for development)
    await esbuild.build({
      ...commonOptions,
      outfile: "dist/markdown2typst.js",
      minify: false,
      sourcemap: isDev ? 'inline' : true,
    });
    console.log(`✓ Built: dist/markdown2typst.js ${isDev ? '(with inline sourcemap)' : ''}`);

    console.log('\n Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
