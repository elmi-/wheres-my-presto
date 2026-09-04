<script setup>
import { ref, onMounted, watch } from 'vue';

import TravelMap from './components/TravelMap.vue'
import DateFilter from './components/DateFilter.vue';
import StatsPanel from './components/StatsPanel.vue';

// todo: remove when cleaning project
const trips = ref([]);
const loading = ref(true);

// todo: remove
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3001/api/trips');
    const data = await response.json();

    trips.value = data;
  } catch (error) {
    console.error('failed to load trips:', error);
  } finally {
    loading.value = false;
  }
});

const selectedYear = ref('all')
const selectedMonth = ref('all')

const dashboardStats = ref({
  totalTrips: 0,
  stationCount: 0,
  topStation: '-',
  topStationTrips: 0
})
</script>

<template>
  <div class="container">
    <!-- replace with movie logo but with presto -->
    <!-- <h1>dude, where's my presto</h1> -->
     <header class="dashboard-header">
        <div class="logo-container">
          <img src="./assets/presto-app-logo.png" alt="dude, where's my presto" />
        </div>
        <div class="dashboard-filters">
          <DateFilter @year-changed="selectedYear = $event" @month-changed="selectedMonth = $event" />
          <StatsPanel :stats="dashboardStats" />
        </div>
     </header>
     <section class="dashboard-content">
      <!-- replace with loading image -->
      <p v-if="loading">Loading trips...</p>
      <TravelMap :selected-year="selectedYear" :selected-month="selectedMonth" @update-stats="dashboardStats = $event" />
     </section>
  </div>
</template>
<style>
* {
  box-sizing: border-box;
}
html,
body,
#app {
  margin: 0;
  padding: 0 1%;
  min-height: 100%;
  background: white;
}
body {
  font-family: Arial, Helvetica, sans-serif;
}
.app {
  min-height: 100vh;
  background: white;
}
.dashboard-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.dashboard-filters {
  padding: 10px 0;
  width: 70%;
}
.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.logo-container img {
  max-height: 150px;
  width: auto;
  object-fit: contain;
}

@media (max-width: 600px) {
  .dashboard-header {
    display: block;
  }
  .logo-container img  {
    max-width: 250px;
    text-align: center;
  }
}
</style>