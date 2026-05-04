<template>
  <Teleport to="body">
    <Transition name="confirm-dialog">
      <div v-if="visible" class="confirm-dialog" @click.self="cancel">
        <div class="confirm-dialog__panel">
          <div class="confirm-dialog__icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p class="confirm-dialog__message">{{ messageText }}</p>
          <div class="confirm-dialog__actions">
            <button class="confirm-dialog__btn confirm-dialog__btn--cancel" @click="cancel">
              {{ cancelLabel }}
            </button>
            <button class="confirm-dialog__btn confirm-dialog__btn--confirm" @click="confirmAction">
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface Props {
  visible: boolean
  message?: string
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  confirmText: '',
  cancelText: ''
})

const messageText = computed(() => props.message || t('dialog.confirm.message'))
const confirmLabel = computed(() => props.confirmText || t('dialog.confirm.confirm'))
const cancelLabel = computed(() => props.cancelText || t('dialog.confirm.cancel'))

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:visible': [value: boolean]
}>()

function confirmAction() {
  emit('confirm')
  emit('update:visible', false)
}

function cancel() {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<style lang="scss" scoped>
.confirm-dialog {
  position: fixed;
  inset: 0;
  z-index: 10010;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  padding: 1rem;

  &__panel {
    background: #fff;
    border-radius: $radius-xl;
    padding: 2rem;
    max-width: 380px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }

  &__icon {
    width: 3rem;
    height: 3rem;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba($color-primary, 0.06);
    color: $color-primary;
  }

  &__message {
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: $color-primary;
    margin: 0 0 1.5rem;
  }

  &__actions {
    display: flex;
    gap: 0.75rem;
  }

  &__btn {
    flex: 1;
    padding: 0.75rem 1.25rem;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-family: inherit;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &--cancel {
      background: transparent;
      border: 1px solid $color-border;
      color: $color-primary;

      &:hover { border-color: $color-primary; }
    }

    &--confirm {
      background: $color-primary;
      border: 1px solid $color-primary;
      color: #fff;

      &:hover { opacity: 0.9; }
    }
  }
}

// Transitions
.confirm-dialog-enter-active { transition: opacity 0.2s ease; }
.confirm-dialog-leave-active { transition: opacity 0.15s ease; }
.confirm-dialog-enter-from,
.confirm-dialog-leave-to { opacity: 0; }

.confirm-dialog-enter-active .confirm-dialog__panel {
  animation: confirm-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.confirm-dialog-leave-active .confirm-dialog__panel {
  animation: confirm-slide-up 0.15s ease reverse;
}

@keyframes confirm-slide-up {
  from { transform: translateY(10px) scale(0.97); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
</style>
