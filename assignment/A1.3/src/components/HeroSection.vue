<template>
  <section id="home" class="hero" aria-labelledby="hero-title">
    <div class="hero__inner">
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
    </div>
  </section>
</template>

<style scoped>
.hero {
  width: 100%;
  padding: 5rem 1rem;
  background-color: #eefaf7;
  background-image: url('../assets/images/greenlink-hero-bg.png');
  background-position: center right;
  background-repeat: no-repeat;
  background-size: cover;
}

.hero__inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.hero__content {
  width: 100%;
  max-width: 44rem;
  margin: 0 auto 0 0;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 1rem 2.5rem rgba(23, 61, 36, 0.1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
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

@media (min-width: 576px) {
  .hero {
    padding-inline: 1.5rem;
  }
}

@media (min-width: 992px) {
  .hero {
    padding-inline: 2rem;
  }
}

@media (max-width: 575px) {
  .hero {
    padding-block: 3.5rem;
    background-position: center center;
  }

  .hero__content {
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.8);
  }

  .hero__actions {
    flex-direction: column;
  }

  .hero__button {
    width: 100%;
  }
}
</style>
