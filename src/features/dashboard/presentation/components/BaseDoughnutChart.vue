<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import {
  ArcElement,
  Chart as ChartJS,
  DoughnutController,
  Legend,
  Tooltip,
} from 'chart.js'
import type { Chart, ChartData, ChartOptions } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(DoughnutController, ArcElement, Tooltip, Legend)

const props = defineProps<{
  chartData: ChartData<'doughnut'>
  chartOptions: ChartOptions<'doughnut'>
}>()

const doughnutRef = ref<{ chart?: Chart<'doughnut'> } | null>(null)

async function animateDoughnut(): Promise<void> {
  await nextTick()

  const chart = doughnutRef.value?.chart
  if (!chart) return

  chart.reset()
  chart.update()
}

onMounted(() => {
  void animateDoughnut()
})

watch(
  () => props.chartData,
  () => {
    void animateDoughnut()
  },
  { deep: true },
)
</script>

<template>
  <Doughnut
    ref="doughnutRef"
    :key="JSON.stringify(chartData.datasets)"
    :data="chartData"
    :options="chartOptions"
  />
</template>
