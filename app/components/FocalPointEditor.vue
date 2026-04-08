<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fp-editor" @keydown.escape="cancel">
      <!-- Top bar -->
      <div class="fp-editor__topbar">
        <div class="fp-editor__title">Focal Point Editor</div>
        <div class="fp-editor__modes">
          <button
            type="button"
            class="fp-editor__mode"
            :class="{ 'fp-editor__mode--active': mode === 'desktop' }"
            @click="mode = 'desktop'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            Desktop
          </button>
          <button
            type="button"
            class="fp-editor__mode"
            :class="{ 'fp-editor__mode--active': mode === 'mobile' }"
            @click="mode = 'mobile'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
            Mobile
          </button>
        </div>
        <div class="fp-editor__coords">{{ currentPoint.x.toFixed(1) }}% / {{ currentPoint.y.toFixed(1) }}%</div>
        <div class="fp-editor__actions">
          <button type="button" class="fp-editor__btn fp-editor__btn--reset" @click="resetPoint">Reset</button>
          <button type="button" class="fp-editor__btn fp-editor__btn--save" :class="{ 'has-changes': dirty }" :disabled="saving" @click="save">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
          <button type="button" class="fp-editor__btn fp-editor__btn--cancel" @click="cancel">Cancel</button>
        </div>
      </div>

      <!-- Body -->
      <div class="fp-editor__body">
        <!-- Source image -->
        <div class="fp-editor__source">
          <div class="fp-editor__source-label">Click to set focal point</div>
          <div class="fp-editor__source-wrap" ref="sourceWrapRef" @click="onSourceClick">
            <img :src="imageUrl" alt="Source" class="fp-editor__source-img" ref="sourceImgRef" draggable="false">
            <div
              class="fp-editor__marker"
              :class="{ 'is-animating': markerAnimating }"
              :style="markerStyle"
            >
              <div class="fp-editor__marker-dot"></div>
              <div class="fp-editor__marker-ring"></div>
              <div class="fp-editor__marker-line fp-editor__marker-line--h"></div>
              <div class="fp-editor__marker-line fp-editor__marker-line--v"></div>
            </div>
          </div>
        </div>

        <!-- Previews -->
        <div class="fp-editor__previews">
          <div class="fp-editor__preview" :class="{ 'fp-editor__preview--active': mode === 'desktop' }">
            <div class="fp-editor__preview-label">Desktop preview <span>~4:1 panoramic</span></div>
            <div class="fp-editor__preview-frame fp-editor__preview-frame--desktop">
              <img :src="imageUrl" alt="Desktop preview" :style="{ objectPosition: `${desktopPoint.x}% ${desktopPoint.y}%` }">
            </div>
          </div>
          <div class="fp-editor__preview" :class="{ 'fp-editor__preview--active': mode === 'mobile' }">
            <div class="fp-editor__preview-label">Mobile preview <span>9:16 portrait</span></div>
            <div class="fp-editor__preview-frame fp-editor__preview-frame--mobile">
              <img :src="imageUrl" alt="Mobile preview" :style="{ objectPosition: `${mobilePoint.x}% ${mobilePoint.y}%` }">
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  imageUrl: string
  initialX: number
  initialY: number
  totemId: string
  token: string
}>()

const emit = defineEmits<{
  saved: [x: number, y: number]
  close: []
}>()

const isOpen = ref(false)
const mode = ref<'desktop' | 'mobile'>('desktop')
const dirty = ref(false)
const saving = ref(false)
const markerAnimating = ref(false)

const desktopPoint = reactive({ x: 50, y: 50 })
const mobilePoint = reactive({ x: 50, y: 50 })
const originalDesktop = reactive({ x: 50, y: 50 })
const originalMobile = reactive({ x: 50, y: 50 })

const currentPoint = computed(() => mode.value === 'desktop' ? desktopPoint : mobilePoint)

const sourceWrapRef = ref<HTMLElement | null>(null)
const sourceImgRef = ref<HTMLImageElement | null>(null)

const markerStyle = computed(() => {
  if (!sourceImgRef.value || !sourceWrapRef.value) {
    return { left: `${currentPoint.value.x}%`, top: `${currentPoint.value.y}%` }
  }
  const img = sourceImgRef.value
  const wrap = sourceWrapRef.value
  const imgRect = img.getBoundingClientRect()
  const wrapRect = wrap.getBoundingClientRect()
  const pt = currentPoint.value
  return {
    left: (imgRect.left - wrapRect.left + imgRect.width * pt.x / 100) + 'px',
    top: (imgRect.top - wrapRect.top + imgRect.height * pt.y / 100) + 'px',
  }
})

// Force reactivity update for marker position
const markerTick = ref(0)
watch([() => currentPoint.value.x, () => currentPoint.value.y, markerTick], () => {})

function open() {
  const x = props.initialX ?? 50
  const y = props.initialY ?? 50
  desktopPoint.x = x; desktopPoint.y = y
  mobilePoint.x = x; mobilePoint.y = y
  originalDesktop.x = x; originalDesktop.y = y
  originalMobile.x = x; originalMobile.y = y
  mode.value = 'desktop'
  dirty.value = false
  isOpen.value = true
  document.body.style.overflow = 'hidden'

  nextTick(() => {
    if (sourceImgRef.value?.complete) {
      setTimeout(() => markerTick.value++, 50)
    } else {
      sourceImgRef.value?.addEventListener('load', () => markerTick.value++, { once: true })
    }
  })
}

function onSourceClick(e: MouseEvent) {
  if (!sourceImgRef.value) return
  const rect = sourceImgRef.value.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  const pt = currentPoint.value
  pt.x = Math.max(0, Math.min(100, Math.round(x * 10) / 10))
  pt.y = Math.max(0, Math.min(100, Math.round(y * 10) / 10))
  dirty.value = true
  markerAnimating.value = true
  setTimeout(() => markerAnimating.value = false, 200)
  markerTick.value++
}

function resetPoint() {
  currentPoint.value.x = 50
  currentPoint.value.y = 50
  dirty.value = true
  markerTick.value++
}

async function save() {
  saving.value = true
  try {
    const config = useRuntimeConfig()
    await $fetch(`/api/locations/totems/${props.totemId}`, {
      method: 'PATCH',
      baseURL: config.public.apiBase as string,
      headers: {
        Authorization: `Bearer ${props.token}`,
        'Content-Type': 'application/merge-patch+json',
      },
      body: {
        imageFocalX: Math.round(desktopPoint.x * 10) / 10,
        imageFocalY: Math.round(desktopPoint.y * 10) / 10,
      },
    })
    originalDesktop.x = desktopPoint.x; originalDesktop.y = desktopPoint.y
    originalMobile.x = mobilePoint.x; originalMobile.y = mobilePoint.y
    dirty.value = false
    isOpen.value = false
    document.body.style.overflow = ''
    emit('saved', desktopPoint.x, desktopPoint.y)
  } catch (err) {
    console.error('Failed to save focal point:', err)
  } finally {
    saving.value = false
  }
}

function cancel() {
  if (dirty.value && !confirm('You have unsaved changes. Discard?')) return
  isOpen.value = false
  document.body.style.overflow = ''
  emit('close')
}

onUnmounted(() => {
  if (isOpen.value) {
    document.body.style.overflow = ''
  }
})

defineExpose({ open })
</script>

<style lang="scss">
.fp-editor {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #03120F;
  display: flex;
  flex-direction: column;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.fp-editor__topbar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
}
.fp-editor__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}
.fp-editor__modes {
  display: flex;
  gap: 0.25rem;
  background: rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 0.1875rem;
}
.fp-editor__mode {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: none;
  border: none;
  border-radius: 6px;
  color: rgba(255,255,255,0.5);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  &:hover { color: rgba(255,255,255,0.8); }
  &--active {
    background: #0CD459;
    color: #03120F;
    box-shadow: 0 2px 8px rgba(12, 212, 89, 0.3);
    svg { stroke: #03120F; }
  }
}
.fp-editor__coords {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.8125rem;
  color: rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.06);
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  white-space: nowrap;
}
.fp-editor__actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}
.fp-editor__btn {
  padding: 0.4375rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  &--save {
    background: #0CD459;
    color: #03120F;
    &:hover { background: #0ae04f; box-shadow: 0 2px 12px rgba(12, 212, 89, 0.4); }
    &.has-changes { animation: fp-pulse 1.5s ease infinite; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
  &--cancel {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.7);
    &:hover { background: rgba(255,255,255,0.14); color: #fff; }
  }
  &--reset {
    background: none;
    color: rgba(255,255,255,0.4);
    text-decoration: underline;
    text-underline-offset: 2px;
    &:hover { color: rgba(255,255,255,0.7); }
  }
}

.fp-editor__body {
  flex: 1;
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  overflow: hidden;
  min-height: 0;
}

.fp-editor__source {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
.fp-editor__source-label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
}
.fp-editor__source-wrap {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: crosshair;
  overflow: hidden;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
}
.fp-editor__source-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}

.fp-editor__marker {
  position: absolute;
  pointer-events: none;
  z-index: 10;
  transform: translate(-50%, -50%);
}
.fp-editor__marker-dot {
  width: 14px;
  height: 14px;
  background: #0CD459;
  border: 2.5px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.4);
  position: relative;
  z-index: 2;
  transition: transform 0.15s ease;
}
.fp-editor__marker.is-animating .fp-editor__marker-dot {
  transform: scale(1.4);
}
.fp-editor__marker-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 32px;
  height: 32px;
  border: 1.5px solid rgba(12, 212, 89, 0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}
.fp-editor__marker-line {
  position: absolute;
  background: rgba(12, 212, 89, 0.2);
  z-index: 0;
  &--h {
    height: 1px;
    width: 200vw;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  &--v {
    width: 1px;
    height: 200vh;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.fp-editor__previews {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}
.fp-editor__preview-label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.375rem;
  span {
    color: rgba(255,255,255,0.25);
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
  }
}
.fp-editor__preview-frame {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  &--desktop { aspect-ratio: 4 / 1; }
  &--mobile { aspect-ratio: 9 / 16; max-height: 320px; }
}

.fp-editor__preview--active {
  .fp-editor__preview-frame {
    border-color: rgba(12, 212, 89, 0.4);
    box-shadow: 0 0 0 1px rgba(12, 212, 89, 0.15);
  }
  .fp-editor__preview-label { color: #0CD459; }
}

@keyframes fp-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(12, 212, 89, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(12, 212, 89, 0); }
}

@media (max-width: 768px) {
  .fp-editor__topbar { flex-wrap: wrap; gap: 0.5rem; padding: 0.625rem 1rem; }
  .fp-editor__title { display: none; }
  .fp-editor__body { flex-direction: column; padding: 1rem; }
  .fp-editor__source { min-height: 40vh; }
  .fp-editor__previews { width: 100%; flex-direction: row; overflow-x: auto; gap: 0.75rem; }
  .fp-editor__preview { min-width: 160px; }
  .fp-editor__preview-frame--mobile { max-height: 200px; }
}
</style>
