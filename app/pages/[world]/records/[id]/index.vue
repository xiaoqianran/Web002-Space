<script setup lang="ts">
import { contentRouter, getRecord, getWorld } from '~/utils/content'
import { getRecordTarget } from '~/utils/routes'

const route = useRoute()
const worldId = String(route.params.world)
const recordId = String(route.params.id)
const world = getWorld(worldId)
const record = getRecord(recordId)
const target = getRecordTarget(contentRouter, worldId, recordId)

if (!world || !record || record.worldId !== worldId || !target) {
  throw createError({ statusCode: 404, statusMessage: 'Record not found' })
}

useSeoMeta({
  title: `${record.name} · RECORDS`,
  description: record.instrution,
})

await navigateTo(target, { redirectCode: 302, replace: true })
</script>

<template>
  <ArchiveRedirect :label="`${record?.name || recordId}`" :target="target || '/'" />
</template>
