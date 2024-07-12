<template>
  <router-link
    :to="{
      path: `/identities/${name}`,
      query: { },
    }"
  >
    <!-- <a :href="`/identities/${name}`"> -->
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
          <!-- <img v-if="profile && profile.picture" :src="profile.picture" /> -->
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
    <!-- </a> -->
  </router-link>
</template>

<script setup>
// import { useNostrStore } from "src/stores/nostr";
import NostrHeadIcon from "components/NostrHeadIcon.vue";

// const $nostr = useNostrStore();

const props = defineProps(["name", "pubkey", "time", "profile"]);

// const userProfile = $nostr.profiles.get(props.pubkey) || null;
</script>

<style scoped lang="scss">
.id-card {
}
</style>
