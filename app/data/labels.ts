import type { ContentSection } from '../types/content'
import { getRecord } from '../utils/content'

/** Display titles aligned with live cosmicbroth.com menubox copy. */
const imageTitles: Record<string, string> = {
  vlog: 'Travel log',
  maps: 'Atlas',
  darkroom: 'darkroom',
  chessboard: 'chessboard',
}

const portraitTitles: Record<string, string> = {
  database: 'database',
  dreamer: 'Dreamer',
  rumor: 'rumor',
  Chessmen: 'Chessmen',
}

export function getContentLabel(section: ContentSection, id: string): string {
  if (section === 'records') {
    return getRecord(id)?.name || id
  }
  if (section === 'images') {
    return imageTitles[id] || id
  }
  return portraitTitles[id] || id
}

/** Original menu path uses unhyphenated world folder names. */
export function getMenuPath(worldId: string): string {
  return `c:\\${worldId.replace(/-/g, '')}\\database`
}
