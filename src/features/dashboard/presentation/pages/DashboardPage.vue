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
const isPeriodPickerOpen = ref(false)
const calendarYear = ref(new Date().getFullYear())

const months = [
  { label: 'Jan', value: '01' },
  { label: 'Feb', value: '02' },
  { label: 'Mar', value: '03' },
  { label: 'Apr', value: '04' },
  { label: 'Mei', value: '05' },
  { label: 'Jun', value: '06' },
  { label: 'Jul', value: '07' },
  { label: 'Agu', value: '08' },
  { label: 'Sep', value: '09' },
  { label: 'Okt', value: '10' },
  { label: 'Nov', value: '11' },
  { label: 'Des', value: '12' },
] as const
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

const selectedPeriodInputLabel = computed(() =>
  selectedPeriod.value === 'all' ? 'Semua Periode' : formatPeriod(selectedPeriod.value),
)

function changeCalendarYear(amount: number): void {
  calendarYear.value += amount
}

function selectMonth(month: string): void {
  selectedPeriod.value = `${calendarYear.value}-${month}`
  isPeriodPickerOpen.value = false
}

function selectAllPeriods(): void {
  selectedPeriod.value = 'all'
  isPeriodPickerOpen.value = false
}

function isSelectedMonth(month: string): boolean {
  return selectedPeriod.value === `${calendarYear.value}-${month}`
}

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
      class="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/30 sm:flex-row sm:items-start sm:justify-between sm:p-5"
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

      <div class="relative w-full sm:w-[340px]">
        <label for="dashboard-period" class="mb-2 block text-xs font-medium text-slate-600">
          Periode target
        </label>

        <button
          id="dashboard-period"
          type="button"
          :aria-expanded="isPeriodPickerOpen"
          aria-haspopup="dialog"
          class="flex h-[58px] w-full items-center justify-between rounded-2xl border bg-white px-4 text-left text-base text-slate-700 outline-none transition"
          :class="isPeriodPickerOpen
            ? 'border-sky-500 ring-2 ring-sky-100'
            : 'border-slate-200 hover:border-slate-300'"
          @click="isPeriodPickerOpen = !isPeriodPickerOpen"
        >
          <span>{{ selectedPeriodInputLabel }}</span>
          <AppIcon name="calendar" class="h-5 w-5 shrink-0 text-slate-500" />
        </button>

        <div
          v-if="isPeriodPickerOpen"
          role="dialog"
          aria-label="Pilih periode"
          class="absolute right-0 top-full z-30 mt-2 w-full min-w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:w-[420px]"
        >
          <div class="mb-5 flex items-center justify-between px-1">
            <button
              type="button"
              aria-label="Tahun sebelumnya"
              class="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
              @click="changeCalendarYear(-1)"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <span class="text-base font-semibold text-slate-700">{{ calendarYear }}</span>

            <button
              type="button"
              aria-label="Tahun berikutnya"
              class="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
              @click="changeCalendarYear(1)"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-4 gap-x-2 gap-y-3">
            <button
              v-for="month in months"
              :key="month.value"
              type="button"
              class="flex h-12 items-center justify-center rounded-lg text-base transition"
              :class="isSelectedMonth(month.value)
                ? 'bg-sky-100 font-semibold text-sky-700'
                : 'text-slate-600 hover:bg-slate-100'"
              @click="selectMonth(month.value)"
            >
              {{ month.label }}
            </button>
          </div>

          <div class="mt-4 border-t border-slate-100 pt-4">
            <button
              type="button"
              class="h-[54px] w-full rounded-xl bg-blue-50 text-base font-medium text-sky-600 transition hover:bg-blue-100"
              @click="selectAllPeriods"
            >
              Semua Periode
            </button>
          </div>
        </div>
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
