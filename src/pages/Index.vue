<template>
  <q-page class="q-pa-sm">
    <div class="hero" :class="$store.showCard ? 'hero-result' : 'hero-empty'">
      <div class="pitch text-center text-secondary">
        <h1 class="text-bold" :class="$q.screen.gt.sm ? 'text-h2' : 'text-h3'">
          Your @nostr.com Identity
        </h1>
        <p class="text-h6 hero-links">
          <a href="/"><span>Nostr Identifier</span></a> |
          <a
            href="https://market.nostr.com"
            target="_blank"
            rel="noopener noreferrer"
            ><span>Nostr Market</span></a
          >
          |
          <a href="https://my.nostr.com/identities" rel="noopener noreferrer"
            ><span>LN Address</span></a
          >
          |
          <a href="https://my.nostr.com/identities" rel="noopener noreferrer"
            ><span>Zaps</span></a
          >
          |
          <span> Relay<q-tooltip>Available soon...</q-tooltip></span>
        </p>
      </div>
      <q-input
        dark
        standout
        autofocus
        rounded
        v-model.trim="handle"
        class="input q-pa-lg"
        :style="{ width: $q.screen.gt.sm ? '100%' : null }"
        placeholder="@nostr.com"
        hint="Powered by LNbits"
        label-color="blue-grey-4"
        :input-style="{
          fontSize: '22px',
        }"
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
      <div class="flex full-width justify-center" ref="nipCard">
        <div class="nip-list q-pa-lg" v-if="$store.showCard">
          <CardItem
            :name="$store.handle"
            :data="$store.handleData"
            :close="closeCard"
            :action="handleBuy"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { saas } from "src/boot/saas";
import { useQuasar, scroll } from "quasar";
import { useAppStore } from "src/stores/store";
import { useRouter, useRoute } from "vue-router";

import NostrHeadIcon from "components/NostrHeadIcon.vue";
import CardItem from "components/cards/CardItem.vue";

const $q = useQuasar();
const $store = useAppStore();
const $router = useRouter();
const $route = useRoute();
const { getScrollTarget, setVerticalScrollPosition } = scroll;

const handle = ref("");
const nipCard = ref(null);

const handleSearch = async () => {
  if (!handle.value) {
    return;
  }
  try {
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
    $router.push({ query: { q: handle.value } });
    const element = nipCard.value;
    scrollToElement(element);
  }
};
const handleBuy = () => {
  if (!$store.isLoggedIn) {
    $q.notify({
      message: "Please login to buy",
      color: "warning",
      textColor: "black",
    });
  }
  $store.buying = true;
  $store.newCartIdentifier = handle;
  $store.handle = "";
  setTimeout(() => {
    $router.push({ path: "/cart" });
  }, 500);
};

if ($route.query["q"]) {
  handle.value = $route.query["q"];
  handleSearch();
}

function scrollToElement(el) {
  const target = getScrollTarget(el);
  const offset = el.offsetTop;
  const duration = 500;
  setVerticalScrollPosition(target, offset, duration);
}

function closeCard() {
  $store.resetHandle();
  handle.value = "";
  $router.replace({ query: null });
}
</script>

<style lang="scss">
.my-card {
  max-width: 800px;
  margin: 0 auto;
}
.hero-links {
  a {
    text-decoration: none;
    color: inherit;
  }
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
  padding-top: 2.5rem;
  box-sizing: content-box;

  .pitch {
    width: 80%;
    margin-bottom: 4rem;
  }

  .input {
    margin-bottom: 3rem;
    max-width: 800px;
  }
  .nip-list {
    width: 100%;
    max-width: 800px;
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
