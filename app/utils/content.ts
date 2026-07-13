import introductionsData from '../../api/introduces.json'
import routerData from '../../api/router.json'
import { worldOverview } from '../data/worlds'
import type {
  ContentCard,
  ContentRouter,
  ContentSection,
  GalleryEntry,
  Introductions,
  PortraitEntry,
  RecordIndex,
  WorldOverview,
} from '../types/content'
import { getCategoryTarget } from './routes'

const recordIndexes = import.meta.glob('../../api/records/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, RecordIndex>

const recordChapters = import.meta.glob('../../api/records/*/*.json', {
  import: 'default',
}) as Record<string, () => Promise<string[]>>

const portraitCollections = import.meta.glob('../../api/portraits/*.json', {
  import: 'default',
}) as Record<string, () => Promise<PortraitEntry[]>>

const imageCollections = import.meta.glob('../../api/images/*.json', {
  import: 'default',
}) as Record<string, () => Promise<GalleryEntry[]>>

export const contentRouter = routerData as ContentRouter
export const introductions = introductionsData as Introductions
export const worlds = worldOverview

export function getWorld(worldId: string): WorldOverview | null {
  return worlds[worldId] || null
}

export function getRecord(recordId: string): RecordIndex | null {
  return recordIndexes[`../../api/records/${recordId}.json`] || null
}

export async function getRecordChapter(recordId: string, chapter: string): Promise<string[] | null> {
  const load = recordChapters[`../../api/records/${recordId}/${chapter}.json`]
  return load ? await load() : null
}

export async function getPortraitCollection(id: string): Promise<PortraitEntry[] | null> {
  const load = portraitCollections[`../../api/portraits/${id}.json`]
  return load ? await load() : null
}

export async function getImageCollection(id: string): Promise<GalleryEntry[] | null> {
  const load = imageCollections[`../../api/images/${id}.json`]
  return load ? await load() : null
}

export function getWorldCards(worldId: string): ContentCard[] {
  const worldIntroductions = introductions[worldId]
  if (!worldIntroductions) return []

  return (['records', 'portraits', 'images'] as const).flatMap((section) => {
    const entries = worldIntroductions[section] || {}
    return Object.entries(entries).flatMap(([id, introduction]) => {
      const target = section === 'records'
        ? contentRouter[worldId]?.records[id]?.[0]
          ? `/${worldId}/records/${id}/${contentRouter[worldId].records[id][0]}`
          : null
        : `/${worldId}/${section}/${id}`
      return target ? [{ id, section, target, ...introduction }] : []
    })
  })
}

export function getWorldCategoryTarget(worldId: string, section: ContentSection): string | null {
  return getCategoryTarget(contentRouter, worldId, section)
}
