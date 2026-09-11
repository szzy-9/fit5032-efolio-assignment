<template>
  <nav class="navbar" aria-label="Primary navigation">
    <div class="navbar__inner">
      <a class="navbar__brand" href="#home">GreenLink Melbourne</a>

      <div class="navbar__links">
        <a href="#home">Home</a>
        <a href="#opportunities">Opportunities</a>
        <a href="#volunteer">Volunteer</a>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  width: 100%;
  padding: 1rem;
}

.navbar__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.navbar__brand {
  color: inherit;
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
}

.navbar__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  max-width: 100%;
}

.navbar__links a {
  color: inherit;
  text-decoration: none;
}

@media (min-width: 768px) {
  .navbar__inner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
