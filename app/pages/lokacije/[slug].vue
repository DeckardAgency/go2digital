<template>
  <div class="page page--single-location">
    <section class="hero">
      <span class="tag">Location</span>
      <h1>{{ formattedSlug }}</h1>
    </section>
    <section class="content">
      <div class="location-details">
        <div class="map-placeholder"></div>
        <div class="info">
          <h2>Office Information</h2>
          <div class="info-item">
            <strong>Address</strong>
            <p>Ulica primjer 123, {{ formattedSlug }}, Croatia</p>
          </div>
          <div class="info-item">
            <strong>Phone</strong>
            <p>+385 1 234 5678</p>
          </div>
          <div class="info-item">
            <strong>Email</strong>
            <p>{{ slug }}@go2digital.com</p>
          </div>
          <div class="info-item">
            <strong>Working Hours</strong>
            <p>Mon - Fri: 9:00 - 17:00</p>
          </div>
        </div>
      </div>
      <div class="links">
        <NuxtLink to="/lokacije">All Locations</NuxtLink>
        <NuxtLink to="/">Back to Home</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const formattedSlug = slug.charAt(0).toUpperCase() + slug.slice(1)

useHead({
  title: `${formattedSlug} - Locations`
})
</script>

<style scoped>
.page--single-location {
  min-height: 100vh;
  padding: 6rem 2rem 2rem;
  background: #0a0a0a;
  color: #fff;
}

.hero {
  text-align: center;
  padding: 4rem 0;
}

.tag {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #fff;
  color: #0a0a0a;
  border-radius: 2rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.hero h1 {
  font-size: 3rem;
}

.content {
  max-width: 900px;
  margin: 0 auto;
}

.location-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

@media (max-width: 768px) {
  .location-details {
    grid-template-columns: 1fr;
  }
}

.map-placeholder {
  height: 300px;
  background: linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 100%);
  border-radius: 1rem;
}

.info h2 {
  margin-bottom: 1.5rem;
}

.info-item {
  margin-bottom: 1.5rem;
}

.info-item strong {
  display: block;
  opacity: 0.5;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.links {
  display: flex;
  gap: 1rem;
  margin-top: 3rem;
}

.links a {
  padding: 0.75rem 1.5rem;
  background: #1a1a1a;
  color: #fff;
  text-decoration: none;
  border-radius: 0.5rem;
}
</style>
