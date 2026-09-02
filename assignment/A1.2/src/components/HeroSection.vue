<template>
  <section id="home" class="hero" aria-labelledby="hero-title">
    <div class="hero__content">
      <p class="hero__eyebrow">Community Urban Greening</p>

      <h1 id="hero-title" class="hero__title">
        <span>Discover Melbourne's</span>
        <span>Urban Nature</span>
      </h1>

      <p class="hero__description">
        Find local greening and biodiversity opportunities and take practical action in your
        community.
      </p>

      <div class="hero__actions">
        <a class="hero__button hero__button--primary" href="#opportunities">
          Explore Opportunities
        </a>
        <a class="hero__button hero__button--secondary" href="#volunteer">Get Involved</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  width: 100%;
  padding: 5rem 1rem;
}

.hero__content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.hero__eyebrow {
  margin-bottom: 1rem;
  color: #2f6b3b;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero__title {
  margin-bottom: 1.5rem;
  color: #173d24;
  font-size: clamp(2.25rem, 7vw, 4.5rem);
  font-weight: 700;
  line-height: 1.05;
}

.hero__title span {
  display: block;
}

.hero__description {
  max-width: 38rem;
  margin-bottom: 2rem;
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.7;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.hero__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0.75rem 1.25rem;
  border: 2px solid #2f6b3b;
  border-radius: 0.5rem;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
}

.hero__button--primary {
  color: #ffffff;
  background: #2f6b3b;
}

.hero__button--secondary {
  color: #2f6b3b;
  background: transparent;
}

@media (max-width: 575px) {
  .hero {
    padding-block: 3.5rem;
  }

  .hero__actions {
    flex-direction: column;
  }

  .hero__button {
    width: 100%;
  }
}
</style>
