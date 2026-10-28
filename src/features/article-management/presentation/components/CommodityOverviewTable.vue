<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'
import ArticleExplorer from '@/features/articles/presentation/components/ArticleExplorer.vue'
import { getCommodityOverview } from '@/app/container'
import type { CommodityOverview } from '@/features/articles/domain/entities/commodity-overview'

/** Role admin dapat mengelola artikel; role user hanya melihat daftar. */
const props = withDefaults(defineProps<{ canManage?: boolean }>(), { canManage: false })

const ROW_OPTIONS = [20, 50, 100]

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

const rows = ref<CommodityOverview[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

/** Pop-up "Daftar dan Kelola Artikel": komoditas kosong berarti tanpa filter. */
const isPopupOpen = ref(false)
const popupCommodity = ref('')
const popupAutoCreate = ref(false)

const popupTitle = computed(() =>
  popupCommodity.value === '' ? 'Semua Komoditas' : `Komoditas ${popupCommodity.value}`,
)

const popupKey = computed(
  () => `${popupCommodity.value}::${popupAutoCreate.value ? 'create' : 'list'}`,
)

const queryInput = ref('')
const periodInput = ref('all')
const periodPickerOpen = ref(false)
const periodPickerYear = ref(new Date().getFullYear())
const periodPickerRoot = ref<HTMLElement | null>(null)

const appliedFilters = ref({ period: 'all', query: '' })

const rowsPerPage = ref(20)
const currentPage = ref(1)
const sortDirection = ref<'asc' | 'desc'>('desc')
const showBackToTop = ref(false)

/** Periode yang tersedia diturunkan dari tanggal poin ringkasan pada sheet "Hasil Scraping". */
const availablePeriods = computed(() => {
  const periods = new Set<string>()

  for (const row of rows.value) {
    for (const point of row.points) {
      if (point.publishedAt.length >= 7) periods.add(point.publishedAt.slice(0, 7))
    }
  }

  return [...periods].sort((a, b) => b.localeCompare(a))
})

const selectedPeriodLabel = computed(() =>
  periodInput.value === 'all' ? 'Semua Periode' : formatPeriod(periodInput.value),
)

const filteredRows = computed(() => {
  const query = appliedFilters.value.query.toLocaleLowerCase('id-ID')
  const period = appliedFilters.value.period

  return rows.value.filter((row) => {
    const matchesQuery = query === '' || row.commodity.toLocaleLowerCase('id-ID').includes(query)

    const matchesPeriod =
      period === 'all' || row.points.some((point) => point.publishedAt.startsWith(period))

    return matchesQuery && matchesPeriod
  })
})

const sortedRows = computed(() =>
  [...filteredRows.value].sort((a, b) => {
    const difference = a.articleCount - b.articleCount

    return sortDirection.value === 'asc'
      ? difference || a.commodity.localeCompare(b.commodity, 'id')
      : difference * -1 || b.commodity.localeCompare(a.commodity, 'id')
  }),
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / rowsPerPage.value)),
)

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value

  return sortedRows.value.slice(start, start + rowsPerPage.value)
})

const showingFrom = computed(() =>
  filteredRows.value.length === 0 ? 0 : (currentPage.value - 1) * rowsPerPage.value + 1,
)

const showingTo = computed(() =>
  Math.min(currentPage.value * rowsPerPage.value, filteredRows.value.length),
)

async function loadOverview(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''

  try {
    rows.value = await getCommodityOverview.execute()
    syncPeriodPickerYear()
  } catch (error) {
    console.error('Gagal memuat daftar komoditas:', error)
    errorMessage.value = 'Data komoditas gagal dimuat.'
  } finally {
    isLoading.value = false
  }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

function toggleArticleSort(): void {
  sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc'
  currentPage.value = 1
}

function handleWindowScroll(): void {
  if (window.scrollY > 360) showBackToTop.value = true
}

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formatPeriod(period: string): string {
  const date = new Date(`${period}-01T12:00:00Z`)

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function syncPeriodPickerYear(): void {
  const latest = availablePeriods.value[0]

  periodPickerYear.value =
    periodInput.value === 'all' || periodInput.value === ''
      ? latest === undefined
        ? new Date().getFullYear()
        : Number(latest.slice(0, 4))
      : Number(periodInput.value.slice(0, 4))
}

function isPeriodMonthSelected(month: string): boolean {
  return periodInput.value === `${periodPickerYear.value}-${month}`
}

function selectPeriodMonth(month: string): void {
  periodInput.value = `${periodPickerYear.value}-${month}`
  periodPickerOpen.value = false
}

function selectAllPeriods(): void {
  periodInput.value = 'all'
  periodPickerOpen.value = false
}

function changePeriodPickerYear(offset: number): void {
  periodPickerYear.value += offset
}

function handlePeriodPickerOutsideClick(event: PointerEvent): void {
  const target = event.target

  if (target instanceof Node && !periodPickerRoot.value?.contains(target)) {
    periodPickerOpen.value = false
  }
}

function handleSearch(): void {
  periodPickerOpen.value = false
  appliedFilters.value = {
    period: periodInput.value,
    query: queryInput.value.trim(),
  }
  currentPage.value = 1
}

function resetFilters(): void {
  queryInput.value = ''
  periodInput.value = 'all'
  periodPickerOpen.value = false
  syncPeriodPickerYear()
  handleSearch()
}

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00Z`)

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function openPopup(commodity: string): void {
  popupCommodity.value = commodity
  popupAutoCreate.value = false
  isPopupOpen.value = true
  document.body.style.overflow = 'hidden'
}

/** Buka pop-up tanpa filter komoditas sekaligus menampilkan formulir artikel baru. */
function openCreateForm(): void {
  if (!props.canManage) return

  popupCommodity.value = ''
  popupAutoCreate.value = true
  isPopupOpen.value = true
  document.body.style.overflow = 'hidden'
}

async function closePopup(): Promise<void> {
  isPopupOpen.value = false
  popupCommodity.value = ''
  popupAutoCreate.value = false
  document.body.style.overflow = ''

  // Sinkronkan ulang ringkasan bila artikel berubah di dalam pop-up.
  await loadOverview()
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return

  if (periodPickerOpen.value) {
    periodPickerOpen.value = false
    return
  }

  if (isPopupOpen.value) {
    void closePopup()
  }
}

onMounted(async () => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('pointerdown', handlePeriodPickerOutsideClick)
  window.addEventListener('scroll', handleWindowScroll, { passive: true })
  handleWindowScroll()
  await loadOverview()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('pointerdown', handlePeriodPickerOutsideClick)
  window.removeEventListener('scroll', handleWindowScroll)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="space-y-6">
    <!-- Panel filter dan pencarian untuk halaman Manajemen Artikel Berita -->
    <section class="sticky top-0 z-20 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-sm font-semibold text-slate-900">Filter dan pencarian</h2>
          <p class="mt-1 text-xs text-slate-500">Cari berdasarkan nama komoditas atau periode.</p>
        </div>

        <button
          v-if="props.canManage"
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-bps-blue px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-bps-blue-dark focus:outline-none focus:ring-2 focus:ring-bps-blue/30"
          @click="openCreateForm"
        >
          <AppIcon name="plus" class="h-4 w-4" />
          Tambah Artikel
        </button>
      </div>

      <form class="grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="handleSearch">
        <div ref="periodPickerRoot" class="relative">
          <label
            for="commodity-period-trigger"
            class="mb-2 block text-xs font-medium text-slate-600"
          >
            Periode
          </label>

          <button
            id="commodity-period-trigger"
            type="button"
            aria-haspopup="dialog"
            :aria-expanded="periodPickerOpen"
            class="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
            @click="periodPickerOpen = !periodPickerOpen"
          >
            <span>{{ selectedPeriodLabel }}</span>
            <AppIcon name="calendar" :size="17" class="shrink-0 text-slate-500" />
          </button>

          <div
            v-if="periodPickerOpen"
            role="dialog"
            aria-label="Pilih periode berdasarkan bulan"
            class="absolute left-0 top-full z-30 mt-2 w-full min-w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10"
          >
            <div class="flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Tahun sebelumnya"
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-bps-blue/30"
                @click="changePeriodPickerYear(-1)"
              >
                <AppIcon name="chevron-left" :size="16" />
              </button>

              <span class="text-sm font-semibold text-slate-800">{{ periodPickerYear }}</span>

              <button
                type="button"
                aria-label="Tahun berikutnya"
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-bps-blue/30"
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
                :class="[
                  'rounded-lg px-2 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-bps-blue/30',
                  isPeriodMonthSelected(month.value)
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100',
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
                  periodInput === 'all'
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

        <div>
          <label for="commodity-query" class="mb-2 block text-xs font-medium text-slate-600">
            Nama komoditas
          </label>

          <div class="relative">
            <AppIcon
              name="search"
              :size="16"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="commodity-query"
              v-model="queryInput"
              type="search"
              placeholder="Contoh: beras, furnitur, kereta api..."
              class="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
            />
          </div>
        </div>

        <div
          class="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <label for="commodity-rows" class="mr-3 text-xs font-medium text-slate-600">
              Baris per halaman
            </label>

            <select
              id="commodity-rows"
              v-model.number="rowsPerPage"
              class="mt-2 h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-bps-blue sm:mt-0"
              @change="currentPage = 1"
            >
              <option v-for="rows in ROW_OPTIONS" :key="rows" :value="rows">
                {{ rows }}
              </option>
            </select>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              @click="resetFilters"
            >
              Reset Filter
            </button>

            <button
              type="submit"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-bps-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-bps-blue-dark focus:outline-none focus:ring-2 focus:ring-bps-blue/30"
            >
              <AppIcon name="search" class="h-4 w-4" />
              Cari Komoditas
            </button>
          </div>
        </div>
      </form>
    </section>

    <!-- Komoditas table -->
    <section class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div
        class="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <div>
          <h2 class="text-base font-semibold text-slate-900">Daftar Komoditas</h2>
          <p class="mt-1 text-xs text-slate-500">
            {{ formatNumber(filteredRows.length) }} dari {{ formatNumber(rows.length) }} komoditas
            &middot;
            {{
              props.canManage
                ? 'Klik baris untuk membuka daftar dan kelola artikel.'
                : 'Klik baris untuk membuka daftar artikel.'
            }}
          </p>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="flex items-center justify-center gap-3 p-12 text-sm text-slate-500"
      >
        <AppIcon name="loader" class="h-5 w-5 animate-spin text-bps-blue" />
        Memuat komoditas...
      </div>

      <div v-else-if="errorMessage" class="p-6">
        <div
          role="alert"
          class="flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800"
        >
          <AppIcon name="circle-alert" class="mt-0.5 h-4 w-4 shrink-0" />
          <p>{{ errorMessage }}</p>
        </div>
      </div>

      <div v-else>
        <div class="space-y-3 p-3 lg:hidden">
          <button
            type="button"
            class="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-bps-blue/40 hover:text-bps-blue"
            :aria-label="`Urutkan jumlah berita ${sortDirection === 'desc' ? 'terbanyak ke tersedikit' : 'tersedikit ke terbanyak'}`"
            @click="toggleArticleSort"
          >
            Jumlah Berita: {{ sortDirection === 'desc' ? 'Terbanyak' : 'Tersedikit' }}
            <AppIcon
              :name="sortDirection === 'desc' ? 'arrow-down' : 'arrow-up'"
              class="h-3.5 w-3.5"
            />
          </button>

          <article
            v-for="row in paginatedRows"
            :key="row.commodity"
            class="cursor-pointer rounded-lg border border-slate-200 bg-white p-4"
            tabindex="0"
            role="button"
            :aria-label="
              props.canManage
                ? `Kelola artikel komoditas ${row.commodity}`
                : `Lihat artikel komoditas ${row.commodity}`
            "
            @click="openPopup(row.commodity)"
            @keydown.enter="openPopup(row.commodity)"
            @keydown.space.prevent="openPopup(row.commodity)"
          >
            <div class="flex items-start justify-between gap-3">
              <h3 class="min-w-0 break-words font-semibold leading-5 text-slate-800">
                {{ row.commodity }}
              </h3>
              <AppIcon name="chevron-right" class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            </div>

            <dl class="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              <div>
                <dt class="text-slate-400">Berita</dt>
                <dd class="mt-1 font-semibold tabular-nums text-slate-700">
                  {{ formatNumber(row.articleCount) }}
                </dd>
              </div>
              <div>
                <dt class="text-slate-400">Jumlah Ringkasan</dt>
                <dd class="mt-1 font-semibold tabular-nums text-slate-700">
                  {{ formatNumber(row.mainPointCount) }}
                </dd>
              </div>
              <div>
                <dt class="text-slate-400">Positif</dt>
                <dd class="mt-1 font-semibold tabular-nums text-emerald-700">
                  {{ formatNumber(row.positiveCount) }}
                </dd>
              </div>
              <div>
                <dt class="text-slate-400">Negatif</dt>
                <dd class="mt-1 font-semibold tabular-nums text-orange-700">
                  {{ formatNumber(row.negativeCount) }}
                </dd>
              </div>
            </dl>

            <div class="mt-4 border-t border-slate-100 pt-3">
              <p class="text-xs font-medium text-slate-400">Ringkasan</p>
              <ul v-if="row.points.length > 0" class="mt-2 space-y-2">
                <li
                  v-for="(point, index) in row.points"
                  :key="index"
                  class="text-xs leading-5 text-slate-600"
                >
                  &bull; {{ point.text }}
                  <span
                    class="ml-1 inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-inset ring-blue-100"
                  >
                    {{ point.mediaName }} &middot; {{ formatDate(point.publishedAt) }}
                  </span>
                </li>
              </ul>
              <span v-else class="mt-2 block text-xs text-slate-400">&mdash;</span>
            </div>
          </article>

          <div v-if="filteredRows.length === 0" class="px-3 py-12 text-center">
            <div
              class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"
            >
              <AppIcon name="search" class="h-5 w-5" />
            </div>
            <p class="mt-4 text-sm font-semibold text-slate-800">
              {{
                rows.length === 0 ? 'Data komoditas belum tersedia.' : 'Komoditas tidak ditemukan'
              }}
            </p>
            <p class="mt-1 text-xs text-slate-500">
              {{
                rows.length === 0
                  ? 'Sheet "Ringkasan Komoditas" pada HasilScrapingFenomena.xlsx tidak memuat data.'
                  : 'Coba ubah kata kunci pencarian komoditas.'
              }}
            </p>
          </div>
        </div>

        <!-- Tabel dapat digulir sendiri (vertikal + horizontal) agar baris nama kolom tetap terlihat. -->
        <div class="hidden lg:block lg:max-h-[70vh] lg:overflow-auto">
          <table class="w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead class="text-xs font-semibold text-slate-500">
              <tr>
                <th
                  class="sticky top-0 z-10 shadow-[inset_0_-1px_0_rgba(148,163,184,0.35)] min-w-56 bg-slate-50 px-4 py-4"
                >
                  Komoditas
                </th>
                <th
                  class="sticky top-0 z-10 shadow-[inset_0_-1px_0_rgba(148,163,184,0.35)] whitespace-nowrap bg-slate-50 px-4 py-4"
                >
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 font-semibold transition hover:text-bps-blue"
                    :aria-label="`Urutkan jumlah berita ${sortDirection === 'desc' ? 'terbanyak ke tersedikit' : 'tersedikit ke terbanyak'}`"
                    @click.stop="toggleArticleSort"
                  >
                    Jumlah Berita
                    <AppIcon
                      :name="sortDirection === 'desc' ? 'arrow-down' : 'arrow-up'"
                      class="h-3.5 w-3.5"
                    />
                  </button>
                </th>
                <th
                  class="sticky top-0 z-10 shadow-[inset_0_-1px_0_rgba(148,163,184,0.35)] whitespace-nowrap bg-slate-50 px-4 py-4"
                >
                  Positif
                </th>
                <th
                  class="sticky top-0 z-10 shadow-[inset_0_-1px_0_rgba(148,163,184,0.35)] whitespace-nowrap bg-slate-50 px-4 py-4"
                >
                  Negatif
                </th>
                <th
                  class="sticky top-0 z-10 shadow-[inset_0_-1px_0_rgba(148,163,184,0.35)] whitespace-nowrap bg-slate-50 px-4 py-4"
                >
                  Jumlah Ringkasan
                </th>
                <th
                  class="sticky top-0 z-10 shadow-[inset_0_-1px_0_rgba(148,163,184,0.35)] min-w-96 bg-slate-50 px-4 py-4"
                >
                  Ringkasan
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="row in paginatedRows"
                :key="row.commodity"
                class="cursor-pointer align-top transition hover:bg-slate-100"
                tabindex="0"
                role="button"
                :aria-label="
                  props.canManage
                    ? `Kelola artikel komoditas ${row.commodity}`
                    : `Lihat artikel komoditas ${row.commodity}`
                "
                @click="openPopup(row.commodity)"
                @keydown.enter="openPopup(row.commodity)"
                @keydown.space.prevent="openPopup(row.commodity)"
              >
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold leading-5 text-slate-800">
                      {{ row.commodity }}
                    </span>
                  </div>
                </td>

                <td class="whitespace-nowrap px-4 py-4 font-semibold tabular-nums text-slate-700">
                  {{ formatNumber(row.articleCount) }}
                </td>

                <td class="px-4 py-4">
                  <span
                    class="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200"
                  >
                    {{ formatNumber(row.positiveCount) }}
                  </span>
                </td>

                <td class="px-4 py-4">
                  <span
                    class="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-200"
                  >
                    {{ formatNumber(row.negativeCount) }}
                  </span>
                </td>

                <td class="whitespace-nowrap px-4 py-4 font-semibold tabular-nums text-slate-700">
                  {{ formatNumber(row.mainPointCount) }}
                </td>

                <td class="px-4 py-4">
                  <ul v-if="row.points.length > 0" class="space-y-2">
                    <li
                      v-for="(point, index) in row.points"
                      :key="index"
                      class="text-xs leading-5 text-slate-600"
                    >
                      &bull; {{ point.text }}
                      <span
                        class="ml-1 inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-inset ring-blue-100"
                      >
                        {{ point.mediaName }} &middot; {{ formatDate(point.publishedAt) }}
                      </span>
                    </li>
                  </ul>

                  <span v-else class="text-xs text-slate-400">&mdash;</span>
                </td>
              </tr>

              <tr v-if="filteredRows.length === 0">
                <td colspan="6" class="px-6 py-16 text-center">
                  <div
                    class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"
                  >
                    <AppIcon name="search" class="h-5 w-5" />
                  </div>

                  <p class="mt-4 text-sm font-semibold text-slate-800">
                    {{
                      rows.length === 0
                        ? 'Data komoditas belum tersedia.'
                        : 'Komoditas tidak ditemukan'
                    }}
                  </p>

                  <p class="mt-1 text-xs text-slate-500">
                    {{
                      rows.length === 0
                        ? 'Sheet "Ringkasan Komoditas" pada HasilScrapingFenomena.xlsx tidak memuat data.'
                        : 'Coba ubah kata kunci pencarian komoditas.'
                    }}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <p class="text-xs text-slate-500">
          Menampilkan
          <span class="font-semibold text-slate-700"> {{ showingFrom }}–{{ showingTo }} </span>
          dari
          <span class="font-semibold text-slate-700"> {{ filteredRows.length }} </span>
          komoditas
        </p>

        <div class="flex items-center gap-2">
          <button
            type="button"
            aria-label="Halaman sebelumnya"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage <= 1"
            @click="currentPage--"
          >
            <AppIcon name="chevron-left" class="h-4 w-4" />
          </button>

          <span class="min-w-24 text-center text-xs font-medium text-slate-600">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </span>

          <button
            type="button"
            aria-label="Halaman berikutnya"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >
            <AppIcon name="chevron-right" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>

    <Transition name="back-to-top">
      <button
        v-if="showBackToTop"
        type="button"
        aria-label="Kembali ke atas daftar komoditas"
        title="Kembali ke atas"
        class="back-to-top-button fixed bottom-5 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-bps-blue text-white shadow-lg shadow-slate-900/20 focus:outline-none focus:ring-2 focus:ring-bps-blue/30 sm:bottom-7 sm:right-7"
        @click="scrollToTop"
      >
        <AppIcon name="arrow-up" class="h-5 w-5" />
      </button>
    </Transition>

    <!-- Pop-up persegi panjang: Daftar dan Kelola Artikel -->
    <Teleport to="body">
      <div
        v-if="isPopupOpen"
        class="fixed inset-0 z-90 flex items-center justify-center bg-slate-900/40 p-3 backdrop-blur-[2px] sm:p-6"
        @click.self="closePopup"
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="commodity-popup-title"
          class="flex h-[94dvh] max-h-[calc(100dvh-1.5rem)] w-full max-w-[1700px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/15 sm:h-[94vh] sm:max-h-none"
        >
          <div
            class="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4 sm:px-7"
          >
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400">
                {{ props.canManage ? 'Daftar dan Kelola Artikel' : 'Daftar Artikel' }}
              </p>

              <h2 id="commodity-popup-title" class="mt-1 text-lg font-bold text-slate-900">
                {{ popupTitle }}
              </h2>
            </div>

            <button
              type="button"
              aria-label="Tutup pop-up komoditas"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
              @click="closePopup"
            >
              <AppIcon name="x" class="h-4 w-4" />
            </button>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 px-4 pb-4 sm:px-6 sm:pb-6">
            <ArticleExplorer
              :key="popupKey"
              :can-manage="props.canManage"
              :commodity="popupCommodity"
              :auto-create="popupAutoCreate"
              :compact-search="true"
            />
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>
