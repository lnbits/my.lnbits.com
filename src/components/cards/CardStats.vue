<template>
  <q-card class="table-bg stat-card no-shadow" bordered>
    <div class="row items-center justify-between no-wrap q-gutter-sm">
      <div class="stat-title">{{ title }}</div>
      <q-icon :name="icon" color="primary" size="20px" />
    </div>
    <div class="stat-value">{{ value }}</div>
  </q-card>
</template>

<script setup>
defineProps({
  title: String,
  icon: String,
  value: [String, Number]
})
</script>
