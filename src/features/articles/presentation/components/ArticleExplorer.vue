<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'

import { createArticle, deleteArticle, searchArticles, updateArticle } from '@/app/container'

import type {
  NewsArticle,
  NewsCategory,
  SentimentLabel,
  CommodityScope,
} from '@/features/articles/domain/entities/news-article'

import type { NewArticleInput } from '@/features/articles/domain/repositories/article.repository'

import type { SearchArticleFilters } from '@/features/articles/domain/use-cases/search-articles'

const props = withDefaults(
  defineProps<{
    canManage?: boolean
    /** Batasi daftar pada komoditas tertentu (dipakai pada pop-up daftar komoditas). */
    commodity?: string
    /** Langsung buka formulir tambah artikel saat komponen ditampilkan. */
    autoCreate?: boolean
    /** Tampilkan hanya satu search bar tanpa panel filter lengkap. */
    compactSearch?: boolean
  }>(),
  {
    canManage: false,
    commodity: '',
    autoCreate: false,
    compactSearch: false,
  },
)

interface ArticleFormState {
  publishedAt: string
  category: NewsCategory
  searchKeywords: string
  title: string
  mediaName: string
  commodities: string
  commodityScope: CommodityScope
  relatedCountries: string
  summary: string
  url: string
  sentiment: SentimentLabel
  sentimentScore: string
}

const CATEGORY_OPTIONS: {
  label: string
  value: NewsCategory
}[] = [
  { label: 'Komoditas', value: 'commodity' },
  { label: 'Kebijakan', value: 'policy' },
  { label: 'Logistik', value: 'logistics' },
]

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

const availableArticles = ref<NewsArticle[]>([])
const filteredArticles = ref<NewsArticle[]>([])

const periodInput = ref('all')
const periodPickerOpen = ref(false)
const periodPickerYear = ref(new Date().getFullYear())
const periodPickerRoot = ref<HTMLElement | null>(null)
const queryInput = ref('')
const appliedFilters = ref<SearchArticleFilters>({
  period: 'all',
  mediaName: 'all',
  category: 'all',
  query: '',
  commodity: props.commodity,
})

const rowsPerPage = ref(20)
const currentPage = ref(1)

const isLoading = ref(false)
const errorMessage = ref('')
const feedbackMessage = ref('')

const isFormOpen = ref(false)
const editingArticleId = ref<string | null>(null)
const isSaving = ref(false)

function emptyForm(): ArticleFormState {
  return {
    publishedAt: new Date().toISOString().slice(0, 10),
    category: 'commodity',
    searchKeywords: '',
    title: '',
    mediaName: 'Antara',
    commodities: props.commodity,
    commodityScope: 'specific',
    relatedCountries: '',
    summary: '',
    url: '',
    sentiment: 'positive',
    sentimentScore: '0.50',
  }
}

const form = ref<ArticleFormState>(emptyForm())

const selectedPeriodLabel = computed(() =>
  periodInput.value === 'all' ? 'Semua Periode' : formatPeriod(periodInput.value),
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredArticles.value.length / rowsPerPage.value)),
)

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value

  return filteredArticles.value.slice(start, start + rowsPerPage.value)
})

const showingFrom = computed(() =>
  filteredArticles.value.length === 0 ? 0 : (currentPage.value - 1) * rowsPerPage.value + 1,
)

const showingTo = computed(() =>
  Math.min(currentPage.value * rowsPerPage.value, filteredArticles.value.length),
)

const isEditing = computed(() => editingArticleId.value !== null)

const formTitle = computed(() =>
  isEditing.value ? 'Edit Artikel Berita' : 'Tambah Artikel Berita',
)

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

function formatPeriod(period: string): string {
  const date = new Date(`${period}-01T12:00:00Z`)

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
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

function handlePeriodPickerKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    periodPickerOpen.value = false
  }
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

function categoryLabel(category: NewsCategory): string {
  return CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category
}

function sentimentLabel(sentiment: SentimentLabel): string {
  return sentiment === 'positive' ? 'Positif' : 'Negatif'
}

function sentimentClasses(sentiment: SentimentLabel): string {
  return sentiment === 'positive'
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    : 'bg-orange-50 text-orange-700 ring-orange-200'
}

function categoryClasses(category: NewsCategory): string {
  const classes: Record<NewsCategory, string> = {
    commodity: 'bg-blue-50 text-blue-700',
    policy: 'bg-emerald-50 text-emerald-700',
    logistics: 'bg-orange-50 text-orange-700',
  }

  return classes[category]
}

function splitCommaSeparated(value: string): string[] {
  return [
    ...new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ]
}

async function loadAllArticles(): Promise<void> {
  availableArticles.value = await searchArticles.execute({
    period: 'all',
    mediaName: 'all',
    category: 'all',
    query: '',
  })

  if (periodInput.value === 'all') {
    const periods = availableArticles.value
      .map((article) => article.period)
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a))
    periodPickerYear.value = periods[0] ? Number(periods[0].slice(0, 4)) : new Date().getFullYear()
  } else {
    periodPickerYear.value = Number(periodInput.value.slice(0, 4))
  }
}

async function runSearch(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''

  try {
    filteredArticles.value = await searchArticles.execute(appliedFilters.value)

    currentPage.value = Math.min(
      currentPage.value,
      Math.max(1, Math.ceil(filteredArticles.value.length / rowsPerPage.value)),
    )
  } catch (error) {
    console.error('Gagal mencari artikel:', error)
    errorMessage.value = 'Artikel gagal dimuat. Silakan coba kembali.'
  } finally {
    isLoading.value = false
  }
}

function handleSearch(): void {
  periodPickerOpen.value = false

  // Filter sumber berita dan kategori disembunyikan dari UI,
  // sehingga pencarian tetap mencakup seluruh media dan kategori.
  // Field mediaName dan category tetap dikirim untuk menjaga kontrak SearchArticleFilters.
  appliedFilters.value = {
    period: periodInput.value,
    mediaName: 'all',
    category: 'all',
    query: queryInput.value.trim(),
    commodity: props.commodity,
  }

  currentPage.value = 1
  feedbackMessage.value = ''

  void runSearch()
}

function resetFilters(): void {
  periodInput.value = 'all'
  periodPickerOpen.value = false
  const periods = availableArticles.value
    .map((article) => article.period)
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))
  periodPickerYear.value = periods[0] ? Number(periods[0].slice(0, 4)) : new Date().getFullYear()
  queryInput.value = ''

  handleSearch()
}

function openCreateForm(): void {
  editingArticleId.value = null
  form.value = emptyForm()
  errorMessage.value = ''
  feedbackMessage.value = ''
  isFormOpen.value = true
}

function openEditForm(article: NewsArticle): void {
  editingArticleId.value = article.id

  form.value = {
    publishedAt: article.publishedAt,
    category: article.category,
    searchKeywords: article.searchKeywords.join(', '),
    title: article.title,
    mediaName: article.mediaName,
    commodities: article.commodities.join(', '),
    commodityScope: article.commodityScope,
    relatedCountries: article.relatedCountries.join(', '),
    summary: article.summary,
    url: article.url,
    sentiment: article.sentiment,
    sentimentScore: String(article.sentimentScore),
  }

  errorMessage.value = ''
  feedbackMessage.value = ''
  isFormOpen.value = true
}

function closeForm(): void {
  if (isSaving.value) return

  isFormOpen.value = false
  editingArticleId.value = null
  form.value = emptyForm()
}

async function refreshAfterMutation(message: string): Promise<void> {
  isFormOpen.value = false
  editingArticleId.value = null
  feedbackMessage.value = message

  await loadAllArticles()
  await runSearch()
}

async function submitForm(): Promise<void> {
  if (isSaving.value) return

  errorMessage.value = ''

  const commodities = splitCommaSeparated(form.value.commodities)

  if (form.value.commodityScope === 'specific' && commodities.length === 0) {
    errorMessage.value = 'Isi minimal satu komoditas atau pilih cakupan lintas komoditas.'
    return
  }

  const score = Number(form.value.sentimentScore)

  if (!Number.isFinite(score) || score < -1 || score > 1) {
    errorMessage.value = 'Skor sentimen harus berada di antara -1 dan +1.'
    return
  }

  const publishedAt = form.value.publishedAt

  const payload: NewArticleInput = {
    publishedAt,
    period: publishedAt.slice(0, 7),
    category: form.value.category,
    searchKeywords: splitCommaSeparated(form.value.searchKeywords),
    title: form.value.title.trim(),
    mediaName: form.value.mediaName.trim(),
    commodities,
    commodityScope: form.value.commodityScope,
    relatedCountries: splitCommaSeparated(form.value.relatedCountries),
    summary: form.value.summary.trim(),
    url: form.value.url.trim(),
    sentiment: form.value.sentiment,
    sentimentScore: score,
  }

  isSaving.value = true

  try {
    if (editingArticleId.value) {
      const article: NewsArticle = {
        ...payload,
        id: editingArticleId.value,
      }

      await updateArticle.execute(article)

      await refreshAfterMutation('Artikel berhasil diperbarui.')
    } else {
      await createArticle.execute(payload)

      await refreshAfterMutation('Artikel berhasil ditambahkan.')
    }
  } catch (error) {
    console.error('Gagal menyimpan artikel:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Artikel gagal disimpan.'
  } finally {
    isSaving.value = false
  }
}

async function handleDelete(article: NewsArticle): Promise<void> {
  const confirmed = window.confirm(
    `Hapus artikel "${article.title}"? Tindakan ini tidak dapat dibatalkan.`,
  )

  if (!confirmed) return

  errorMessage.value = ''
  feedbackMessage.value = ''

  try {
    await deleteArticle.execute(article.id)

    await loadAllArticles()
    await runSearch()

    feedbackMessage.value = 'Artikel berhasil dihapus.'
  } catch (error) {
    console.error('Gagal menghapus artikel:', error)

    errorMessage.value = error instanceof Error ? error.message : 'Artikel gagal dihapus.'
  }
}

onMounted(async () => {
  document.addEventListener('pointerdown', handlePeriodPickerOutsideClick)
  document.addEventListener('keydown', handlePeriodPickerKeydown)

  isLoading.value = true

  try {
    await loadAllArticles()
    await runSearch()
  } catch (error) {
    console.error('Gagal menginisialisasi halaman artikel:', error)
    errorMessage.value = 'Data artikel gagal dimuat.'
  } finally {
    isLoading.value = false
  }

  if (props.autoCreate) {
    openCreateForm()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePeriodPickerOutsideClick)
  document.removeEventListener('keydown', handlePeriodPickerKeydown)
})
</script>

<template>
  <div class="space-y-5">
    <!-- Feedback -->
    <div
      v-if="feedbackMessage"
      role="status"
      class="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
    >
      <AppIcon name="circle-check" class="mt-0.5 h-4 w-4 shrink-0" />
      <p>{{ feedbackMessage }}</p>
    </div>

    <div
      v-if="errorMessage && !isFormOpen"
      role="alert"
      class="flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800"
    >
      <AppIcon name="circle-alert" class="mt-0.5 h-4 w-4 shrink-0" />
      <p>{{ errorMessage }}</p>
    </div>

    <!-- Panel filter lengkap: dipakai pada halaman Manajemen Artikel Berita -->
    <section
      v-if="!props.compactSearch"
      class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-6"
    >
      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-base font-semibold text-slate-900">Filter dan pencarian</h2>
          <p class="mt-1 text-xs text-slate-500">Cari berdasarkan judul atau nama komoditas.</p>
        </div>

        <button
          v-if="props.canManage"
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-bps-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-bps-blue-dark focus:outline-none focus:ring-2 focus:ring-bps-blue/30"
          @click="openCreateForm"
        >
          <AppIcon name="plus" class="h-4 w-4" />
          Tambah Artikel
        </button>
      </div>

      <form class="grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="handleSearch">
        <div ref="periodPickerRoot" class="relative">
          <label for="article-period-trigger" class="mb-2 block text-xs font-medium text-slate-600">
            Periode
          </label>

          <button
            id="article-period-trigger"
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
          <label for="article-query" class="mb-2 block text-xs font-medium text-slate-600">
            Judul atau komoditas
          </label>

          <div class="relative">
            <AppIcon
              name="search"
              :size="16"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="article-query"
              v-model="queryInput"
              type="search"
              placeholder="Contoh: nikel, beras..."
              class="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
            />
          </div>
        </div>

        <div
          class="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <label for="article-rows" class="mr-3 text-xs font-medium text-slate-600">
              Baris per halaman
            </label>

            <select
              id="article-rows"
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
              Cari Artikel
            </button>
          </div>
        </div>
      </form>
    </section>

    <!-- Satu search bar: dipakai pada pop-up Daftar dan Kelola Artikel -->
    <section
      v-if="props.compactSearch"
      class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30 sm:p-5"
    >
      <form class="flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="handleSearch">
        <div class="flex-1">
          <label for="article-query" class="mb-2 block text-xs font-medium text-slate-600">
            Cari artikel
          </label>

          <div class="relative">
            <AppIcon
              name="search"
              :size="16"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="article-query"
              v-model="queryInput"
              type="search"
              placeholder="Contoh: kebijakan, logistik, beras..."
              class="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            @click="resetFilters"
          >
            Reset
          </button>

          <button
            type="submit"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-bps-blue px-5 py-2.5 text-sm font-semibold text-bps-blue transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-bps-blue/30"
          >
            <AppIcon name="search" class="h-4 w-4" />
            Cari
          </button>
        </div>
      </form>
    </section>

    <!-- Result table -->
    <section
      class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30"
    >
      <div
        class="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <div>
          <h2 class="text-base font-semibold text-slate-900">
            {{ props.canManage ? 'Daftar dan Kelola Artikel' : 'Daftar Artikel' }}
            <span v-if="props.commodity" class="text-bps-blue">&mdash; {{ props.commodity }}</span>
          </h2>
          <p class="mt-1 text-xs text-slate-500">
            {{ formatNumber(filteredArticles.length) }} artikel ditemukan
          </p>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="flex items-center justify-center gap-3 p-12 text-sm text-slate-500"
      >
        <AppIcon name="loader" class="h-5 w-5 animate-spin text-bps-blue" />
        Memuat artikel...
      </div>

      <div
        v-else
        :class="props.compactSearch ? 'overflow-x-hidden' : 'overflow-x-auto'"
      >
        <table
          :class="[
            'border-collapse text-left text-sm',
            props.compactSearch
              ? 'compact-article-table w-full min-w-0 table-fixed'
              : 'w-full min-w-[1650px]',
          ]"
        >
          <colgroup v-if="props.compactSearch && props.canManage">
            <col style="width: 7%" />
            <col style="width: 7%" />
            <col style="width: 8%" />
            <col style="width: 17%" />
            <col style="width: 8%" />
            <col style="width: 8%" />
            <col style="width: 8%" />
            <col style="width: 15%" />
            <col style="width: 6%" />
            <col style="width: 6%" />
            <col style="width: 4%" />
            <col style="width: 6%" />
          </colgroup>
          <colgroup v-else-if="props.compactSearch">
            <col style="width: 7%" />
            <col style="width: 7%" />
            <col style="width: 8%" />
            <col style="width: 19%" />
            <col style="width: 8%" />
            <col style="width: 8%" />
            <col style="width: 8%" />
            <col style="width: 17%" />
            <col style="width: 6%" />
            <col style="width: 7%" />
            <col style="width: 5%" />
          </colgroup>
          <thead class="bg-slate-50 text-xs font-semibold text-slate-500">
            <tr>
              <th class="whitespace-nowrap px-4 py-4">Tanggal</th>
              <th class="whitespace-nowrap px-4 py-4">Kategori</th>
              <th class="px-4 py-4">Kata Kunci</th>
              <th class="min-w-64 px-4 py-4">Judul Berita</th>
              <th class="whitespace-nowrap px-4 py-4">Media</th>
              <th class="min-w-48 px-4 py-4">Komoditas</th>
              <th class="min-w-40 px-4 py-4">Negara Terkait</th>
              <th class="min-w-72 px-4 py-4">Ringkasan</th>
              <th class="px-4 py-4">Tautan</th>
              <th class="whitespace-nowrap px-4 py-4">Sentimen</th>
              <th class="whitespace-nowrap px-4 py-4">Skor</th>

              <th v-if="props.canManage" class="whitespace-nowrap px-4 py-4">Aksi</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="article in paginatedArticles"
              :key="article.id"
              class="align-top transition hover:bg-slate-100"
            >
              <td class="whitespace-nowrap px-4 py-4 text-slate-600">
                {{ formatDate(article.publishedAt) }}
              </td>

              <td class="px-4 py-4">
                <span
                  :class="[
                    'inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium',
                    categoryClasses(article.category),
                  ]"
                >
                  {{ categoryLabel(article.category) }}
                </span>
              </td>

              <td class="max-w-44 px-4 py-4 text-xs leading-5 text-slate-600">
                {{ article.searchKeywords.join(', ') || '—' }}
              </td>

              <td class="px-4 py-4">
                <p class="max-w-sm font-semibold leading-5 text-slate-800">
                  {{ article.title }}
                </p>
                <p class="mt-1 text-[11px] text-slate-400">ID: {{ article.id }}</p>
              </td>

              <td class="min-w-0 break-words whitespace-normal px-4 py-4 text-slate-600">
                {{ article.mediaName }}
              </td>

              <td class="min-w-0 break-words whitespace-normal px-4 py-4 text-xs leading-5 text-slate-600">
                <template v-if="article.commodityScope === 'cross_commodity'">
                  <p>Lintas Komoditas</p>
                </template>

                <template v-else-if="article.commodities.length > 0">
                  <p>{{ article.commodities.join(', ') }}</p>
                </template>

                <template v-else>
                  <span class="text-slate-400">—</span>
                </template>
              </td>

              <td class="px-4 py-4 text-xs leading-5 text-slate-600">
                {{ article.relatedCountries.join(', ') || '—' }}
              </td>

              <td class="px-4 py-4 text-xs leading-5 text-slate-600">
                <p class="max-w-sm">
                  {{ article.summary || '—' }}
                </p>
              </td>

              <td class="px-4 py-4">
                <a
                  :href="article.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-bps-blue hover:text-bps-blue-dark hover:underline"
                >
                  Buka berita
                  <AppIcon name="external-link" class="h-3 w-3" />
                </a>
              </td>

              <td class="px-4 py-4">
                <span
                  :class="[
                    'inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
                    sentimentClasses(article.sentiment),
                  ]"
                >
                  {{ sentimentLabel(article.sentiment) }}
                </span>
              </td>

              <td class="whitespace-nowrap px-4 py-4 font-semibold tabular-nums text-slate-700">
                {{ article.sentimentScore.toFixed(2) }}
              </td>

              <td v-if="props.canManage" class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    :aria-label="`Edit ${article.title}`"
                    title="Edit artikel"
                    class="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-bps-blue transition hover:bg-blue-100"
                    @click="openEditForm(article)"
                  >
                    <AppIcon name="pencil" class="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    :aria-label="`Hapus ${article.title}`"
                    title="Hapus artikel"
                    class="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-100 bg-orange-50 text-orange-700 transition hover:bg-orange-100"
                    @click="handleDelete(article)"
                  >
                    <AppIcon name="trash" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!isLoading && paginatedArticles.length === 0">
              <td :colspan="props.canManage ? 12 : 11" class="px-6 py-16 text-center">
                <div
                  class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"
                >
                  <AppIcon name="search" class="h-5 w-5" />
                </div>

                <p class="mt-4 text-sm font-semibold text-slate-800">Artikel tidak ditemukan</p>

                <p class="mt-1 text-xs text-slate-500">
                  Coba ubah periode atau kata kunci pencarian.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        class="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <p class="text-xs text-slate-500">
          Menampilkan
          <span class="font-semibold text-slate-700"> {{ showingFrom }}–{{ showingTo }} </span>
          dari
          <span class="font-semibold text-slate-700">
            {{ formatNumber(filteredArticles.length) }}
          </span>
          artikel
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

    <!-- Create / edit dialog -->
    <Teleport to="body">
      <div
        v-if="props.canManage && isFormOpen"
        class="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 p-3 backdrop-blur-[2px] sm:p-6"
        @click.self="closeForm"
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="article-form-title"
          class="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl shadow-slate-900/20"
        >
          <div
            class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4 sm:px-7"
          >
            <div>
              <h2 id="article-form-title" class="text-lg font-bold text-slate-900">
                {{ formTitle }}
              </h2>

              <p class="mt-1 text-xs text-slate-500">Lengkapi informasi artikel berita.</p>
            </div>

            <button
              type="button"
              aria-label="Tutup form"
              :disabled="isSaving"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
              @click="closeForm"
            >
              <AppIcon name="x" class="h-4 w-4" />
            </button>
          </div>

          <form class="space-y-6 p-5 sm:p-7" @submit.prevent="submitForm">
            <div
              v-if="errorMessage"
              role="alert"
              class="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800"
            >
              {{ errorMessage }}
            </div>

            <section class="space-y-4">
              <h3
                class="border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Informasi artikel
              </h3>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div class="md:col-span-2">
                  <label for="form-title" class="mb-2 block text-xs font-medium text-slate-600">
                    Judul artikel *
                  </label>

                  <input
                    id="form-title"
                    v-model="form.title"
                    required
                    maxlength="500"
                    class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
                    placeholder="Masukkan judul berita"
                  />
                </div>

                <div>
                  <label for="form-date" class="mb-2 block text-xs font-medium text-slate-600">
                    Tanggal publikasi *
                  </label>

                  <input
                    id="form-date"
                    v-model="form.publishedAt"
                    type="date"
                    required
                    class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
                  />

                  <p class="mt-1.5 text-[11px] text-slate-400">
                    Periode akan ditentukan otomatis berdasarkan tanggal.
                  </p>
                </div>

                <div>
                  <label for="form-media" class="mb-2 block text-xs font-medium text-slate-600">
                    Nama media *
                  </label>

                  <input
                    id="form-media"
                    v-model="form.mediaName"
                    required
                    maxlength="120"
                    class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
                    placeholder="Contoh: Antara"
                  />
                </div>

                <div>
                  <label for="form-category" class="mb-2 block text-xs font-medium text-slate-600">
                    Kategori fenomena *
                  </label>

                  <select
                    id="form-category"
                    v-model="form.category"
                    required
                    class="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
                  >
                    <option
                      v-for="option in CATEGORY_OPTIONS"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <label for="form-url" class="mb-2 block text-xs font-medium text-slate-600">
                    Link berita *
                  </label>

                  <input
                    id="form-url"
                    v-model="form.url"
                    type="url"
                    required
                    class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </section>

            <section class="space-y-4">
              <h3
                class="border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Klasifikasi
              </h3>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div class="md:col-span-2">
                  <label for="form-keywords" class="mb-2 block text-xs font-medium text-slate-600">
                    Kata kunci pencarian
                  </label>

                  <input
                    id="form-keywords"
                    v-model="form.searchKeywords"
                    class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
                    placeholder="Pisahkan kata kunci dengan koma"
                  />
                </div>

                <div>
                  <label for="form-scope" class="mb-2 block text-xs font-medium text-slate-600">
                    Cakupan komoditas *
                  </label>

                  <select
                    id="form-scope"
                    v-model="form.commodityScope"
                    required
                    class="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
                  >
                    <option value="specific">Komoditas spesifik</option>
                    <option value="cross_commodity">Lintas komoditas</option>
                  </select>
                </div>

                <div>
                  <label
                    for="form-commodities"
                    class="mb-2 block text-xs font-medium text-slate-600"
                  >
                    Nama komoditas
                  </label>

                  <input
                    id="form-commodities"
                    v-model="form.commodities"
                    :required="form.commodityScope === 'specific'"
                    class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
                    placeholder="Misalnya: Nikel, CPO"
                  />
                </div>

                <div class="md:col-span-2">
                  <label for="form-countries" class="mb-2 block text-xs font-medium text-slate-600">
                    Negara terkait
                  </label>

                  <input
                    id="form-countries"
                    v-model="form.relatedCountries"
                    class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
                    placeholder="Pisahkan nama negara dengan koma"
                  />
                </div>

                <div class="md:col-span-2">
                  <label for="form-summary" class="mb-2 block text-xs font-medium text-slate-600">
                    Ringkasan berita *
                  </label>

                  <textarea
                    id="form-summary"
                    v-model="form.summary"
                    required
                    rows="4"
                    maxlength="3000"
                    class="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
                    placeholder="Tuliskan ringkasan berita..."
                  />
                </div>
              </div>
            </section>

            <section class="space-y-4">
              <h3
                class="border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Analisis sentimen
              </h3>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label for="form-sentiment" class="mb-2 block text-xs font-medium text-slate-600">
                    Sentimen *
                  </label>

                  <select
                    id="form-sentiment"
                    v-model="form.sentiment"
                    required
                    class="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
                  >
                    <option value="positive">Positif</option>
                    <option value="negative">Negatif</option>
                  </select>
                </div>

                <div>
                  <label for="form-score" class="mb-2 block text-xs font-medium text-slate-600">
                    Skor sentimen (-1 sampai +1) *
                  </label>

                  <input
                    id="form-score"
                    v-model="form.sentimentScore"
                    type="number"
                    min="-1"
                    max="1"
                    step="0.01"
                    required
                    class="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
                  />
                </div>
              </div>

              <p class="text-xs leading-relaxed text-slate-400">
                Data sentimen pada prototipe ini diisi secara manual. Nantinya skor akan berasal
                dari proses analisis yang ditetapkan.
              </p>
            </section>

            <div
              class="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"
            >
              <button
                type="button"
                :disabled="isSaving"
                class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                @click="closeForm"
              >
                Batal
              </button>

              <button
                type="submit"
                :disabled="isSaving"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-bps-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-bps-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                <AppIcon
                  :name="isSaving ? 'loader' : 'check'"
                  :class="['h-4 w-4', isSaving ? 'animate-spin' : '']"
                />
                {{ isSaving ? 'Menyimpan...' : 'Simpan Artikel' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </Teleport>
  </div>
</template>


<style scoped>
/* Pop-up daftar artikel: pertahankan seluruh kolom dalam lebar modal. */
.compact-article-table {
  width: 100%;
  table-layout: fixed;
}

.compact-article-table th,
.compact-article-table td {
  min-width: 0 !important;
  max-width: none;
  padding: 0.7rem 0.45rem;
  overflow-wrap: anywhere;
  word-break: normal;
  vertical-align: top;
}

.compact-article-table th {
  white-space: normal !important;
  line-height: 1.35;
}

.compact-article-table td {
  line-height: 1.45;
}

/* Media and Komoditas must wrap inside their own fixed-width columns. */
.compact-article-table td:nth-child(5),
.compact-article-table td:nth-child(6) {
  white-space: normal !important;
  overflow-wrap: anywhere;
}

.compact-article-table a {
  white-space: normal;
  overflow-wrap: anywhere;
}

@media (max-width: 1280px) {
  .compact-article-table th,
  .compact-article-table td {
    padding: 0.55rem 0.35rem;
    font-size: 0.7rem;
  }
}
</style>
