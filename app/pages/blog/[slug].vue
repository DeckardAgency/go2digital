<template>
  <div class="page page--single-blog">
    <article>
      <header class="hero">
        <span class="date">January 5, 2026</span>
        <h1>{{ formattedSlug }}</h1>
        <p class="author">By Go2Digital Team</p>
      </header>
      <section class="content">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <h2>Key Takeaways</h2>
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
        <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
        <div class="links">
          <NuxtLink to="/blog">Back to Articles</NuxtLink>
          <NuxtLink to="/">Back to Home</NuxtLink>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const formattedSlug = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

useHead({
  title: `${formattedSlug} - Blog`
})
</script>

<style scoped>
.page--single-blog {
  min-height: 100vh;
  padding: 6rem 2rem 2rem;
  background: #1a0a0a;
  color: #fff;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  max-width: 800px;
  margin: 0 auto;
}

.date {
  color: #ff6b6b;
  font-size: 0.875rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin: 1rem 0;
  line-height: 1.3;
}

.author {
  opacity: 0.7;
}

.content {
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.9;
}

.content p {
  margin-bottom: 1.5rem;
}

.content h2 {
  margin: 2rem 0 1rem;
  color: #ff6b6b;
}

.links {
  display: flex;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #3a2a2a;
}

.links a {
  padding: 0.75rem 1.5rem;
  background: #2a1a1a;
  color: #fff;
  text-decoration: none;
  border-radius: 0.5rem;
}
</style>
