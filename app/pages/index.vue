<template>
  <div class="page page--home">
    <HeroSection />
    <HorizontalScrollSection />
    <section class="content">
      <h2>Our Work</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
      <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      <div class="links">
        <NuxtLink to="/lab">Go to Labs</NuxtLink>
        <NuxtLink to="/blog">Go to Blog</NuxtLink>
        <NuxtLink to="/kontakt">Contact Us</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Homepage - Go2Digital'
})
</script>

<style scoped lang="scss">
// Variables and mixins are now globally available via nuxt.config.ts

// NOTE: Do NOT use `contain: layout` here - it breaks ScrollTrigger pinning in HeroSection
.page--home {
  min-height: 100vh;
}

.content {
  max-width: 800px;
  margin: 0 auto;
  padding: $spacing-2xl $spacing-xl;
  line-height: 1.8;
  background: $dark-background;
  color: $dark-text;

  p {
    margin-bottom: $spacing-lg;
  }
}

.links {
  display: flex;
  gap: $spacing-md;
  margin-top: $spacing-xl;

  a {
    padding: $spacing-sm $spacing-lg;
    background: $dark-surface;
    color: $dark-text;
    text-decoration: none;
    border-radius: $radius-md;
    transition: background $transition-slow;

    @include hover {
      background: lighten($dark-surface, 10%);
    }
  }
}
</style>
