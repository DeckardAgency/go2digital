<script setup lang="ts">
interface Props {
  text?: string
  href?: string
  variant?: 'on-light' | 'on-dark'
  size?: 'small' | 'default' | 'large'
  width?: 'fit-content' | 'full-width' | 'auto'
  noIcon?: boolean
  tag?: 'a' | 'button'
  type?: 'button' | 'submit'
  target?: '_self' | '_blank'
  borderRadius?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: 'Learn more',
  href: '#',
  variant: 'on-light',
  size: 'default',
  width: 'fit-content',
  noIcon: false,
  tag: 'a',
  type: 'button',
  target: '_self'
})

const classes = computed(() => {
  const classList = ['btn-animated', `btn-animated--${props.variant}`]

  if (props.size === 'small') classList.push('btn-animated--small')
  if (props.size === 'large') classList.push('btn-animated--large')

  if (props.width === 'full-width') classList.push('btn-animated--full-width')
  if (props.width === 'fit-content') classList.push('btn-animated--fit-content')
  if (props.width === 'auto') classList.push('btn-animated--auto')

  if (props.noIcon) classList.push('btn-animated--no-icon')

  return classList
})

const customStyle = computed(() => {
  if (props.borderRadius) {
    return { '--btn-border-radius': props.borderRadius }
  }
  return undefined
})
</script>

<template>
  <NuxtLink
    v-if="tag === 'a'"
    :to="href"
    :class="classes"
    :style="customStyle"
    :target="target === '_blank' ? '_blank' : undefined"
    :rel="target === '_blank' ? 'noopener noreferrer' : undefined"
  >
    <span class="btn-animated__fill"></span>
    <span class="btn-animated__text">
      <span class="btn-animated__text-inner">
        <span class="btn-animated__text-default">{{ text }}</span>
        <span class="btn-animated__text-hover">{{ text }}</span>
      </span>
    </span>
    <span v-if="!noIcon" class="btn-animated__icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 11" fill="none">
        <path d="M8.5 1L13 5.5M13 5.5L8.5 10M13 5.5H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </NuxtLink>

  <button
    v-else
    :type="type"
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
    <span v-if="!noIcon" class="btn-animated__icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 11" fill="none">
        <path d="M8.5 1L13 5.5M13 5.5L8.5 10M13 5.5H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </button>
</template>

<style scoped lang="scss">
// Variables
$btn-color-dark: #03120F;
$btn-color-light: #FAFAFA;
$btn-font-family: 'PP Neue Montreal', -apple-system, BlinkMacSystemFont, sans-serif;
$btn-height: 3.125rem;
$btn-icon-size: 3rem;
$btn-border-radius: 999px;
$btn-transition-duration: 0.4s;
$btn-transition-easing: cubic-bezier(0.4, 0, 0.2, 1);

.btn-animated {
  --btn-border-radius: #{$btn-border-radius};

  position: relative;
  display: inline-flex;
  align-items: center;
  height: $btn-height;
  padding: 0.0625rem;
  padding-left: 1.5rem;
  padding-right: 0.0625rem;
  border-radius: var(--btn-border-radius);
  overflow: hidden;
  isolation: isolate;
  cursor: pointer;
  text-decoration: none;
  border: none;
  outline: none;
  box-sizing: border-box;
  gap: 1rem;

  &__fill {
    position: absolute;
    top: 1px;
    right: 1px;
    bottom: 1px;
    width: $btn-icon-size;
    border-radius: var(--btn-border-radius);
    transition: width $btn-transition-duration $btn-transition-easing;
    z-index: 1;
  }

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

  &__text {
    position: relative;
    font-family: $btn-font-family;
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
    transition: transform $btn-transition-duration $btn-transition-easing;
  }

  &__text-default,
  &__text-hover {
    display: block;
    white-space: nowrap;
    line-height: 1.3;
  }

  // Variant: On Light
  &--on-light {
    background-color: $btn-color-dark;

    .btn-animated__fill {
      background-color: $btn-color-light;
    }

    .btn-animated__icon {
      background-color: $btn-color-light;

      svg {
        color: $btn-color-dark;
      }
    }

    .btn-animated__text-default {
      color: $btn-color-light;
    }

    .btn-animated__text-hover {
      color: $btn-color-dark;
    }

    &:hover {
      .btn-animated__fill {
        width: calc(100% - 2px);
      }

      .btn-animated__text-inner {
        transform: translateY(-50%);
      }
    }
  }

  // Variant: On Dark
  &--on-dark {
    background-color: $btn-color-light;
    border: 1px solid $btn-color-dark;

    .btn-animated__fill {
      background-color: $btn-color-dark;
    }

    .btn-animated__icon {
      background-color: $btn-color-dark;

      svg {
        color: $btn-color-light;
      }
    }

    .btn-animated__text-default {
      color: $btn-color-dark;
    }

    .btn-animated__text-hover {
      color: $btn-color-light;
    }

    &:hover {
      .btn-animated__fill {
        width: calc(100% - 2px);
      }

      .btn-animated__text-inner {
        transform: translateY(-50%);
      }
    }
  }

  // Size: Small
  &--small {
    height: 2.75rem;
    padding-left: 1.25rem;

    .btn-animated__fill {
      width: 2.625rem;
    }

    .btn-animated__icon {
      width: calc(2.625rem - 2px);
      height: calc(2.625rem - 2px);

      svg {
        width: 0.75rem;
        height: 0.625rem;
      }
    }

    .btn-animated__text {
      font-size: 0.875rem;
    }

    @media (max-width: 480px) {
      height: 2rem;
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
  }

  // Size: Large
  &--large {
    height: 3.5rem;
    padding-left: 1.75rem;

    .btn-animated__fill {
      width: 3.375rem;
    }

    .btn-animated__icon {
      width: calc(3.375rem - 2px);
      height: calc(3.375rem - 2px);

      svg {
        width: 1rem;
        height: 0.75rem;
      }
    }

    .btn-animated__text {
      font-size: 1.125rem;
    }
  }

  // Width Variants
  &--full-width {
    width: 100%;
    justify-content: space-between;
  }

  &--fit-content {
    width: fit-content;
  }

  &--auto {
    width: auto;
  }

  // No Icon Variant
  &--no-icon {
    padding-right: 1.5rem;
    gap: 0;

    .btn-animated__fill {
      width: 0;
      right: auto;
      left: 1px;
    }

    &.btn-animated--small {
      padding-right: 1.25rem;

      @media (max-width: 480px) {
        padding-right: 0.5rem;
      }
    }

    &.btn-animated--large {
      padding-right: 1.75rem;
    }

    &.btn-animated--on-light,
    &.btn-animated--on-dark {
      &:hover {
        .btn-animated__fill {
          width: calc(100% - 2px);
        }
      }
    }
  }
}
</style>
