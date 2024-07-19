<template v-if="loaded">
  <q-page class="q-pa-sm container">
    <div class="q-gutter-md">
      <q-breadcrumbs class="text-grey-4 q-mb-lg" active-color="secondary">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Indentities" to="/identities" />
        <q-breadcrumbs-el :label="user_details.name" />
      </q-breadcrumbs>
    </div>
    <q-card class="nostr-card" bordered v-if="!user_details.name">
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
    </q-card>
    <q-card v-else class="nostr-card text-white no-shadow q-mb-xl" bordered>
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
      <q-card-section class="q-pa-sm">
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
                class=""
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

      <q-card-actions align="right">
        <q-btn
          disabled
          label="Renew"
          class="text-capitalize"
          rounded
          color="secondary"
          text-color="primary"
        >
          <!-- todo: make this true -->
          <q-tooltip>Can renew six months before expiration date.</q-tooltip>
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

const user_details = ref({});
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
      message: "Changes saved!",
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
  if (name) {
    const identifier = await getUserIdentifier(name);
    if (identifier) {
      user_details.value = identifier;
      refreshProfileFromNostr();
      return;
    }
  }
  return $router.push({ path: "/identities" });
});
</script>
