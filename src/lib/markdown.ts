import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import GithubSlugger from 'github-slugger'

const sanitizeSchema = {
  ...defaultSchema,
  // Keep heading ids unprefixed so outline jumps can target them directly.
  clobberPrefix: '',
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ['className']],
    span: [...(defaultSchema.attributes?.span ?? []), ['className']],
    ul: [...(defaultSchema.attributes?.ul ?? []), ['className']],
    ol: [...(defaultSchema.attributes?.ol ?? []), ['className']],
    li: [...(defaultSchema.attributes?.li ?? []), ['className']],
    input: [
      ...(defaultSchema.attributes?.input ?? []),
      ['type', 'checkbox'],
      'checked',
      'disabled',
    ],
    h1: [...(defaultSchema.attributes?.h1 ?? []), ['id']],
    h2: [...(defaultSchema.attributes?.h2 ?? []), ['id']],
    h3: [...(defaultSchema.attributes?.h3 ?? []), ['id']],
    h4: [...(defaultSchema.attributes?.h4 ?? []), ['id']],
    h5: [...(defaultSchema.attributes?.h5 ?? []), ['id']],
    h6: [...(defaultSchema.attributes?.h6 ?? []), ['id']],
  },
} as typeof defaultSchema

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  // Sanitize first, then slug — otherwise sanitize prefixes ids with `user-content-`.
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeSlug)
  .use(rehypeStringify)

export async function renderMarkdown(source: string): Promise<string> {
  const file = await processor.process(source)
  // GFM emits disabled checkboxes; enable them for interactive preview toggles.
  return String(file).replace(
    /(<input\b[^>]*\btype="checkbox"[^>]*)\s+disabled(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi,
    '$1',
  )
}

export type OutlineHeading = {
  id: string
  text: string
  level: number
  /** 1-based line number in the source */
  line: number
  /** Absolute character offset of the heading line start */
  from: number
}

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*$/gm

function plainHeadingText(raw: string): string {
  return raw
    .replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]+/g, '')
    .trim()
}

export function extractOutline(source: string): OutlineHeading[] {
  const headings: OutlineHeading[] = []
  const slugger = new GithubSlugger()

  for (const match of source.matchAll(HEADING_RE)) {
    const level = match[1].length
    const text = plainHeadingText(match[2])
    const id = slugger.slug(text) || 'section'
    const from = match.index ?? 0
    const line = (source.slice(0, from).match(/\n/g) ?? []).length + 1
    headings.push({ id, text, level, line, from })
  }

  return headings
}

/** Active outline id for a caret offset (last heading at or before the caret). */
export function activeOutlineId(
  headings: OutlineHeading[],
  caret: number,
): string | null {
  let active: string | null = null
  for (const heading of headings) {
    if (heading.from <= caret) active = heading.id
    else break
  }
  return active
}

export function countWords(source: string): number {
  const plain = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/[#>*_\-|]/g, ' ')
    .trim()

  if (!plain) return 0
  return plain.split(/\s+/).filter(Boolean).length
}
