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

const binaryLines = computed(() => {
  const seed = `${recordId}-${chapterId}`
  const rows: string[] = []
  for (let row = 0; row < 2; row += 1) {
    const chunks: string[] = []
    for (let i = 0; i < 8; i += 1) {
      const n = (seed.charCodeAt((row * 8 + i) % seed.length) * (i + 3) + row * 17 + i * 11) % 256
      chunks.push(n.toString(2).padStart(8, '0'))
    }
    rows.push(chunks.join(' '))
  }
  return rows
})

useSeoMeta({
  title: `${chapterTitle} - ${record.name}`,
  description: record.instrution,
  ogImage: assetUrl(record.image_url),
})
</script>

<template>
  <main class="original-page original-record" data-content-page="records" :style="{ '--world-color': world.color }">
    <section class="record-console">
      <header class="record-console__top">
        <p class="record-console__title">&gt;&gt; TITLE: {{ record.name }}</p>
        <div class="record-console__signal" aria-hidden="true">
          <i v-for="n in 18" :key="n" />
        </div>
      </header>

      <div class="record-console__middle">
        <div class="record-console__image">
          <img :src="assetUrl(record.image_url)" :alt="record.name">
        </div>
        <div class="record-console__content">
          <div class="record-console__instruction">
            <p>{{ record.instrution }}</p>
          </div>
          <div class="record-console__data">
            <p>&gt;&gt; WORLD --------------- <span>{{ world.name }}</span></p>
            <p>&gt;&gt; TYPE --------------- <span>{{ record.type.toUpperCase() }}</span></p>
            <p>&gt;&gt; TIME --------------- <span>{{ record.time }}</span></p>
            <div class="record-console__arrow" aria-hidden="true">
              <svg viewBox="0 0 238 230">
                <path d="M194,12V49.455l16.667,12.485V168.061L169,209.677H66.917L56.5,193.03H19" fill="none" stroke="currentColor" stroke-width="4" />
                <path d="M35,28L189,188" fill="none" stroke="currentColor" stroke-width="4" />
                <path d="M219,184.121V218.35H184.1Z" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="record-console__code">
        <p>[NODE.LINK] INITIATING...</p>
        <p>[DECODE] memory.fragment[chapter_{{ chapterNumber }}]</p>
        <p v-for="(line, index) in binaryLines" :key="index">{{ line }}</p>
        <p>→ STATUS: ACTIVE</p>
        <p>→ OUTPUT: [timeline append]</p>
        <p>→ PREFETCH: enabled</p>
      </div>
    </section>

    <nav class="record-chapters" aria-label="章节导航">
      <NuxtLink
        v-for="(chapter, index) in registeredChapters"
        :key="chapter"
        class="record-chapters__item"
        :class="{ active: chapter === chapterId }"
        :to="`/${worldId}/records/${recordId}/${chapter}`"
      >
        <span>{{ record.chapters[index] || `章节 ${index + 1}` }}</span>
        <i />
      </NuxtLink>
    </nav>

    <article class="record-manuscript">
      <header class="record-manuscript__title">
        <b>{{ chapterNumber }}</b>
        <h1>{{ chapterTitle }}</h1>
      </header>
      <div class="record-manuscript__body">
        <p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p>
      </div>
    </article>
  </main>
</template>
