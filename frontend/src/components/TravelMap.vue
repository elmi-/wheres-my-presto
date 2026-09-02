<script setup>
import { ref, onMounted, watch } from 'vue'

import DateFilter from './DateFilter.vue'
import StatsPanel from './StatsPanel.vue'

import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LIcon
} from '@vue-leaflet/vue-leaflet'

import 'leaflet/dist/leaflet.css'

const emit = defineEmits([
  'update-stats'
])

const center = [43.6532, -79.3832]
const zoom = 12

const stations = ref({})
const trips = ref([])
const loading = ref(true)
const stationStats = ref({})

const props = defineProps({
  selectedYear: {
    type: String,
    required: true
  },

  selectedMonth: {
    type: String,
    required: true
  }
})

function normalizeStationName(name) {
  return name
    // .toUpperCase()
    // .replace(' RAIL', '')
    // .replace(' STATION', '')
    // .trim()
}

function calculatedStationStats() {
  const stats = {}

  for (const trip of getFilteredTrips()) {
    const location = trip.location
    const agency = trip.transitAgency

    if (!location) {
      continue
    }

    if (!stats[location]) {
      stats[location] = {
        trips: 0,
        agencies: {}
      }
    }

    // total trips
    stats[location].trips++

    // trips/agency
    if (agency) {
      if (!stats[location].agencies[agency]) {
        stats[location].agencies[agency] = 0
      }

      stats[location].agencies[agency]++
    }
  }

  stationStats.value = stats

  // todo: remove
  console.log(
    'filtered station stats:',
    stationStats.value
  )
}
watch(() => [props.selectedYear, props.selectedMonth], () => {
    calculatedStationStats()
    getDashboardStats()
  }
)

function getTripCount(stationName) {
  const normalizedName = normalizeStationName(stationName)

  for (const location in stationStats.value) {
    if(normalizeStationName(location) === normalizedName){
      return stationStats.value[location].trips
    }
  }

  return 0
}

function getMarkerSize(tripCount) {
  if (tripCount >= 40) {
    return 35
  }

  if (tripCount >= 20) {
    return 30
  }

  if (tripCount >= 10) {
    return 25
  }

  return 20
}

function getAgencyColor(agency) {
  if (!agency) {
    return '#777'
  }

  const name = agency.toLowerCase()

  if (name.includes('go')) {
    return '#27ae60'
  }

  if (name.includes('transit')) {
    return '#e74c3c'
  }

  if (name.includes('pearson')) {
    return '#3498db'
  }

  return '#000'
}

function getStationAgencies(stationName) {
  const normalizedName = normalizeStationName(stationName)

  for (const location in stationStats.value) {
    if (normalizeStationName(location) === normalizedName) {
      return stationStats.value[location].agencies
    }
  }

  return {}
}

function getFilteredTrips() {
    return trips.value.filter(trip => {
        const date = new Date(trip.date)

        const year = String(date.getFullYear())

        const month = String(date.getMonth() + 1).padStart(2, '0')

        const yearMatches = props.selectedYear === 'all' || year === props.selectedYear

        const monthMatches = props.selectedMonth === 'all' || month === props.selectedMonth

        return yearMatches && monthMatches
    })
}

function getDashboardStats() {
  const filteredTrips = getFilteredTrips()
  const totalTrips = filteredTrips.length
  const stationCount = Object.keys(stationStats.value).length

  let topStation = '-'
  let topStationTrips = 0

  for (const station in stationStats.value) {
    const trips = stationStats.value[station].trips
    if (trips > topStationTrips) {
      topStationTrips = trips
      topStation = station
    }
  }

  const stats = {
    totalTrips,
    stationCount,
    topStation,
    topStationTrips
  }

  emit('update-stats', stats)

  return stats
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
    getDashboardStats()

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
    <!-- todo: remove later -->
    <!-- <DateFilter @year-changed="selectedYear = $event;" @month-changed="selectedMonth = $event;" /> -->
    <!-- <div class="stats">
        <strong>Total Trips:</strong>
        {{ getTotalTrips() }}
    </div> -->
    <!-- <StatsPanel :stats="getDashboardStats()" /> -->
    <LMap :zoom="zoom" :center="center">
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base" name="OpenStreetMap"/>
        <template v-for="(station, name) in stations" :key="name">
          <template v-for="(agencyTrips, agency) in getStationAgencies(name)" :key="name + '-' + agency">
            <LMarker v-if="station && agencyTrips > 0" :lat-lng="[station.lat, station.lng]">
              <LIcon :icon-size="[getMarkerSize(agencyTrips), getMarkerSize(agencyTrips)]" :icon-anchor="[getMarkerSize(agencyTrips) / 2, getMarkerSize(agencyTrips)]">
                <div class="station-marker" :style="{backgroundColor: getAgencyColor(agency)}">
                  <span>{{ agencyTrips }}</span>
                </div>
              </LIcon>
              <LPopup>
                <strong>{{ name }}</strong>
                <strong>{{ agency }}</strong>
                Trips:{{ agencyTrips }}
              </LPopup>
            </LMarker>
          </template>
        </template>
    </LMap>
  </div>
  <div class="map-legend">

  </div>
</template>

<style scoped>
.leaflet-div-icon {
  background: none !important;
  border: none !important;
}
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
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}
.station-marker span {
  transform: rotate(45deg);
  color: white;
  font-size: 11px;
  font-weight: bold;
}
</style>