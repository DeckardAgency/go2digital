<template>
  <div class="page page--lab">
    <section class="hero">
      <h1
        data-split-text
        data-split-type="lines"
        data-split-duration="0.6"
        data-split-stagger="0.08"
      >Go2Labs</h1>
      <p
        data-split-text
        data-split-type="lines"
        data-split-duration="0.5"
        data-split-delay="0.2"
        data-split-stagger="0.06"
      >Exploring the future of digital innovation.</p>
    </section>
    <section class="content">
      <p>Our laboratory is where ideas come to life. We experiment with cutting-edge technologies and push the boundaries of what's possible in the digital realm.</p>
      <div class="labs-grid">
        <NuxtLink to="/lab/experiment-1" class="lab-card">
          <h3>Experiment 1</h3>
          <p>AI-powered design systems</p>
        </NuxtLink>
        <NuxtLink to="/lab/experiment-2" class="lab-card">
          <h3>Experiment 2</h3>
          <p>Interactive 3D experiences</p>
        </NuxtLink>
        <NuxtLink to="/lab/experiment-3" class="lab-card">
          <h3>Experiment 3</h3>
          <p>Motion design toolkit</p>
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
  title: 'Go2Labs - Go2Digital'
})
</script>

<style scoped>
.page--lab {
  min-height: 100vh;
  padding: 6rem 2rem 2rem;
  background: #0d1117;
  color: #fff;
}

.hero {
  text-align: center;
  padding: 4rem 0;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #58a6ff;
}

.content {
  max-width: 900px;
  margin: 0 auto;
  line-height: 1.8;
}

.labs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.lab-card {
  padding: 2rem;
  background: #161b22;
  border-radius: 1rem;
  text-decoration: none;
  color: #fff;
  transition: transform 0.3s, background 0.3s;
}

.lab-card:hover {
  transform: translateY(-4px);
  background: #1f2937;
}

.lab-card h3 {
  color: #58a6ff;
  margin-bottom: 0.5rem;
}

.links {
  margin-top: 2rem;
}

.links a {
  padding: 0.75rem 1.5rem;
  background: #1a1a2e;
  color: #fff;
  text-decoration: none;
  border-radius: 0.5rem;
}
</style>
