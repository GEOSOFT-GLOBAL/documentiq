import { mathjax } from "mathjax-full/js/mathjax";
import { TeX } from "mathjax-full/js/input/tex";
import { CHTML } from "mathjax-full/js/output/chtml";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages";

// Initialize MathJax
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX({ packages: AllPackages });
const chtml = new CHTML({
  fontURL:
    "https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2",
});

const html = mathjax.document("", { InputJax: tex, OutputJax: chtml });

export function convertLatexToSVG(latex: string): string {
  try {
    // Convert LaTeX to HTML
    const node = html.convert(latex, {
      display: true,
      em: 16,
      ex: 8,
      containerWidth: 80 * 16,
    });

    // Get the HTML string
    const htmlString = adaptor.outerHTML(node);

    return htmlString;
  } catch (error) {
    console.error("Error converting LaTeX to HTML:", error);
    return `<span style="color: red; font-style: italic;">${escapeHtml(
      latex
    )}</span>`;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
