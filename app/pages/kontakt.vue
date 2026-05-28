<script setup lang="ts">
definePageMeta({ showFooter: false })

const { t } = useI18n()
const {
  time,
  date,
  temperature,
  weatherDescription,
  batteryPercentage,
  init,
  destroy
} = useContactHeader()

const { initSplitText } = useSplitText()

const overlayVisible = ref(true)
const weatherLoaded = ref(false)
const timeAnimationComplete = ref(false)
const initialTime = ref('')

// Capture initial time for split text animation
watch(time, (newVal) => {
  if (newVal && !initialTime.value) {
    initialTime.value = newVal
    // After animation completes, switch to live time
    setTimeout(() => {
      timeAnimationComplete.value = true
    }, 1200)
  }
}, { immediate: true })

// SEO
useSeo('singleton/contact-page', null, t('contact.seo.title'))

const { blockMaps } = useTypography()

const DEFAULT_PRESETS = {
  headerTime: 'display-stat',
  headerDate: 'display-stat',
  temperature: 'display-stat',
  weatherDesc: 'body',
  batteryText: 'body',
  batteryPercent: 'body-sm',
} as const

function typoClass(key: keyof typeof DEFAULT_PRESETS): string {
  const map = blockMaps.value['contact'] || {}
  return `typo-${map[key] || DEFAULT_PRESETS[key]}`
}

// Watch for weather data to load, then init split text
watch(temperature, (newVal) => {
  if (newVal !== '--°' && !weatherLoaded.value) {
    weatherLoaded.value = true
    nextTick(() => {
      setTimeout(() => initSplitText(), 50)
    })
  }
})

// Click-to-copy email
const CONTACT_EMAIL = 'info@go2digital.hr'
async function copyEmail() {
  try {
    await navigator.clipboard.writeText(CONTACT_EMAIL)
  } catch {
    /* ignore */
  }
}

// Initialize on mount
onMounted(() => {
  init()
})

// Cleanup on unmount
onUnmounted(() => {
  destroy()
})
</script>

<template>
  <div class="contact-page" :class="{ 'overlay-visible': overlayVisible }" :style="{ backgroundImage: 'url(/images/contact-bg.jpg)' }">
    <!-- Left Content Stack -->
    <div class="left-content">
      <!-- Header Info -->
      <div class="header-info">
        <!-- Static time for split text animation -->
        <div
          v-if="!timeAnimationComplete && initialTime"
          :class="['header-info__time', typoClass('headerTime')]"
          data-split-text
          data-split-type="chars"
          data-split-trigger="load"
          data-split-duration="0.8"
          data-split-delay="0"
          data-split-stagger="0.04"
        >{{ initialTime }}</div>
        <!-- Live updating time after animation -->
        <div v-else :class="['header-info__time', typoClass('headerTime')]">{{ time }}</div>
        <div
          :class="['header-info__date', typoClass('headerDate')]"
          data-split-text
          data-split-type="chars"
          data-split-trigger="load"
          data-split-duration="0.8"
          data-split-delay="0.2"
          data-split-stagger="0.03"
        >{{ date }}</div>
      </div>

      <!-- Weather -->
      <div class="weather">
        <div
          v-if="weatherLoaded"
          :class="['weather__temperature', typoClass('temperature')]"
          data-split-text
          data-split-type="chars"
          data-split-trigger="load"
          data-split-duration="0.8"
          data-split-delay="0"
          data-split-stagger="0.05"
        >{{ temperature }}</div>
        <div
          v-if="weatherLoaded"
          :class="['weather__description', typoClass('weatherDesc')]"
          data-split-text
          data-split-type="words"
          data-split-trigger="load"
          data-split-duration="0.8"
          data-split-delay="0.1"
          data-split-stagger="0.08"
        >{{ weatherDescription }}</div>
      </div>

      <!-- Battery Status -->
      <div class="battery-status">
        <div :class="['battery-status__text', typoClass('batteryText')]">
          <span
            data-split-text
            data-split-type="words"
            data-split-trigger="load"
            data-split-duration="0.8"
            data-split-delay="0.4"
            data-split-stagger="0.06"
          >{{ t('contact.batteryTextLine1') }}</span>
          <br>
          <span
            data-split-text
            data-split-type="words"
            data-split-trigger="load"
            data-split-duration="0.8"
            data-split-delay="0.5"
            data-split-stagger="0.06"
          >{{ t('contact.batteryTextLine2') }}</span>
        </div>
        <div class="battery-status__bar-wrapper">
          <div class="battery-status__bar">
            <div class="battery-status__fill" :style="{ width: batteryPercentage + '%' }"></div>
          </div>
          <span :class="['battery-status__percentage', typoClass('batteryPercent')]">{{ batteryPercentage }}%</span>
        </div>
      </div>
    </div>

    <!-- Right Content -->
    <div class="right-content">
      <!-- Social Links -->
      <div class="social-links">
        <BtnAnimated
          :text="$t('contact.social.linkedin')"
          to="https://www.linkedin.com/company/go2digital-d-o-o-/"
          :external="true"
          variant="on-dark"
          size="small"
          :no-icon="true"
          border-radius="0.5rem"
        />
        <BtnAnimated
          :text="$t('contact.social.instagram')"
          to="https://www.instagram.com/go2digital_hr/"
          :external="true"
          variant="on-dark"
          size="small"
          :no-icon="true"
          border-radius="0.5rem"
        />
        <BtnAnimated
          :text="$t('contact.social.facebook')"
          to="https://www.facebook.com/go2digital.hr/"
          :external="true"
          variant="on-dark"
          size="small"
          :no-icon="true"
          border-radius="0.5rem"
        />
        <BtnAnimated
          :text="$t('contact.social.youtube')"
          to="https://www.youtube.com/channel/UCsbdtVvbIDtUdSA5mM5zFaA"
          :external="true"
          variant="on-dark"
          size="small"
          :no-icon="true"
          border-radius="0.5rem"
        />
      </div>

      <!-- Contact Info -->
      <div class="contact-info">
        <div class="contact-info__row">
          <BtnAnimated
            class="contact-info__email-btn"
            :text="$t('contact.info.email')"
            tag="button"
            type="button"
            variant="on-dark"
            size="small"
            border-radius="0.5rem"
            @click="copyEmail"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" width="14" height="14">
                <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M10.5 2.5h-7A1 1 0 0 0 2.5 3.5v7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </template>
          </BtnAnimated>
          <BtnAnimated
            :text="$t('contact.info.phone')"
            to="tel:+38514839192"
            :external="true"
            variant="on-dark"
            size="small"
            :no-icon="true"
            border-radius="0.5rem"
          />
        </div>
        <BtnAnimated
          :text="$t('contact.info.address')"
          to="https://maps.google.com/?q=Radnička+cesta+52,+Zagreb"
          :external="true"
          variant="on-dark"
          size="small"
          :no-icon="true"
          border-radius="0.5rem"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// Variables and mixins are now globally available via nuxt.config.ts
// Page-specific design tokens
$overlay-light: rgba(0, 0, 0, 0.4);
$text-light: rgba(255, 255, 255, 0.85);
$text-lighter: rgba(255, 255, 255, 0.6);

.contact-page {
  position: relative;
  top: 0;
  left: 0;
  width: 100vw;
  // svh is the SMALLEST viewport (chrome visible); guarantees content fits
  // even on browsers that don't shrink the viewport for fixed bottom toolbars.
  // Fallback to dvh for browsers that don't support svh.
  height: 100dvh;
  height: 100svh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  contain: layout style;

  @include tablet {
    display: flex;
    flex-direction: column;
  }

  &::after {
    content: '';
    @include absolute-fill;
    background: $overlay-light;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.6s ease;
  }

  &.overlay-visible::after {
    opacity: 1;
  }
}

.left-content {
  position: absolute;
  top: $spacing-2xl;
  left: $spacing-2xl;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: $spacing-2xl;

  @include wide {
    left: $spacing-lg;
    top: $spacing-lg;
    gap: 3.125rem;
  }

  @include desktop {
    left: $spacing-md;
    top: $spacing-md;
    gap: $spacing-lg;
  }

  @include tablet {
    all: unset;
    margin-top: 6rem;
    padding: $spacing-md;
    z-index: 3;
  }
}

.header-info {
  color: $dark-text;

  @include tablet {
    margin-bottom: 2.5rem;
  }

  &__time {
    margin-bottom: $spacing-xs;
  }

  &__date {
  }
}

.weather {
  color: $dark-text;

  &__temperature {
    margin-bottom: 0.75rem;

    @include tablet {
      margin-bottom: 0;
    }
  }

  &__description {
    color: $text-light;
  }
}

.battery-status {
  width: 15rem;
  color: $dark-text;

  &__text {
    color: $text-light;
    margin-bottom: 0.9375rem;
  }

  &__bar-wrapper {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__bar {
    position: relative;
    flex: 1;
    height: 2rem;
    background: #FAFAFA;
    border-radius: 16px;
    overflow: hidden;
  }

  &__fill {
    position: absolute;
    left: 0.25rem;
    top: 0.25rem;
    bottom: 0.25rem;
    width: 2%;
    max-width: calc(100% - 0.5rem);
    background: $color-accent;
    border-radius: 12px;
    transition: width 0.3s ease;
  }

  &__percentage {
    flex-shrink: 0;
    color: $text-lighter;
  }
}

.right-content {
  position: absolute;
  top: $spacing-xl;
  right: $spacing-xl;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: $spacing-sm;

  @include wide {
    right: $spacing-lg;
    top: $spacing-lg;
  }

  @include desktop {
    right: $spacing-md;
    top: $spacing-md;
  }

  @include tablet {
    all: unset;
    margin-top: auto;
    padding: 1rem;
    z-index: 3;
  }

  @include mobile {
    // Pad the bottom by the iOS home-indicator inset so the last row of
    // social/contact buttons clears any bottom safe area on iOS Safari.
    padding: 1rem 1rem calc(1rem + env(safe-area-inset-bottom)) 1rem;
  }
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  justify-content: flex-end;

  @include desktop {
    max-width: 15.625rem;
  }

  @include tablet {
    max-width: unset;
    margin-bottom: 0.625rem;
  }

  // Shrink 20% on smaller phones (e.g. Samsung S25 ~360px) so the last
  // contact row clears the browser bottom toolbar.
  @media (max-width: 410px) {
    zoom: 0.8;
  }
}

.contact-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: $spacing-xs;

  &__row {
    display: flex;
    gap: $spacing-xs;
  }

  // Email copy button: flat icon (no chip background), no hover animation
  &__email-btn {
    :deep(.btn-animated__icon) { background-color: transparent; }
    :deep(.btn-animated__fill) { display: none; }
    &:hover :deep(.btn-animated__text-inner) { transform: none; }
  }

  @media (max-width: 410px) {
    zoom: 0.8;
  }
}
</style>
