<template>
  <q-page class="instances-page q-pa-sm">
    <instances-table service="relay" />
  </q-page>
</template>

<script setup>
import InstancesTable from 'components/tables/InstancesTable.vue'
</script>

<style scoped>
.instances-page {
  padding-bottom: 7rem;
}
</style>
