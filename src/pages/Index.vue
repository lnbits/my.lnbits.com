<template>
  <q-page class="q-pa-sm">
    <div class="hero">
      <div class="pitch text-center text-secondary">
        <h1 class="text-h2 text-bold">Your @nostr.com Identity</h1>
        <p class="text-h6">Nostr Identifier | Nostr Relay | LN Address</p>
      </div>
      <q-input
        dark
        standout
        autofocus
        rounded
        v-model.trim="handle"
        class="input q-pa-lg"
        placeholder="@nostr.com"
        label-color="blue-grey-4"
        :input-style="{ fontSize: '22px' }"
        @keydown.enter.prevent="handleSearch"
      >
        <template v-slot:prepend>
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
            class="text-capitalize"
          />
        </template>
      </q-input>
    </div>
    <div class="nip-list" v-if="$store.showCard">
      <CardItem
        :name="$store.handle"
        :data="$store.handleData"
        :close="$store.resetHandle"
        :action="handleBuy"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { saas } from "src/boot/saas";
import { useQuasar } from "quasar";
import { useAppStore } from "src/stores/store";
import { useRouter } from "vue-router";

import NostrHeadIcon from "components/NostrHeadIcon.vue";
import CardItem from "components/cards/CardItem.vue";

const $q = useQuasar();
const $store = useAppStore();
const $router = useRouter();

const handle = ref("");

const handleSearch = async () => {
  try {
    const { data } = await saas.queryIdentifier(handle.value);
    $store.handle = handle.value;
    $store.handleData = data;
  } catch (error) {
    console.error("Error searching for identifier: ", error);
  } finally {
    handle.value = "";
  }
};
const handleBuy = () => {
  if (!$store.isLoggedIn) {
    $q.notify({
      message: "Please login to buy",
      color: "negative",
      position: "top",
      timeout: 2000,
    });
  }
  $store.buying = true;
  setTimeout(() => {
    $router.push({ path: "/profile" });
  }, 500);
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
.nip-list {
  margin-top: 2rem;
  width: 80%;
  max-width: 700px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
}
</style>
