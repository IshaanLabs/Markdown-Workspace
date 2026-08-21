# Markdown Workspace

Free, open-source **Markdown editor, viewer, and formatter** that runs entirely in your browser. No signup, no backend — edit locally, preview live, and export to Markdown, HTML, DOCX, or PDF.

**Live demo:** [https://ishaanlabs.github.io/Markdown-Workspace/](https://ishaanlabs.github.io/Markdown-Workspace/)

## Features

- **Edit / Split / Preview** view modes
- **CodeMirror 6** editor with Markdown syntax highlighting
- **Live GFM preview** (tables, checklists, strikethrough, and more)
- **Formatting toolbar** — bold, italic, headings, lists, tables, code, links, images, and more
- **Toggleable outline** — jump to any heading in the editor and preview
- **Open & save** `.md` / `.txt` via the File System Access API (with download fallback)
- **Export**
  - `.md` — raw source
  - `.html` — standalone styled document
  - `.docx` — client-side Word document
  - **PDF** — watermark-free print-to-PDF with title page, headers/footers, and page numbers
- Drafts persist in **localStorage**
- Fully **static** — deployable to GitHub Pages

Also try the sister app: **[JSON Workspace](https://ishaanlabs.github.io/Json_Workplace/#/viewer)**

---

## Tech stack

| Layer    | Choice                                         |
| -------- | ---------------------------------------------- |
| UI       | React 19 + Vite + Tailwind CSS                 |
| Editor   | CodeMirror 6                                   |
| Markdown | remark / rehype (unified) + GFM                |
| DOCX     | [`docx`](https://www.npmjs.com/package/docx)    |
| PDF      | Custom print stylesheet + browser print dialog |
| Icons    | Phosphor                                       |

---

## Develop

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build      # production build → dist/
npm run preview    # preview the production build
npm test           # run Vitest tests
npm run lint       # oxlint
```

`vite.config.ts` uses `base: './'` so asset paths work on GitHub Pages project sites.

---

## Deploy to GitHub Pages

1. Build the site:

   ```bash
   npm run build
   ```
2. Publish the `dist/` folder to GitHub Pages (Actions workflow, `gh-pages` branch, or Pages “Deploy from a folder”).
3. Site URL:

   **https://ishaanlabs.github.io/Markdown-Workspace/**

---



## Privacy

Everything runs client-side. Your documents never leave the browser unless you choose to download/export them. Optional Analytics only loads when you configure a Measurement ID.

---

## Contributing

If you have ideas for improvements, bug fixes, or new features, feel free to open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
