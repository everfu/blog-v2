import { slugify } from './slugify'

export interface TocHeading {
  id: string
  text: string
  level: number
}

/**
 * 从 markdown 文本中提取所有 h1/h2/h3 标题。
 * 不依赖 unified/remark 等外部包，使用正则解析以保持轻量。
 *
 * 服务端调用，结果传递给客户端 TableOfContents 组件。
 *
 * 处理边界：
 * - 跳过围栏代码块（``` 或 ~~~）
 * - 跳过 ::: directive 容器（callout 等）
 * - 仅识别行首的 ATX 风格标题
 * - 去除常见行内 md 标记
 */
export function extractHeadings(md: string): TocHeading[] {
  const headings: TocHeading[] = []
  const lines = md.split(/\r?\n/)
  let inFence = false
  let fenceMarker = ''
  let inDirective = false
  for (const raw of lines) {
    const line = raw.trimEnd()
    if (inFence) {
      if (line.trim().startsWith(fenceMarker)) inFence = false
      continue
    }
    if (inDirective) {
      // remark-directive 容器以 :::`  闭合（3+ 冒号）
      if (/^:::{2,}\s*$/.test(line.trim())) inDirective = false
      continue
    }
    const fenceMatch = line.match(/^(\s{0,3})(```+|~~~+)/)
    if (fenceMatch) {
      inFence = true
      fenceMarker = fenceMatch[2]
      continue
    }
    // 开启 directive 容器：`::: name options`
    if (/^:::\s+\S+/.test(line.trim())) {
      inDirective = true
      continue
    }
    const m = line.match(/^(#{1,3})\s+(.+?)\s*#*\s*$/)
    if (m) {
      const level = m[1].length
      const text = stripInlineMd(m[2])
      if (!text) continue
      headings.push({ id: slugify(text), text, level })
    }
  }
  return headings
}

/** 简单去除常见行内 md 标记：粗体、斜体、代码、链接、图片。 */
function stripInlineMd(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim()
}
