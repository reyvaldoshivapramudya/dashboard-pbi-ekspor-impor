<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'
import { getArticleChanges } from '@/app/container'
import type {
  ArticleChange,
  ArticleChangeAction,
} from '@/features/articles/domain/entities/article-change'

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

const changes = ref<ArticleChange[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const selectedAction = ref<'all' | ArticleChangeAction>('all')
const selectedPeriod = ref('all')
const periodPickerOpen = ref(false)
const periodPickerYear = ref(new Date().getFullYear())
const periodPickerRoot = ref<HTMLElement | null>(null)

const availablePeriods = computed(() =>
  [...new Set(changes.value.map((change) => getPeriodKey(change.changedAt)))].sort((a, b) =>
    b.localeCompare(a),
  ),
)

const filteredChanges = computed(() =>
  changes.value.filter((change) => {
    const matchesAction =
      selectedAction.value === 'all' || change.action === selectedAction.value
    const matchesPeriod =
      selectedPeriod.value === 'all' || getPeriodKey(change.changedAt) === selectedPeriod.value

    return matchesAction && matchesPeriod
  }),
)

const actionLabels: Record<ArticleChangeAction, string> = {
  created: 'Ditambahkan',
  updated: 'Diubah',
  deleted: 'Dihapus',
}

const actionStyles: Record<ArticleChangeAction, string> = {
  created: 'bg-emerald-50 text-emerald-700',
  updated: 'bg-blue-50 text-bps-blue-dark',
  deleted: 'bg-orange-50 text-orange-700',
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getPeriodKey(value: string): string {
  const date = new Date(value)
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${date.getFullYear()}-${month}`
}

function formatPeriod(period: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${period}-01T12:00:00Z`))
}

function syncPeriodPickerYear(): void {
  const latest = availablePeriods.value[0]

  periodPickerYear.value =
    selectedPeriod.value === 'all'
      ? latest === undefined
        ? new Date().getFullYear()
        : Number(latest.slice(0, 4))
      : Number(selectedPeriod.value.slice(0, 4))
}

function isPeriodMonthSelected(month: string): boolean {
  return selectedPeriod.value === `${periodPickerYear.value}-${month}`
}

function selectPeriodMonth(month: string): void {
  selectedPeriod.value = `${periodPickerYear.value}-${month}`
  periodPickerOpen.value = false
}

function selectAllPeriods(): void {
  selectedPeriod.value = 'all'
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

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && periodPickerOpen.value) {
    periodPickerOpen.value = false
  }
}

async function loadChanges(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''

  try {
    changes.value = await getArticleChanges.execute()
    syncPeriodPickerYear()
  } catch (error) {
    console.error('Gagal memuat riwayat perubahan artikel:', error)
    errorMessage.value = 'Riwayat perubahan gagal dimuat.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('pointerdown', handlePeriodPickerOutsideClick)
  void loadChanges()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('pointerdown', handlePeriodPickerOutsideClick)
})
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-xl border border-slate-200 bg-white p-6 sm:p-7">
      <div class="flex items-start gap-3">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-bps-blue">
          <AppIcon name="history" :size="21" />
        </div>
        <div>
          <h1 class="text-lg font-semibold tracking-tight text-slate-900">Riwayat Perubahan</h1>
          <p class="mt-1 text-sm leading-relaxed text-slate-500">
            Catatan aktivitas tambah, ubah, dan hapus artikel oleh Admin.
          </p>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="flex flex-wrap items-end gap-2">
          <span class="mb-2 block w-full text-xs font-medium text-slate-600">Jenis perubahan</span>
          <button
            v-for="filter in [
              { value: 'all', label: 'Semua' },
              { value: 'created', label: 'Ditambahkan' },
              { value: 'updated', label: 'Diubah' },
              { value: 'deleted', label: 'Dihapus' },
            ]"
            :key="filter.value"
            type="button"
            :class="[
              'rounded-lg px-3 py-2 text-sm font-medium transition',
              selectedAction === filter.value
                ? 'bg-bps-blue text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100',
            ]"
            @click="selectedAction = filter.value as 'all' | ArticleChangeAction"
          >
            {{ filter.label }}
          </button>
        </div>

        <div ref="periodPickerRoot" class="relative">
          <label for="article-changes-period-trigger" class="mb-2 block text-xs font-medium text-slate-600">
            Periode
          </label>

          <button
            id="article-changes-period-trigger"
            type="button"
            aria-haspopup="dialog"
            :aria-expanded="periodPickerOpen"
            class="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
            @click="periodPickerOpen = !periodPickerOpen"
          >
            <span>{{ selectedPeriod === 'all' ? 'Semua Periode' : formatPeriod(selectedPeriod) }}</span>
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
      </div>
    </section>

    <section class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div v-if="isLoading" class="flex items-center justify-center gap-3 p-12 text-sm text-slate-500">
        <AppIcon name="loader" class="h-5 w-5 animate-spin text-bps-blue" />
        Memuat riwayat...
      </div>

      <div v-else-if="errorMessage" class="p-6 text-sm text-orange-800">
        {{ errorMessage }}
      </div>

      <div v-else-if="filteredChanges.length === 0" class="p-12 text-center">
        <AppIcon name="history" class="mx-auto h-8 w-8 text-slate-300" />
        <p class="mt-3 text-sm font-medium text-slate-700">Belum ada riwayat perubahan.</p>
        <p class="mt-1 text-xs text-slate-500">Aktivitas Admin akan muncul di halaman ini.</p>
      </div>

      <div v-else class="divide-y divide-slate-100">
        <article
          v-for="change in filteredChanges"
          :key="change.id"
          class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        >
          <div class="flex min-w-0 items-start gap-3">
            <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
              <AppIcon
                :name="change.action === 'created' ? 'plus' : change.action === 'updated' ? 'pencil' : 'trash'"
                :size="16"
              />
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-800">{{ change.articleTitle }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ formatDate(change.changedAt) }}</p>
            </div>
          </div>
          <span
            :class="[
              'inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold',
              actionStyles[change.action],
            ]"
          >
            {{ actionLabels[change.action] }}
          </span>
        </article>
      </div>
    </section>
  </div>
</template>
