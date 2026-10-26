<script setup lang="ts">
import BaseDoughnutChart from './BaseDoughnutChart.vue'
import type { ChartData, ChartOptions } from 'chart.js'

interface LegendItem {
  label: string
  value: number
  percentage: string
  color: string
}

defineProps<{
  title: string
  description: string
  chartData: ChartData<'doughnut'>
  chartOptions: ChartOptions<'doughnut'>
  total: string | number
  legendItems: LegendItem[]
}>()
</script>

<template>
  <section
    class="dashboard-doughnut-card min-w-0 rounded-xl border border-slate-200 bg-white p-4"
  >
    <div class="mb-2 flex items-start gap-2">
      <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-bps-blue"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M12 3a9 9 0 1 0 9 9h-9V3Z" stroke-linecap="round" stroke-linejoin="round" />
          <path
            d="M15 3.5A9 9 0 0 1 20.5 9H15V3.5Z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="min-w-0">
        <h2 class="text-sm font-semibold leading-4 text-slate-900">{{ title }}</h2>
        <p class="mt-0.5 text-xs leading-tight text-slate-500">{{ description }}</p>
      </div>
    </div>

    <div
      class="grid min-h-[140px] grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(120px,0.9fr)_minmax(0,1fr)]"
    >
      <div class="relative mx-auto h-[138px] w-full max-w-[170px]">
        <BaseDoughnutChart :chart-data="chartData" :chart-options="chartOptions" />
        <div
          class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
        >
          <span class="text-2xl font-extrabold leading-none tracking-tight text-slate-900">{{
            total
          }}</span>
          <span class="mt-1 text-xs font-semibold text-slate-600">Artikel</span>
        </div>
      </div>

      <div class="space-y-2 px-1 sm:px-0">
        <div v-for="item in legendItems" :key="item.label" class="flex items-start gap-3">
          <span
            class="mt-1 h-3 w-3 shrink-0 rounded-[3px]"
            :style="{ backgroundColor: item.color }"
          />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span class="text-xs font-semibold text-slate-800">{{ item.label }}</span>
              <span class="text-xs font-bold tabular-nums text-slate-500">{{
                item.percentage
              }}</span>
            </div>
            <p class="mt-0.5 text-xs text-slate-500">{{ item.value }} artikel</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard-doughnut-card {
  animation: dashboard-card-enter 560ms ease-out 100ms both;
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
  .dashboard-doughnut-card {
    animation: none;
  }
}
</style>
