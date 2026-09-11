<script setup>
import HeroSection from '../components/HeroSection.vue'
import OpportunityList from '../components/OpportunityList.vue'
import VolunteerForm from '../components/VolunteerForm.vue'
import { opportunities } from '../data/opportunities.js'
</script>

<template>
  <main>
    <HeroSection />
    <OpportunityList :opportunities="opportunities" />
    <VolunteerForm />
  </main>
</template>
