<template>
  <q-page class="q-pa-sm container">
    <div class="q-gutter-md">
      <q-breadcrumbs class="text-grey-4 q-mb-lg" active-color="secondary">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Indentities" to="/identities" />
        <q-breadcrumbs-el :label="user_details.name" />
      </q-breadcrumbs>
    </div>
    <q-card class="nostr-card text-white no-shadow" bordered>
      <q-card-section>
        <q-list dark class="row">
          <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <q-item-section>
              <div>
                <div class="text-h6">Identifier</div>
                <div class="text-subtitle2">
                  Edit your NIP05 identifier for nostr.com
                </div>
              </div>
            </q-item-section>
            <q-item-section side>
              <q-btn
                type="a"
                :href="`https://metadata.nostr.com?pubkey=${user_details.pubkey}`"
                target="_blank"
                label="Edit Nostr Profile"
                class="text-capitalize"
                rounded
                color="secondary"
                text-color="primary"
              ></q-btn>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-section class="q-pa-sm">
        <q-list dark class="row">
          <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <q-item-section side>
              <q-avatar size="100px">
                <q-img
                  v-if="user_details.picture"
                  :src="user_details.picture"
                  spinner-color="secondary"
                  spinner-size="52px"
                  :ratio="1"
                />
                <!-- <img v-if="user_details.picture" :src="user_details.picture" /> -->
                <NostrHeadIcon v-else color="secondary" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ user_details.name }}</q-item-label>
              <q-item-label caption>{{ user_details.pubkey }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input
                dark
                standout
                v-model="user_details.pubkey"
                label="Public Key"
                hint="Public key associated with this identifier. Hex or Npub format."
              />
            </q-item-section>
          </q-item>

          <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12 q-mt-lg">
            <q-item-section>
              <q-input
                dark
                standout
                v-model="addRelayValue"
                @keydown.enter="addRelayFn"
                type="text"
                label="wss://relay....."
                hint="Add a relay"
              >
                <q-btn @click="addRelayFn" dense flat icon="add"></q-btn>
              </q-input>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-section>
        <div class="q-mt-md">
          <q-chip
            v-for="relay in user_details.relays"
            :key="relay"
            class="nostr-card"
            removable
            @remove="removeRelayFn(relay)"
            color="primary"
            text-color="white"
          >
            <span v-text="relay"></span>
          </q-chip>
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-ma-md">
        <q-list dark class="row">
          <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <q-item-section>
              <q-btn
                @click="updateUserIdentifier"
                rounded
                class="text-capitalize"
                color="secondary"
                text-color="primary"
                label="Update NIP05"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useNostrStore } from "src/stores/nostr";
import { saas } from "boot/saas";
import NostrHeadIcon from "components/NostrHeadIcon.vue";

const $q = useQuasar();
const $route = useRoute();
const $router = useRouter();

const $nostr = useNostrStore();
const props = defineProps(["name"]);

const user_details = ref({});
const addRelayValue = ref("");

const addRelayFn = () => {
  if (!addRelayValue.value) return;
  if (user_details.value.relays.includes(addRelayValue.value)) return;
  user_details.value.relays.push(addRelayValue.value);
  addRelayValue.value = "";
};

const removeRelayFn = (relay) => {
  user_details.value.relays = user_details.value.relays.filter(
    (r) => r !== relay
  );
};

const updateUserIdentifier = async () => {
  try {
    const { data } = await saas.updateIdentity(user_details.value.id, {
      pubkey: user_details.value.pubkey,
      relays: user_details.value.relays,
    });
    user_details.value = saas.mapAddressToProfile(data);
    $q.notify({
      message: "Changes saved!",
      color: "positive",
    });
  } catch (error) {
    console.error(error);
    $q.notify({
      message: "Failed to update identifer!",
      color: "negative",
      icon: "warning",
    });
  }
};

const getUserIdentifier = async (id) => {
  try {
    const { data } = await saas.getUsrIdentities(id);

    if (data.length !== 1) {
      return;
    }

    const address = data[0];
    return saas.mapAddressToProfile(address);
  } catch (error) {
    console.error("error", error);
  }
};

onMounted(async () => {
  const name = $route.params["name"];
  if (name) {
    const identifier = await getUserIdentifier(name);
    if (identifier) {
      user_details.value = identifier;
      return;
    }
  }
  return $router.push({ path: "/identities" });
});
</script>
