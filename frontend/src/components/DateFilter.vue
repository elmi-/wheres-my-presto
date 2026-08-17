<script setup>
import { ref, watch } from 'vue'

const selectedYear = ref('all')
const selectedMonth = ref('all')

const emit = defineEmits([
  'year-changed',
  'month-changed'
])

watch(selectedYear, (value) => {
  emit('year-changed', value)
})

watch(selectedMonth, (value) => {
  emit('month-changed', value)
})
</script>

<template>
  <div class="date-filter">
    <div class="filter-group">
      <label for="year">
        Year
      </label>
      <select id="year" v-model="selectedYear">
        <option value="all">
          all
        </option>
        <option value="2026">
          2026
        </option>
        <option value="2025">
          2025
        </option>
        <option value="2024">
          2024
        </option>
      </select>
    </div>

    <div class="filter-group">
      <label for="month">
        month
      </label>
      <select id="month" v-model="selectedMonth">
        <option value="all">
            all
        </option>
        <option value="01">January</option>
        <option value="02">February</option>
        <option value="03">March</option>
        <option value="04">April</option>
        <option value="05">May</option>
        <option value="06">June</option>
        <option value="07">July</option>
        <option value="08">August</option>
        <option value="09">September</option>
        <option value="10">October</option>
        <option value="11">November</option>
        <option value="12">December</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.date-filter {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

label {
  font-weight: bold;
}

select {
  padding: 8px;
  min-width: 150px;
}
</style>