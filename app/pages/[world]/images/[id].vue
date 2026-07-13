<script setup lang="ts">
import { contentRouter, getImageCollection, getWorld, introductions } from '~/utils/content'

const route = useRoute()
const worldId = String(route.params.world)
const collectionId = String(route.params.id)
const world = getWorld(worldId)
const images = await getImageCollection(collectionId)
const introduction = introductions[worldId]?.images[collectionId]
if (!world || !images || !introduction || !contentRouter[worldId]?.images.includes(collectionId)) throw createError({ statusCode: 404, statusMessage: 'Image collection not found' })
const assetUrl = useAssetUrl()
useSeoMeta({ title: `${collectionId} - ${world.name}图形库`, description: introduction.introduce, ogImage: assetUrl(introduction.image_url) })
</script>

<template>
  <main class="original-page original-images" data-content-page="images" :style="{ '--world-color': world.color }">
    <section class="image-canvas">
      <figure v-for="(image, index) in images" :key="`${image.image_url}-${index}`" class="image-node">
        <img :src="assetUrl(image.image_url)" :alt="image.instrution || `图像 ${index + 1}`" loading="lazy"><figcaption>{{ image.instrution }}</figcaption>
      </figure>
      <div class="image-guide"><div>▣</div><strong>DRAG SCREEN</strong><span>TO BROWSE IMAGES</span><footer>↪ Infinite scrolling / Ready <b>▥▥▥▥▥</b></footer></div>
      <div class="vertical-scroll">SCROLL <b>////</b></div>
    </section>
  </main>
</template>
