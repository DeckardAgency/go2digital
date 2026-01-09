<template>
  <div class="page page--home">
    <section class="hero">
      <h1>Welcome to Go2Digital</h1>
      <p>We create digital experiences that matter.</p>
    </section>
    <section class="content">
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
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
  padding: 6rem 2rem 2rem;
  background: #0a0a0a;
  color: #fff;
}

.hero {
  text-align: center;
  padding: 4rem 0;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.content {
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.8;
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
