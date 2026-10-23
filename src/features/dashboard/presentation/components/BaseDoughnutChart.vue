<script setup lang="ts">
import {
  ArcElement,
  Chart as ChartJS,
  DoughnutController,
  Legend,
  Tooltip,
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(DoughnutController, ArcElement, Tooltip, Legend)

defineProps<{
  chartData: ChartData<'doughnut'>
  chartOptions: ChartOptions<'doughnut'>
}>()
</script>

<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>
