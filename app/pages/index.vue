<script setup lang="ts">
import unknownWorldsData from '../../api/unknownWorlds.json'
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
  return `${world.name} / ${selectedSection.value} / ${activeCard.value?.id || world.name}`
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
        <p>◷ <em>宇宙汤:</em> {{ dateText }}</p>
        <strong>{{ clockText }}</strong>
      </div>

      <button class="ray-home__console" type="button" aria-label="控制台" @click="closeSystem">
        <span>CONSLOE</span>
        <i /><b /><i />
        <div class="ray-home__console-grid" aria-hidden="true" />
      </button>

      <div class="ray-home__external">External Links&nbsp; ↘</div>
      <div class="ray-home__social">
        <a href="https://space.bilibili.com/" target="_blank" rel="noreferrer" aria-label="Bilibili">▣</a>
        <a href="https://weibo.com/" target="_blank" rel="noreferrer" aria-label="Weibo">◉</a>
        <a href="https://fanqienovel.com/" target="_blank" rel="noreferrer" aria-label="番茄小说">▣</a>
      </div>

      <button class="ray-home__help" type="button" @click="openInstruction">
        <span class="ray-home__help-icon" aria-hidden="true">◉</span>
        <span>
          <strong>Need Help?</strong>
          <small>Check Instruction</small>
        </span>
      </button>

      <div class="ray-home__corner ray-home__corner--left" aria-hidden="true" />
      <div class="ray-home__corner ray-home__corner--right" aria-hidden="true" />
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
                {{ card.id }}
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
