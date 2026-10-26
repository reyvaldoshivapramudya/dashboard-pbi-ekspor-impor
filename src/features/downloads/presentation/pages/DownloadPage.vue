<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { articleRepository } from '@/app/container'
import type { NewsArticle } from '@/features/articles/domain/entities/news-article'
import AppIcon from '@/shared/components/AppIcon.vue'
import { downloadXlsx } from '@/shared/utils/xlsx-export'

const MONTH_OPTIONS = [
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
]

const EXPORT_HEADERS = [
  'Tanggal Publikasi',
  'Periode',
  'Judul Berita',
  'Sumber Berita',
  'Kategori Fenomena',
  'Komoditas',
  'Cakupan Komoditas',
  'Negara Terkait',
  'Ringkasan',
  'Sentimen',
  'Skor Sentimen',
  'Kata Kunci',
  'Link Berita',
]

const EXPORT_COLUMN_WIDTHS = [18, 12, 48, 24, 22, 32, 22, 28, 72, 14, 16, 34, 56]

const articles = ref<NewsArticle[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const selectedPeriod = ref('all')
const periodPickerOpen = ref(false)
const periodPickerYear = ref(new Date().getFullYear())
const periodPickerRoot = ref<HTMLElement | null>(null)
const isDownloading = ref(false)
const downloadMessage = ref('')

const availablePeriods = computed(() =>
  [...new Set(articles.value.map((article) => article.period))].sort((a, b) => b.localeCompare(a)),
)

const availableYears = computed(() =>
  [...new Set(availablePeriods.value.map((period) => Number(period.slice(0, 4))))].sort(
    (a, b) => a - b,
  ),
)

const minimumYear = computed(() => availableYears.value[0] ?? new Date().getFullYear())
const maximumYear = computed(
  () => availableYears.value[availableYears.value.length - 1] ?? new Date().getFullYear(),
)

const selectedPeriodLabel = computed(() =>
  selectedPeriod.value === 'all' ? 'Semua Periode' : formatPeriod(selectedPeriod.value),
)

const selectedArticles = computed(() => {
  const filtered =
    selectedPeriod.value === 'all'
      ? articles.value
      : articles.value.filter((article) => article.period === selectedPeriod.value)

  return [...filtered].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
})

const mediaCount = computed(() => new Set(selectedArticles.value.map((article) => article.mediaName)).size)
const positiveCount = computed(
  () => selectedArticles.value.filter((article) => article.sentiment === 'positive').length,
)
const negativeCount = computed(
  () => selectedArticles.value.filter((article) => article.sentiment === 'negative').length,
)

function formatPeriod(period: string): string {
  const date = new Date(`${period}-01T12:00:00Z`)

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

function isPeriodMonthSelected(month: string): boolean {
  return selectedPeriod.value === `${periodPickerYear.value}-${month}`
}

function isMonthAvailable(month: string): boolean {
  return availablePeriods.value.includes(`${periodPickerYear.value}-${month}`)
}

function selectPeriodMonth(month: string): void {
  const period = `${periodPickerYear.value}-${month}`
  if (!availablePeriods.value.includes(period)) return

  selectedPeriod.value = period
  periodPickerOpen.value = false
  downloadMessage.value = ''
}

function selectAllPeriods(): void {
  selectedPeriod.value = 'all'
  periodPickerOpen.value = false
  downloadMessage.value = ''
}

function changePeriodPickerYear(offset: number): void {
  const nextYear = periodPickerYear.value + offset
  if (nextYear < minimumYear.value || nextYear > maximumYear.value) return

  periodPickerYear.value = nextYear
}

function handlePeriodPickerOutsideClick(event: PointerEvent): void {
  const target = event.target

  if (target instanceof Node && !periodPickerRoot.value?.contains(target)) {
    periodPickerOpen.value = false
  }
}

function handlePeriodPickerKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') periodPickerOpen.value = false
}

function categoryLabel(category: NewsArticle['category']): string {
  const labels: Record<NewsArticle['category'], string> = {
    commodity: 'Komoditas',
    policy: 'Kebijakan',
    logistics: 'Logistik',
  }

  return labels[category]
}

function commodityScopeLabel(scope: NewsArticle['commodityScope']): string {
  return scope === 'specific' ? 'Komoditas spesifik' : 'Lintas komoditas'
}

function sentimentLabel(sentiment: NewsArticle['sentiment']): string {
  return sentiment === 'positive' ? 'Positif' : 'Negatif'
}

function buildExportRows(): Array<Array<string | number>> {
  return selectedArticles.value.map((article) => [
    article.publishedAt,
    article.period,
    article.title,
    article.mediaName,
    categoryLabel(article.category),
    article.commodities.join(', '),
    commodityScopeLabel(article.commodityScope),
    article.relatedCountries.join(', '),
    article.summary,
    sentimentLabel(article.sentiment),
    article.sentimentScore,
    article.searchKeywords.join(', '),
    article.url,
  ])
}

function downloadExcel(): void {
  if (selectedArticles.value.length === 0 || isDownloading.value) return

  isDownloading.value = true
  downloadMessage.value = ''
  errorMessage.value = ''

  try {
    const periodSlug = selectedPeriod.value === 'all' ? 'semua-periode' : selectedPeriod.value

    downloadXlsx({
      fileName: `hasil-scraping-berita-ekspor-impor-${periodSlug}.xlsx`,
      sheetName: 'Artikel Berita',
      headers: EXPORT_HEADERS,
      rows: buildExportRows(),
      columnWidths: EXPORT_COLUMN_WIDTHS,
    })

    downloadMessage.value = `File Excel berhasil disiapkan dengan ${formatNumber(selectedArticles.value.length)} artikel.`
  } catch (error) {
    console.error('Gagal menyiapkan file Excel.', error)
    errorMessage.value = 'File Excel belum berhasil dibuat. Silakan coba kembali.'
  } finally {
    isDownloading.value = false
  }
}

async function loadArticles(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''

  try {
    articles.value = await articleRepository.getAll()

    if (availablePeriods.value.length > 0) {
      selectedPeriod.value = availablePeriods.value[0]!
      periodPickerYear.value = Number(selectedPeriod.value.slice(0, 4))
    }
  } catch (error) {
    console.error('Tidak dapat memuat data artikel untuk diunduh.', error)
    errorMessage.value = 'Data berita gagal dimuat. Muat ulang halaman untuk mencoba kembali.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadArticles()
  document.addEventListener('pointerdown', handlePeriodPickerOutsideClick)
  document.addEventListener('keydown', handlePeriodPickerKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePeriodPickerOutsideClick)
  document.removeEventListener('keydown', handlePeriodPickerKeydown)
})
</script>

<template>
  <div class="space-y-6">
    <div
      v-if="errorMessage"
      role="alert"
      class="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
    >
      <AppIcon name="circle-alert" :size="17" class="mt-0.5 shrink-0" />
      <p>{{ errorMessage }}</p>
    </div>

    <div
      v-if="downloadMessage"
      role="status"
      class="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
    >
      <AppIcon name="circle-check" :size="17" class="mt-0.5 shrink-0" />
      <p>{{ downloadMessage }}</p>
    </div>

    <section class="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div class="flex items-start gap-3">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bps-blue/10 text-bps-blue">
          <AppIcon name="download" :size="21" />
        </div>
        <div>
          <h2 class="text-sm font-semibold text-slate-900">Unduh hasil scraping</h2>
          <p class="mt-0.5 max-w-2xl text-xs leading-relaxed text-slate-500">
            Pilih periode berita yang dibutuhkan. Data akan diunduh dalam format Microsoft Excel
            (.xlsx) dan hanya mencakup artikel pada periode terpilih.
          </p>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div ref="periodPickerRoot" class="relative">
          <label for="download-period-trigger" class="mb-2 block text-xs font-medium text-slate-600">
            Periode data
          </label>

          <button
            id="download-period-trigger"
            type="button"
            aria-haspopup="dialog"
            :aria-expanded="periodPickerOpen"
            :disabled="isLoading || availablePeriods.length === 0"
            class="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            @click="periodPickerOpen = !periodPickerOpen"
          >
            <span>{{ selectedPeriodLabel }}</span>
            <AppIcon name="calendar" :size="17" class="shrink-0 text-slate-500" />
          </button>

          <div
            v-if="periodPickerOpen"
            role="dialog"
            aria-label="Pilih periode download berdasarkan bulan"
            class="absolute left-0 top-full z-30 mt-2 w-full min-w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10"
          >
            <div class="flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Tahun sebelumnya"
                :disabled="periodPickerYear <= minimumYear"
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-bps-blue/30 disabled:cursor-not-allowed disabled:opacity-30"
                @click="changePeriodPickerYear(-1)"
              >
                <AppIcon name="chevron-left" :size="16" />
              </button>

              <span class="text-sm font-semibold text-slate-800">{{ periodPickerYear }}</span>

              <button
                type="button"
                aria-label="Tahun berikutnya"
                :disabled="periodPickerYear >= maximumYear"
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-bps-blue/30 disabled:cursor-not-allowed disabled:opacity-30"
                @click="changePeriodPickerYear(1)"
              >
                <AppIcon name="chevron-right" :size="16" />
              </button>
            </div>

            <div class="mt-3 grid grid-cols-4 gap-2">
              <button
                v-for="month in MONTH_OPTIONS"
                :key="month.value"
                type="button"
                :aria-label="`${month.label} ${periodPickerYear}`"
                :aria-pressed="isPeriodMonthSelected(month.value)"
                :disabled="!isMonthAvailable(month.value)"
                :class="[
                  'rounded-lg px-2 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-bps-blue/30 disabled:cursor-not-allowed disabled:text-slate-300',
                  isPeriodMonthSelected(month.value)
                    ? 'bg-slate-900 text-white shadow-sm'
                    : isMonthAvailable(month.value)
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300',
                ]"
                @click="selectPeriodMonth(month.value)"
              >
                {{ month.label }}
              </button>
            </div>

            <div class="mt-3 border-t border-slate-100 pt-3">
              <button
                type="button"
                :class="[
                  'w-full rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-bps-blue/30',
                  selectedPeriod === 'all'
                    ? 'bg-blue-50 text-bps-blue'
                    : 'text-slate-600 hover:bg-slate-50',
                ]"
                @click="selectAllPeriods"
              >
                Semua Periode
              </button>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <p class="text-xs font-medium text-slate-500">Artikel yang akan diunduh</p>
          <p class="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {{ isLoading ? '—' : formatNumber(selectedArticles.length) }}
          </p>
          <p class="mt-1 text-xs text-slate-500">{{ selectedPeriodLabel }}</p>
        </div>
      </div>

      <div class="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700">
            <AppIcon name="file" :size="19" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-800">Format Excel (.xlsx)</p>
            <p class="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">
              Memuat tanggal, judul, media, kategori, komoditas, ringkasan, sentimen, kata kunci, dan tautan berita.
            </p>
          </div>
        </div>

        <button
          type="button"
          :disabled="isLoading || isDownloading || selectedArticles.length === 0"
          class="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-bps-blue px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-bps-blue-dark focus:outline-none focus:ring-2 focus:ring-bps-blue/30 disabled:cursor-not-allowed disabled:bg-slate-300"
          @click="downloadExcel"
        >
          <AppIcon :name="isDownloading ? 'loader' : 'download'" :size="17" :class="isDownloading ? 'animate-spin' : ''" />
          {{ isDownloading ? 'Menyiapkan file...' : 'Download Excel' }}
        </button>
      </div>

      <div v-if="!isLoading && selectedArticles.length === 0" class="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        Belum ada artikel untuk diunduh pada periode ini.
      </div>
    </section>

    <section class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <p class="text-xs font-medium text-slate-500">Sumber berita</p>
        <p class="mt-2 text-2xl font-bold tracking-tight text-slate-900">{{ isLoading ? '—' : formatNumber(mediaCount) }}</p>
        <p class="mt-1 text-xs text-slate-500">Media berbeda pada periode terpilih</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <p class="text-xs font-medium text-slate-500">Sentimen positif</p>
        <p class="mt-2 text-2xl font-bold tracking-tight text-emerald-700">{{ isLoading ? '—' : formatNumber(positiveCount) }}</p>
        <p class="mt-1 text-xs text-slate-500">Artikel dengan label positif</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <p class="text-xs font-medium text-slate-500">Sentimen negatif</p>
        <p class="mt-2 text-2xl font-bold tracking-tight text-rose-700">{{ isLoading ? '—' : formatNumber(negativeCount) }}</p>
        <p class="mt-1 text-xs text-slate-500">Artikel dengan label negatif</p>
      </div>
    </section>

    <p class="text-xs leading-relaxed text-slate-400">
      File diekspor dari data artikel yang tersedia di aplikasi. Pada versi prototipe ini, data masih berupa simulasi dan belum terhubung langsung ke layanan scraping aktif.
    </p>
  </div>
</template>
