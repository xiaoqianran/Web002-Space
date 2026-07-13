<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()

function returnHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <main class="error-page">
    <p class="eyebrow">[RAY.ERROR] SIGNAL LOST</p>
    <h1>{{ error.statusCode }}</h1>
    <p>{{ error.statusMessage || '无法读取该档案节点。' }}</p>
    <button type="button" @click="returnHome">RETURN TO ARCHIVE</button>
  </main>
</template>
