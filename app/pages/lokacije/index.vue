<template>
  <div class="page page--lokacije">
    <section class="hero">
      <h1
        data-split-text
        data-split-type="lines"
        data-split-duration="0.6"
        data-split-stagger="0.08"
      >Locations</h1>
      <p
        data-split-text
        data-split-type="lines"
        data-split-duration="0.5"
        data-split-delay="0.2"
        data-split-stagger="0.06"
      >Find us around the world.</p>
    </section>
    <section class="content">
      <div class="locations-grid">
        <NuxtLink to="/lokacije/zagreb" class="location-card">
          <div class="location-image"></div>
          <h3>Zagreb</h3>
          <p>Headquarters</p>
        </NuxtLink>
        <NuxtLink to="/lokacije/split" class="location-card">
          <div class="location-image"></div>
          <h3>Split</h3>
          <p>Regional Office</p>
        </NuxtLink>
        <NuxtLink to="/lokacije/rijeka" class="location-card">
          <div class="location-image"></div>
          <h3>Rijeka</h3>
          <p>Development Hub</p>
        </NuxtLink>
        <NuxtLink to="/lokacije/osijek" class="location-card">
          <div class="location-image"></div>
          <h3>Osijek</h3>
          <p>Innovation Center</p>
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
  title: 'Locations - Go2Digital'
})
</script>

<style scoped>
.page--lokacije {
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
  max-width: 1000px;
  margin: 0 auto;
}

.locations-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

@media (max-width: 768px) {
  .locations-grid {
    grid-template-columns: 1fr;
  }
}

.location-card {
  display: block;
  text-decoration: none;
  color: #fff;
  background: #1a1a1a;
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.3s;
}

.location-card:hover {
  transform: scale(1.02);
}

.location-image {
  height: 200px;
  background: linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 100%);
}

.location-card h3 {
  padding: 1.5rem 1.5rem 0.5rem;
  font-size: 1.5rem;
}

.location-card p {
  padding: 0 1.5rem 1.5rem;
  opacity: 0.7;
}

.links {
  margin-top: 3rem;
  text-align: center;
}

.links a {
  padding: 0.75rem 1.5rem;
  background: #1a1a1a;
  color: #fff;
  text-decoration: none;
  border-radius: 0.5rem;
}
</style>
