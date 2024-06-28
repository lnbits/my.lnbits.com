<template>
  <q-card class="no-shadow q-mb-sm" bordered>
    <q-item>
      <q-item-section avatar>
        <NostrHeadIcon color="blue-grey-4" size="md" />
      </q-item-section>

      <q-item-section>
        <q-item-label class="text-h6">{{ name }}</q-item-label>
        <q-item-label caption style="font-size: 20px" v-if="available">
          {{ price || "$100" }}
        </q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-btn
          v-if="available"
          label="buy"
          size="md"
          color="positive"
          class="text-capitalize"
        ></q-btn>
        <q-icon v-else name="close" color="negative" />
      </q-item-section>
    </q-item>
  </q-card>
</template>

<script setup>
defineProps(["name", "price", "available"]);

import NostrHeadIcon from "components/NostrHeadIcon.vue";
</script>

<style scoped></style>
