<template>
  <div class="page page--kontakt">
    <section class="hero">
      <h1
        data-split-text
        data-split-type="lines"
        data-split-duration="0.6"
        data-split-stagger="0.08"
      >Contact Us</h1>
      <p
        data-split-text
        data-split-type="lines"
        data-split-duration="0.5"
        data-split-delay="0.2"
        data-split-stagger="0.06"
      >Let's start a conversation.</p>
    </section>
    <section class="content">
      <div class="contact-grid">
        <div class="contact-info">
          <h2>Get in Touch</h2>
          <p>We'd love to hear from you. Whether you have a question about our services, pricing, or anything else, our team is ready to answer all your questions.</p>
          <div class="info-item">
            <strong>Email</strong>
            <p>hello@go2digital.com</p>
          </div>
          <div class="info-item">
            <strong>Phone</strong>
            <p>+385 1 234 5678</p>
          </div>
          <div class="info-item">
            <strong>Address</strong>
            <p>Zagreb, Croatia</p>
          </div>
        </div>
        <div class="contact-form">
          <form @submit.prevent>
            <input type="text" placeholder="Your Name" />
            <input type="email" placeholder="Your Email" />
            <textarea placeholder="Your Message" rows="5"></textarea>
            <button type="submit">Send Message</button>
          </form>
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
  title: 'Contact - Go2Digital'
})
</script>

<style scoped>
.page--kontakt {
  min-height: 100vh;
  padding: 6rem 2rem 2rem;
  background: #0a1a0a;
  color: #fff;
}

.hero {
  text-align: center;
  padding: 4rem 0;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #4ade80;
}

.content {
  max-width: 1000px;
  margin: 0 auto;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

@media (max-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}

.contact-info h2 {
  color: #4ade80;
  margin-bottom: 1rem;
}

.info-item {
  margin: 1.5rem 0;
}

.info-item strong {
  display: block;
  color: #4ade80;
  margin-bottom: 0.25rem;
}

.contact-form form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-form input,
.contact-form textarea {
  padding: 1rem;
  background: #1a2a1a;
  border: 1px solid #2a3a2a;
  border-radius: 0.5rem;
  color: #fff;
  font-size: 1rem;
}

.contact-form button {
  padding: 1rem 2rem;
  background: #4ade80;
  color: #0a1a0a;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.contact-form button:hover {
  background: #22c55e;
}

.links {
  margin-top: 3rem;
}

.links a {
  padding: 0.75rem 1.5rem;
  background: #1a2a1a;
  color: #fff;
  text-decoration: none;
  border-radius: 0.5rem;
}
</style>
