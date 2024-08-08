<template>
  <q-page class="q-pa-sm container">
    <div class="q-gutter-md">
      <q-breadcrumbs class="text-grey-4 q-mb-lg" active-color="secondary">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Identities" />
      </q-breadcrumbs>
    </div>
    <q-input
      dark
      standout
      rounded
      v-model.trim="filterText"
      class="input q-mb-lg"
      placeholder="Filter by identifier or public key"
      label-color="blue-grey-4"
      :input-style="{ fontSize: $q.screen.gt.sm ? '22px' : null }"
      @keydown.enter.prevent="handleSearch"
    >
      <template v-slot:prepend>
        <NostrHeadIcon color="blue-grey-4" />
      </template>

      <template v-slot:append>
        <q-btn
          v-if="filterText && identityNotOwned"
          rounded
          unelevated
          text-color="primary"
          color="secondary"
          label="Check Identity"
          @click="handleSearch"
          class="text-capitalize"
        />
      </template>

      <template v-slot:after>
        <q-btn
          @click="identitiesDisplay = !identitiesDisplay"
          unelevated
          text-color="secondary"
          color="primary"
          :icon="identitiesDisplay ? 'list' : 'grid_view'"
        />
      </template>

      <template v-slot:error> Failed to filer. </template>
    </q-input>

    <div
      v-if="newIdentity && newIdentity.identifier === filterText"
      class="nip-list"
    >
      <CardItem
        :name="newIdentity.identifier"
        :data="newIdentity"
        :action="handleBuy"
        :close="(newIdentity.value = null)"
      />
    </div>

    <div v-if="identitiesDisplay" class="id-card row q-mt-md">
      <div
        v-for="identity in filteredIdentities"
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
    <div v-else>
      <q-list
        v-for="identity in filteredIdentities"
        class="nostr-card no-shadow q-ma-sm"
        bordered
      >
        <q-item
          clickable
          v-ripple
          tag="a"
          :href="`/identities/${identity.local_part}`"
          class="q-py-md"
        >
          <q-item-section avatar>
            <q-avatar>
              <q-img
                v-if="
                  $nostr.profiles.has(identity.pubkey) &&
                  $nostr.profiles.get(identity.pubkey).picture
                "
                :src="$nostr.profiles.get(identity.pubkey).picture"
                spinner-color="secondary"
                spinner-size="52px"
                :ratio="1"
              />
              <NostrHeadIcon v-else color="blue-grey-4" />
            </q-avatar>
          </q-item-section>

          <q-item-section class="ellipsis">
            <q-item-label
              lines="1"
              class="text-weight-bold text-white q-mb-md"
              >{{ identity.local_part }}</q-item-label
            >
            <q-item-label caption lines="2">
              <span class="text-weight-bold text-white">Pubkey:</span>
              &nbsp;
              <span class="text-white">{{ identity.pubkey }}</span>
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            {{ timeFromNow(identity.time * 1000) }}
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { useAppStore } from "src/stores/store";
import { useNostrStore } from "src/stores/nostr";
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

const $router = useRouter();
import { saas } from "boot/saas";
import { timeFromNow } from "src/boot/utils";
import CardItem from "components/cards/CardItem.vue";

import NostrHeadIcon from "components/NostrHeadIcon.vue";
import CardProfile from "components/cards/CardProfile.vue";

const $q = useQuasar();
const $store = useAppStore();
const $nostr = useNostrStore();

const filterText = ref("");
const newIdentity = ref({});

const identities = ref([]);
const filteredIdentities = ref([]);
const identityNotOwned = ref(true);
const identitiesDisplay = ref(true);

const getIdentities = async () => {
  try {
    const { data } = await saas.getUserIdentities({ active: true });
    identities.value = data.filter((i) => i.active);
    data.forEach((i) => {
      $nostr.addPubkey(i.pubkey);
    });
    filteredIdentities.value = identities.value;
  } catch (error) {
    console.error("error", error);
  }
};

const filterIdentifier = (id, filter) => {
  if (!filterText.value) {
    return true;
  }
  if (id.local_part.toLowerCase().indexOf(filter) !== -1) {
    return true;
  }
  if (id.pubkey.toLowerCase().indexOf(filter) !== -1) {
    return true;
  }
  return false;
};

watch(filterText, (n, o) => {
  const filter = filterText.value.toLocaleLowerCase();
  filteredIdentities.value = identities.value.filter((id) =>
    filterIdentifier(id, filter)
  );
  identityNotOwned.value = !identities.value.find(
    (id) => id.local_part.toLowerCase() === filter
  );
});

const handleSearch = async () => {
  try {
    const { data } = await saas.queryIdentifier(filterText.value);
    newIdentity.value = data;
    if (data.available) {
      $q.notify({
        message: `${data.identifier} available`,
        color: "positive",
      });
    } else {
      $q.notify({
        message: `${data.identifier} not available`,
        color: "warning",
        textColor: "black",
      });
    }
  } catch (error) {
    console.error("Error searching for identifier: ", error);
  }
};

const handleBuy = () => {
  $store.newCartIdentifier = filterText;
  setTimeout(() => {
    $router.push({ path: "/cart" });
  }, 500);
};

onMounted(async () => {
  identities.value = [...$store.identities.values()];
  await getIdentities();
});
</script>

<style lang="scss">
.responsive {
  canvas {
    width: 100% !important;
    height: auto !important;
    object-fit: contain;
  }
}

.id-card a {
  text-decoration: none;
}
</style>
