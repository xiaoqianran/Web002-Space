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

useSeoMeta({ title: `${chapterTitle} - ${record.name}`, description: record.instrution, ogImage: assetUrl(record.image_url) })
</script>

<template>
  <main class="original-page original-record" data-content-page="records" :style="{ '--world-color': world.color }">
    <section class="record-console">
      <header><span>≫ TITLE:</span> {{ record.name }}<i /></header>
      <div class="record-console__grid">
        <img :src="assetUrl(record.image_url)" :alt="record.name">
        <div class="record-console__brief">
          <p>{{ record.instrution }}</p>
          <dl>
            <div><dt>≫ WORLD ---------------</dt><dd>{{ world.name }}</dd></div>
            <div><dt>≫ TYPE ----------------</dt><dd>{{ record.type }}</dd></div>
            <div><dt>≫ TIME ----------------</dt><dd>{{ record.time }}</dd></div>
          </dl>
        </div>
        <nav aria-label="章节导航">
          <NuxtLink v-for="(chapter, index) in registeredChapters" :key="chapter" :to="`/${worldId}/records/${recordId}/${chapter}`" :class="{ active: chapter === chapterId }">
            {{ record.chapters[index] || `章节 ${index + 1}` }} <i />
          </NuxtLink>
        </nav>
      </div>
    </section>

    <section class="record-decode">
      <p>[NODE.LINK] INITIATING...</p><p>[DECODE] memory.fragment[{{ chapterId }}]</p>
      <p>01100101 01101111 01001110 01011000 10001011 01010110</p>
      <p>→ STATUS: ACTIVE<br>→ OUTPUT: [timeline append]<br>→ PREFETCH: enabled</p>
    </section>

    <article class="record-manuscript">
      <header><span>— →</span><b>{{ chapterNumber }}</b><h1>{{ chapterTitle }}</h1></header>
      <div><p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p></div>
    </article>
  </main>
</template>
