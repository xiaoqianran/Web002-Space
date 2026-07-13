import { describe, expect, it } from 'vitest'
import {
  contentRouter,
  getImageCollection,
  getPortraitCollection,
  getRecord,
  getRecordChapter,
  getWorldCards,
  worlds,
} from '../../app/utils/content'

describe('typed content repository', () => {
  it('loads all worlds and navigation cards', () => {
    expect(Object.keys(worlds)).toHaveLength(4)

    for (const worldId of Object.keys(worlds)) {
      expect(getWorldCards(worldId).length).toBeGreaterThanOrEqual(3)
    }
  })

  it('keeps record indexes aligned with router chapters', async () => {
    for (const [worldId, world] of Object.entries(contentRouter)) {
      for (const [recordId, chapters] of Object.entries(world.records)) {
        const record = getRecord(recordId)
        expect(record?.worldId).toBe(worldId)
        expect(record?.chapters).toHaveLength(chapters.length)
        for (const chapter of chapters) {
          expect((await getRecordChapter(recordId, chapter))?.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('loads portrait and image collections', async () => {
    expect((await getPortraitCollection('database'))?.length).toBe(11)
    expect((await getPortraitCollection('Chessmen'))?.length).toBe(15)
    expect((await getImageCollection('vlog'))?.length).toBe(21)
    expect((await getImageCollection('chessboard'))?.length).toBe(23)
  })
})
