<template>
  <q-page class="q-pa-sm">
    <div class="hero" :class="$store.showCard ? 'hero-result' : 'hero-empty'">
      <div class="pitch text-center text-secondary">
        <h1 class="text-h2 text-bold">Your @nostr.com Identity</h1>
        <p class="text-h6">
          <span>Nostr Identifier</span> |
          <span class="cursor-pointer">Nostr Market</span> |
          <span>Nostr Relay</span> |
          <span> LN Address</span>
        </p>
      </div>
      <q-input
        dark
        standout
        autofocus
        rounded
        v-model.trim="handle"
        class="input q-pa-lg"
        placeholder="@nostr.com"
        hint="Powered by LNbits"
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
      <div class="nip-list" v-if="$store.showCard">
        <CardItem
          :name="$store.handle"
          :data="$store.handleData"
          :close="$store.resetHandle"
          :action="handleBuy"
        />
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { saas } from "src/boot/saas";
import { useQuasar } from "quasar";
import { useAppStore } from "src/stores/store";
import { useRouter, useRoute } from "vue-router";

import NostrHeadIcon from "components/NostrHeadIcon.vue";
import CardItem from "components/cards/CardItem.vue";

const $q = useQuasar();
const $store = useAppStore();
const $router = useRouter();
const $route = useRoute()

const handle = ref("");

const handleSearch = async () => {
  try {
    if (!handle.value) {
      return;
    }
    const { data } = await saas.queryIdentifier(handle.value);
    $store.handle = handle.value;
    $store.handleData = data;
  } catch (error) {
    console.error("Error searching for identifier: ", error);
    $q.notify({
      message: "There was a problem while searching",
      color: "negative",
      position: "top",
      timeout: 2000,
    });
  } finally {
    $router.push({ query: { q: handle.value }})
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
    $router.push({ path: "/identities" });
  }, 500);
};

if ($route.query["q"]) {
  handle.value = $route.query["q"]
  handleSearch()
}
</script>

<style lang="scss">
.my-card {
  max-width: 800px;
  margin: 0 auto;
}
.hero-empty {
  margin-bottom: 8rem;
}
.hero-result {
  margin-bottom: 2rem;
}
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 5rem;
  // padding-bottom: 3rem;
  // min-height: 61.8vh;
  // height: 100%;
  box-sizing: content-box;
  // padding: 5rem 0 6.875rem;

  .pitch {
    width: 80%;
    margin-bottom: 4rem;
  }

  .input {
    margin-bottom: 3rem;
    width: 80%;
    max-width: 800px;
  }
  .nip-list {
    width: 80%;
    max-width: 800px;
    margin: 0 auto 5rem auto;
    background: rgba(255, 255, 255, 0.1);
  }
}

.dot-nostr {
  .video {
    display: none;
  }
}

.index-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 5rem;

  .sidebar {
    display: none;
    grid-area: sidebar;
  }

  .main {
    grid-area: main;
    width: 100%;
  }

  .info {
    display: none;
    grid-area: info;
  }
}
@media (min-width: $breakpoint-md-min) {
  .dot-nostr {
    .video {
      display: block;
      align-self: center;
    }
  }
  .index-content {
    display: grid;
    gap: 3rem;
    grid-template-areas: "sidebar main";
    grid-template-columns: minmax(0, 1fr) minmax(0, 2.5fr);

    .sidebar {
      display: flex;
      align-self: start;
      padding-top: unset;
    }
  }
}
@media (min-width: $breakpoint-lg-min) {
  .index-content {
    gap: 3rem;
    grid-template-areas: "sidebar main info";
    grid-template-columns: minmax(0, 1fr) minmax(0, 2.5fr) minmax(0, 15rem);

    .info {
      display: flex;
      align-self: start;
    }
  }
}
</style>
