import { revalidatePath, revalidateTag } from 'next/cache'

export function revalidatePaths(paths: string[]) {
  paths.forEach(path => revalidatePath(path))
}

export function revalidateTags(tags: string[]) {
  tags.forEach(tag => revalidateTag(tag, 'max'))
}

export function revalidateContent(tags: string[], paths: string[]) {
  revalidateTags(tags)
  revalidatePaths(paths)
}

