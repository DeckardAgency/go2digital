<template>
  <div class="page page--blog">
    <section class="hero">
      <h1>Articles</h1>
      <p>Insights, tutorials, and stories from our team.</p>
    </section>
    <section class="content">
      <div class="blog-grid">
        <NuxtLink to="/blog/getting-started-with-nuxt" class="blog-card">
          <span class="date">Jan 5, 2026</span>
          <h3>Getting Started with Nuxt 4</h3>
          <p>A comprehensive guide to building modern web applications.</p>
        </NuxtLink>
        <NuxtLink to="/blog/design-systems" class="blog-card">
          <span class="date">Dec 28, 2025</span>
          <h3>Building Design Systems</h3>
          <p>How to create scalable and maintainable design systems.</p>
        </NuxtLink>
        <NuxtLink to="/blog/animation-techniques" class="blog-card">
          <span class="date">Dec 15, 2025</span>
          <h3>Advanced Animation Techniques</h3>
          <p>Master GSAP and create stunning web animations.</p>
        </NuxtLink>
      </div>
      <div class="links">
        <NuxtLink to="/">Back to Home</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Blog - Go2Digital'
})
</script>

<style scoped>
.page--blog {
  min-height: 100vh;
  padding: 6rem 2rem 2rem;
  background: #1a0a0a;
  color: #fff;
}

.hero {
  text-align: center;
  padding: 4rem 0;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ff6b6b;
}

.content {
  max-width: 900px;
  margin: 0 auto;
}

.blog-grid {
  display: grid;
  gap: 1.5rem;
}

.blog-card {
  padding: 2rem;
  background: #2a1a1a;
  border-radius: 1rem;
  text-decoration: none;
  color: #fff;
  transition: transform 0.3s;
}

.blog-card:hover {
  transform: translateX(8px);
}

.blog-card .date {
  font-size: 0.875rem;
  color: #ff6b6b;
}

.blog-card h3 {
  margin: 0.5rem 0;
  font-size: 1.5rem;
}

.blog-card p {
  opacity: 0.7;
}

.links {
  margin-top: 2rem;
}

.links a {
  padding: 0.75rem 1.5rem;
  background: #2a1a1a;
  color: #fff;
  text-decoration: none;
  border-radius: 0.5rem;
}
</style>
