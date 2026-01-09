<template>
  <div class="page page--single-lab">
    <section class="hero">
      <span class="tag">Lab Experiment</span>
      <h1>{{ slug }}</h1>
    </section>
    <section class="content">
      <p>This is a detailed view of the lab experiment. Here you can explore the methodology, findings, and interactive demos of our research.</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur interdum, nisl nunc egestas nunc, vitae tincidunt nisl nunc euismod nunc.</p>
      <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.</p>
      <div class="links">
        <NuxtLink to="/lab">Back to Labs</NuxtLink>
        <NuxtLink to="/">Back to Home</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

useHead({
  title: `${slug} - Go2Labs`
})
</script>

<style scoped>
.page--single-lab {
  min-height: 100vh;
  padding: 6rem 2rem 2rem;
  background: #0d1117;
  color: #fff;
}

.hero {
  text-align: center;
  padding: 4rem 0;
}

.tag {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #58a6ff;
  color: #0d1117;
  border-radius: 2rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.hero h1 {
  font-size: 3rem;
  text-transform: capitalize;
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
  background: #161b22;
  color: #fff;
  text-decoration: none;
  border-radius: 0.5rem;
}
</style>
