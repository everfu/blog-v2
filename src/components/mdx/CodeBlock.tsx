import { codeToHtml } from 'shiki'
import { CodeBlockClient } from './CodeBlockClient'

interface CodeBlockProps {
  children: string
  className?: string
}

// 从 className 中提取语言，如 "language-typescript" -> "typescript"
function extractLanguage(className?: string): string {
  if (!className) return 'text'
  const match = className.match(/language-(\w+)/)
  if (!match) return 'text'
  
  const lang = match[1]
  // 常见语言映射
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'tsx': 'tsx',
    'jsx': 'jsx',
    'sh': 'bash',
    'shell': 'bash',
    'yml': 'yaml',
    'md': 'markdown',
    'py': 'python',
  }
  
  return langMap[lang] || lang
}

export async function CodeBlock({ children, className }: CodeBlockProps) {
  const lang = extractLanguage(className)
  const code = children.replace(/\n$/, '')
  
  const html = await codeToHtml(code, {
    lang,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
  })

  return <CodeBlockClient html={html} code={code} lang={lang} />
}
