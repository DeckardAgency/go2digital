<template>
  <div class="page page--home">
    <HeroSection />
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

<style scoped>
.page--home {
  min-height: 100vh;
}

.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 2rem;
  line-height: 1.8;
  background: #0a0a0a;
  color: #fff;
}

.content p {
  margin-bottom: 1.5rem;
}

.links {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.links a {
  padding: 0.75rem 1.5rem;
  background: #1a1a2e;
  color: #fff;
  text-decoration: none;
  border-radius: 0.5rem;
  transition: background 0.3s;
}

.links a:hover {
  background: #2a2a4e;
}
</style>
