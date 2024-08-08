<template v-if="loaded">
  <q-page class="container">
    <div class="q-gutter-md">
      <q-breadcrumbs class="text-grey-4 q-mb-lg" active-color="secondary">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Identities" to="/identities" />
        <q-breadcrumbs-el :label="user_details.name" />
      </q-breadcrumbs>
    </div>
    <q-card class="nostr-card text-white no-shadow q-mb-xl" bordered>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey q-pa-sm"
        active-color="secondary"
        indicator-color="secondary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="identifier" label="NIP05 Identifier" />
        <q-tab name="ln_address" label="Lightning Address" />
      </q-tabs>

      <q-separator />

      <q-tab-panels class="nostr-card" v-model="tab" animated>
        <q-tab-panel name="identifier" class="q-pa-none">
          <div v-if="!user_details.name">
            <q-item>
              <q-item-section avatar>
                <q-skeleton type="QAvatar" />
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  <q-skeleton type="text" />
                </q-item-label>
                <q-item-label caption>
                  <q-skeleton type="text" />
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-skeleton height="200px" square />
          </div>
          <div v-else>
            <q-card-section>
              <q-list dark class="row">
                <q-item class="col-12">
                  <q-item-section>
                    <div>
                      <div class="text-h6">
                        Identifier
                        <q-badge
                          class="nostr-card"
                          removable
                          color="primary"
                          text-color="white"
                          ><span v-if="user_details.active">Active</span>
                          <span v-else>Inactive</span>
                        </q-badge>
                      </div>

                      <div v-if="user_details.expiresAt" class="text-caption">
                        Expires at
                        <span
                          v-text="
                            new Date(
                              user_details.expiresAt * 1000
                            ).toLocaleDateString()
                          "
                        ></span>
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
            <q-card-section class="q-pa-sms">
              <q-list dark class="row">
                <q-item class="col-12">
                  <q-item-section side>
                    <q-avatar size="100px">
                      <q-img
                        v-if="user_details.picture"
                        :src="user_details.picture"
                        spinner-color="secondary"
                        spinner-size="52px"
                        :ratio="1"
                      />
                      <NostrHeadIcon v-else color="secondary" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ user_details.name }}</q-item-label>
                    <q-item-label caption class="ellipsis"
                      >{{ user_details.pubkey }}
                    </q-item-label>
                    <q-item-label>
                      <q-btn
                        :to="`/pubkey/${user_details.pubkey}`"
                        rounded
                        class="text-capitalize q-mt-sm"
                        color="secondary"
                        text-color="primary"
                        label="View all"
                        size="sm"
                        ><q-tooltip
                          >View all NIP05 identities associated with this public
                          key</q-tooltip
                        ></q-btn
                      >
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item class="col-12">
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
                <q-item class="col-12 q-mt-lg">
                  <q-item-section>
                    <q-input
                      dark
                      standout
                      v-model="addRelayValue"
                      @keydown.enter="addRelayFn(addRelayValue)"
                      type="url"
                      label="wss://relay....."
                      hint="Add a relay"
                    >
                      <q-btn
                        @click="addRelayFn(addRelayValue)"
                        dense
                        flat
                        icon="add"
                      ></q-btn>
                      <template v-slot:after> </template>
                    </q-input>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
            <q-card-section class="q-ml-sm">
              <div>
                <q-btn
                  @click="refreshRelaysFromNostr"
                  rounded
                  color="secondary"
                  text-color="primary"
                  size="sm"
                  >Add Relays from Nostr Profile</q-btn
                >
              </div>
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

            <q-separator color="secondary"></q-separator>

            <q-card-actions align="right" class="q-pa-md">
              <q-btn
                disabled
                label="Renew"
                class="text-capitalize"
                rounded
                color="secondary"
                text-color="primary"
              >
                <!-- todo: make this true -->
                <q-tooltip
                  >Can renew six months before expiration date.</q-tooltip
                >
              </q-btn>
              <q-btn
                @click="updateUserIdentifier"
                rounded
                class="text-capitalize"
                color="secondary"
                text-color="primary"
                label="Update NIP05"
              />
            </q-card-actions>
          </div>
        </q-tab-panel>

        <q-tab-panel name="ln_address" class="q-pa-none">
          <div class="text-h6 q-pa-md">
            <span v-text="user_details.name"></span>@nostr.com
          </div>
          <q-card-section>
            <div class="row q-mt-sm">
              <div class="col">
                <q-select
                  color="secondary"
                  outlined
                  dark
                  map-options
                  hint="Funds will be sent to this wallet"
                  label="Select Wallet"
                  v-model="selectedWallet"
                  :options="userWallets"
                ></q-select>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 col-12 q-mt-lg q-pr-lg">
                <q-input
                  dark
                  standout
                  type="number"
                  label="Min Sats"
                  min="1"
                  max="maxSats"
                  step="1"
                  hint="Minimum required amount."
                  v-model="user_details.ln_address.min"
                />
              </div>
              <div class="col-md-6 col-12 q-mt-lg">
                <q-input
                  dark
                  standout
                  type="number"
                  label="Max Sats"
                  min="1"
                  step="1"
                  hint="Maximum allowed amount."
                  v-model="user_details.ln_address.max"
                />
              </div>
            </div>
          </q-card-section>
          <q-separator color="secondary"></q-separator>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              @click="updateUserLNaddress"
              rounded
              class="text-capitalize"
              color="secondary"
              text-color="primary"
              label="Update LN Address"
            />
          </q-card-actions>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNostrStore } from "src/stores/nostr";

import { saas } from "boot/saas";
import NostrHeadIcon from "components/NostrHeadIcon.vue";

const $q = useQuasar();
const $router = useRouter();
const $route = useRoute();
const $nostr = useNostrStore();

const props = defineProps(["name"]);

const tab = ref("identifier");
const user_details = ref({});
const userWallets = ref([]);
const selectedWallet = ref(null);

const addRelayValue = ref("");

watch(
  () => $nostr.initiated,
  () => refreshProfileFromNostr()
);

const validateWsURL = (wsUrl) => {
  let url = null;
  try {
    url = new URL(wsUrl);
  } catch {}
  if (!url) {
    try {
      wsUrl = `wss://${wsUrl}`;
      url = new URL(wsUrl);
    } catch {}
  }
  if (!url || (url.protocol !== "ws:" && url.protocol !== "wss:")) {
    throw new Error("Protocol must be 'ws://' or 'wss://'");
  }

  return wsUrl;
};

const addRelayFn = (relay) => {
  if (!relay) return;

  try {
    const wsUrl = validateWsURL(relay);
    if (user_details.value.relays.includes(wsUrl)) return;

    user_details.value.relays.push(wsUrl);
  } catch (error) {
    $q.notify({
      message: "Invalid relay URL",
      caption: `${error}`,
      textColor: "black",
      color: "warning",
    });
  } finally {
    addRelayValue.value = "";
  }
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
    refreshProfileFromNostr();
    $q.notify({
      message: "Updated Identifier!",
      color: "positive",
    });
  } catch (error) {
    console.error(error);
    $q.notify({
      message: "Failed to update identifer!",
      caption: error.response?.data?.detail,
      color: "negative",
    });
  }
};

const updateUserLNaddress = async () => {
  try {
    if (!selectedWallet.value) {
      $q.notify({
        message: "Please select an wallet!",
        color: "warning",
      });
      return;
    }
    await saas.updateLNaddress(user_details.value.id, {
      wallet: selectedWallet.value.value,
      min: user_details.value.ln_address.min,
      max: user_details.value.ln_address.max,
    });

    $q.notify({
      message: "Lighting Address updated!",
      color: "positive",
    });
  } catch (error) {
    console.error(error);
    $q.notify({
      message: "Failed to update Lightning Address!",
      caption: error.response?.data?.detail,
      color: "negative",
    });
  }
};

const getUserIdentifier = async (id) => {
  try {
    const { data } = await saas.getUserIdentities({ localPart: id });

    if (data.length !== 1) {
      return;
    }
    const address = data[0];
    return saas.mapAddressToProfile(address);
  } catch (error) {
    console.error("error", error);
    $q.notify({
      message: `Failed to fetch identifier '${id}'!`,
      caption: error.response?.data?.detail,
      color: "negative",
    });
  }
};

const getAccountDetails = async () => {
  try {
    const { data } = await saas.getAccountDetails();

    const wallets = data.wallets.map((w) => ({
      label: w.name,
      value: w.id,
    }));
    userWallets.value = wallets;
  } catch (error) {
    console.error(error);
    $q.notify({
      message: "Failed to get user wallets!",
      caption: error.response?.data?.detail,
      color: "negative",
    });
  }
};

function refreshRelaysFromNostr() {
  const profile = $nostr.profiles.get(user_details.value.pubkey);
  if (profile) {
    user_details.value.picture = profile.picture;
    (profile.relays || []).forEach((r) => addRelayFn(r));
  }
}

function refreshProfileFromNostr() {
  const profile = $nostr.profiles.get(user_details.value.pubkey);
  if (profile) {
    user_details.value.picture = profile.picture;
  }
}

onMounted(async () => {
  const name = props.name || $route.params.name;
  if (!name) {
    return $router.push({ path: "/identities" });
  }
  const identifier = await getUserIdentifier(name);

  await getAccountDetails();
  if (identifier) {
    user_details.value = identifier;
    selectedWallet.value = userWallets.value.find(
      (w) => w.value === identifier.ln_address.wallet
    );
    refreshProfileFromNostr();
    return;
  }
});
</script>
