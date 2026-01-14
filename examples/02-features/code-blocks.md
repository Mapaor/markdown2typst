# Code Blocks

This example demonstrates various code block features.

## Inline Code

Use the `print()` function to display output.

Variable assignment: `x = 42`

## Code Blocks with Syntax Highlighting

### Python

```python
def fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Calculate the 10th Fibonacci number
result = fibonacci(10)
print(f"The 10th Fibonacci number is: {result}")
```

### JavaScript

```javascript
// Class definition
class Calculator {
  constructor() {
    this.result = 0;
  }

  add(a, b) {
    this.result = a + b;
    return this.result;
  }
}

const calc = new Calculator();
console.log(calc.add(5, 3)); // Output: 8
```

### Rust

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
    
    let doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();
    println!("Doubled: {:?}", doubled);
}
```

### JSON

```json
{
  "name": "markdown2typst",
  "version": "1.0.0",
  "description": "Convert Markdown to Typst",
  "author": "Your Name",
  "license": "MIT"
}
```

## Code Without Language Specification

```
This is a plain code block
without syntax highlighting.
It's useful for pseudo-code
or plain text output.
```

## Note
Luckily no language names mapping is necessary because Typst supports all Markdown languages.

Besides Typst also supports the "typ", "typc", and "typm" tags for Typst markup, Typst code, and Typst math, respectively. 

Which means you can add Typst code blocks in Markdown and although they won't get highlighting in a Markdown editor they will in a Typst editor.

Here's an example:

```typ
#let name = "Typst"
This is #name's documentation.
It explains #name.

#let my-add(x, y) = x + y
Sum is #my-add(2, 3).
```