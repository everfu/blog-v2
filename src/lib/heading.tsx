import { slugify } from './slugify'

/**
 * 将 React 节点递归展开为纯文本字符串。
 * 服务端/客户端结果一致（纯函数，可在 RSC 中调用）。
 */
export function extractNodeText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractNodeText).join('')
  if (typeof node === 'object' && 'props' in node) {
    const props = (node as { props: { children?: React.ReactNode } }).props
    return extractNodeText(props.children)
  }
  return ''
}

/**
 * 直接从 React 节点计算稳定的 heading id（服务端安全）。
 */
export function headingIdFromChildren(children: React.ReactNode): string {
  return slugify(extractNodeText(children))
}

interface HeadingProps {
  children?: React.ReactNode
  className?: string
  [key: string]: unknown
}

/**
 * 服务端可用的标题工厂：基于 children 文本直接计算 id。
 * 不依赖 useMemo 等 client hooks，可被 MDXRemote 在 RSC 中渲染。
 */
export function makeHeading(tag: 'h1' | 'h2' | 'h3' | 'h4', baseClassName: string) {
  return function Heading({ children, className = '', ...props }: HeadingProps) {
    const id = headingIdFromChildren(children)
    const Tag = tag
    return (
      <Tag id={id} className={`${baseClassName} ${className} scroll-mt-24`.trim()} {...props}>
        {children}
      </Tag>
    )
  }
}
