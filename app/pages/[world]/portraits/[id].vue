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
const activeIndex = ref(0)
const activePerson = computed(() => portraits[activeIndex.value] || portraits[0])

const cards = computed(() =>
  portraits.flatMap((person, personIndex) =>
    person.portraits.map(portrait => ({
      person,
      personIndex,
      image_url: portrait.image_url,
    })),
  ),
)

useSeoMeta({
  title: `${collectionId} - ${world.name}肖像库`,
  description: introduction.introduce,
  ogImage: assetUrl(introduction.image_url),
})
</script>

<template>
  <main class="original-page original-portraits" data-content-page="portraits" :style="{ '--world-color': world.color }">
    <section class="portrait-canvas">
      <div class="portrait-system" aria-live="polite">
        <span class="portrait-system__tag">DATA SYSTEM</span>
        <div class="portrait-system__body">
          <p><b>ACCESS OBJECT:</b> <em>{{ activePerson?.name }}</em></p>
          <p><b>OBJECT INFORMATION:</b> <em>{{ activePerson?.information }}</em></p>
          <footer>
            <i /><i /><i /><i />
            <small>READY TO ACCESS</small>
          </footer>
        </div>
      </div>

      <figure
        v-for="(card, index) in cards"
        :key="`${card.image_url}-${index}`"
        class="portrait-node"
        :class="`portrait-node--${(index % 3) + 1}`"
        @mouseenter="activeIndex = card.personIndex"
        @focusin="activeIndex = card.personIndex"
      >
        <div class="portrait-node__frame">
          <img :src="assetUrl(card.image_url)" :alt="`${card.person.name}肖像`" loading="lazy">
        </div>
        <figcaption>
          <span>【 {{ String(card.personIndex).padStart(3, '0') }} 】 ROLE: {{ card.person.name }}</span>
          <i aria-hidden="true">□ ■ □</i>
        </figcaption>
      </figure>

      <div class="vertical-scroll" aria-hidden="true">SCROLL <b>////</b></div>
    </section>
  </main>
</template>
