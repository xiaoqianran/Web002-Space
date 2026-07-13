import { describe, expect, it } from 'vitest'
import routerData from '../../api/router.json'
import type { ContentRouter } from '../../app/types/content'
import { buildPrerenderRoutes, getCategoryTarget, getRecordTarget } from '../../app/utils/routes'

const router = routerData as ContentRouter

describe('content route catalog', () => {
  it('builds every unique content and redirect route', () => {
    const routes = buildPrerenderRoutes(router)

    expect(routes).toHaveLength(81)
    expect(new Set(routes).size).toBe(routes.length)
    expect(routes).toContain('/cosmic-broth/records/yuzhoutang/c1')
    expect(routes).toContain('/meta-room/records/guovssahas/c20')
    expect(routes).toContain('/meta-room/portraits/Chessmen')
    expect(routes).toContain('/fogbound-box/images/darkroom')
  })

  it('resolves category entry points from the router snapshot', () => {
    expect(getCategoryTarget(router, 'cosmic-broth', 'records'))
      .toBe('/cosmic-broth/records/yuzhoutang/c1')
    expect(getCategoryTarget(router, 'checkerboard', 'portraits'))
      .toBe('/checkerboard/portraits/dreamer')
    expect(getCategoryTarget(router, 'meta-room', 'images'))
      .toBe('/meta-room/images/chessboard')
  })

  it('rejects unknown worlds and records', () => {
    expect(getCategoryTarget(router, 'unknown', 'images')).toBeNull()
    expect(getRecordTarget(router, 'meta-room', 'unknown')).toBeNull()
  })
})
