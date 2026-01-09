<template>
  <div class="page page--esg">
    <section class="hero">
      <h1>ESG</h1>
      <p>Environmental, Social & Governance</p>
    </section>
    <section class="content">
      <div class="esg-grid">
        <div class="esg-card">
          <h2>Environmental</h2>
          <p>We are committed to reducing our carbon footprint and promoting sustainable practices in all our operations. Our digital-first approach minimizes waste and energy consumption.</p>
        </div>
        <div class="esg-card">
          <h2>Social</h2>
          <p>We believe in creating a positive impact on our community. From diversity initiatives to educational programs, we invest in people and their growth.</p>
        </div>
        <div class="esg-card">
          <h2>Governance</h2>
          <p>Transparency and ethical conduct are at the core of our business. We maintain the highest standards of corporate governance and accountability.</p>
        </div>
      </div>
      <div class="stats">
        <div class="stat">
          <span class="number">100%</span>
          <span class="label">Renewable Energy</span>
        </div>
        <div class="stat">
          <span class="number">50+</span>
          <span class="label">Community Projects</span>
        </div>
        <div class="stat">
          <span class="number">0</span>
          <span class="label">Carbon Emissions</span>
        </div>
      </div>
      <div class="links">
        <NuxtLink to="/">Back to Home</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'ESG - Go2Digital'
})
</script>

<style scoped>
.page--esg {
  min-height: 100vh;
  padding: 6rem 2rem 2rem;
  background: linear-gradient(180deg, #0a1a2a 0%, #0a0a1a 100%);
  color: #fff;
}

.hero {
  text-align: center;
  padding: 4rem 0;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, #4ade80, #60a5fa, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.content {
  max-width: 1000px;
  margin: 0 auto;
}

.esg-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

@media (max-width: 768px) {
  .esg-grid {
    grid-template-columns: 1fr;
  }
}

.esg-card {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.esg-card h2 {
  margin-bottom: 1rem;
  color: #60a5fa;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 4rem;
  padding: 3rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat {
  text-align: center;
}

.stat .number {
  display: block;
  font-size: 3rem;
  font-weight: 700;
  color: #4ade80;
}

.stat .label {
  opacity: 0.7;
}

.links {
  margin-top: 3rem;
  text-align: center;
}

.links a {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  text-decoration: none;
  border-radius: 0.5rem;
}
</style>
