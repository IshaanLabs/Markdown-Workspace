import { renderMarkdown } from '@/lib/markdown'
import { downloadText, slugifyFilename } from '@/lib/files/download'

const EXPORT_CSS = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
    color: #0f172a;
    background: #ffffff;
    line-height: 1.7;
  }
  .doc {
    max-width: 44rem;
    margin: 0 auto;
    padding: 3rem 1.5rem 4rem;
  }
  h1, h2, h3, h4, h5, h6 {
    line-height: 1.25;
    letter-spacing: -0.02em;
    margin: 1.6em 0 0.6em;
  }
  h1 { font-size: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.35em; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.2rem; }
  p, ul, ol, blockquote, pre, table { margin: 0.9em 0; }
  a { color: #0f766e; }
  code {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 0.9em;
    background: #f1f5f9;
    padding: 0.1em 0.35em;
    border-radius: 0.3em;
  }
  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 1rem 1.1rem;
    border-radius: 0.75rem;
    overflow-x: auto;
  }
  pre code { background: transparent; padding: 0; color: inherit; }
  blockquote {
    border-left: 3px solid #14b8a6;
    margin-left: 0;
    padding: 0.2em 0 0.2em 1em;
    color: #334155;
    background: #f0fdfa;
  }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #e2e8f0; padding: 0.55rem 0.7rem; text-align: left; }
  th { background: #f8fafc; }
  hr { border: 0; border-top: 1px solid #e2e8f0; margin: 2rem 0; }
  img { max-width: 100%; height: auto; }
`

export async function exportHtmlDocument(source: string, title: string) {
  const body = await renderMarkdown(source)
  const safeTitle = title.replace(/[<>&"]/g, '')
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <style>${EXPORT_CSS}</style>
</head>
<body>
  <article class="doc">
${body}
  </article>
</body>
</html>
`
  downloadText(html, `${slugifyFilename(title)}.html`, 'text/html;charset=utf-8')
}
