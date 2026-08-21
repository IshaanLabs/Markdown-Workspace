import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ExternalHyperlink,
} from 'docx'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import type { Content, ListItem, PhrasingContent, Root } from 'mdast'
import { downloadBlob, slugifyFilename } from '@/lib/files/download'

type DocChild = Paragraph | Table

type TextMark = {
  bold?: boolean
  italics?: boolean
  strike?: boolean
  code?: boolean
}

const headingMap = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
} as const

function phrasingToRuns(
  nodes: PhrasingContent[],
  mark: TextMark = {},
): (TextRun | ExternalHyperlink)[] {
  const runs: (TextRun | ExternalHyperlink)[] = []

  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        runs.push(
          new TextRun({
            text: node.value,
            bold: mark.bold,
            italics: mark.italics,
            strike: mark.strike,
            font: mark.code ? 'Courier New' : undefined,
          }),
        )
        break
      case 'strong':
        runs.push(...phrasingToRuns(node.children, { ...mark, bold: true }))
        break
      case 'emphasis':
        runs.push(...phrasingToRuns(node.children, { ...mark, italics: true }))
        break
      case 'delete':
        runs.push(...phrasingToRuns(node.children, { ...mark, strike: true }))
        break
      case 'inlineCode':
        runs.push(
          new TextRun({
            text: node.value,
            font: 'Courier New',
            bold: mark.bold,
            italics: mark.italics,
          }),
        )
        break
      case 'link': {
        const label =
          node.children
            .map((child) => ('value' in child ? String(child.value) : ''))
            .join('') || node.url
        runs.push(
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: label,
                color: '0F766E',
                underline: {},
              }),
            ],
            link: node.url,
          }),
        )
        break
      }
      case 'break':
        runs.push(new TextRun({ break: 1 }))
        break
      default:
        if ('children' in node && Array.isArray(node.children)) {
          runs.push(...phrasingToRuns(node.children as PhrasingContent[], mark))
        }
        break
    }
  }

  return runs
}

function convertListItem(item: ListItem, ordered: boolean, index: number): Paragraph[] {
  const prefix =
    item.checked != null ? (item.checked ? '☑ ' : '☐ ') : ordered ? `${index}. ` : '• '

  const paragraphs: Paragraph[] = []

  for (const child of item.children) {
    if (child.type === 'paragraph') {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(prefix), ...phrasingToRuns(child.children)],
          spacing: { after: 120 },
        }),
      )
    } else if (child.type === 'list') {
      paragraphs.push(...(convertBlocks([child]) as Paragraph[]))
    }
  }

  if (paragraphs.length === 0) {
    paragraphs.push(new Paragraph({ children: [new TextRun(prefix)] }))
  }

  return paragraphs
}

function convertBlocks(nodes: Content[]): DocChild[] {
  const out: DocChild[] = []

  for (const node of nodes) {
    switch (node.type) {
      case 'heading': {
        const level = Math.min(6, Math.max(1, node.depth)) as 1 | 2 | 3 | 4 | 5 | 6
        out.push(
          new Paragraph({
            heading: headingMap[level],
            children: phrasingToRuns(node.children),
            spacing: { before: 240, after: 120 },
          }),
        )
        break
      }
      case 'paragraph':
        out.push(
          new Paragraph({
            children: phrasingToRuns(node.children),
            spacing: { after: 160 },
          }),
        )
        break
      case 'blockquote':
        for (const child of node.children) {
          if (child.type === 'paragraph') {
            out.push(
              new Paragraph({
                children: phrasingToRuns(child.children),
                indent: { left: 420 },
                border: {
                  left: {
                    style: BorderStyle.SINGLE,
                    size: 18,
                    color: '14B8A6',
                    space: 8,
                  },
                },
                spacing: { after: 120 },
              }),
            )
          } else {
            out.push(...convertBlocks([child]))
          }
        }
        break
      case 'code':
        for (const line of node.value.split('\n')) {
          out.push(
            new Paragraph({
              children: [
                new TextRun({ text: line || ' ', font: 'Courier New', size: 18 }),
              ],
              shading: { type: 'clear', fill: 'F1F5F9' },
              spacing: { after: 0 },
            }),
          )
        }
        out.push(new Paragraph({ children: [], spacing: { after: 160 } }))
        break
      case 'list': {
        let i = 0
        for (const item of node.children) {
          i += 1
          out.push(...convertListItem(item, Boolean(node.ordered), i))
        }
        break
      }
      case 'thematicBreak':
        out.push(
          new Paragraph({
            border: {
              bottom: {
                style: BorderStyle.SINGLE,
                size: 6,
                color: 'CBD5E1',
                space: 1,
              },
            },
            spacing: { before: 200, after: 200 },
          }),
        )
        break
      case 'table': {
        const colCount = Math.max(...node.children.map((row) => row.children.length), 1)
        const rows = node.children.map(
          (row, rowIndex) =>
            new TableRow({
              children: row.children.map(
                (cell) =>
                  new TableCell({
                    width: {
                      size: Math.floor(9000 / colCount),
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: phrasingToRuns(cell.children),
                      }),
                    ],
                    shading:
                      rowIndex === 0 ? { type: 'clear', fill: 'F8FAFC' } : undefined,
                  }),
              ),
            }),
        )
        out.push(
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows,
          }),
        )
        out.push(new Paragraph({ children: [], spacing: { after: 160 } }))
        break
      }
      default:
        if ('children' in node && Array.isArray(node.children)) {
          out.push(...convertBlocks(node.children as Content[]))
        }
        break
    }
  }

  return out
}

export async function exportDocxDocument(source: string, title: string) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(source) as Root
  const children = convertBlocks(tree.children)

  const doc = new Document({
    creator: 'Markdown Workspace',
    title,
    sections: [
      {
        properties: {},
        children:
          children.length > 0
            ? children
            : [new Paragraph({ children: [new TextRun('')] })],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, `${slugifyFilename(title)}.docx`)
}
