<template>
  <q-page class="q-pa-sm container">
    <div class="q-gutter-md">
      <q-breadcrumbs class="text-grey-4 q-mb-lg" active-color="secondary">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Identities" to="/identities" />
        <q-breadcrumbs-el label="Pubkey" />
      </q-breadcrumbs>
    </div>
    <div class="row">
      <div
        v-for="identity in identities"
        class="q-pa-sm col-xs-12 col-sm-6 col-md-4 col-lg-3"
      >
        <CardProfile
          :name="identity.local_part"
          :pubkey="identity.pubkey"
          :time="identity.time"
          :profile="$nostr.profiles.get(identity.pubkey)"
        ></CardProfile>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { saas } from "boot/saas"; // keeping this here for future use (API call)
import { useQuasar } from "quasar";
import { useNostrStore } from "src/stores/nostr";

import CardProfile from "components/cards/CardProfile.vue";

const $q = useQuasar();
const $nostr = useNostrStore();

const props = defineProps(["pubkey"]);

const identities = ref([]);

watch(
  () => $nostr.initiated,
  () => refreshFromNostr()
);

function refreshFromNostr() {
  if (!props.pubkey) {
    $q.notify({
      type: "negative",
      message: "No pubkey provided",
    });
    $router.push("/identities");
  }
  const ids = $nostr.getIdsFromPubkey(props.pubkey);
  identities.value = ids;
}

onMounted(async () => {
  refreshFromNostr();
});
</script>
