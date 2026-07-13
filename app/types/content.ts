export type ContentSection = 'records' | 'portraits' | 'images'

export interface WorldOverview {
  id: string
  name: string
  color: string
  time_diff: string
  introduce: string
  image_url: string
  star_image_url: string
  x: number
  y: number
  r: number
  compass?: unknown
}

export interface ContentRouterWorld {
  records: Record<string, string[]>
  portraits: string[]
  images: string[]
}

export type ContentRouter = Record<string, ContentRouterWorld>

export interface Introduction {
  image_url: string
  introduce: string
}

export type Introductions = Record<
  string,
  Record<ContentSection, Record<string, Introduction>>
>

export interface RecordIndex {
  id: string
  name: string
  image_url: string
  type: string
  time: string
  instrution: string
  world: string
  worldId: string
  chapters: string[]
}

export interface PortraitImage {
  image_url: string
  content: string
}

export interface PortraitEntry {
  name: string
  information: string
  portraits: PortraitImage[]
}

export interface GalleryEntry {
  image_url: string
  instrution: string
}

export interface ContentCard extends Introduction {
  id: string
  section: ContentSection
  target: string
}
