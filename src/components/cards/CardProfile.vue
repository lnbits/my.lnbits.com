<template>
  <router-link
    :to="{
      path: `/identities/${name}`,
    }"
  >
    <q-card class="nostr-card no-shadow" bordered>
      <q-card-section class="text-center">
        <q-avatar color="blue-grey-4" size="100px" class="shadow-10">
          <q-img
            v-if="profile && profile.picture"
            :src="profile.picture"
            spinner-color="secondary"
            spinner-size="52px"
            :ratio="1"
          />
          <NostrHeadIcon v-else color="primary" />
        </q-avatar>
      </q-card-section>

      <q-card-section class="q-pt-none text-center text-white">
        <div class="text-h6">
          {{ name }}
        </div>
        <div class="text-caption ellipsis">
          {{ pubkey }}
        </div>
      </q-card-section>
    </q-card>
  </router-link>
</template>

<script setup>
import NostrHeadIcon from "components/NostrHeadIcon.vue";

const props = defineProps(["name", "pubkey", "time", "profile"]);
</script>

<style scoped lang="scss"></style>
