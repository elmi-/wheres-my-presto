<template>
  <l-map :zoom="11" :center="[43.65, -79.38]" style="height: 600px">
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <l-marker
      v-for="(trip, index) in trips"
      :key="index"
      :lat-lng="trip.coords"
    >
      <l-popup>
        {{ trip.Location }}<br />
        {{ trip.Date }}<br />
        {{ trip.TransitAgency }}
      </l-popup>
    </l-marker>
  </l-map>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup
} from '@vue-leaflet/vue-leaflet'

const trips = ref([])

onMounted(async () => {
  const res = await fetch('http://localhost:3001/api/trips')
  const data = await res.json()
})
</script>