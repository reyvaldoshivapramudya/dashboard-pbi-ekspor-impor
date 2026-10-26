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
import DashboardDoughnutCard from '../components/DashboardDoughnutCard.vue'

const COLORS = {
  blue: '#1688c7',
  blueDark: '#11699b',
  blueLight: '#48a8dc',
  green: '#48b817',
  greenLight: '#70c947',
  orange: '#ff9800',
  orangeLight: '#ffb547',
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
    const latestAvailablePeriod = availablePeriods.value[0]

    // Buka dashboard pada periode terbaru yang benar-benar memiliki data.
    if (latestAvailablePeriod) {
      calendarYear.value = Number(latestAvailablePeriod.slice(0, 4))
      selectedPeriod.value = latestAvailablePeriod
      return
    }
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
  // Keep count labels visible even when a bar is close to the right edge.
  layout: { padding: { right: 24 } },

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
      grace: '18%',
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
  // Reserve a little room above the bars for their numeric labels.
  layout: { padding: { top: 14 } },

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
      grace: '18%',
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

// 2. Komposisi sentimen positif dan negatif ditampilkan sebagai diagram donat.
const sentimentData = computed<ChartData<'doughnut'>>(() => {
  const items = summary.value?.sentimentDistribution ?? []

  return {
    labels: items.map((item) => item.label),
    datasets: [
      {
        data: items.map((item) => item.value),
        backgroundColor: [COLORS.green, COLORS.orange],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 5,
      },
    ],
  }
})

const sentimentChartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      backgroundColor: '#17324d',
      padding: 12,
      displayColors: true,
    },
  },
}

const sentimentLegendItems = computed(() =>
  (summary.value?.sentimentDistribution ?? []).map((item) => ({
    ...item,
    percentage: formatPercentage(item.value, summary.value?.totalArticles ?? 0),
    color: item.label.toLowerCase() === 'positif' ? COLORS.green : COLORS.orange,
  })),
)

const periodHighlights = computed(() => {
  const current = summary.value
  if (!current) return []

  const leadingCommodity = current.topCommodities[0]
  const leadingCategory = [...current.categoryDistribution]
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)[0]
  const positiveLeads = current.positiveSentimentCount >= current.negativeSentimentCount
  const leadingSentimentCount = positiveLeads
    ? current.positiveSentimentCount
    : current.negativeSentimentCount

  return [
    {
      icon: 'activity',
      tone: 'blue',
      text: leadingCommodity
        ? `Komoditas paling banyak diberitakan adalah ${leadingCommodity.label}, sebanyak ${formatNumber(leadingCommodity.value)} artikel (${formatPercentage(leadingCommodity.value, current.totalArticles)}).`
        : 'Belum ada komoditas spesifik yang tercatat pada periode ini.',
    },
    {
      icon: positiveLeads ? 'thumbs-up' : 'circle-alert',
      tone: positiveLeads ? 'green' : 'orange',
      text: `Sentimen berita didominasi ${positiveLeads ? 'positif' : 'negatif'} (${formatPercentage(leadingSentimentCount, current.totalArticles)}), dari ${formatNumber(current.totalArticles)} artikel pada periode terpilih.`,
    },
    {
      icon: 'file',
      tone: 'blue',
      text: leadingCategory
        ? `Kategori fenomena terbanyak adalah ${leadingCategory.label} (${formatPercentage(leadingCategory.value, current.totalArticles)}), dengan ${formatNumber(leadingCategory.value)} artikel. ` +
          `Kategori lain: ${current.categoryDistribution
            .filter((item) => item.label !== leadingCategory.label)
            .map((item) => `${item.label} ${formatPercentage(item.value, current.totalArticles)}`)
            .join(', ')}.`
        : 'Kategori fenomena belum memiliki data pada periode terpilih.',
    },
  ]
})

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
  <div class="dashboard-page flex flex-col gap-2">
    <!-- Filter periode ringkas seperti referensi dashboard -->
    <section
  class="flex min-h-[90px] flex-col gap-2 rounded-xl border border-blue-100 bg-white/90 p-2 shadow-sm shadow-blue-950/[0.03] xl:flex-row xl:items-center xl:gap-3 sm:px-3 sm:py-2"
>
      <div class="flex min-w-0 items-center gap-3 xl:min-w-[280px] xl:flex-1">
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-500"
        >
          <AppIcon name="calendar" class="h-5 w-5" />
        </div>
        <div class="min-w-0">
          <h2 class="text-sm font-bold text-slate-900">Periode Analisis</h2>
          <p class="mt-0.5 text-xs text-slate-500">Pilih periode untuk memperbarui statistik.</p>
        </div>
      </div>

      <div class="relative w-full xl:w-[225px] xl:shrink-0">
        <button
          id="dashboard-period"
          type="button"
          :aria-expanded="isPeriodPickerOpen"
          aria-haspopup="dialog"
          class="flex h-9 w-full items-center justify-between rounded-lg border bg-white px-3 text-left text-sm font-medium text-slate-800 outline-none transition"
          :class="
            isPeriodPickerOpen
              ? 'border-sky-500 ring-2 ring-sky-100'
              : 'border-slate-200 hover:border-slate-300'
          "
          @click="isPeriodPickerOpen = !isPeriodPickerOpen"
        >
          <span class="flex min-w-0 items-center gap-2 truncate">
            <AppIcon name="calendar" class="h-5 w-5 shrink-0 text-slate-700" />
            <span class="truncate">{{ selectedPeriodInputLabel }}</span>
          </span>
          <AppIcon name="chevron-right" class="h-4 w-4 shrink-0 rotate-90 text-slate-600" />
        </button>

        <div
          v-if="isPeriodPickerOpen"
          role="dialog"
          aria-label="Pilih periode"
          class="absolute right-0 top-full z-30 mt-2 w-full min-w-[300px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:w-[360px]"
        >
          <div class="mb-4 flex items-center justify-between px-1">
            <button
              type="button"
              aria-label="Tahun sebelumnya"
              class="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
              @click="changeCalendarYear(-1)"
            >
              <AppIcon name="chevron-left" class="h-5 w-5" />
            </button>
            <span class="text-base font-bold text-slate-800">{{ calendarYear }}</span>
            <button
              type="button"
              aria-label="Tahun berikutnya"
              class="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
              @click="changeCalendarYear(1)"
            >
              <AppIcon name="chevron-right" class="h-5 w-5" />
            </button>
          </div>

          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="month in months"
              :key="month.value"
              type="button"
              class="flex h-10 items-center justify-center rounded-lg text-sm transition"
              :class="
                isSelectedMonth(month.value)
                  ? 'bg-sky-100 font-semibold text-sky-700'
                  : 'text-slate-600 hover:bg-slate-100'
              "
              @click="selectMonth(month.value)"
            >
              {{ month.label }}
            </button>
          </div>

          <div class="mt-3 border-t border-slate-100 pt-3">
            <button
              type="button"
              class="h-10 w-full rounded-lg bg-blue-50 text-sm font-semibold text-sky-700 transition hover:bg-blue-100"
              @click="selectAllPeriods"
            >
              Semua Periode
            </button>
          </div>
        </div>
      </div>

      <div
        class="flex items-center gap-2 rounded-lg bg-sky-50 px-2.5 py-1.5 xl:ml-auto xl:max-w-[310px]"
      >
        <AppIcon name="info" class="h-4 w-4 shrink-0 text-sky-600" />
        <p class="text-xs leading-relaxed text-sky-800">
          Sumber: dataset simulasi hasil scraping berita online.
        </p>
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
      <!-- Empat kartu metrik utama -->
      <section class="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Artikel"
          :value="formatNumber(summary.totalArticles)"
          description="Artikel pada periode terpilih."
          icon="file"
          accent="blue"
        />

        <StatCard
          title="Media Terpantau"
          :value="formatNumber(summary.mediaCount)"
          description="Portal berita yang tercakup dalam analisis."
          icon="globe"
          accent="green"
        />

        <StatCard
          title="Komoditas Spesifik"
          :value="formatNumber(summary.identifiedCommoditiesCount)"
          description="Nama komoditas unik yang teridentifikasi."
          icon="package"
          accent="orange"
        />

        <StatCard
          title="Sentimen Positif"
          :value="formatNumber(summary.positiveSentimentCount)"
          :description="`Dari ${formatNumber(summary.totalArticles)} artikel.`"
          :badge="positiveSentimentShare"
          icon="thumbs-up"
          accent="green"
        />
      </section>

      <!-- Baris utama: top komoditas dan diagram donat sentimen -->
      <section class="grid grid-cols-1 gap-2 xl:grid-cols-2 -mt-1">
        <DashboardChartCard
          title="Top 5 Komoditas"
          description="Komoditas spesifik dengan jumlah artikel terbanyak pada periode terpilih."
          icon="package"
          :chart-data="topCommoditiesData"
          :chart-options="horizontalChartOptions"
          :chart-height="180"
        />

        <DashboardDoughnutCard
          title="Distribusi Sentimen"
          description="Perbandingan jumlah artikel dengan label sentimen."
          :chart-data="sentimentData"
          :chart-options="sentimentChartOptions"
          :total="formatNumber(summary.totalArticles)"
          :legend-items="sentimentLegendItems"
        />
      </section>

      <!-- Baris ringkasan bawah: media, fenomena, klasifikasi, dan sorotan -->
      <section class="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[1.18fr_1fr_1fr_1.12fr]">
        <DashboardChartCard
          title="Artikel per Media"
          description="Jumlah artikel dari masing-masing portal berita."
          icon="database"
          :chart-data="mediaData"
          :chart-options="horizontalChartOptions"
          :chart-height="180"
          class="h-full"
        />

        <DashboardChartCard
          title="Distribusi Kategori Fenomena"
          description="Jumlah artikel berdasarkan kategori utama."
          icon="file"
          :chart-data="categoryData"
          :chart-options="verticalChartOptions"
          :chart-height="180"
          class="h-full"
        />

        <DashboardChartCard
          title="Cakupan Klasifikasi Komoditas"
          description="Perbandingan jenis klasifikasi komoditas."
          icon="package"
          :chart-data="commodityScopeData"
          :chart-options="verticalChartOptions"
          :chart-height="180"
          class="h-full"
        />

        <section
          class="flex min-w-0 flex-col overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm shadow-blue-950/[0.04]"
        >
          <div class="flex items-center gap-2 border-b border-blue-100 bg-sky-50/80 px-3 py-2">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sky-500 shadow-sm shadow-sky-950/[0.04]"
            >
              <AppIcon name="activity" class="h-4 w-4" />
            </div>
            <h2 class="text-sm font-bold leading-5 text-slate-900">Sorotan Periode</h2>
          </div>

          <div class="flex-1 divide-y divide-slate-100 px-3">
            <div v-for="(item, index) in periodHighlights" :key="index" class="flex gap-2 py-2">
              <div
                :class="[
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  item.tone === 'green'
                    ? 'bg-emerald-50 text-emerald-600'
                    : item.tone === 'orange'
                      ? 'bg-orange-50 text-orange-500'
                      : 'bg-sky-50 text-sky-500',
                ]"
              >
                <AppIcon :name="item.icon" class="h-4 w-4" />
              </div>
              <p class="min-w-0 self-center text-xs leading-[1.35] text-slate-700">
                {{ item.text }}
              </p>
            </div>
          </div>
        </section>
      </section>

      <div class="flex items-start gap-2 rounded-lg border border-blue-100 bg-white/80 px-3 py-1.5">
        <AppIcon name="info" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
        <p class="text-xs leading-relaxed text-slate-500">
          Data dan hasil klasifikasi pada prototipe ini bersifat simulasi. Sentimen, kategori, dan
          komoditas belum dihasilkan dari proses scraping maupun analisis otomatis.
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Desktop dashboard is designed to fit one screen on common laptop/monitor heights. */
@media (min-width: 1280px) and (min-height: 760px) {
  .dashboard-page {
    gap: 0.45rem;
  }
}
@media (min-width: 1280px) and (max-height: 850px) {
  .dashboard-page {
    gap: 0.35rem;
  }
}
</style>
