import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import { CodeBlock } from './CodeBlock'
import { Callout } from './Callout'
import MDXImage from './MDXImage'

// 导出组件对象供 MDXRemote 使用
export const mdxComponents: MDXComponents = {
    // 标题 - 简洁风格，带左侧装饰线
    h1: ({ children }) => (
      <h1 className="text-xl font-bold mb-4 mt-10 text-foreground flex items-center gap-3">
        <span className="w-1 h-5 bg-foreground rounded-full"></span>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-bold mb-3 mt-8 text-foreground flex items-center gap-2">
        <span className="w-0.5 h-4 bg-muted rounded-full"></span>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-semibold mb-2 mt-6 text-foreground">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-sm font-semibold mb-2 mt-4 text-muted">
        {children}
      </h4>
    ),
    
    // 段落 - 适中的行高和间距
    p: ({ children }) => (
      <p className="text-sm text-foreground/90">
        {children}
      </p>
    ),
    
    // 链接 - 下划线悬停效果
    a: ({ href, children }) => (
      <Link 
        href={href as string} 
        className="text-foreground underline decoration-muted underline-offset-2 hover:decoration-foreground transition-colors"
      >
        {children}
      </Link>
    ),
    
    // 列表 - 自定义标记样式
    ul: ({ children }) => (
      <ul className="mdx-list mb-4 list-disc space-y-1.5 pl-5 text-sm text-foreground/90">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mdx-list mb-4 list-decimal space-y-1.5 pl-5 text-sm text-foreground/90">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="pl-1 leading-7">
        {children}
      </li>
    ),
    
    // 行内代码
    code: ({ children, className }) => {
      // 如果有 className，说明是代码块内的 code，由 pre 处理
      if (className) {
        return <code className={className}>{children}</code>
      }
      // 行内代码样式
      return (
        <code className="px-1.5 py-0.5 bg-card border border-border rounded text-xs font-mono text-foreground">
          {children}
        </code>
      )
    },
    // 代码块 - 使用 Shiki 语法高亮
    pre: ({ children }) => {
      // 获取 code 元素的 props
      const codeElement = children as React.ReactElement<{ children: string; className?: string }>
      const code = codeElement?.props?.children || ''
      const className = codeElement?.props?.className || ''
      
      return <CodeBlock className={className}>{code}</CodeBlock>
    },
    
    // 引用 - 左侧细线 + 斜体
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-muted pl-4 py-1 my-4 text-sm italic text-muted">
        {children}
      </blockquote>
    ),
    
    // 分割线 - 虚线样式与网站一致
    hr: () => (
      <div className="my-8 flex items-center justify-center">
        <div className="flex-1 border-t border-dashed border-border"></div>
        <span className="px-3 text-muted text-xs">✦</span>
        <div className="flex-1 border-t border-dashed border-border"></div>
      </div>
    ),
    
    // 图片 - 带 Lightbox 灯箱功能
    img: ({ src, alt }) => (
      <MDXImage src={src as string} alt={alt || ''} />
    ),
    
    // 表格 - 简洁边框
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="w-full text-sm border-collapse">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b border-border">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-border">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-card/50 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2 text-left text-xs font-semibold text-muted uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 text-foreground/90">
        {children}
      </td>
    ),

    // 强调文本
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-foreground/80">{children}</em>
    ),

    // Callout 组件
    Callout,
}

// 兼容 mdx-components.tsx
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...mdxComponents, ...components }
}
