import Link from 'next/link'
import { SectionDivider } from '@/components/common'
import { siteConfig } from '@/config/site'

export default function HeroSection() {
  return (
    <section>
      <h2 className="section-title">
        01 / <span className="text-foreground">HOME</span>
      </h2>
      <SectionDivider />
      
      <div className="grid md:grid-cols-2 gap-12 items-start mx-4 md:mx-8 my-8">
        {/* 左侧：标题和介绍 */}
        <div>
          <h1 className="text-2xl md:text-3xl leading-snug mb-6">
            A nook where <span className="font-bold">thoughts</span>
            <br />
            <span className="font-bold">& ideas</span> sometimes
            <br />
            echo
          </h1>
          
          <div className="flex gap-3">
            <Link 
              href={siteConfig.author.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-foreground bg-white px-3 py-2 transition-colors cursor-pointer font-medium text-xs uppercase tracking-wide relative group text-black rounded-sm"
            >
              <span className="corner" />
              ABOUT ME
            </Link>
          </div>
        </div>

        {/* 右侧：关于我 */}
        <div className="text-sm text-muted leading-relaxed">
          <p>
            Self-taught developer passionate about open source. 
            Creator of <span className="font-medium text-foreground">{siteConfig.stats.repositories} repositories</span> with 
            <span className="font-medium text-foreground"> {siteConfig.stats.stars.toLocaleString()} stars</span> on GitHub.
          </p>
          <p className="mt-4">
            Minimalist obsessed with speed and lightweight solutions. 
            Photography enthusiast, traveler, and documentary lover.
          </p>
        </div>
      </div>
    </section>
  )
}
