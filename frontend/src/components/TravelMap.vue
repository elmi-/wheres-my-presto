<script setup>
import { ref, onMounted, watch } from 'vue'

import DateFilter from './DateFilter.vue'

import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LIcon
} from '@vue-leaflet/vue-leaflet'

import 'leaflet/dist/leaflet.css'

const center = [43.6532, -79.3832]
const zoom = 12

const stations = ref({})
const trips = ref([])
const loading = ref(true)
const stationStats = ref({})

const selectedYear = ref('all')
const selectedMonth = ref('all')

function normalizeStationName(name) {
  return name
    .toUpperCase()
    .replace(' RAIL', '')
    .replace(' STATION', '')
    .trim()
}

function calculatedStationStats() {
    const stats = {}

    for(const trip of getFilteredTrips()) {
        const location = trip.location

        if(!location) {
            continue
        }

        if(!stats[location]) {
            stats[location] = {
                trips: 0
            }
        }
        stats[location].trips++
    }

    stationStats.value = stats

    console.log("filtered station stats", stationStats.value)
}

watch(
  [selectedYear, selectedMonth], () => {
    calculatedStationStats()
  }
)

function getTripCount(stationName) {
  const normalizedName = normalizeStationName(stationName)

  for (const location in stationStats.value) {
    if (normalizeStationName(location) === normalizedName) {
      return stationStats.value[location].trips
    }
  }

  return 0
}

function getMarkerSize(stationName) {
  const tripCount = getTripCount(stationName)

  if (tripCount >= 40) {
    return 30
  }
  if (tripCount >= 20) {
    return 25
  }
  if (tripCount >= 10) {
    return 20
  }
  return 14
}

function getFilteredTrips() {
    return trips.value.filter(trip => {
        const date = new Date(trip.date)

        const year = String(date.getFullYear())

        const month = String(date.getMonth() + 1).padStart(2, '0')

        const yearMatches = selectedYear.value === 'all' || year === selectedYear.value

        const monthMatches = selectedMonth.value === 'all' || month === selectedMonth.value

        return yearMatches && monthMatches
    })
}

function getTotalTrips() {
  return getFilteredTrips().length
}

// todao: remove
function testDateFilter() {
  console.log('test year:', selectedYear.value)
  console.log('test month:', selectedMonth.value)
}

onMounted(async () => {
  try {
    const stationsResponse = await fetch(
      'http://localhost:3001/api/stations'
    )

    if (!stationsResponse.ok) {
      throw new Error('Failed to load stations')
    }

    stations.value = await stationsResponse.json()

    const tripsResponse = await fetch(
      'http://localhost:3001/api/trips'
    )

    if (!tripsResponse.ok) {
      throw new Error('Failed to load trips')
    }
    trips.value = await tripsResponse.json()

    calculatedStationStats()

    console.log('Stations loaded:', stations.value)
    console.log('Trips loaded:', trips.value)
  } catch (error) {
    console.error('Error loading data:', error)
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
    <DateFilter @year-changed="selectedYear = $event; testDateFilter()" @month-changed="selectedMonth = $event; testDateFilter()" />
    <div class="stats">
        <strong>Total Trips:</strong>
        {{ getTotalTrips() }}
    </div>
    <LMap :zoom="zoom" :center="center">
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
        />
      <template v-for="(station, name) in stations" :key="name">
        <LMarker v-if="station && getTripCount(name) > 0" :lat-lng="[station.lat, station.lng]">
            <LIcon :icon-size="[getMarkerSize(name), getMarkerSize(name)]" :icon-anchor="[getMarkerSize(name) / 2, getMarkerSize(name) / 2]">
                <div class="station-marker">
                    {{ getTripCount(name) }}
                </div>
            </LIcon>
            <LPopup>
                <strong>{{ name }}</strong>
                <br><br>
                <strong>trips: {{ getTripCount(name) }}</strong>
                <br><br>
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
.station-marker {
  width: 100%;
  height: 100%;
  border-radius: 70%;
  background: white;
  border: 3px solid #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
}

.stats {
  position: absolute;
  z-index: 1000;
  top: 10px;
  right: 10px;
  background: white;
  padding: 10px 15px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  font-size: 16px;
}
</style>