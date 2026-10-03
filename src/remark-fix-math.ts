import { visit } from 'unist-util-visit';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';

/**
 * Remark plugin to fix math blocks that swallowed adjacent text because 
 * of a missing newline before the closing $$.
 */
export function remarkFixAdjacentMath() {
	return (tree: any) => {
		// First pass: fix the nodes and store the extracted nodes
		visit(tree, 'math', (node: any) => {
			let value = node.value || '';
			const meta = node.meta;
			
			// Reconstruct the full string because remark-math treats adjacent text as meta
			if (meta) {
				value = meta + (value ? '\n' + value : '');
				node.meta = null; // Clear meta since it was actually part of the math
			}
			
			// Look for the first occurrence of $$ in the value
			const match = value.match(/\$\$/);
			
			if (match) {
				// Found a stray $$ inside the math block!
				// This means the math block swallowed the closing delimiter and everything after it.
				
				const splitIndex = match.index;
				const mathContent = value.substring(0, splitIndex);
				const remainder = value.substring(splitIndex + 2); // skip $$
				
				// Fix the math node
				node.value = mathContent.trim();
				
				// We need to append the remainder as new parsed markdown nodes after this node
				if (remainder.trim().length > 0) {
					// Parse the remainder with full features
					const processor = unified()
						.use(remarkParse)
						.use(remarkGfm, { singleTilde: false })
						.use(remarkMath)
						// Notice we also recursively apply this plugin in case the remainder has more adjacent math
						.use(remarkFixAdjacentMath);
					
					const remainderAst = processor.parse(remainder.trim());
					const remainderTree = processor.runSync(remainderAst);
					
					// Store the nodes to be inserted
					node.data = node.data || {};
					node.data.insertAfter = (remainderTree as any).children;
				}
			} else {
				node.value = value.trim();
			}
		});

		// Second pass: insert the extracted nodes
		visit(tree, (node: any, index: number | undefined, parent: any) => {
			if (node.data && node.data.insertAfter && parent && index !== undefined) {
				parent.children.splice(index + 1, 0, ...node.data.insertAfter);
				delete node.data.insertAfter;
			}
		});
	};
}
