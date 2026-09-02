<script setup>
import AppNavbar from './components/AppNavbar.vue'
import HeroSection from './components/HeroSection.vue'
import OpportunityList from './components/OpportunityList.vue'
import VolunteerForm from './components/VolunteerForm.vue'
import { opportunities } from './data/opportunities.js'
</script>

<template>
  <AppNavbar />

  <main>
    <HeroSection />
    <OpportunityList :opportunities="opportunities" />
    <VolunteerForm />
  </main>
</template>
