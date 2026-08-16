<script setup>
import { ref, onMounted } from 'vue'

import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup
} from '@vue-leaflet/vue-leaflet'

import 'leaflet/dist/leaflet.css'

const center = [43.6532, -79.3832]
const zoom = 10

const stations = ref({})

const loading = ref(true)

onMounted(async () => {
  try {
    const response = await fetch(
      'http://localhost:3001/api/stations'
    )
    if (!response.ok) {
      throw new Error('Failed to load stations')
    }
    stations.value = await response.json()
    console.log('stations loaded:', stations.value)
  } catch (error) {
    console.error('error loading stations:', error)

  } finally {
    loading.value = false
  }
})
</script>
<template>
  <div class="map-container">
    <div v-if="loading" class="loading">
      Loading stations...
    </div>
    <LMap :zoom="zoom" :center="center">
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
        />
      <template v-for="(station, name) in stations" :key="name">
        <LMarker v-if="station" :lat-lng="[station.lat, station.lng]">
          <LPopup>
            <strong>{{ name }}</strong>
            <br>
            lat: {{ station.lat }}
            <br>
            long: {{ station.lng }}
          </LPopup>
        </LMarker>
      </template>
    </LMap>
  </div>
</template>

<style scoped>
.map-container {
  height: 600px;
  width: 100%;
  position: relative;
}
.leaflet-container {
  height: 100%;
  width: 100%;
}
</style>