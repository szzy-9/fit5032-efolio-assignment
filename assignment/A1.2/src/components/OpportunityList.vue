<script setup>
import OpportunityCard from './OpportunityCard.vue'
</script>

<template>
  <section id="opportunities" class="opportunities" aria-labelledby="opportunities-title">
    <div class="opportunities__inner">
      <h2 id="opportunities-title" class="opportunities__title">Featured Opportunities</h2>

      <div class="opportunities__grid">
        <OpportunityCard
          category="Tree Planting"
          title="Riverside Planting Day"
          location="Footscray"
          description="Join a community planting activity supporting local biodiversity."
        />

        <OpportunityCard
          category="Biodiversity"
          title="Native Habitat Restoration"
          location="Brunswick"
          description="Help restore native habitat and create safer spaces for local wildlife."
        />

        <OpportunityCard
          category="Urban Greening"
          title="Community Garden Workshop"
          location="Clayton"
          description="Learn practical skills for growing food and greening shared urban spaces."
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.opportunities {
  width: 100%;
  padding: 4rem 1rem;
  background: #f3f7f3;
}

.opportunities__inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.opportunities__title {
  margin-bottom: 2rem;
  color: #173d24;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
}

.opportunities__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
}

@media (min-width: 576px) {
  .opportunities {
    padding-inline: 1.5rem;
  }
}

@media (min-width: 768px) {
  .opportunities__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 992px) {
  .opportunities {
    padding-inline: 2rem;
  }

  .opportunities__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
