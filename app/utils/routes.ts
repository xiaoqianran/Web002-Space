import type { ContentRouter, ContentSection } from '../types/content'

export function getCategoryTarget(
  router: ContentRouter,
  world: string,
  section: ContentSection,
): string | null {
  const category = router[world]?.[section]
  if (!category) return null

  if (section === 'records') {
    const [recordId] = Object.keys(category)
    if (!recordId) return null
    const [chapter] = (category as Record<string, string[]>)[recordId] || []
    return chapter ? `/${world}/records/${recordId}/${chapter}` : null
  }

  const [id] = category as string[]
  return id ? `/${world}/${section}/${id}` : null
}

export function getRecordTarget(
  router: ContentRouter,
  world: string,
  recordId: string,
): string | null {
  const [chapter] = router[world]?.records[recordId] || []
  return chapter ? `/${world}/records/${recordId}/${chapter}` : null
}

export function buildPrerenderRoutes(router: ContentRouter): string[] {
  const routes = new Set<string>(['/'])

  for (const [world, categories] of Object.entries(router)) {
    for (const section of ['records', 'portraits', 'images'] as const) {
      routes.add(`/${world}/${section}`)
    }

    for (const [recordId, chapters] of Object.entries(categories.records)) {
      routes.add(`/${world}/records/${recordId}`)
      for (const chapter of chapters) {
        routes.add(`/${world}/records/${recordId}/${chapter}`)
      }
    }

    for (const id of categories.portraits) {
      routes.add(`/${world}/portraits/${id}`)
    }
    for (const id of categories.images) {
      routes.add(`/${world}/images/${id}`)
    }
  }

  return [...routes]
}
