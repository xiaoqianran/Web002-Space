<script setup lang="ts">
import { contentRouter, getWorld } from '~/utils/content'
import { getCategoryTarget } from '~/utils/routes'

const route = useRoute()
const worldId = String(route.params.world)
const world = getWorld(worldId)
const target = getCategoryTarget(contentRouter, worldId, 'portraits')

if (!world || !target) {
  throw createError({ statusCode: 404, statusMessage: 'Portrait archive not found' })
}

useSeoMeta({
  title: `${world.name} · PORTRAITS`,
  description: world.introduce,
})

await navigateTo(target, { redirectCode: 302, replace: true })
</script>

<template>
  <ArchiveRedirect :label="`${world?.name || worldId} / portraits`" :target="target || '/'" />
</template>
