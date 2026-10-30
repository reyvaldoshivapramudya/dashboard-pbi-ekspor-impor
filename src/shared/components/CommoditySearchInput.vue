<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'
import { getSimilarCommodities } from '@/shared/utils/commodity-search'

const props = defineProps<{
  id: string
  modelValue: string
  placeholder: string
  commodities: string[]
  history: string[]
  suggestionLabel?: string
  historyLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  select: [value: string]
  removeHistory: [value: string]
}>()

const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const activeIndex = ref(-1)

const suggestions = computed(() => getSimilarCommodities(props.modelValue, props.commodities))
const visibleHistory = computed(() =>
  props.modelValue.trim() ? [] : props.history.slice(0, 5),
)
const selectableItems = computed(() =>
  suggestions.value.length > 0 ? suggestions.value : visibleHistory.value,
)
const isDropdownVisible = computed(
  () => isFocused.value && (suggestions.value.length > 0 || visibleHistory.value.length > 0),
)

function choose(value: string): void {
  activeIndex.value = -1
  emit('update:modelValue', value)
  isFocused.value = false
  emit('select', value)
}

function handleInput(event: Event): void {
  activeIndex.value = -1
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function clearSearch(): void {
  activeIndex.value = -1
  emit('update:modelValue', '')
  emit('select', '')
  input.value?.focus()
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown' && selectableItems.value.length > 0) {
    event.preventDefault()
    isFocused.value = true
    activeIndex.value = (activeIndex.value + 1) % selectableItems.value.length
  } else if (event.key === 'ArrowUp' && selectableItems.value.length > 0) {
    event.preventDefault()
    isFocused.value = true
    activeIndex.value =
      activeIndex.value <= 0 ? selectableItems.value.length - 1 : activeIndex.value - 1
  } else if (event.key === 'Enter' && activeIndex.value >= 0) {
    const selectedItem = selectableItems.value[activeIndex.value]
    if (selectedItem) {
      event.preventDefault()
      choose(selectedItem)
    }
  } else if (event.key === 'Escape') {
    isFocused.value = false
    activeIndex.value = -1
  }
}

function removeHistoryEntry(event: MouseEvent, entry: string): void {
  event.preventDefault()
  event.stopPropagation()
  emit('removeHistory', entry)
}

function handleFocusout(event: FocusEvent): void {
  const nextTarget = event.relatedTarget

  if (!(nextTarget instanceof Node) || !root.value?.contains(nextTarget)) {
    isFocused.value = false
  }
}
</script>

<template>
  <div ref="root" class="relative" @focusout="handleFocusout">
    <AppIcon
      name="search"
      :size="16"
      class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
    />

    <input
      ref="input"
      :id="props.id"
      :value="props.modelValue"
      type="text"
      :placeholder="props.placeholder"
      autocomplete="off"
      class="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm outline-none focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
      @input="handleInput"
      @focus="isFocused = true"
      @keydown="handleKeydown"
    />

    <button
      v-if="props.modelValue"
      type="button"
      :aria-label="`Hapus pencarian ${props.modelValue}`"
      title="Hapus pencarian"
      class="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-bps-blue/30"
      @mousedown.prevent
      @click="clearSearch"
    >
      <AppIcon name="x" :size="15" />
    </button>

    <div
      v-if="isDropdownVisible"
      role="group"
      :aria-label="`${props.suggestionLabel ?? 'Komoditas terkait'} dan ${props.historyLabel ?? 'Riwayat pencarian'}`"
      class="absolute left-0 right-0 top-full z-40 mt-1 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/10"
    >
      <template v-if="suggestions.length > 0">
        <p class="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {{ props.suggestionLabel ?? 'Komoditas terkait' }}
        </p>
        <div
          v-for="commodity in suggestions"
          :key="commodity"
          :class="[
            'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition',
            activeIndex === suggestions.indexOf(commodity)
              ? 'bg-blue-50 text-bps-blue'
              : 'hover:bg-blue-50 hover:text-bps-blue',
          ]"
        >
          <button
            type="button"
            class="flex min-w-0 flex-1 items-center gap-2 text-left"
            @mousedown.prevent
            @click="choose(commodity)"
          >
            <AppIcon name="search" :size="14" class="shrink-0 text-slate-400" />
            <span>{{ commodity }}</span>
          </button>
        </div>
      </template>

      <template v-if="visibleHistory.length > 0">
        <p class="border-t border-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {{ props.historyLabel ?? 'Riwayat pencarian' }}
        </p>
        <div
          v-for="entry in visibleHistory"
          :key="entry"
          :class="[
            'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-600 transition',
            activeIndex === visibleHistory.indexOf(entry)
              ? 'bg-slate-50'
              : 'hover:bg-slate-50',
          ]"
        >
          <button
            type="button"
            class="flex min-w-0 flex-1 items-center gap-2 text-left"
            @mousedown.prevent
            @click="choose(entry)"
          >
            <AppIcon name="history" :size="14" class="shrink-0 text-slate-400" />
            <span class="truncate">{{ entry }}</span>
          </button>
          <button
            type="button"
            :aria-label="`Hapus riwayat pencarian ${entry}`"
            title="Hapus riwayat pencarian"
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-bps-blue/30"
            @mousedown.prevent
            @click="removeHistoryEntry($event, entry)"
          >
            <AppIcon name="x" :size="14" />
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
