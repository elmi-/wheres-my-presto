<script setup>

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

console.log('StatsPanel props:', props)

</script>
<template>
  <div class="stats-panel">
    <div class="stat-card">
      <div class="stat-label">
        Total Trips
      </div>
      <div class="stat-value">
        {{ props.stats.totalTrips }}
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">
        Stations
      </div>
      <div class="stat-value">
        {{ props.stats.stationCount }}
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">
        Most Trips
      </div>
      <div class="stat-value">
        {{ props.stats.topStationTrips }}
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">
        Most Used Station
      </div>
      <div class="stat-value station-name">
        {{ props.stats.topStation }}
      </div>
    </div>
  </div>
</template>
<style scoped>
.stats-panel {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 15px;
  margin-bottom: 20px;
}
.stat-card {
  background: white;
  padding: 20px;
  box-shadow:0 2px 6px rgba(0, 0, 0, 0.15);
  flex: 1;
}
.stat-label {
  font-size: 14px;
  color: #666;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-top: 8px;

}
.station-name {
  font-size: 20px;
}
</style>