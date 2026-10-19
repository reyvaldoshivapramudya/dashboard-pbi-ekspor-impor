<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'

import { getDashboardPeriods, getDashboardSummary } from '@/app/container'

import type {
  ChartItem,
  DashboardSummary,
} from '@/features/dashboard/domain/entities/dashboard.types'

import AppIcon from '@/shared/components/AppIcon.vue'
import StatCard from '../components/StatCard.vue'
import DashboardChartCard from '../components/DashboardChartCard.vue'

const COLORS = {
  blue: '#1688c7',
  blueDark: '#11699b',
  blueLight: '#48a8dc',
  green: '#61a745',
  greenLight: '#80bd67',
  orange: '#ed922e',
  orangeLight: '#f3b562',
  text: '#475569',
  muted: '#94a3b8',
  grid: '#eaf0f6',
} as const

const selectedPeriod = ref('all')
const availablePeriods = ref<string[]>([])
const summary = ref<DashboardSummary | null>(null)

const isLoading = ref(true)
const errorMessage = ref('')

const numberFormatter = new Intl.NumberFormat('id-ID')

function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

function formatPeriod(period: string): string {
  const date = new Date(`${period}-01T12:00:00Z`)

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function formatPercentage(numerator: number, denominator: number): string {
  if (denominator === 0) return '0%'

  return `${Math.round((numerator / denominator) * 100)}%`
}

const periodOptions = computed(() => [
  {
    label: 'Semua Periode',
    value: 'all',
  },
  ...availablePeriods.value.map((period) => ({
    label: formatPeriod(period),
    value: period,
  })),
])

const selectedPeriodLabel = computed(() =>
  selectedPeriod.value === 'all' ? 'Semua periode' : formatPeriod(selectedPeriod.value),
)

const positiveSentimentShare = computed(() =>
  formatPercentage(summary.value?.positiveSentimentCount ?? 0, summary.value?.totalArticles ?? 0),
)

async function loadDashboard(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''

  try {
    summary.value = await getDashboardSummary.execute(selectedPeriod.value)
  } catch (error) {
    console.error('Gagal memuat ringkasan dashboard:', error)

    summary.value = null
    errorMessage.value = 'Ringkasan dashboard gagal dimuat. Silakan coba kembali.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    availablePeriods.value = await getDashboardPeriods.execute()
  } catch (error) {
    console.error('Gagal memuat daftar periode:', error)
  }

  await loadDashboard()
})

watch(selectedPeriod, () => {
  void loadDashboard()
})

function createBarData(
  items: ChartItem[],
  datasetLabel: string,
  backgroundColor: string | string[],
): ChartData<'bar'> {
  return {
    labels: items.map((item) => item.label),
    datasets: [
      {
        label: datasetLabel,
        data: items.map((item) => item.value),
        backgroundColor,
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 30,
      },
    ],
  }
}

const horizontalChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',

  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#17324d',
      padding: 12,
      displayColors: false,
    },
  },

  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: COLORS.grid,
      },
      border: {
        display: false,
      },
      ticks: {
        color: COLORS.muted,
        precision: 0,
      },
    },
    y: {
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      ticks: {
        color: COLORS.text,
      },
    },
  },
}

const verticalChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#17324d',
      padding: 12,
      displayColors: false,
    },
  },

  scales: {
    x: {
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      ticks: {
        color: COLORS.text,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: COLORS.grid,
      },
      border: {
        display: false,
      },
      ticks: {
        color: COLORS.muted,
        precision: 0,
      },
    },
  },
}

// 1. Lima komoditas dengan artikel terbanyak
const topCommoditiesData = computed(() =>
  createBarData(summary.value?.topCommodities ?? [], 'Jumlah artikel', COLORS.blue),
)

// 2. Jumlah artikel positif dan negatif
const sentimentData = computed(() =>
  createBarData(summary.value?.sentimentDistribution ?? [], 'Jumlah artikel', [
    COLORS.green,
    COLORS.orange,
  ]),
)

// 3. Jumlah artikel dari masing-masing media

const mediaData = computed(() => {
  const mediaColors = [
    COLORS.blue,
    COLORS.blueLight,
    COLORS.blueDark,
    COLORS.green,
    COLORS.greenLight,
    COLORS.orange,
    COLORS.orangeLight,
  ]

  const items = summary.value?.mediaDistribution ?? []

  return createBarData(
    items,
    'Jumlah artikel',
    items.map((_, index) => mediaColors[index % mediaColors.length] ?? COLORS.blue),
  )
})

// 4. Distribusi kategori fenomena
const categoryData = computed(() => {
  const items = summary.value?.categoryDistribution ?? []

  const categoryColors = items.map((item) => {
    if (item.label === 'Komoditas') return COLORS.blue
    if (item.label === 'Kebijakan') return COLORS.green

    return COLORS.orange
  })

  return createBarData(items, 'Jumlah artikel', categoryColors)
})

// 5. Komoditas spesifik dibandingkan lintas komoditas
const commodityScopeData = computed(() => {
  const items = summary.value?.commodityScopeDistribution ?? []

  const scopeColors = items.map((item) =>
    item.label === 'Komoditas spesifik' ? COLORS.blue : COLORS.orange,
  )

  return createBarData(items, 'Jumlah artikel', scopeColors)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Period filter -->
    <section
      class="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/30 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-bps-blue"
        >
          <AppIcon name="calendar" class="h-5 w-5" />
        </div>

        <div>
          <h2 class="text-sm font-semibold text-slate-900">Filter periode</h2>
          <p class="mt-1 text-xs text-slate-500">
            Pilih periode untuk memperbarui seluruh statistik.
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-2 sm:min-w-56">
        <label for="dashboard-period" class="text-xs font-medium text-slate-600">
          Periode target
        </label>

        <select
          id="dashboard-period"
          v-model="selectedPeriod"
          class="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
        >
          <option v-for="option in periodOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </section>

    <!-- Loading -->
    <section v-if="isLoading" class="rounded-2xl border border-slate-200 bg-white p-10 text-center">
      <AppIcon name="loader" class="mx-auto h-6 w-6 animate-spin text-bps-blue" />
      <p class="mt-3 text-sm font-medium text-slate-700">Memuat statistik dashboard...</p>
    </section>

    <!-- Error -->
    <section
      v-else-if="errorMessage"
      role="alert"
      class="rounded-2xl border border-orange-200 bg-orange-50 p-5"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-orange-800">
          <AppIcon name="circle-alert" class="mr-2 inline h-4 w-4 align-[-2px]" />
          {{ errorMessage }}
        </p>

        <button
          type="button"
          class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-orange-800 ring-1 ring-orange-200 hover:bg-orange-100"
          @click="loadDashboard"
        >
          Coba lagi
        </button>
      </div>
    </section>

    <template v-else-if="summary">
      <!-- Section heading -->
      <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-900">Ringkasan statistik</h2>
          <p class="mt-1 text-sm text-slate-500">
            Gambaran fenomena ekspor impor untuk
            <span class="font-semibold text-slate-700">
              {{ selectedPeriodLabel }}
            </span>
          </p>
        </div>

        <p class="text-xs text-slate-400">Sumber: dataset simulasi</p>
      </div>

      <!-- Four statistic cards -->
      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Artikel"
          :value="formatNumber(summary.totalArticles)"
          description="Jumlah artikel berita dalam periode terpilih."
          icon="file"
          accent="blue"
        />

        <StatCard
          title="Media Terpantau"
          :value="formatNumber(summary.mediaCount)"
          description="Portal berbeda yang tercatat memiliki artikel."
          icon="globe"
          accent="green"
        />

        <StatCard
          title="Komoditas Spesifik"
          :value="formatNumber(summary.identifiedCommoditiesCount)"
          description="Jumlah nama komoditas unik yang teridentifikasi."
          icon="package"
          accent="orange"
        />

        <StatCard
          title="Sentimen Positif"
          :value="formatNumber(summary.positiveSentimentCount)"
          :description="`${positiveSentimentShare} dari artikel berlabel positif.`"
          icon="thumbs-up"
          accent="green"
        />
      </section>

      <!-- First row: commodities and sentiment -->
      <section class="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <DashboardChartCard
          title="Top 5 Komoditas"
          description="Komoditas spesifik dengan jumlah artikel terbanyak pada periode terpilih."
          :chart-data="topCommoditiesData"
          :chart-options="horizontalChartOptions"
          :chart-height="280"
        />

        <DashboardChartCard
          title="Distribusi Sentimen"
          description="Perbandingan jumlah artikel dengan label sentimen positif dan negatif."
          :chart-data="sentimentData"
          :chart-options="verticalChartOptions"
        />
      </section>

      <!-- Second row: media -->
      <section>
        <DashboardChartCard
          title="Artikel per Media"
          description="Jumlah artikel dari masing-masing portal berita dalam dataset."
          :chart-data="mediaData"
          :chart-options="horizontalChartOptions"
          :chart-height="310"
        />
      </section>

      <!-- Third row: category and classification -->
      <section class="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <DashboardChartCard
          title="Distribusi Kategori Fenomena"
          description="Jumlah artikel berdasarkan kategori Komoditas, Kebijakan, dan Logistik."
          :chart-data="categoryData"
          :chart-options="verticalChartOptions"
        />

        <DashboardChartCard
          title="Cakupan Klasifikasi Komoditas"
          description="Perbandingan artikel tentang komoditas spesifik dengan tema lintas komoditas."
          :chart-data="commodityScopeData"
          :chart-options="verticalChartOptions"
        />
      </section>

      <!-- Note -->
      <div class="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
        <AppIcon name="info" class="mt-0.5 h-4 w-4 shrink-0 text-bps-blue" />

        <p class="text-xs leading-relaxed text-slate-600">
          Data dan hasil klasifikasi pada prototipe ini bersifat simulasi. Sentimen, kategori, dan
          komoditas belum dihasilkan dari proses scraping maupun analisis otomatis.
        </p>
      </div>
    </template>
  </div>
</template>
