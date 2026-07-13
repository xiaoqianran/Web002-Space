<script setup lang="ts">
import { contentRouter } from '~/utils/content'
import { getCategoryTarget } from '~/utils/routes'

const route = useRoute()
const worldId = String(route.params.world)
const target = getCategoryTarget(contentRouter, worldId, 'portraits')

if (!target) {
  throw createError({ statusCode: 404, statusMessage: 'Portrait archive not found' })
}

await navigateTo(target, { redirectCode: 302, replace: true })
</script>

<template>
  <div />
</template>
