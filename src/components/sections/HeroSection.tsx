import Link from 'next/link'
import { SectionDivider } from '@/components/common'
import { DEFAULT_HERO_METADATA, parseHeroMetadata } from '@/server/home/adapters/page'
import type { Json } from '@/types/supabase'

function renderMarkedText(text: string, markedClassName: string) {
  const lines = text.split('\n')

  return lines.map((line, lineIndex) => (
    <span key={`${line}-${lineIndex}`}>
      {line.split(/(`[^`]+`)/g).map((part, partIndex) => {
        const marked = part.startsWith('`') && part.endsWith('`')
        const text = marked ? part.slice(1, -1) : part

        return marked ? (
          <span key={`${part}-${partIndex}`} className={markedClassName}>
            {text}
          </span>
        ) : (
          text
        )
      })}
      {lineIndex < lines.length - 1 && <br />}
    </span>
  ))
}

export default function HeroSection({
  title = 'Home',
  metadata = DEFAULT_HERO_METADATA as unknown as Json,
  indexLabel = '01',
}: {
  title?: string
  subtitle?: string
  metadata?: Json
  indexLabel?: string
}) {
  const config = parseHeroMetadata(metadata)

  return (
    <section>
      <h2 className="section-title">
        {indexLabel} / <span className="text-foreground">{title.toUpperCase()}</span>
      </h2>
      <SectionDivider />
      
      <div className="grid md:grid-cols-2 gap-12 items-start mx-4 md:mx-8 my-8">
        <div>
          <h1 className="text-2xl md:text-3xl leading-snug mb-6">
            {renderMarkedText(config.headline, 'font-bold text-muted')}
          </h1>
          
          <div className="flex gap-3">
            <Link 
              href={config.buttonHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-foreground bg-white px-3 py-2 transition-colors cursor-pointer font-medium text-xs uppercase tracking-wide relative group text-black rounded-sm"
            >
              <span className="corner" />
              {config.buttonLabel}
            </Link>
          </div>
        </div>

        <div className="text-sm text-muted leading-relaxed">
          {config.intro.split(/\n{2,}/).map(paragraph => (
            <p key={paragraph} className="mt-4 first:mt-0">
              {renderMarkedText(paragraph, 'font-bold text-foreground')}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
