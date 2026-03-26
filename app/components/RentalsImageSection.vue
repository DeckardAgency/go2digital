<template>
  <section class="rentals-image">
    <div class="rentals-image__inner">
      <div class="rentals-image__placeholder"></div>
      <div class="rentals-image__overlay">
        <span class="rentals-image__text">RENTALS</span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.rentals-image {
  width: 100%;
  padding: $spacing-2xl;
  background-color: #FAFAFA;
  z-index: 30;
  @include mobile { padding: $spacing-md; }

  &__inner {
    position: relative;
    width: 100%;
    min-height: 60vh;
    border-radius: 2rem;
    overflow: hidden;
    @include mobile { border-radius: $radius-xl; }
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    min-height: 60vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 50%, #1a1a2e 100%);
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  &__text {
    font-size: clamp(4rem, 15vw, 15rem);
    font-weight: 400;
    letter-spacing: -0.04em;
    color: transparent;
    -webkit-text-stroke: 2px rgba(#FAFAFA, 0.6);
    text-transform: uppercase;
  }
}
</style>
