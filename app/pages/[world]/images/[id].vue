<script setup lang="ts">
import { contentRouter, getImageCollection, getWorld, introductions } from '~/utils/content'

const route = useRoute()
const worldId = String(route.params.world)
const collectionId = String(route.params.id)
const world = getWorld(worldId)
const images = await getImageCollection(collectionId)
const introduction = introductions[worldId]?.images[collectionId]

if (!world || !images || !introduction || !contentRouter[worldId]?.images.includes(collectionId)) {
  throw createError({ statusCode: 404, statusMessage: 'Image collection not found' })
}

const assetUrl = useAssetUrl()
useSeoMeta({
  title: `${collectionId} · ${world.name}图形库`,
  description: introduction.introduce,
  ogImage: assetUrl(introduction.image_url),
})
</script>

<template>
  <main class="content-page" data-content-page="images" :style="{ '--world-color': world.color }">
    <WorldHeader
      :world="world"
      eyebrow="IMAGES / OPTICAL FRAGMENTS"
      :title="collectionId"
      :description="introduction.introduce"
    />

    <section class="gallery-grid">
      <figure
        v-for="(image, index) in images"
        :key="`${image.image_url}-${index}`"
        :class="{ 'gallery-grid__wide': index % 7 === 0 }"
      >
        <div class="gallery-grid__image">
          <img :src="assetUrl(image.image_url)" :alt="image.instrution || `图像 ${index + 1}`" loading="lazy">
          <span>FRAME {{ String(index + 1).padStart(3, '0') }}</span>
        </div>
        <figcaption>{{ image.instrution }}</figcaption>
      </figure>
    </section>

    <ArchiveFooter />
  </main>
</template>
