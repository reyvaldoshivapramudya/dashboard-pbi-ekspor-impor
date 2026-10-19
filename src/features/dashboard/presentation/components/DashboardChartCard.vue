<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import BaseBarChart from './BaseBarChart.vue'

withDefaults(
  defineProps<{
    title: string
    description: string
    chartData: ChartData<'bar'>
    chartOptions: ChartOptions<'bar'>
    chartHeight?: number
  }>(),
  {
    chartHeight: 270,
  },
)
</script>

<template>
  <section
    class="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-6"
  >
    <div class="mb-5">
      <h2 class="text-base font-semibold text-slate-900">
        {{ title }}
      </h2>

      <p class="mt-1.5 text-xs leading-relaxed text-slate-500">
        {{ description }}
      </p>
    </div>

    <div class="relative w-full" :style="{ height: `${chartHeight}px` }">
      <BaseBarChart :chart-data="chartData" :chart-options="chartOptions" />
    </div>
  </section>
</template>
