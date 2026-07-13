<script setup lang="ts">
import type { ContentSection } from '~/types/content'
import { contentRouter, getWorldCategoryTarget, worlds } from '~/utils/content'

const route = useRoute()
const isOpen = ref(false)
const assetUrl = useAssetUrl()
const sections: Array<{ id: ContentSection, label: string }> = [
  { id: 'records', label: 'RECORDS' },
  { id: 'portraits', label: 'PORTRAITS' },
  { id: 'images', label: 'IMAGES' },
]

watch(() => route.path, () => {
  isOpen.value = false
})
</script>

<template>
  <header class="site-header" :class="{ 'site-header--home': route.path === '/' }">
    <NuxtLink class="brand" to="/" aria-label="返回首页">
      <span class="brand-mark" aria-hidden="true"><i /></span>
      <span>
        <strong>GRAND-STARRS-RAY</strong>
        <small>COSMIC BROTH ARCHIVE</small>
      </span>
    </NuxtLink>

    <button
      class="menu-trigger"
      type="button"
      :aria-expanded="isOpen"
      aria-controls="site-navigation"
      @click="isOpen = !isOpen"
    >
      {{ isOpen ? 'CLOSE' : 'MENU' }}
      <span aria-hidden="true">{{ isOpen ? '×' : '≡' }}</span>
    </button>

    <Transition name="menu">
      <div v-if="isOpen" id="site-navigation" class="navigation-panel">
        <div class="navigation-grid">
          <section v-for="(world, worldId) in worlds" :key="worldId" class="navigation-world">
            <div class="navigation-world__heading">
              <img :src="assetUrl(world.star_image_url)" alt="">
              <div>
                <small>{{ worldId }}</small>
                <h2>{{ world.name }}</h2>
              </div>
            </div>
            <nav :aria-label="`${world.name}内容导航`">
              <NuxtLink
                v-for="section in sections"
                :key="section.id"
                :to="getWorldCategoryTarget(String(worldId), section.id) || '/'"
              >
                <span>{{ section.label }}</span>
                <b>{{ section.id === 'records'
                  ? Object.keys(contentRouter[String(worldId)]?.records || {}).length
                  : contentRouter[String(worldId)]?.[section.id].length || 0 }}</b>
              </NuxtLink>
            </nav>
          </section>
        </div>
      </div>
    </Transition>
  </header>
</template>
