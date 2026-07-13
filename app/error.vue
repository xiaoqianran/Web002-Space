<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()

function returnHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <main class="original-page ray-error" data-content-page="error">
    <div class="ray-error__panel">
      <p class="ray-error__code">[RAY.ERROR] SIGNAL LOST</p>
      <h1>{{ error.statusCode || 404 }}</h1>
      <p class="ray-error__msg">{{ error.statusMessage || '无法读取该档案节点。' }}</p>
      <pre class="ray-error__dump">→ channel: ARCHIVE
→ status: DISCONNECTED
→ recovery: RETURN_HOME</pre>
      <button class="ray-error__btn" type="button" @click="returnHome">
        [返回]::home()
      </button>
    </div>
  </main>
</template>
