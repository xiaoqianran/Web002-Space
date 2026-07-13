<script setup lang="ts">
import { contentRouter, getPortraitCollection, getWorld, introductions } from '~/utils/content'

const route = useRoute()
const worldId = String(route.params.world)
const collectionId = String(route.params.id)
const world = getWorld(worldId)
const portraits = await getPortraitCollection(collectionId)
const introduction = introductions[worldId]?.portraits[collectionId]
if (!world || !portraits || !introduction || !contentRouter[worldId]?.portraits.includes(collectionId)) throw createError({ statusCode: 404, statusMessage: 'Portrait collection not found' })
const assetUrl = useAssetUrl()
useSeoMeta({ title: `${collectionId} - ${world.name}肖像库`, description: introduction.introduce, ogImage: assetUrl(introduction.image_url) })
</script>

<template>
  <main class="original-page original-portraits" data-content-page="portraits" :style="{ '--world-color': world.color }">
    <section class="portrait-canvas">
      <div class="portrait-system"><b>DATA SYSTEM</b><span>ACCESS OBJECT: {{ portraits[0]?.name }}</span><span>OBJECT INFORMATION: {{ portraits[0]?.information }}</span><i>READY TO ACCESS</i></div>
      <template v-for="(person, personIndex) in portraits" :key="`${person.name}-${personIndex}`">
        <figure v-for="(portrait, imageIndex) in person.portraits" :key="`${portrait.image_url}-${imageIndex}`" class="portrait-node">
          <div><img :src="assetUrl(portrait.image_url)" :alt="`${person.name}肖像`" loading="lazy"></div>
          <figcaption>【{{ String(personIndex + 1).padStart(3, '0') }}】 ROLE: {{ person.name }} <i>□□□</i></figcaption>
        </figure>
      </template>
      <div class="vertical-scroll">SCROLL <b>////</b></div>
    </section>
  </main>
</template>
