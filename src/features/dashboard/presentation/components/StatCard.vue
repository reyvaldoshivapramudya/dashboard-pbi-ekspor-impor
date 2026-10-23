<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'

type Accent = 'blue' | 'green' | 'orange'

const props = withDefaults(
  defineProps<{
    title: string
    value: string | number
    description: string
    icon: string
    accent?: Accent
    badge?: string
  }>(),
  {
    accent: 'blue',
  },
)

const accentClasses = computed(() => {
  const styles = {
    blue: {
      icon: 'bg-blue-50 text-bps-blue',
      indicator: 'bg-bps-blue',
    },
    green: {
      icon: 'bg-emerald-50 text-bps-green',
      indicator: 'bg-bps-green',
    },
    orange: {
      icon: 'bg-orange-50 text-bps-orange',
      indicator: 'bg-bps-orange',
    },
  }

  return styles[props.accent]
})
</script>

<template>
  <article
    class="relative overflow-hidden rounded-xl border border-blue-100 bg-white p-3 shadow-sm shadow-blue-950/[0.04] transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
  >
    <div class="flex min-w-0 items-center gap-2.5">
      <div
        :class="[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          accentClasses.icon,
        ]"
      >
        <AppIcon :name="icon" class="h-5 w-5" />
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold leading-4 text-slate-800">{{ title }}</p>
        <div class="mt-0.5 flex min-w-0 items-center justify-between gap-2">
          <p class="wrap-break-word text-2xl font-extrabold leading-none tracking-tight text-[#11194e]">
            {{ value }}
          </p>
          <span
            v-if="badge"
            class="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600"
          >
            {{ badge }}
          </span>
        </div>
        <p class="mt-1 text-[10px] leading-tight text-slate-500">{{ description }}</p>
      </div>
    </div>

    <div :class="['absolute inset-x-0 bottom-0 h-[3px]', accentClasses.indicator]" />
  </article>
</template>
