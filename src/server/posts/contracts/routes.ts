type PostRouteData = {
  slug: string
  year: string
}

export function getPostHref(post: PostRouteData): string {
  return `/${post.year}/${post.slug}`
}
