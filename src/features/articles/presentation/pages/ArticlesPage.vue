<script setup lang="ts">
import CommodityOverviewTable from '@/features/article-management/presentation/components/CommodityOverviewTable.vue'
</script>

<template>
  <!-- Tampilan sama seperti Manajemen Artikel Berita, tanpa fitur kelola (CRUD). -->
  <CommodityOverviewTable :can-manage="false" />
</template>
