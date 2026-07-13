<script setup lang="ts">
import type { ContentSection } from '~/types/content'
import {
  contentRouter,
  getRecord,
  getWorldCategoryTarget,
  introductions,
  worlds,
} from '~/utils/content'

const route = useRoute()
const isOpen = ref(false)
const assetUrl = useAssetUrl()
const worldIds = Object.keys(worlds)
const activeWorldId = ref(worldIds[0] || 'cosmic-broth')

const sections: Array<{ id: ContentSection, label: string }> = [
  { id: 'records', label: 'records' },
  { id: 'portraits', label: 'portraits' },
  { id: 'images', label: 'images' },
]

const imageTitles: Record<string, string> = {
  vlog: 'Travel log',
  maps: 'Atlas',
  darkroom: 'darkroom',
  chessboard: 'chessboard',
}

const activeWorld = computed(() => worlds[activeWorldId.value] || null)

const activeEntries = computed(() => {
  const worldId = activeWorldId.value
  const worldIntro = introductions[worldId]
  if (!worldIntro) return [] as Array<{ section: ContentSection, id: string, label: string, target: string }>

  return sections.flatMap((section) => {
    const bucket = worldIntro[section.id] || {}
    return Object.keys(bucket).map((id) => {
      const target = section.id === 'records'
        ? (() => {
            const chapter = contentRouter[worldId]?.records[id]?.[0]
            return chapter ? `/${worldId}/records/${id}/${chapter}` : `/${worldId}/records/${id}`
          })()
        : `/${worldId}/${section.id}/${id}`

      const label = section.id === 'records'
        ? (getRecord(id)?.name || id)
        : section.id === 'images'
          ? (imageTitles[id] || id)
          : id

      return { section: section.id, id, label, target }
    })
  })
})

const pathLabel = computed(() => `c:\\${activeWorldId.value}\\database`)

watch(() => route.path, () => {
  isOpen.value = false
})

watch(isOpen, (open) => {
  if (typeof document === 'undefined') return
  document.documentElement.style.overflow = open ? 'hidden' : ''
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.documentElement.style.overflow = ''
  }
})

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function selectWorld(worldId: string) {
  activeWorldId.value = worldId
}
</script>

<template>
  <header class="site-header" :class="{ 'site-header--home': route.path === '/', 'is-menu-open': isOpen }">
    <NuxtLink class="brand" to="/" aria-label="返回首页">
      <img class="brand-logo" :src="assetUrl('/assets/logo_CVfnudUF.png')" alt="COSMIC BROTH" width="137" height="55">
      <span class="brand-fallback" aria-hidden="true">
        <span class="brand-mark"><i /></span>
        <span>
          <strong>GRAND-STARRS-RAY</strong>
          <small>ACS&MMS</small>
        </span>
      </span>
    </NuxtLink>

    <button
      class="menu-trigger"
      type="button"
      :aria-expanded="isOpen"
      aria-controls="site-navigation"
      @click="toggleMenu"
    >
      <svg class="menu-trigger__shape" viewBox="0 0 550 180" aria-hidden="true">
        <polygon points="530.85,166.3 56.09,166.3 31.78,145.77 31.78,114.67 19.15,98.95 19.15,33.1 46.32,13.71 494.75,13.71 530.85,47.11" />
      </svg>
      <span class="menu-trigger__label">{{ isOpen ? 'CLOSE' : 'MENU' }}</span>
      <span class="menu-trigger__icon" aria-hidden="true">
        <i /><i /><i />
      </span>
    </button>

    <Transition name="menubox">
      <div
        v-if="isOpen"
        id="site-navigation"
        class="menubox"
        role="dialog"
        aria-modal="true"
        aria-label="站点导航"
      >
        <div class="menubox__edge menubox__edge--left" aria-hidden="true">
          <i /><i /><i />
        </div>

        <aside class="menubox__worldview" v-if="activeWorld">
          <p class="menubox__eyebrow">■ [缩略浏览]::check()</p>
          <div class="menubox__preview">
            <header>
              <span>[{{ activeWorld.name }}]</span>
            </header>
            <div class="menubox__preview-body">
              <img :src="assetUrl(activeWorld.image_url)" :alt="activeWorld.name">
              <div>
                <p>{{ activeWorld.introduce }}</p>
                <NuxtLink
                  class="menubox__explore"
                  :to="getWorldCategoryTarget(activeWorldId, 'records') || '/'"
                  @click="isOpen = false"
                >
                  EXPLORE
                </NuxtLink>
              </div>
            </div>
          </div>
          <pre class="menubox__code">[WORLD.OVERVIEW] INITIALIZING…
01001110 10000011 10001100 11111111 10001101 01010011 01100111
→ projection.scale: 1:2048
→ view_port: READY</pre>
        </aside>

        <div class="menubox__selector">
          <p class="menubox__path">{{ pathLabel }}</p>
          <div class="menubox__columns">
            <div class="menubox__worlds" role="listbox" aria-label="世界列表">
              <button
                v-for="(world, worldId) in worlds"
                :key="worldId"
                type="button"
                class="menubox__world"
                :class="{ active: activeWorldId === worldId }"
                :style="{ '--world-color': world.color }"
                @click="selectWorld(String(worldId))"
              >
                <b>{{ world.name }}</b>
                <i v-if="activeWorldId === worldId" class="menubox__arrow" aria-hidden="true" />
              </button>
            </div>

            <div class="menubox__entries" role="list">
              <template v-for="entry in activeEntries" :key="`${entry.section}-${entry.id}`">
                <p class="menubox__section-label">{{ entry.section }}</p>
                <NuxtLink class="menubox__entry" :to="entry.target" @click="isOpen = false">
                  {{ entry.label }}
                </NuxtLink>
              </template>
            </div>
          </div>
        </div>

        <div class="menubox__edge menubox__edge--right" aria-hidden="true">
          <i /><i /><i />
        </div>
      </div>
    </Transition>
  </header>
</template>
