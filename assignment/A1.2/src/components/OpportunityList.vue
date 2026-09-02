<script setup>
import { computed, ref } from 'vue'

import OpportunityCard from './OpportunityCard.vue'

const props = defineProps({
  opportunities: {
    type: Array,
    required: true,
  },
})

const searchQuery = ref('')
const selectedCategory = ref('')

const categoryOptions = computed(() => [
  ...new Set(props.opportunities.map((opportunity) => opportunity.category)),
])

const filteredOpportunities = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return props.opportunities.filter((opportunity) => {
    const searchableFields = [opportunity.title, opportunity.location, opportunity.category]

    const matchesSearch =
      !query || searchableFields.some((field) => field.toLowerCase().includes(query))
    const matchesCategory =
      !selectedCategory.value || opportunity.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})
</script>

<template>
  <section id="opportunities" class="opportunities" aria-labelledby="opportunities-title">
    <div class="opportunities__inner">
      <h2 id="opportunities-title" class="opportunities__title">Featured Opportunities</h2>

      <div class="opportunities__filters">
        <div class="opportunities__field">
          <label for="opportunity-search">Search opportunities</label>
          <input
            id="opportunity-search"
            v-model="searchQuery"
            type="search"
            placeholder="Search opportunities..."
          />
        </div>

        <div class="opportunities__field">
          <label for="opportunity-category">Category</label>
          <select id="opportunity-category" v-model="selectedCategory">
            <option value="">All Categories</option>
            <option v-for="category in categoryOptions" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>

      <p class="opportunities__count" role="status" aria-live="polite">
        {{ filteredOpportunities.length }}
        {{ filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities' }} found
      </p>

      <div class="opportunities__grid">
        <OpportunityCard
          v-for="opportunity in filteredOpportunities"
          :key="opportunity.id"
          :opportunity="opportunity"
        />

        <div v-if="filteredOpportunities.length === 0" class="opportunities__empty">
          <p class="opportunities__empty-title">No opportunities found.</p>
          <p>Try another keyword or category.</p>
        </div>
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

.opportunities__filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.opportunities__field label {
  display: block;
  margin-bottom: 0.5rem;
  color: #173d24;
  font-weight: 600;
}

.opportunities__field input,
.opportunities__field select {
  display: block;
  width: 100%;
  min-height: 3rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid #879b8c;
  border-radius: 0.5rem;
  background: #ffffff;
  font: inherit;
}

.opportunities__count {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #cbd8ce;
  color: #4d5d52;
  font-weight: 600;
}

.opportunities__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
}

.opportunities__empty {
  grid-column: 1 / -1;
  padding: 1.5rem;
  border-radius: 0.5rem;
  background: #ffffff;
  text-align: center;
}

.opportunities__empty-title {
  margin-bottom: 0.25rem;
  color: #173d24;
  font-weight: 700;
}

@media (min-width: 576px) {
  .opportunities {
    padding-inline: 1.5rem;
  }
}

@media (min-width: 768px) {
  .opportunities__filters {
    grid-template-columns: minmax(0, 2fr) minmax(12rem, 1fr);
  }

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
