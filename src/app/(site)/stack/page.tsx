import { SectionDivider } from '@/components/common'
import { HardwareCard, SoftwareCatalog } from '@/components/stack'
import { getStack } from '@/server/content/adapters/page'

export const revalidate = 300

export const metadata = {
  title: 'Stack',
  description: '我在工作与生活中长期使用、愿意推荐，或正在关注的设备与软件。',
}

function EmptyStack() {
  return (
    <section>
      <h2 className="section-title">
        02 / <span className="text-foreground">LIBRARY</span>
      </h2>
      <SectionDivider />
      <div className="mx-4 my-8 border border-dashed border-border px-5 py-12 text-center md:mx-8">
        <span className="i-lucide-layers-3 mb-3 inline-block text-2xl text-muted" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">Stack 清单正在整理</h3>
        <p className="mt-2 text-xs leading-relaxed text-muted">发布硬件或软件条目后，它们会显示在这里。</p>
      </div>
    </section>
  )
}

export default async function StackPage() {
  const { hardwareItems, softwareCategories } = await getStack()
  const softwareItemCount = softwareCategories.reduce((total, category) => total + category.items.length, 0)
  const stackIsEmpty = hardwareItems.length === 0 && softwareItemCount === 0

  return (
    <div className="space-y-0">
      <section>
        <h2 className="section-title">
          01 / <span className="text-foreground">STACK</span>
        </h2>
        <SectionDivider />

        <div className="mx-4 my-8 md:mx-8">
          <p className="text-sm leading-relaxed text-muted">
            一个趁手的工具、一款合适的软件，在工作中能成为很好的生产力工具，让工作事半功倍；或许还能在生活中成为很好的消遣工具，让生活充满多姿多彩。
          </p>
        </div>
      </section>

      <SectionDivider />

      {stackIsEmpty ? (
        <EmptyStack />
      ) : (
        <>
          <section id="hardware" className="scroll-mt-8">
            <h2 className="section-title">
              02 / <span className="text-foreground">HARDWARE</span>
            </h2>
            <SectionDivider />

            <div className="mx-4 my-8 md:mx-8">
              {hardwareItems.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 md:gap-5">
                  {hardwareItems.map((item, index) => (
                    <HardwareCard key={item.name} item={item} index={index} />
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-border px-5 py-10 text-center">
                  <span className="i-lucide-monitor-smartphone mb-3 inline-block text-2xl text-muted" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-foreground">硬件清单正在整理</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted">发布硬件条目后，它们会显示在这里。</p>
                </div>
              )}
            </div>
          </section>

          <SectionDivider />

          <section id="software" className="scroll-mt-8">
            <h2 className="section-title">
              03 / <span className="text-foreground">SOFTWARE</span>
            </h2>
            <SectionDivider />

            <div className="mx-4 my-8 md:mx-8">
              <SoftwareCatalog categories={softwareCategories} />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
