<script setup lang="ts">
import { contentRouter } from '~/utils/content'
import { getRecordTarget } from '~/utils/routes'

const route = useRoute()
const worldId = String(route.params.world)
const recordId = String(route.params.id)
const target = getRecordTarget(contentRouter, worldId, recordId)

if (!target) {
  throw createError({ statusCode: 404, statusMessage: 'Record not found' })
}

await navigateTo(target, { redirectCode: 302, replace: true })
</script>

<template>
  <div />
</template>
