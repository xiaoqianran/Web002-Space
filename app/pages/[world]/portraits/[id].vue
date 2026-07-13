<script setup lang="ts">
import { contentRouter, getPortraitCollection, getWorld, introductions } from '~/utils/content'

const route = useRoute()
const worldId = String(route.params.world)
const collectionId = String(route.params.id)
const world = getWorld(worldId)
const portraits = await getPortraitCollection(collectionId)
const introduction = introductions[worldId]?.portraits[collectionId]

if (!world || !portraits || !introduction || !contentRouter[worldId]?.portraits.includes(collectionId)) {
  throw createError({ statusCode: 404, statusMessage: 'Portrait collection not found' })
}

const assetUrl = useAssetUrl()
useSeoMeta({
  title: `${collectionId} · ${world.name}肖像库`,
  description: introduction.introduce,
  ogImage: assetUrl(introduction.image_url),
})
</script>

<template>
  <main class="content-page" data-content-page="portraits" :style="{ '--world-color': world.color }">
    <WorldHeader
      :world="world"
      eyebrow="PORTRAITS / SUBJECT DATABASE"
      :title="collectionId"
      :description="introduction.introduce"
    />

    <section class="portrait-index">
      <article v-for="(person, personIndex) in portraits" :key="`${person.name}-${personIndex}`" class="portrait-person">
        <header>
          <span>SUBJECT {{ String(personIndex + 1).padStart(3, '0') }}</span>
          <h2>{{ person.name }}</h2>
          <p>{{ person.information }}</p>
        </header>
        <div class="portrait-grid">
          <figure v-for="(portrait, imageIndex) in person.portraits" :key="`${portrait.image_url}-${imageIndex}`">
            <div class="portrait-grid__image">
              <img :src="assetUrl(portrait.image_url)" :alt="`${person.name}肖像 ${imageIndex + 1}`" loading="lazy">
              <span>{{ String(imageIndex + 1).padStart(2, '0') }}</span>
            </div>
            <figcaption>{{ portrait.content }}</figcaption>
          </figure>
        </div>
      </article>
    </section>

    <ArchiveFooter />
  </main>
</template>
