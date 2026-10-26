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
    class="dashboard-chart-card flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4"
  >
    <div class="mb-2 flex items-start gap-2">
      <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-bps-blue"
      >
        <AppIcon :name="icon" class="h-5 w-5" />
      </div>
      <div class="min-w-0">
        <h2 class="text-sm font-semibold leading-4 text-slate-900">
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

<style scoped>
.dashboard-chart-card {
  animation: dashboard-card-enter 560ms ease-out both;
}

@keyframes dashboard-card-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dashboard-chart-card {
    animation: none;
  }
}
</style>
