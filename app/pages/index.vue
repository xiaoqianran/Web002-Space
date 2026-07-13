<script setup lang="ts">
import unknownWorldsData from '../../api/unknownWorlds.json'
import { getContentLabel } from '~/data/labels'
import type { ContentSection } from '~/types/content'
import { getWorldCards, worlds } from '~/utils/content'

interface UnknownWorld {
  x: number
  y: number
  r: number
  image_url: string
}

const assetUrl = useAssetUrl()
const unknownWorlds = unknownWorldsData as UnknownWorld[]

useSeoMeta({
  title: 'COSMIC BROTH',
  description: 'GRAND-STARRS-RAY 舰载世界观资料库。',
})

const selectedWorldId = ref<string | null>(null)
const selectedSection = ref<ContentSection>('records')
const selectedCardId = ref<string | null>(null)
const showInstruction = ref(false)
const clockText = ref('--:--:--')
const dateText = ref('2041/07/13')

// Seed drag near original default windowview transform so star framing matches live site.
const offset = reactive({ x: 48, y: 72 })
const drag = reactive({
  active: false,
  moved: false,
  startX: 0,
  startY: 0,
  originX: 0,
  originY: 0,
  pointerId: -1,
})

const sections: ContentSection[] = ['records', 'portraits', 'images']

const shipMeters = [
  { key: 'EN', level: 0.8 },
  { key: 'HI', level: 0.5 },
  { key: 'PSI', level: 0.3 },
  { key: 'CQL', level: 0.5 },
] as const

const socialLinks = [
  { href: 'https://b23.tv/0kFykcQ', label: 'Bilibili', icon: 'bili' },
  { href: 'https://weibo.com/u/5652161753', label: 'Weibo', icon: 'weibo' },
  { href: 'https://changdunovel.com/wap/share-v2.html?&book_id=7522080164855942206', label: '长读小说', icon: 'book' },
] as const

const selectedWorld = computed(() =>
  selectedWorldId.value ? worlds[selectedWorldId.value] ?? null : null,
)

const selectedCards = computed(() =>
  selectedWorldId.value ? getWorldCards(selectedWorldId.value) : [],
)

const sectionCards = computed(() =>
  selectedCards.value.filter(card => card.section === selectedSection.value),
)

const activeCard = computed(() => {
  if (selectedCardId.value) {
    const matched = sectionCards.value.find(card => card.id === selectedCardId.value)
    if (matched) return matched
  }
  return sectionCards.value[0] || null
})

const accessTitle = computed(() => {
  const world = selectedWorld.value
  if (!world) return ''
  const card = activeCard.value
  const cardLabel = card ? getContentLabel(card.section, card.id) : world.name
  return `${world.name} / ${selectedSection.value} / ${cardLabel}`
})

function pickSection(section: ContentSection) {
  selectedSection.value = section
  selectedCardId.value = selectedCards.value.find(card => card.section === section)?.id ?? null
}

function pickCard(cardId: string, section: ContentSection) {
  selectedSection.value = section
  selectedCardId.value = cardId
}

const sceneStyle = computed(() => ({
  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
}))

function clampOffset(x: number, y: number) {
  // Match original ~150%~200% star field drag range.
  const limitX = typeof window === 'undefined' ? 320 : Math.max(220, window.innerWidth * 0.28)
  const limitY = typeof window === 'undefined' ? 200 : Math.max(140, window.innerHeight * 0.22)
  return {
    x: Math.max(-limitX, Math.min(limitX, x)),
    y: Math.max(-limitY, Math.min(limitY, y)),
  }
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  if (selectedWorldId.value || showInstruction.value) return
  const target = event.target as HTMLElement | null
  if (target?.closest('a, button, .ray-home__system, .ray-home__instruction')) return

  drag.active = true
  drag.moved = false
  drag.startX = event.clientX
  drag.startY = event.clientY
  drag.originX = offset.x
  drag.originY = offset.y
  drag.pointerId = event.pointerId
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!drag.active || event.pointerId !== drag.pointerId) return
  const dx = event.clientX - drag.startX
  const dy = event.clientY - drag.startY
  if (Math.hypot(dx, dy) > 4) drag.moved = true
  const next = clampOffset(drag.originX + dx, drag.originY + dy)
  offset.x = next.x
  offset.y = next.y
}

function onPointerUp(event: PointerEvent) {
  if (event.pointerId !== drag.pointerId) return
  drag.active = false
  drag.pointerId = -1
  try {
    ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
  }
  catch {
    // ignore
  }
}

function selectWorld(worldId: string, event: MouseEvent) {
  if (drag.moved) {
    event.preventDefault()
    return
  }
  selectedWorldId.value = worldId
  selectedSection.value = 'records'
  selectedCardId.value = getWorldCards(worldId).find(card => card.section === 'records')?.id ?? null
}

function closeSystem() {
  selectedWorldId.value = null
}

function openInstruction() {
  showInstruction.value = true
}

function closeInstruction() {
  showInstruction.value = false
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function tickClock() {
  const now = new Date()
  const year = now.getFullYear() + 15
  dateText.value = `${year}/${pad(now.getMonth() + 1)}/${pad(now.getDate())}`
  clockText.value = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

let clockTimer: ReturnType<typeof setInterval> | null = null
let canvasFrame = 0
const canvasRef = ref<HTMLCanvasElement | null>(null)
const stars = ref<Array<{ x: number, y: number, r: number, a: number, s: number }>>([])

function resizeStars() {
  const canvas = canvasRef.value
  if (!canvas || typeof window === 'undefined') return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.floor(window.innerWidth * dpr)
  canvas.height = Math.floor(window.innerHeight * dpr)
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  const count = Math.floor((window.innerWidth * window.innerHeight) / 14000)
  stars.value = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: (Math.random() * 1.4 + 0.3) * dpr,
    a: Math.random() * 0.7 + 0.15,
    s: Math.random() * 0.35 + 0.05,
  }))
}

function drawStars() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (const star of stars.value) {
    star.a += (Math.random() - 0.5) * 0.04
    star.a = Math.max(0.08, Math.min(0.9, star.a))
    star.y += star.s
    if (star.y > canvas.height) {
      star.y = 0
      star.x = Math.random() * canvas.width
    }
    ctx.beginPath()
    ctx.fillStyle = `rgba(220, 235, 255, ${star.a})`
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
    ctx.fill()
  }
  canvasFrame = requestAnimationFrame(drawStars)
}

onMounted(() => {
  tickClock()
  clockTimer = setInterval(tickClock, 1000)
  resizeStars()
  drawStars()
  window.addEventListener('resize', resizeStars)
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
  cancelAnimationFrame(canvasFrame)
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', resizeStars)
  }
})
</script>

<template>
  <main class="ray-home" data-content-page="home">
    <section
      class="ray-home__viewport"
      :class="{ 'is-dragging': drag.active, 'is-system-open': !!selectedWorldId }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <!-- Star field layer: 200% stage, left/top % matches original windowview_stars -->
      <div class="ray-home__field" :style="sceneStyle">
        <img
          class="ray-home__background"
          :src="assetUrl('/assets/background_436870b549.jpg')"
          alt="宇宙航行背景"
          draggable="false"
        >

        <button
          v-for="(world, worldId) in worlds"
          :key="worldId"
          type="button"
          class="ray-home__star ray-home__star--clickable"
          :class="{ 'is-selected': selectedWorldId === worldId }"
          :style="{
            left: `${world.x}%`,
            top: `${world.y}%`,
            '--r': world.r,
            '--world-color': world.color,
          }"
          :aria-label="`打开 ${world.name}`"
          @click="selectWorld(String(worldId), $event)"
        >
          <img :src="assetUrl(world.star_image_url)" :alt="world.name" draggable="false">
        </button>

        <div
          v-for="(node, index) in unknownWorlds"
          :key="`unknown-${index}`"
          class="ray-home__star ray-home__star--unknown"
          :style="{
            left: `${node.x}%`,
            top: `${node.y}%`,
            '--r': node.r,
          }"
          aria-hidden="true"
        >
          <img :src="assetUrl(node.image_url)" alt="" draggable="false">
        </div>
      </div>

      <canvas ref="canvasRef" class="ray-home__canvas" aria-hidden="true" />
      <div class="ray-home__scanlines" aria-hidden="true" />
      <div class="ray-home__orbit ray-home__orbit--left"><span>[ The Torch's Flicker ]</span></div>
      <div class="ray-home__orbit ray-home__orbit--right" />

      <div class="ray-home__drag ray-home__drag--left">
        <b>▲</b>
        DRAG
        <b>▲</b>
      </div>
      <div class="ray-home__drag ray-home__drag--right">
        <b>▼</b>
        DRAG
        <b>▼</b>
      </div>

      <!-- Bottom HUD aligned to original uibox layout -->
      <div class="ray-uibox" aria-label="舰载状态与控制台">
        <section class="ray-uibox__ship">
          <div class="ray-uibox__ship-info">
            <div class="ray-uibox__ship-icon" aria-hidden="true">
              <svg viewBox="0 0 500 500" class="ray-uibox__ship-svg">
                <circle cx="250" cy="250" r="210" fill="none" stroke="currentColor" stroke-width="8" />
                <circle cx="250" cy="250" r="108" fill="none" stroke="currentColor" stroke-width="8" />
                <path d="M250 70 L290 190 L420 190 L315 270 L355 400 L250 320 L145 400 L185 270 L80 190 L210 190 Z" fill="none" stroke="currentColor" stroke-width="10" stroke-linejoin="round" />
                <circle cx="250" cy="250" r="28" fill="currentColor" />
              </svg>
            </div>
            <div class="ray-uibox__meters">
              <div v-for="meter in shipMeters" :key="meter.key" class="ray-uibox__meter">
                <span>{{ meter.key }}</span>
                <i :style="{ '--l': meter.level }" />
              </div>
            </div>
          </div>
          <div class="ray-uibox__blocks" aria-hidden="true">
            <span /><span /><span />
          </div>
        </section>

        <section class="ray-uibox__middle">
          <div class="ray-uibox__time">
            <p class="ray-uibox__time-tip">
              <i aria-hidden="true" />
              <span><em>宇宙汤:</em> {{ dateText }}</span>
            </p>
            <div class="ray-uibox__time-line" aria-hidden="true" />
            <strong class="ray-uibox__clock">{{ clockText }}</strong>
          </div>

          <button class="ray-uibox__console" type="button" aria-label="控制台 CONSLOE" @click="closeSystem">
            <div class="ray-uibox__console-border" aria-hidden="true" />
            <img class="ray-uibox__console-web" :src="assetUrl('/assets/hud/web.svg')" alt="" aria-hidden="true">
            <span class="ray-uibox__console-label">CONSLOE</span>
            <i class="ray-uibox__console-dot ray-uibox__console-dot--a" /><i class="ray-uibox__console-dot ray-uibox__console-dot--b" /><i class="ray-uibox__console-dot ray-uibox__console-dot--c" />
          </button>

          <div class="ray-uibox__links">
            <p class="ray-uibox__links-tip">
              External Links
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h8v2H9.4L18 16.6 16.6 18 8 9.4V14H6V6z" fill="currentColor" /></svg>
            </p>
            <div class="ray-uibox__links-line" aria-hidden="true" />
            <div class="ray-uibox__social">
              <a
                v-for="link in socialLinks"
                :key="link.href"
                class="ray-uibox__social-item"
                :href="link.href"
                target="_blank"
                rel="noreferrer"
                :aria-label="link.label"
              >
                <svg v-if="link.icon === 'bili'" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.5 7h15a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-9A1.5 1.5 0 0 1 4.5 7Zm3-3 2 2h5l2-2h1.5l-2.2 2.2A2 2 0 0 1 14.6 9H9.4a2 2 0 0 1-1.4-.6L5.8 4H7.5ZM8 11v4h1.5v-4H8Zm6.5 0v4H16v-4h-1.5Z" /></svg>
                <svg v-else-if="link.icon === 'weibo'" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.8 8.6c3.2-.2 6.4 1.8 6.6 4.8.2 3.2-2.8 5.8-6.4 5.6C6.4 18.8 3.6 16 3.8 12.8c.2-2.8 2.8-4 6-4.2Zm-.2 8.2c2.2.2 4-.8 4-2.4s-1.8-2.8-4-3-4 .8-4 2.4 1.8 2.8 4 3Zm8.8-7.8c.8.2 1.4 1 1.2 1.8-.1.5-.5.9-1 1-.5.1-1-.2-1.2-.7-.2-.5 0-1.1.5-1.4.2-.1.3-.2.5-.2v-.5Zm1.8-1.6c1.4.5 2.3 1.8 2.1 3.3-.1.7-.6 1.3-1.2 1.6-.6.3-1.3.2-1.7-.3-.4-.5-.3-1.2.2-1.6.2-.2.4-.4.4-.7 0-.5-.4-1-1-1.1-.5-.1-.9.2-1.1.6-.3.6-1 .9-1.6.6-.6-.2-.9-1-.6-1.6.7-1.5 2.5-2.4 4.5-1.8Z" /></svg>
                <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 3h9l3 3v15H6V3Zm8 1.5V7h2.5L14 4.5ZM8 10h8v1.5H8V10Zm0 3h8v1.5H8V13Zm0 3h5V17.5H8V16Z" /></svg>
              </a>
            </div>
          </div>
        </section>

        <section class="ray-uibox__help">
          <button class="ray-uibox__help-btn" type="button" @click="openInstruction">
            <span class="ray-uibox__help-icon" aria-hidden="true">
              <i />
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6" /><path d="M12 10.5v6M12 7.5h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
            </span>
            <span class="ray-uibox__help-copy">
              <strong>Need Help?</strong>
              <small>Check Instruction</small>
            </span>
          </button>
          <div class="ray-uibox__blocks" aria-hidden="true">
            <span /><span /><span />
          </div>
        </section>
      </div>

      <div class="ray-home__brackets" aria-hidden="true">
        <i /><i /><i /><i />
      </div>
    </section>

    <!-- Original-like system layer: databox + section compass nodes -->
    <Transition name="system">
      <div
        v-if="selectedWorld && selectedWorldId"
        class="ray-home__system"
        :style="{ '--world-color': selectedWorld.color }"
        role="dialog"
        aria-modal="true"
        :aria-label="`${selectedWorld.name} 资料系统`"
      >
        <button type="button" class="ray-home__system-backdrop" aria-label="关闭系统层" @click="closeSystem" />

        <aside class="ray-home__databox">
          <p class="ray-home__databox-title">{{ accessTitle }}</p>
          <div class="ray-home__databox-main">
            <div class="ray-home__databox-image">
              <img :src="assetUrl(selectedWorld.image_url)" :alt="selectedWorld.name">
            </div>
            <p class="ray-home__databox-copy">
              {{ activeCard?.introduce || selectedWorld.introduce }}
            </p>
          </div>
          <div class="ray-home__databox-bottom">
            <NuxtLink
              v-if="activeCard"
              class="ray-home__access-btn"
              :to="activeCard.target"
            >
              ACCESS-&gt;
            </NuxtLink>
            <span v-else class="ray-home__access-btn is-disabled">ACCESS-&gt;</span>
          </div>
        </aside>

        <div class="ray-home__pagebox" aria-label="分区与作品选择">
          <div class="ray-home__compass">
            <div class="ray-home__compass-wave" aria-hidden="true" />
            <div class="ray-home__compass-ring" aria-hidden="true" />
            <div class="ray-home__compass-ring ray-home__compass-ring--mid" aria-hidden="true" />
            <div class="ray-home__compass-ring ray-home__compass-ring--inner" aria-hidden="true" />
            <div class="ray-home__compass-nodes">
              <button
                v-for="(section, index) in sections"
                :key="section"
                type="button"
                class="ray-home__compass-node"
                :class="{ 'is-selected': selectedSection === section }"
                :style="{ '--i': index, '--n': sections.length }"
                @click="pickSection(section)"
              >
                {{ section }}
              </button>
            </div>
            <div class="ray-home__compass-ids">
              <button
                v-for="(card, index) in sectionCards"
                :key="card.id"
                type="button"
                class="ray-home__compass-id"
                :class="{ 'is-selected': activeCard?.id === card.id }"
                :style="{ '--i': index, '--n': Math.max(sectionCards.length, 1) }"
                @click="pickCard(card.id, card.section)"
              >
                {{ getContentLabel(card.section, card.id) }}
              </button>
              <p v-if="!sectionCards.length" class="ray-home__compass-empty">NO DATA</p>
            </div>
            <p class="ray-home__compass-world">{{ selectedWorld.name }}</p>
          </div>
        </div>

        <button type="button" class="ray-home__system-close" @click="closeSystem">
          [返回]::close()
        </button>
      </div>
    </Transition>

    <Transition name="system">
      <div
        v-if="showInstruction"
        class="ray-home__instruction"
        role="dialog"
        aria-modal="true"
        aria-label="操作说明"
      >
        <button type="button" class="ray-home__instruction-backdrop" aria-label="关闭说明" @click="closeInstruction" />
        <div class="ray-home__instruction-panel">
          <p class="ray-home__instruction-title">OPERATING INSTRUCTIONS</p>
          <ul>
            <li><b>DRAG</b> 拖拽星图背景，浏览更广阔的航行视野。</li>
            <li><b>CLICK</b> 点击星球节点，打开对应世界观资料系统。</li>
            <li><b>ACCESS</b> 在系统层选择 records / portraits / images 后进入档案。</li>
            <li><b>CONSLOE</b> 关闭系统层，回到航行监测界面。</li>
          </ul>
          <button type="button" class="ray-home__system-close" @click="closeInstruction">[返回]::close()</button>
        </div>
      </div>
    </Transition>
  </main>
</template>
