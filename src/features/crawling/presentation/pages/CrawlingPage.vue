<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { getCrawlHistory, runCrawlSimulation } from '@/app/container'
import AppIcon from '@/shared/components/AppIcon.vue'

import type { CrawlRun, CrawlStatus } from '@/features/crawling/domain/entities/crawl-run'

const NEWS_MEDIA_SOURCES = [
  'Antara',
  'CNBC Indonesia',
  'DetikFinance',
  'Liputan6',
  'SINDOnews',
  'Bisnis.com',
  'Tribun',
]

interface PeriodOption {
  label: string
  value: string
}

function getCurrentPeriod(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  return `${now.getFullYear()}-${month}`
}

function buildPeriodOptions(): PeriodOption[] {
  const now = new Date()
  const options: PeriodOption[] = []

  for (let offset = 0; offset < 12; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)

    const value = `${date.getFullYear()}-` + `${String(date.getMonth() + 1).padStart(2, '0')}`

    const label = new Intl.DateTimeFormat('id-ID', {
      month: 'long',
      year: 'numeric',
    }).format(date)

    options.push({ label, value })
  }

  return options
}

const currentPeriod = getCurrentPeriod()

const periodOptions = computed(() => buildPeriodOptions())

const selectedPeriod = ref(currentPeriod)
const selectedMedia = ref<string[]>([...NEWS_MEDIA_SOURCES])

const history = ref<CrawlRun[]>([])

const isLoadingHistory = ref(true)
const isRunning = ref(false)

const errorMessage = ref('')
const feedbackMessage = ref('')

const currentPeriodLabel = computed(() => {
  const option = periodOptions.value.find((item) => item.value === currentPeriod)

  return option?.label ?? currentPeriod
})

const selectedPeriodLabel = computed(() => {
  const option = periodOptions.value.find((item) => item.value === selectedPeriod.value)

  return option?.label ?? selectedPeriod.value
})

const currentPeriodHasSuccessfulRun = computed(() =>
  history.value.some((run) => run.period === currentPeriod && run.status === 'success'),
)

const successfulRunsCount = computed(
  () => history.value.filter((run) => run.status === 'success').length,
)

const totalArticlesAdded = computed(() =>
  history.value
    .filter((run) => run.status === 'success')
    .reduce((total, run) => total + run.articlesAdded, 0),
)

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

function formatDateTime(value: string | null): string {
  if (!value) return '—'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value))
}

function formatPeriod(period: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${period}-01T12:00:00Z`))
}

function statusLabel(status: CrawlStatus): string {
  const labels: Record<CrawlStatus, string> = {
    running: 'Berjalan',
    success: 'Berhasil',
    failed: 'Gagal',
  }

  return labels[status]
}

function statusClasses(status: CrawlStatus): string {
  const classes: Record<CrawlStatus, string> = {
    running: 'bg-blue-50 text-bps-blue ring-blue-200',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    failed: 'bg-orange-50 text-orange-700 ring-orange-200',
  }

  return classes[status]
}

function toggleMedia(mediaName: string): void {
  if (selectedMedia.value.includes(mediaName)) {
    selectedMedia.value = selectedMedia.value.filter((item) => item !== mediaName)
    return
  }

  selectedMedia.value = [...selectedMedia.value, mediaName]
}

function selectAllMedia(): void {
  selectedMedia.value = [...NEWS_MEDIA_SOURCES]
}

function clearSelectedMedia(): void {
  selectedMedia.value = []
}

async function loadHistory(): Promise<void> {
  isLoadingHistory.value = true

  try {
    history.value = await getCrawlHistory.execute()
  } catch (error) {
    console.error('Gagal memuat riwayat crawling:', error)
    errorMessage.value = 'Riwayat crawling gagal dimuat.'
  } finally {
    isLoadingHistory.value = false
  }
}

async function startCrawling(
  period = selectedPeriod.value,
  mediaNames = selectedMedia.value,
): Promise<void> {
  if (isRunning.value) return

  if (mediaNames.length === 0) {
    errorMessage.value = 'Pilih setidaknya satu portal berita sebelum memulai.'
    return
  }

  isRunning.value = true
  errorMessage.value = ''
  feedbackMessage.value = ''

  try {
    const pendingRun = runCrawlSimulation.execute({
      period,
      mediaNames: [...mediaNames],
    })

    // Memuat status "running" sebelum simulasi selesai.
    await loadHistory()

    const result = await pendingRun

    await loadHistory()

    if (result.status === 'success') {
      feedbackMessage.value = result.message
    } else {
      errorMessage.value = result.message
    }
  } catch (error) {
    console.error('Gagal menjalankan simulasi crawling:', error)

    errorMessage.value =
      error instanceof Error ? error.message : 'Simulasi crawling gagal dijalankan.'
  } finally {
    isRunning.value = false
  }
}

function startCurrentPeriodCrawl(): void {
  selectedPeriod.value = currentPeriod
  selectedMedia.value = [...NEWS_MEDIA_SOURCES]

  void startCrawling(currentPeriod, [...NEWS_MEDIA_SOURCES])
}

onMounted(() => {
  void loadHistory()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Current-period reminder -->
    <section
      v-if="!currentPeriodHasSuccessfulRun"
      class="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm"
    >
      <div class="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div class="flex items-start gap-3">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-bps-orange"
          >
            <AppIcon name="bell" class="h-5 w-5" />
          </div>

          <div>
            <span
              class="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700"
            >
              Pengingat periode
            </span>

            <h2 class="mt-2 text-base font-semibold text-slate-900">
              Belum ada crawling berhasil untuk {{ currentPeriodLabel }}
            </h2>

            <p class="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
              Jalankan simulasi untuk seluruh portal agar contoh artikel periode saat ini masuk ke
              dataset dashboard.
            </p>
          </div>
        </div>

        <button
          type="button"
          :disabled="isRunning"
          class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-bps-orange px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          @click="startCurrentPeriodCrawl"
        >
          <AppIcon
            :name="isRunning ? 'loader' : 'play'"
            :class="['h-5 w-5', isRunning ? 'animate-spin' : '']"
          />
          Crawl Bulan Ini
        </button>
      </div>
    </section>

    <section v-else class="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
      <div class="flex items-start gap-3">
        <AppIcon name="circle-check" class="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

        <div>
          <h2 class="text-sm font-semibold text-emerald-900">
            Periode {{ currentPeriodLabel }} sudah memiliki crawling berhasil
          </h2>

          <p class="mt-1 text-xs leading-relaxed text-emerald-800">
            Kamu tetap dapat menjalankan simulasi ulang. Artikel dengan URL yang sama akan dilewati
            sebagai duplikat.
          </p>
        </div>
      </div>
    </section>

    <!-- Notifications -->
    <div
      v-if="feedbackMessage"
      role="status"
      class="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
    >
      <AppIcon name="circle-check" class="mt-0.5 h-4 w-4 shrink-0" />
      <p>{{ feedbackMessage }}</p>
    </div>

    <div
      v-if="errorMessage"
      role="alert"
      class="flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800"
    >
      <AppIcon name="circle-alert" class="mt-0.5 h-4 w-4 shrink-0" />
      <p>{{ errorMessage }}</p>
    </div>

    <!-- Run summary -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm font-medium text-slate-500">Total Eksekusi Berhasil</p>
          <AppIcon name="circle-check" class="h-5 w-5 text-bps-green" />
        </div>

        <p class="mt-3 text-3xl font-bold text-slate-900">
          {{ formatNumber(successfulRunsCount) }}
        </p>

        <p class="mt-2 text-xs text-slate-500">Berdasarkan riwayat simulasi.</p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm font-medium text-slate-500">Portal Berita Tersedia</p>
          <AppIcon name="globe" class="h-5 w-5 text-bps-blue" />
        </div>

        <p class="mt-3 text-3xl font-bold text-slate-900">
          {{ NEWS_MEDIA_SOURCES.length }}
        </p>

        <p class="mt-2 text-xs text-slate-500">Portal yang dapat dipilih pada prototipe.</p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm font-medium text-slate-500">Artikel Ditambahkan</p>
          <AppIcon name="file-plus" class="h-5 w-5 text-bps-orange" />
        </div>

        <p class="mt-3 text-3xl font-bold text-slate-900">
          {{ formatNumber(totalArticlesAdded) }}
        </p>

        <p class="mt-2 text-xs text-slate-500">
          Total penambahan yang tercatat pada riwayat berhasil.
        </p>
      </article>
    </section>

    <!-- Crawling configuration -->
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div class="mb-6 flex items-start gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-bps-blue"
        >
          <AppIcon name="sliders" class="h-5 w-5" />
        </div>

        <div>
          <h2 class="text-base font-semibold text-slate-900">Konfigurasi Crawling</h2>

          <p class="mt-1 text-sm text-slate-500">
            Tentukan periode dan portal berita untuk simulasi.
          </p>
        </div>
      </div>

      <div class="max-w-md">
        <label for="crawl-period" class="mb-2 block text-xs font-medium text-slate-600">
          Periode target
        </label>

        <select
          id="crawl-period"
          v-model="selectedPeriod"
          :disabled="isRunning"
          class="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15 disabled:bg-slate-50"
        >
          <option v-for="option in periodOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="mb-3 mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-800">Portal berita</h3>

          <p class="mt-1 text-xs text-slate-500">
            {{ selectedMedia.length }} dari {{ NEWS_MEDIA_SOURCES.length }} portal dipilih
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            :disabled="isRunning"
            class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            @click="selectAllMedia"
          >
            Pilih Semua
          </button>

          <button
            type="button"
            :disabled="isRunning"
            class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            @click="clearSelectedMedia"
          >
            Hapus Pilihan
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <label
          v-for="media in NEWS_MEDIA_SOURCES"
          :key="media"
          :class="[
            'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition',
            selectedMedia.includes(media)
              ? 'border-blue-200 bg-blue-50/60'
              : 'border-slate-200 bg-white hover:bg-slate-50',
            isRunning ? 'cursor-not-allowed opacity-60' : '',
          ]"
        >
          <input
            type="checkbox"
            :checked="selectedMedia.includes(media)"
            :disabled="isRunning"
            class="h-4 w-4 accent-[#1688c7]"
            @change="toggleMedia(media)"
          />

          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            :class="
              selectedMedia.includes(media)
                ? 'bg-white text-bps-blue'
                : 'bg-slate-100 text-slate-500'
            "
          >
            <AppIcon name="globe" class="h-4 w-4" />
          </span>

          <span class="text-sm font-medium text-slate-700">
            {{ media }}
          </span>

          <AppIcon
            v-if="selectedMedia.includes(media)"
            name="circle-check"
            class="ml-auto h-4 w-4 text-bps-blue"
          />
        </label>
      </div>

      <!-- Running status -->
      <div v-if="isRunning" class="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div class="flex items-center gap-3">
          <AppIcon name="loader" class="h-5 w-5 animate-spin text-bps-blue" />

          <div>
            <p class="text-sm font-semibold text-slate-800">Simulasi crawling sedang berjalan</p>

            <p class="mt-1 text-xs leading-relaxed text-slate-500">
              Menyiapkan artikel dummy untuk {{ selectedPeriodLabel }}. Proses ini tidak mengakses
              portal berita sungguhan.
            </p>
          </div>
        </div>
      </div>

      <div
        class="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="max-w-xl text-xs leading-relaxed text-slate-400">
          Setiap portal menghasilkan paling banyak satu artikel contoh pada simulasi ini. Artikel
          dengan URL yang sudah tercatat akan dilewati untuk mencegah duplikasi.
        </p>

        <button
          type="button"
          :disabled="isRunning || selectedMedia.length === 0"
          class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-bps-blue px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-bps-blue-dark focus:outline-none focus:ring-2 focus:ring-bps-blue/30 disabled:cursor-not-allowed disabled:opacity-50"
          @click="startCrawling()"
        >
          <AppIcon
            :name="isRunning ? 'loader' : 'play'"
            :class="['h-5 w-5', isRunning ? 'animate-spin' : '']"
          />

          {{ isRunning ? 'Sedang Berjalan...' : 'Mulai Crawling' }}
        </button>
      </div>
    </section>

    <!-- Crawl history -->
    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        class="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <div>
          <h2 class="text-base font-semibold text-slate-900">Riwayat Crawling</h2>

          <p class="mt-1 text-xs text-slate-500">
            Catatan eksekusi simulasi crawling yang tersimpan di browser.
          </p>
        </div>

        <button
          type="button"
          :disabled="isLoadingHistory || isRunning"
          class="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          @click="loadHistory"
        >
          <AppIcon
            :name="isLoadingHistory ? 'loader' : 'refresh'"
            :class="['h-4 w-4', isLoadingHistory ? 'animate-spin' : '']"
          />
          Muat Ulang
        </button>
      </div>

      <div
        v-if="isLoadingHistory"
        class="flex items-center justify-center gap-3 p-12 text-sm text-slate-500"
      >
        <AppIcon name="loader" class="h-5 w-5 animate-spin text-bps-blue" />
        Memuat riwayat...
      </div>

      <div v-else-if="history.length === 0" class="px-6 py-14 text-center">
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"
        >
          <AppIcon name="history" class="h-6 w-6" />
        </div>

        <p class="mt-4 text-sm font-semibold text-slate-800">Belum ada riwayat crawling</p>

        <p class="mt-1 text-xs text-slate-500">
          Jalankan simulasi pertama untuk mencatat riwayat di sini.
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[1050px] border-collapse text-left text-sm">
          <thead class="bg-slate-50 text-xs font-semibold text-slate-500">
            <tr>
              <th class="px-5 py-4">Waktu Mulai</th>
              <th class="px-5 py-4">Periode</th>
              <th class="px-5 py-4">Portal Dipilih</th>
              <th class="px-5 py-4">Artikel Ditemukan</th>
              <th class="px-5 py-4">Artikel Baru</th>
              <th class="px-5 py-4">Duplikat</th>
              <th class="px-5 py-4">Status</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="run in history"
              :key="run.id"
              class="align-top transition hover:bg-slate-50/70"
            >
              <td class="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                {{ formatDateTime(run.startedAt) }}
                <p class="mt-1 text-[10px] text-slate-400">ID: {{ run.id.slice(0, 8) }}</p>
              </td>

              <td class="whitespace-nowrap px-5 py-4 font-medium text-slate-700">
                {{ formatPeriod(run.period) }}
              </td>

              <td class="px-5 py-4">
                <div class="flex max-w-xs flex-wrap gap-1.5">
                  <span
                    v-for="media in run.mediaNames"
                    :key="media"
                    class="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600"
                  >
                    {{ media }}
                  </span>
                </div>
              </td>

              <td class="px-5 py-4 tabular-nums text-slate-600">
                {{ formatNumber(run.articlesFound) }}
              </td>

              <td class="px-5 py-4 font-semibold tabular-nums text-emerald-700">
                {{ formatNumber(run.articlesAdded) }}
              </td>

              <td class="px-5 py-4 tabular-nums text-slate-600">
                {{ formatNumber(run.duplicatesSkipped) }}
              </td>

              <td class="px-5 py-4">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
                    statusClasses(run.status),
                  ]"
                >
                  <span
                    v-if="run.status === 'running'"
                    class="h-1.5 w-1.5 animate-pulse rounded-full bg-current"
                  />
                  <AppIcon
                    v-else
                    :name="run.status === 'success' ? 'circle-check' : 'circle-alert'"
                    class="h-4 w-4"
                  />
                  {{ statusLabel(run.status) }}
                </span>

                <p
                  v-if="run.status !== 'running'"
                  class="mt-2 max-w-48 text-[11px] leading-relaxed text-slate-400"
                >
                  {{ run.message }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Prototype disclaimer -->
    <div class="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
      <AppIcon name="info" class="mt-0.5 h-4 w-4 shrink-0 text-bps-blue" />

      <p class="text-xs leading-relaxed text-slate-600">
        Halaman ini masih merupakan simulasi. Status berhasil hanya berarti pembuatan artikel dummy
        dan penyimpanan lokal berhasil, bukan bukti bahwa portal berita telah di-scrape atau
        diakses.
      </p>
    </div>
  </div>
</template>
