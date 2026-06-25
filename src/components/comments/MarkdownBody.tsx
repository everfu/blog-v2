import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import type { EmojiImageToken } from './types'

function escapeMarkdownImageAlt(value: string) {
  return value.replace(/[[\]\\]/g, '\\$&')
}

function renderEmojiShortcodes(body: string, emojiImages?: Map<string, EmojiImageToken>) {
  if (!emojiImages?.size) return body

  return body.replace(/::([^:\n]{1,80})::/g, (match, shortcode: string) => {
    const token = emojiImages.get(shortcode)
    if (!token) return match

    return `![${escapeMarkdownImageAlt(token.label)}](<${token.icon}>)`
  })
}

export function MarkdownBody({ body, emojiImages }: { body: string, emojiImages?: Map<string, EmojiImageToken> }) {
  const renderedBody = useMemo(() => renderEmojiShortcodes(body, emojiImages), [body, emojiImages])

  return (
    <div className="comment-markdown max-w-none text-sm leading-relaxed text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-4">
              {children}
            </a>
          ),
          p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
          code: ({ children }) => (
            <code className="bg-card px-1 py-0.5 text-[0.85em]">
              {children}
            </code>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src || ''}
              alt={alt || ''}
              title={alt || ''}
              className="inline-block h-5 w-5 align-[-0.2em] object-contain"
            />
          ),
        }}
      >
        {renderedBody}
      </ReactMarkdown>
    </div>
  )
}
