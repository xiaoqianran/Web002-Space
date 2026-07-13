<script setup lang="ts">
import { getWorldCards, worlds } from '~/utils/content'

const assetUrl = useAssetUrl()

useSeoMeta({
  title: '宇宙汤资料库',
  description: '探索宇宙汤、地平世界、迷雾中古与棋盘室的记录、人物和图像。',
})
</script>

<template>
  <main data-content-page="home">
    <section class="hero">
      <div class="hero__grid" aria-hidden="true" />
      <div class="hero__content">
        <p class="eyebrow">[RAY.SOM] MULTIVERSE ARCHIVE / ONLINE</p>
        <h1>
          <span>COSMIC</span>
          <span>BROTH</span>
        </h1>
        <p class="hero__lead">宇宙并不遵循正确的逻辑。这里记录偏航的故事、被观察的人，以及没有上下文的图像碎片。</p>
        <a class="hero__scroll" href="#worlds">SCROLL TO ACCESS <span>↓</span></a>
      </div>
      <div class="hero__telemetry" aria-label="系统状态">
        <span>WORLDS <b>04</b></span>
        <span>ARCHIVE <b>ONLINE</b></span>
        <span>SIGNAL <b>98.7%</b></span>
      </div>
    </section>

    <section id="worlds" class="world-index">
      <article
        v-for="(world, worldId, index) in worlds"
        :key="worldId"
        class="world-panel"
        :style="{ '--world-color': world.color }"
      >
        <div class="world-panel__number">0{{ index + 1 }}</div>
        <div class="world-panel__summary">
          <img class="world-panel__star" :src="assetUrl(world.star_image_url)" alt="">
          <p class="eyebrow">WORLD NODE / {{ worldId }}</p>
          <h2>{{ world.name }}</h2>
          <p>{{ world.introduce }}</p>
        </div>
        <div class="world-panel__cards">
          <NuxtLink
            v-for="card in getWorldCards(String(worldId))"
            :key="`${card.section}-${card.id}`"
            class="archive-card"
            :to="card.target"
          >
            <img :src="assetUrl(card.image_url)" :alt="card.id">
            <span class="archive-card__type">{{ card.section }}</span>
            <strong>{{ card.id }}</strong>
            <p>{{ card.introduce }}</p>
            <i>OPEN NODE ↗</i>
          </NuxtLink>
        </div>
      </article>
    </section>

    <ArchiveFooter />
  </main>
</template>
