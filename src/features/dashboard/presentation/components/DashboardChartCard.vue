<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import AppIcon from '@/shared/components/AppIcon.vue'
import BaseBarChart from './BaseBarChart.vue'

withDefaults(
  defineProps<{
    title: string
    description: string
    icon?: string
    chartData: ChartData<'bar'>
    chartOptions: ChartOptions<'bar'>
    chartHeight?: number
  }>(),
  {
    chartHeight: 270,
    icon: 'activity',
  },
)
</script>

<template>
  <section
    class="flex min-w-0 flex-col rounded-xl border border-blue-100 bg-white p-3 shadow-sm shadow-blue-950/[0.04]"
  >
    <div class="mb-2 flex items-start gap-2">
      <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-500"
      >
        <AppIcon :name="icon" class="h-5 w-5" />
      </div>
      <div class="min-w-0">
        <h2 class="text-sm font-bold leading-4 text-slate-900">
          {{ title }}
        </h2>
        <p class="mt-0.5 text-xs leading-tight text-slate-500">
          {{ description }}
        </p>
      </div>
    </div>

    <div class="relative w-full" :style="{ height: `${chartHeight}px` }">
      <BaseBarChart :chart-data="chartData" :chart-options="chartOptions" />
    </div>
  </section>
</template>
