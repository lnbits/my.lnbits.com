<template>
  <q-page class="q-pa-sm">
    <!-- <q-card class="my-card"> -->
    <div class="hero">
      <div class="pitch text-center text-secondary">
        <h1 class="text-h2 text-bold">Get your Nostr Indentifier</h1>
        <p class="text-h6">
          Simplifying Nostr keys into easy-to-read handles, like @username for
          social media.
        </p>
      </div>
      <q-input
        dark
        rounded
        v-model.trim="handle"
        class="input"
        label="Find and buy a nostr.com handle"
        label-color="blue-grey-4"
        suffix="@nostr.com"
      >
        <template v-slot:before>
          <NostrHeadIcon color="blue-grey-4" />
        </template>
        <template v-slot:append>
          <q-btn
            rounded
            unelevated
            text-color="primary"
            color="secondary"
            label="Search"
            @click="handleSearch"
          />
        </template>
      </q-input>
    </div>
    <!-- </q-card> -->
  </q-page>
</template>

<script setup>
import { ref } from "vue";

import NostrHeadIcon from "components/NostrHeadIcon.vue";

const handle = ref("");

const handleSearch = () => {
  console.log("Searching for handle: ", handle.value);
};
</script>

<style lang="scss">
.my-card {
  max-width: 800px;
  margin: 0 auto;
}
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6.875rem 0 6.875rem;

  .pitch {
    width: 80%;
    margin-bottom: 4rem;
  }

  .input {
    width: 80%;
    max-width: 800px;
  }
}
</style>
