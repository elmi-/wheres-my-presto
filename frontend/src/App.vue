<script setup>
import TravelMap from './components/TravelMap.vue'
import { ref, onMounted } from 'vue';

const trips = ref([]);
const loading = ref(true);

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
</script>

<template>
  <div class="container">
    <!-- replace with movie logo but with presto -->
    <!-- <h1>dude, where's my presto</h1> -->
     <header class="dashboard-header">
      <!-- move filters from travelmap -->
      <!-- <div class="dashboard-filters"></div> -->
       <div class="logo-container">
        <img src="./assets/presto-app-logo.png" alt="dude, where's my presto" />
       </div>
     </header>
     <section class="dashboard-content">
      <!-- replace with loading image -->
      <p v-if="loading">Loading trips...</p>
      <TravelMap />
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
    justify-content: center;
  }
  .logo-container img  {
    max-width: 250px;
    text-align: center;
  }
}
</style>