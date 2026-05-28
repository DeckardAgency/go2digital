<template>
  <NuxtLink
    v-if="tag === 'a' && !external"
    :to="to"
    class="btn-animated"
    :class="classes"
    :style="customStyle"
  >
    <span class="btn-animated__fill"></span>
    <span class="btn-animated__text">
      <span class="btn-animated__text-inner">
        <span class="btn-animated__text-default">{{ text }}</span>
        <span class="btn-animated__text-hover">{{ text }}</span>
      </span>
    </span>
    <span v-if="!noIcon" class="btn-animated__icon" aria-hidden="true">
      <slot name="icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 11" fill="none">
          <path d="M8.5 1L13 5.5M13 5.5L8.5 10M13 5.5H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </slot>
    </span>
  </NuxtLink>

  <a
    v-else-if="tag === 'a' && external"
    :href="to"
    target="_blank"
    rel="noopener noreferrer"
    class="btn-animated"
    :class="classes"
    :style="customStyle"
  >
    <span class="btn-animated__fill"></span>
    <span class="btn-animated__text">
      <span class="btn-animated__text-inner">
        <span class="btn-animated__text-default">{{ text }}</span>
        <span class="btn-animated__text-hover">{{ text }}</span>
      </span>
    </span>
    <span v-if="!noIcon" class="btn-animated__icon" aria-hidden="true">
      <slot name="icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 11" fill="none">
          <path d="M8.5 1L13 5.5M13 5.5L8.5 10M13 5.5H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </slot>
    </span>
  </a>

  <button
    v-else
    :type="type"
    class="btn-animated"
    :class="classes"
    :style="customStyle"
  >
    <span class="btn-animated__fill"></span>
    <span class="btn-animated__text">
      <span class="btn-animated__text-inner">
        <span class="btn-animated__text-default">{{ text }}</span>
        <span class="btn-animated__text-hover">{{ text }}</span>
      </span>
    </span>
    <span v-if="!noIcon" class="btn-animated__icon" aria-hidden="true">
      <slot name="icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 11" fill="none">
          <path d="M8.5 1L13 5.5M13 5.5L8.5 10M13 5.5H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </slot>
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  /** Button label text */
  text?: string
  /** Link destination (for tag='a') */
  to?: string
  /** Render as link or button */
  tag?: 'a' | 'button'
  /** Button type attribute (for tag='button') */
  type?: 'button' | 'submit' | 'reset'
  /** Color variant */
  variant?: 'on-light' | 'on-dark'
  /** Size variant */
  size?: 'small' | 'default' | 'large'
  /** Width behavior */
  width?: 'fit-content' | 'full-width' | 'auto'
  /** Hide the arrow icon */
  noIcon?: boolean
  /** Open in new tab (external link) */
  external?: boolean
  /** Custom border-radius override */
  borderRadius?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: 'Learn more',
  to: '/',
  tag: 'a',
  type: 'button',
  variant: 'on-light',
  size: 'default',
  width: 'fit-content',
  noIcon: false,
  external: false,
  borderRadius: ''
})

const classes = computed(() => [
  `btn-animated--${props.variant}`,
  props.size !== 'default' ? `btn-animated--${props.size}` : '',
  `btn-animated--${props.width}`,
  props.noIcon ? 'btn-animated--no-icon' : ''
].filter(Boolean))

const customStyle = computed(() =>
  props.borderRadius ? { '--btn-border-radius': props.borderRadius } : undefined
)
</script>

<style lang="scss" scoped>
// ==========================================================================
// BtnAnimated — Animated button with expanding fill from icon side
// ==========================================================================

$btn-color-dark: #03120F;
$btn-color-light: #FAFAFA;
$btn-height: 3.125rem;
$btn-icon-size: 3rem;
$btn-border-radius: 999px;
$btn-duration: 0.4s;
$btn-easing: cubic-bezier(0.4, 0, 0.2, 1);

.btn-animated {
  --btn-border-radius: #{$btn-border-radius};

  position: relative;
  display: inline-flex;
  align-items: center;
  height: $btn-height;
  padding: 0.0625rem 0.0625rem 0.0625rem 1.5rem;
  border-radius: var(--btn-border-radius);
  overflow: hidden;
  isolation: isolate;
  cursor: pointer;
  text-decoration: none;
  border: none;
  outline: none;
  box-sizing: border-box;
  gap: 1rem;
  font-family: $font-family;

  // ── Fill ──
  &__fill {
    position: absolute;
    top: 1px;
    right: 1px;
    bottom: 1px;
    width: $btn-icon-size;
    border-radius: var(--btn-border-radius);
    transition: width $btn-duration $btn-easing;
    z-index: 1;
  }

  // ── Icon ──
  &__icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(#{$btn-icon-size} - 2px);
    height: calc(#{$btn-icon-size} - 2px);
    border-radius: 50%;
    flex-shrink: 0;
    z-index: 3;

    svg {
      width: 0.875rem;
      height: 0.6875rem;
      flex-shrink: 0;
    }
  }

  // ── Text ──
  &__text {
    position: relative;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.3;
    white-space: nowrap;
    z-index: 2;
    overflow: hidden;
    height: 1.3em;
  }

  &__text-inner {
    display: flex;
    flex-direction: column;
    transition: transform $btn-duration $btn-easing;
  }

  &__text-default,
  &__text-hover {
    display: block;
    white-space: nowrap;
    line-height: 1.3;
  }

  // ══════════════════════════════════════════════
  // Variant: On Light (dark bg, light text)
  // ══════════════════════════════════════════════
  &--on-light {
    background-color: $btn-color-dark;

    .btn-animated__fill { background-color: $btn-color-light; }
    .btn-animated__icon { background-color: $btn-color-light; svg { color: $btn-color-dark; } }
    .btn-animated__text-default { color: $btn-color-light; }
    .btn-animated__text-hover { color: $btn-color-dark; }

    &:hover {
      .btn-animated__fill { width: calc(100% - 2px); }
      .btn-animated__text-inner { transform: translateY(-50%); }
    }
  }

  // ══════════════════════════════════════════════
  // Variant: On Dark (light bg, dark text)
  // ══════════════════════════════════════════════
  &--on-dark {
    background-color: $btn-color-light;
    border: 1px solid $btn-color-dark;

    .btn-animated__fill { background-color: $btn-color-dark; }
    .btn-animated__icon { background-color: $btn-color-dark; svg { color: $btn-color-light; } }
    .btn-animated__text-default { color: $btn-color-dark; }
    .btn-animated__text-hover { color: $btn-color-light; }

    &:hover {
      .btn-animated__fill { width: calc(100% - 2px); }
      .btn-animated__text-inner { transform: translateY(-50%); }
    }
  }

  // ══════════════════════════════════════════════
  // Sizes
  // ══════════════════════════════════════════════
  &--small {
    height: 2.75rem;
    padding-left: 1.25rem;

    .btn-animated__fill { width: 2.625rem; }
    .btn-animated__icon {
      width: calc(2.625rem - 2px);
      height: calc(2.625rem - 2px);
      svg { width: 0.75rem; height: 0.625rem; }
    }
    .btn-animated__text { font-size: 0.875rem; }
  }

  &--large {
    height: 3.5rem;
    padding-left: 1.75rem;

    .btn-animated__fill { width: 3.375rem; }
    .btn-animated__icon {
      width: calc(3.375rem - 2px);
      height: calc(3.375rem - 2px);
      svg { width: 1rem; height: 0.75rem; }
    }
    .btn-animated__text { font-size: 1.125rem; }
  }

  // ══════════════════════════════════════════════
  // Width
  // ══════════════════════════════════════════════
  &--full-width { width: 100%; justify-content: space-between; }
  &--fit-content { width: fit-content; }
  &--auto { width: auto; }

  // ══════════════════════════════════════════════
  // No Icon
  // ══════════════════════════════════════════════
  &--no-icon {
    padding-right: 1.5rem;
    gap: 0;

    .btn-animated__fill { width: 0; right: auto; left: 1px; }

    &.btn-animated--small { padding-right: 1.25rem; }
    &.btn-animated--large { padding-right: 1.75rem; }

    &.btn-animated--on-light:hover,
    &.btn-animated--on-dark:hover {
      .btn-animated__fill { width: calc(100% - 2px); }
    }
  }

  // ── Focus visible ──
  &:focus-visible {
    outline: 2px solid $color-accent;
    outline-offset: 2px;
  }
}

// Accessibility
@media (prefers-reduced-motion: reduce) {
  .btn-animated__fill,
  .btn-animated__text-inner {
    transition: none;
  }
}
</style>
