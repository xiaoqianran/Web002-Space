<script setup lang="ts">
import type { WorldOverview } from '~/types/content'

defineProps<{
  world: WorldOverview
  eyebrow: string
  title: string
  description?: string
}>()

const assetUrl = useAssetUrl()
</script>

<template>
  <header class="world-header" :style="{ '--world-color': world.color }">
    <div class="world-header__copy">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p v-if="description" class="world-header__description">{{ description }}</p>
      <div class="world-header__meta">
        <span>WORLD / {{ world.name }}</span>
        <span>NODE / {{ world.id }}</span>
        <span>TIME-DIFF / {{ world.time_diff }}</span>
      </div>
    </div>
    <div class="world-header__visual" aria-hidden="true">
      <img :src="assetUrl(world.image_url)" alt="">
      <span class="orbit orbit--one" />
      <span class="orbit orbit--two" />
    </div>
  </header>
</template>
