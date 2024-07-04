<template tag="a" :href="`/identities/${name}`">
  <a :href="`/identities/${name}`">
    <q-card class="nostr-card no-shadow" bordered>
      <q-card-section class="text-center">
        <q-avatar size="100px" class="shadow-10">
          <NostrHeadIcon color="blue-grey-4" />
          <!-- <img :src="avatar"> -->
        </q-avatar>
      </q-card-section>

      <q-card-section class="q-pt-none text-center">
        <div class="text-h6 text-grey-8">
          {{ name }}
        </div>
        <div class="text-caption text-grey-8 ellipsis">
          {{ pubkey }}
        </div>
      </q-card-section>
    </q-card>
  </a>
</template>

<script setup>
import NostrHeadIcon from "components/NostrHeadIcon.vue";

defineProps(["name", "pubkey", "time"]);
</script>

<style scoped lang="scss">
.id-card {
}
</style>
