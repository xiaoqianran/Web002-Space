<script setup lang="ts">
import { getWorldCards, worlds } from '~/utils/content'

const assetUrl = useAssetUrl()

useSeoMeta({
  title: 'COSMIC BROTH',
  description: 'GRAND-STARRS-RAY 舰载世界观资料库。',
})
</script>

<template>
  <main class="ray-home" data-content-page="home">
    <section class="ray-home__viewport">
      <img class="ray-home__background" :src="assetUrl('/assets/background_436870b549.jpg')" alt="宇宙航行背景">
      <div class="ray-home__scanlines" aria-hidden="true" />
      <div class="ray-home__orbit ray-home__orbit--left"><span>[ The Torch's Flicker ]</span></div>
      <div class="ray-home__orbit ray-home__orbit--right" />

      <div class="ray-home__drag ray-home__drag--left">DRAG <b>▶ ▶</b></div>
      <div class="ray-home__drag ray-home__drag--right">DRAG <b>◀ ◀</b></div>

      <div class="ray-home__status">
        <div class="ray-home__brain" aria-hidden="true"><i /></div>
        <dl>
          <div><dt>EN</dt><dd><i style="width: 72%" /></dd></div>
          <div><dt>HI</dt><dd><i style="width: 51%" /></dd></div>
          <div><dt>PSI</dt><dd><i style="width: 28%" /></dd></div>
          <div><dt>CQL</dt><dd><i style="width: 63%" /></dd></div>
        </dl>
      </div>

      <div class="ray-home__clock">
        <p>◷ <em>宇宙汤:</em> 2041/07/13</p>
        <strong>21:01:54</strong>
      </div>

      <a class="ray-home__console" href="#worlds">
        <span>CONSLOE</span>
        <i /><b /><i />
      </a>

      <div class="ray-home__external">External Links&nbsp; ↘</div>
      <div class="ray-home__social"><span>▣</span><span>◉</span><span>▣</span></div>
      <a class="ray-home__help" href="#worlds">
        <span class="ray-home__help-icon">◉</span>
        <span><strong>Need Help?</strong><small>Check Instruction</small></span>
      </a>
      <div class="ray-home__corner ray-home__corner--left" aria-hidden="true" />
      <div class="ray-home__corner ray-home__corner--right" aria-hidden="true" />
    </section>

    <section id="worlds" class="ray-worlds">
      <header><small>EXPLORE / WORLD NODES</small><h1>ACCESS ARCHIVE</h1></header>
      <article
        v-for="(world, worldId, index) in worlds"
        :key="worldId"
        class="ray-world"
        :style="{ '--world-color': world.color }"
      >
        <div class="ray-world__index">0{{ index + 1 }}</div>
        <img :src="assetUrl(world.star_image_url)" alt="">
        <div class="ray-world__copy"><small>{{ worldId }}</small><h2>{{ world.name }}</h2><p>{{ world.introduce }}</p></div>
        <nav>
          <NuxtLink v-for="card in getWorldCards(String(worldId))" :key="`${card.section}-${card.id}`" :to="card.target">
            <span>{{ card.section }}</span><strong>{{ card.id }}</strong><b>ACCESS →</b>
          </NuxtLink>
        </nav>
      </article>
    </section>
  </main>
</template>
