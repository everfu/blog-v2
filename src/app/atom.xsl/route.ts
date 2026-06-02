import { atomXsl } from '@/features/feeds/atom-xsl'

export const revalidate = 3600

export async function GET() {
  return new Response(atomXsl, {
    headers: {
      'Content-Type': 'text/xsl; charset=utf-8',
      'Content-Disposition': 'inline; filename="atom.xsl"',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
