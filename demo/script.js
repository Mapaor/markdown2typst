// Import markdown2typst from CDN
import markdown2typst from 'https://cdn.jsdelivr.net/npm/markdown2typst@0.1.2/dist/markdown2typst.min.js';

// Get the input and output textarea elements of the DOM
const markdownInput = document.getElementById('markdown-input');
const typstOutput = document.getElementById('typst-output');

// Function to convert markdown to typst (library wrapper with error handling)
function convertMarkdownToTypst() {
    const markdown = markdownInput.value; // Get value (content) from textarea elements
    
    try {
        // Convert using the markdown2typst library
        const typst = markdown2typst(markdown);
        typstOutput.value = typst;
    } catch (error) {
        typstOutput.value = `Error: ${error.message}`;
        console.error('Conversion error:', error);
    }
}

// Add event listener for real-time conversion
markdownInput.addEventListener('input', convertMarkdownToTypst);

const copyIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-icon lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>';

document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const targetId = btn.dataset.target;
        const textarea = document.getElementById(targetId);
        
        try {
            // Copy to clipboard
            await navigator.clipboard.writeText(textarea.value);
            
            // Show check icon
            btn.innerHTML = checkIcon;
            btn.style.opacity = '1';
            
            // Reset to copy icon after 1 second
            setTimeout(() => {
                btn.innerHTML = copyIcon;
                btn.style.opacity = '';
            }, 1000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });
});
