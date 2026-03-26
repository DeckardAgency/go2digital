<template>
  <div class="page page--privacy">
    <section class="privacy">
      <div class="privacy__container">
        <h1 class="privacy__title">Privacy Policy</h1>
        <div class="privacy__content">
          <p>Privacy policy content coming soon.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Privacy Policy - Go2Digital'
})
</script>

<style scoped lang="scss">
.page--privacy {
  min-height: 100vh;
}

.privacy {
  padding: 120px 24px 80px;

  &__container {
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
  }

  &__title {
    font-size: clamp(2rem, 4vw, 3.5rem);
    font-weight: 700;
    color: var(--color-text, #fff);
    margin-bottom: 48px;
  }

  &__content {
    font-size: 1rem;
    line-height: 1.8;
    color: var(--color-text-secondary, #999);

    p {
      margin-bottom: 1.5em;
    }
  }
}
</style>
