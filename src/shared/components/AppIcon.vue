<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  Database,
  ExternalLink,
  File,
  FilePenLine,
  FilePlus,
  Globe,
  History,
  Info,
  LoaderCircle,
  Menu,
  Package,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ThumbsUp,
  Trash2,
  X,
} from '@lucide/vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    name: string
    size?: number
    strokeWidth?: number
  }>(),
  {
    size: 18,
    strokeWidth: 2,
  },
)

const icons: Record<string, Component> = {
  activity: Activity,
  'bar-chart': BarChart3,
  bell: Bell,
  calendar: CalendarDays,
  check: Check,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'circle-alert': CircleAlert,
  'circle-check': CircleCheck,
  'circle-help': CircleHelp,
  database: Database,
  'external-link': ExternalLink,
  file: File,
  'file-edit': FilePenLine,
  'file-plus': FilePlus,
  globe: Globe,
  history: History,
  info: Info,
  loader: LoaderCircle,
  menu: Menu,
  package: Package,
  pencil: Pencil,
  play: Play,
  plus: Plus,
  refresh: RefreshCw,
  search: Search,
  sliders: SlidersHorizontal,
  'thumbs-up': ThumbsUp,
  trash: Trash2,
  x: X,
}

const resolvedIcon = computed(() => icons[props.name] ?? CircleHelp)
</script>

<template>
  <component
    :is="resolvedIcon"
    v-bind="$attrs"
    :size="size"
    :stroke-width="strokeWidth"
    aria-hidden="true"
  />
</template>
