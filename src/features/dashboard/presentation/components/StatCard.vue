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
    class="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-sm font-medium text-slate-500">
          {{ title }}
        </p>

        <p class="mt-3 wrap-break-word text-3xl font-bold tracking-tight text-slate-900">
          {{ value }}
        </p>
      </div>

      <div
        :class="[
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          accentClasses.icon,
        ]"
      >
        <AppIcon :name="icon" class="h-5 w-5" />
      </div>
    </div>

    <p class="mt-4 text-xs leading-relaxed text-slate-500">
      {{ description }}
    </p>

    <div :class="['absolute inset-x-0 bottom-0 h-1', accentClasses.indicator]" />
  </article>
</template>
