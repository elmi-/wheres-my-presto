<script setup>
const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})
</script>
<template>
  <div class="stats-panel">
    <div class="stat-card">
      <div class="label">total Trips</div>
       {{ props.stats.totalTrips }}
    </div>
    <div class="stat-card">
      <div class="label">stations visited</div>
      <div class="value">{{ props.stats.stationCount }}</div>
    </div>
    <div class="stat-card">
      <div class="label">most used</div>
      <div class="value">{{ props.stats.topStation }}</div>
    </div>
    <div class="stat-card">
      <div class="label">most trips</div>
      <div class="value">{{ props.stats.topStationTrips }}</div>
    </div>
  </div>
</template>

<style scoped>
.stats-panel {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow:
    0 2px 6px
    rgba(0,0,0,0.15);
}
.label {
  color: #666;
  font-size: 14px;
}
.value {
  font-size: 28px;
  font-weight: bold;
  margin-top: 10px;
}
</style>