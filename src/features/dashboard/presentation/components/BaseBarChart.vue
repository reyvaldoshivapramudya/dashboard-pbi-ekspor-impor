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
import type { ChartData, ChartOptions, Plugin } from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend)

const valueLabelsPlugin: Plugin<'bar'> = {
  id: 'barValueLabels',
  afterDatasetsDraw(chart) {
    const dataset = chart.data.datasets[0]
    const metadata = chart.getDatasetMeta(0)
    if (!dataset) return

    const values = dataset.data.map((value) => Number(value))
    const horizontal = chart.options.indexAxis === 'y'
    const context = chart.ctx

    context.save()
    context.fillStyle = '#10194f'
    context.font = '600 11px Inter, Arial, sans-serif'

    metadata.data.forEach((element, index) => {
      const value = values[index]
      if (value === undefined || !Number.isFinite(value)) return

      // For horizontal bars, `x` is the bar's value endpoint; `width / 2`
      // incorrectly pushes labels into/away from the bar and can clip them.
      // For vertical bars, `y` is likewise the value endpoint, not the center.
      const bar = element as unknown as { x: number; y: number; width: number; height: number }
      context.textAlign = horizontal ? (value < 0 ? 'right' : 'left') : 'center'
      context.textBaseline = horizontal ? 'middle' : value < 0 ? 'top' : 'bottom'

      const labelX = horizontal ? bar.x + (value < 0 ? -7 : 7) : bar.x
      const labelY = horizontal ? bar.y : bar.y + (value < 0 ? 7 : -5)
      context.fillText(new Intl.NumberFormat('id-ID').format(value), labelX, labelY)
    })

    context.restore()
  },
}

defineProps<{
  chartData: ChartData<'bar'>
  chartOptions: ChartOptions<'bar'>
}>()
</script>

<template>
  <Bar
    :key="JSON.stringify(chartData.datasets)"
    :data="chartData"
    :options="chartOptions"
    :plugins="[valueLabelsPlugin]"
  />
</template>
