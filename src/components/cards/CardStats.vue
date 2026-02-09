<template>
  <q-card class="table-bg q-pa-md no-shadow" bordered>
    <q-card-section class="">
      <q-btn round unelevated color="primary" :icon="icon" />
    </q-card-section>
    <!-- <q-item>
      <q-item-section avatar>
        <q-avatar>
        </q-avatar>
      </q-item-section>
    </q-item> -->

    <q-separator />
    <q-card-section>
      <div class="text-subtitle1">
        {{ title }}
      </div>
      <div class="text-h4 text-weight-bolder">
        {{ value }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  title: String,
  icon: String,
  value: [String, Number]
})
</script>
