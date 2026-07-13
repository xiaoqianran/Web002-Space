<script setup lang="ts">
defineProps<{
  label: string
  target: string
}>()
</script>

<template>
  <main class="original-page archive-redirect" data-content-page="redirect">
    <div class="archive-redirect__panel">
      <p class="archive-redirect__code">[NODE.LINK] ROUTING...</p>
      <h1>{{ label }}</h1>
      <p class="archive-redirect__path">→ {{ target }}</p>
      <div class="archive-redirect__bars" aria-hidden="true">
        <i /><i /><i /><i /><i />
      </div>
      <p class="archive-redirect__tip">建立档案通道中，请稍候</p>
    </div>
  </main>
</template>
