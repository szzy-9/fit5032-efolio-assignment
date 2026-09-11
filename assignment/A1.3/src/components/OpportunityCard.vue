<script setup>
defineProps({
  opportunity: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <article
    class="opportunity-card"
    :aria-labelledby="`opportunity-${opportunity.id}-title`"
  >
    <p class="opportunity-card__category">{{ opportunity.category }}</p>
    <h3 :id="`opportunity-${opportunity.id}-title`" class="opportunity-card__title">
      {{ opportunity.title }}
    </h3>
    <p class="opportunity-card__organisation">{{ opportunity.organisation }}</p>

    <div class="opportunity-card__details">
      <p><span>Location:</span> {{ opportunity.location }}</p>
      <p><span>Commitment:</span> {{ opportunity.commitment }}</p>
    </div>

    <p class="opportunity-card__description">{{ opportunity.description }}</p>
    <button class="opportunity-card__button" type="button">I'm Interested</button>
  </article>
</template>

<style scoped>
.opportunity-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  max-width: 28rem;
  padding: 1.5rem;
  border: 1px solid #cbd8ce;
  border-radius: 0.75rem;
  background: #ffffff;
  overflow-wrap: anywhere;
}

.opportunity-card__category {
  margin-bottom: 0.75rem;
  color: #2f6b3b;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.opportunity-card__title {
  margin-bottom: 0.25rem;
  color: #173d24;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.25;
}

.opportunity-card__organisation {
  margin-bottom: 1rem;
  color: #4d5d52;
  font-weight: 600;
}

.opportunity-card__details {
  display: grid;
  gap: 0.375rem;
  margin-bottom: 1rem;
  color: #4d5d52;
}

.opportunity-card__details span {
  color: #173d24;
  font-weight: 600;
}

.opportunity-card__description {
  flex-grow: 1;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.opportunity-card__button {
  align-self: flex-start;
  min-height: 2.75rem;
  padding: 0.625rem 1rem;
  border: 2px solid #2f6b3b;
  border-radius: 0.5rem;
  color: #ffffff;
  background: #2f6b3b;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 575px) {
  .opportunity-card__button {
    align-self: stretch;
  }
}
</style>
