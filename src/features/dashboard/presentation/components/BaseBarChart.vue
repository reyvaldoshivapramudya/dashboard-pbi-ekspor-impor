<script setup lang="ts">
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'

import type { ChartData, ChartOptions } from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend)

defineProps<{
  chartData: ChartData<'bar'>
  chartOptions: ChartOptions<'bar'>
}>()
</script>

<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>
