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
const offset = reactive({ x: 0, y: 0 })
const drag = reactive({
  active: false,
  startX: 0,
  startY: 0,
  originX: 0,
  originY: 0,
  pointerId: -1,
})

const boardStyle = computed(() => ({
  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
}))

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  const target = event.target as HTMLElement | null
  if (target?.closest('a, button')) return
  drag.active = true
  drag.startX = event.clientX
  drag.startY = event.clientY
  drag.originX = offset.x
  drag.originY = offset.y
  drag.pointerId = event.pointerId
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!drag.active || event.pointerId !== drag.pointerId) return
  offset.x = drag.originX + (event.clientX - drag.startX)
  offset.y = drag.originY + (event.clientY - drag.startY)
}

function onPointerUp(event: PointerEvent) {
  if (event.pointerId !== drag.pointerId) return
  drag.active = false
  drag.pointerId = -1
  try {
    ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
  }
  catch {
    // ignore
  }
}

useSeoMeta({
  title: `${collectionId} - ${world.name}图形库`,
  description: introduction.introduce,
  ogImage: assetUrl(introduction.image_url),
})
</script>

<template>
  <main
    class="original-page original-images"
    data-content-page="images"
    :class="{ 'is-dragging': drag.active }"
    :style="{ '--world-color': world.color }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <section class="image-canvas" :style="boardStyle">
      <figure
        v-for="(image, index) in images"
        :key="`${image.image_url}-${index}`"
        class="image-node"
        :class="`image-node--${(index % 4) + 1}`"
      >
        <img :src="assetUrl(image.image_url)" :alt="image.instrution || `图像 ${index + 1}`" loading="lazy">
      </figure>
    </section>

    <div class="image-guide" aria-hidden="true">
      <div class="image-guide__mark">
        <span /><span /><span /><span />
        <i>▣</i>
      </div>
      <strong>DRAG SCREEN</strong>
      <span>TO BROWSE IMAGES</span>
      <footer>
        <em>↪ Infinite scrolling / Ready</em>
        <b>▥▥▥▥▥</b>
      </footer>
    </div>

    <div class="vertical-scroll" aria-hidden="true">SCROLL <b>////</b></div>
  </main>
</template>
