<script setup lang="ts">
import { contentRouter, getRecord, getRecordChapter, getWorld } from '~/utils/content'

const route = useRoute()
const worldId = String(route.params.world)
const recordId = String(route.params.id)
const chapterId = String(route.params.chapter)
const world = getWorld(worldId)
const record = getRecord(recordId)
const paragraphs = await getRecordChapter(recordId, chapterId)
const registeredChapters = contentRouter[worldId]?.records[recordId] || []

if (!world || !record || record.worldId !== worldId || !paragraphs || !registeredChapters.includes(chapterId)) {
  throw createError({ statusCode: 404, statusMessage: 'Record chapter not found' })
}

const chapterNumber = Number.parseInt(chapterId.replace(/^c/, ''), 10)
const chapterTitle = record.chapters[chapterNumber - 1] || `章节 ${chapterNumber}`
const assetUrl = useAssetUrl()

useSeoMeta({
  title: `${chapterTitle} · ${record.name}`,
  description: record.instrution,
  ogImage: assetUrl(record.image_url),
})
</script>

<template>
  <main class="content-page" data-content-page="records" :style="{ '--world-color': world.color }">
    <WorldHeader
      :world="world"
      eyebrow="RECORDS / MEMORY FRAGMENT"
      :title="record.name"
      :description="record.instrution"
    />

    <div class="reader-layout">
      <aside class="record-sidebar">
        <img :src="assetUrl(record.image_url)" :alt="record.name">
        <dl>
          <div><dt>TYPE</dt><dd>{{ record.type }}</dd></div>
          <div><dt>DATE</dt><dd>{{ record.time }}</dd></div>
          <div><dt>CHAPTERS</dt><dd>{{ registeredChapters.length }}</dd></div>
        </dl>
        <nav aria-label="章节导航">
          <NuxtLink
            v-for="(chapter, index) in registeredChapters"
            :key="chapter"
            :to="`/${worldId}/records/${recordId}/${chapter}`"
            :class="{ active: chapter === chapterId }"
          >
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            {{ record.chapters[index] || `章节 ${index + 1}` }}
          </NuxtLink>
        </nav>
      </aside>

      <article class="record-reader">
        <header>
          <p>[DECODE] memory.fragment[{{ chapterId }}]</p>
          <h2>{{ chapterTitle }}</h2>
          <span>STATUS: ACTIVE / OUTPUT: TIMELINE APPEND</span>
        </header>
        <div class="record-reader__body">
          <p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p>
        </div>
      </article>
    </div>

    <ArchiveFooter />
  </main>
</template>
