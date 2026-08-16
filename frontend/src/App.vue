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
    <h1>dude, where's my presto</h1>

    <!-- replace with loading image -->
    <p v-if="loading">Loading trips...</p>

    <div v-else>
      <p><strong>Total Trips:</strong> {{ trips.length }}</p>
    </div>

    <TravelMap />

  </div>
</template>