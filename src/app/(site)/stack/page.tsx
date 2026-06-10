import { SectionDivider } from '@/components/common'
import { HardwareCard, SoftwareCard } from '@/components/stack'
import { hardwareItems } from '@/data/hardware'
import { softwareCategories } from '@/data/software'

export default function StackPage() {
  return (
    <div className="space-y-0">
      {/* 01 / STACK */}
      <section>
        <h2 className="section-title">
          01 / <span className="text-foreground">STACK</span>
        </h2>
        <SectionDivider />
        
        <div className="mx-4 md:mx-8 my-8">
          <p className="text-sm text-muted leading-relaxed">
            一个趁手的工具、一款合适的软件，在工作中能成为很好的生产力工具，让工作事半功倍；或许还能在生活中成为很好的消遣工具，让生活充满多姿多彩。
          </p>
        </div>
      </section>

      <SectionDivider />

      {/* 02 / HARDWARE */}
      <section>
        <h2 className="section-title">
          02 / <span className="text-foreground">HARDWARE</span>
        </h2>
        <SectionDivider />
        
        <div className="grid md:grid-cols-2 gap-4 mx-4 md:mx-8 my-8">
          {hardwareItems.map((item) => (
            <HardwareCard key={item.name} item={item} />
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* 03 / SOFTWARE */}
      <section>
        <h2 className="section-title">
          03 / <span className="text-foreground">SOFTWARE</span>
        </h2>
        <SectionDivider />
        
        <div className="mx-4 md:mx-8 my-8">
          <div className="grid md:grid-cols-1 gap-8">
            {softwareCategories.map((category) => (
              <div key={category.name}>
                {/* 标题居中，两侧虚线 */}
                <div className="flex items-center justify-center mb-4">
                  <div className="flex-1 border-t border-dashed border-border" />
                  <h3 className="text-base font-bold px-4 text-foreground">{category.name}</h3>
                  <div className="flex-1 border-t border-dashed border-border" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {category.items.map((item) => (
                    <SoftwareCard key={item.name} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
