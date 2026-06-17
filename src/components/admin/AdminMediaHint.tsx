import Link from 'next/link'

export default function AdminMediaHint({
  folder = 'uploads',
  label = '媒体库',
}: {
  folder?: string
  label?: string
}) {
  return (
    <Link
      href={`/admin/media?folder=${folder}`}
      className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground underline-offset-4 hover:underline"
    >
      <span className="i-lucide-images text-xs" />
      从{label}复制链接
    </Link>
  )
}

