<template>
  <q-page class="q-pa-sm">
    <!-- <q-card class="my-card"> -->
    <div class="hero">
      <div class="pitch text-center text-secondary">
        <h1 class="text-h2 text-bold">Your @nostr Identity</h1>
        <p class="text-h6">
          Nostr Identifier | Nostr Relay | LN Address
        </p>
      </div>
      <q-input
        dark
        standout
        autofocus
        rounded
        v-model.trim="handle"
        class="input q-pa-lg"
        placeholder="@nostr"
        label-color="blue-grey-4"
        :input-style="{ fontSize: '30px' }"
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
    <div class="nip-list">
      <CardItem
        v-for="nip5 in [...nip5List.values()]"
        :name="nip5.local"
        :available="nip5.available"
      />
      <!-- <q-list dark v-if="nip5List.size">
        <q-item
          v-for="nip5 in [...nip5List.values()]"
          :key="nip5"
          clickable
          v-ripple
          @click="handle = nip5"
        >
          <q-item-section class="text-secondary">
            <q-item-label>{{ nip5.local }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              v-if="nip5.available"
              unelevated
              color="positive"
              label="Buy"
            />
            <q-btn v-else round unelevated color="negative" icon="close" />
          </q-item-section>
        </q-item>
      </q-list> -->
    </div>
    <!-- </q-card> -->
  </q-page>
</template>

<script setup>
import { ref, computed } from "vue";
import { saas } from "src/boot/saas";
import { useQuasar } from "quasar";

import NostrHeadIcon from "components/NostrHeadIcon.vue";
import CardItem from "components/cards/CardItem.vue";

const $q = useQuasar();

const handle = ref("");
const nip5List = new Map();

const handleSearch = async () => {
  if (nip5List.has(handle.value)) {
    return $q.notify({
      message: `Already searched ${handle.value}.`,
      color: "warning",
    });
  }
  try {
    const { data } = await saas.queryIdentifier(handle.value);
    console.log("data: ", data);
    nip5List.set(handle.value, { local: handle.value, ...data });
  } catch (error) {
    console.error("Error searching for identifier: ", error);
  } finally {
    handle.value = "";
  }
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
