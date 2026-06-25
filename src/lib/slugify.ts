/**
 * 将标题文本转换为 URL 友好的 slug。
 * - 保留中文、英文、数字
 * - 连续非保留字符合并为单个 `-`
 * - 首尾 `-` 去除
 * - 空结果回退为 `heading`
 *
 * 服务端 `extractHeadings` 与 rehype 阶段 `rehypeSlugify` 共用此实现，
 * 确保 TOC id 与 DOM 中标题 id 完全一致。
 */
export function slugify(text: string): string {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || 'heading'
}
