<template v-if="loaded">
  <q-page class="q-pa-sm container">
    <div class="q-gutter-md">
      <q-breadcrumbs class="text-grey-4 q-mb-lg" active-color="secondary">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Wallets" to="/wallets" />
        <q-breadcrumbs-el v-if="wallet" :label="wallet.name || wallet.id" />
      </q-breadcrumbs>
    </div>
    <q-card class="nostr-card" bordered v-if="!wallet || !wallet.name">
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
              <div class="q-mb-lg">
                <div class="text-h3">
                  <span v-text="wallet.name"></span>
                </div>
              </div>
              <div class="text-h6">
                <span v-text="wallet.balance_msat / 1000"></span>
                <strong> sats </strong>
              </div>
            </q-item-section>

            <q-item-section side>
              <q-btn
                label="Show QR Code"
                class="text-capitalize"
                rounded
                color="secondary"
                text-color="primary"
                @click="showQrCode = !showQrCode"
              ></q-btn>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-section v-if="showQrCode">
        <div class="row ">
          <div class="col-md-3 col-none">
          </div>
          <div class="col-md-6 col-12  text-center">
            <div class="responsive">
              <vue-qrcode
                :value="lndHubLink"
                :options="{ width: 300 }"
              ></vue-qrcode>
            </div>
          </div>
        </div>
        <div class="row q-mt-md">
          <div class="col-12 text-center">
            <q-btn
              rounded
              unelevated
              text-color="primary"
              color="secondary"
              @click="copyData(lndHubLink)"
              label="Copy Link"
              class="text-capitalize"
            ></q-btn>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12">
            To access the wallet from a mobile phone:
            <ol>
              <li>
                Install either
                <a class="text-secondary" href="https://zeusln.app">Zeus</a> or
                <a class="text-secondary" href="https://bluewallet.io/"
                  >BlueWallet</a
                >
              </li>
              <li>
                Go to:
                <ul>
                  <li>
                    <code>Add a wallet / Import wallet</code> on
                    <a
                      class="text-secondary"
                      href="https://bluewallet.io/"
                      target="_blank"
                      >BlueWallet</a
                    >
                    or
                  </li>
                  <li>
                    <code>Settings / Add a new node</code> on
                    <a
                      class="text-secondary"
                      href="https://zeusln.app"
                      target="_blank"
                      >Zeus</a
                    >.
                  </li>
                </ul>
              </li>
              <li>Scan the QR code from the mobile wallet.</li>
            </ol>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNostrStore } from "src/stores/nostr";
import VueQrcode from "@chenfengyuan/vue-qrcode";

import { saas } from "boot/saas";

const $q = useQuasar();
const $router = useRouter();
const $route = useRoute();
const $nostr = useNostrStore();

const props = defineProps(["id"]);
const wallet = ref(null);
const lndHubLink = ref("null");
const showQrCode = ref(false);

const copyData = (data) => {
  copyToClipboard(data);

  $q.notify({
    message: "Copied",
    color: "grey",
  });
};

const getAccountWallets = async () => {
  try {
    const { data } = await saas.getAccountDetails();
    return data.wallets;
  } catch (error) {
    console.error(error);
    $q.notify({
      message: "Failed to get user wallets!",
      caption: error.response?.data?.detail,
      color: "negative",
    });
  }
  return [];
};

onMounted(async () => {
  const id = props.id || $route.params.id;
  wallet.value = { id: id };

  let activeWallet = $nostr.wallets.find((w) => w.id === id);
  if (!activeWallet) {
    const userWallets = await getAccountWallets();
    activeWallet = userWallets.find((w) => w.id === id);
  }

  if (!activeWallet) {
    return $router.push({ path: "/wallets" });
  }

  wallet.value = activeWallet;
  lndHubLink.value =
    `lndhub://admin:${wallet.value.adminkey}` +
    `@${window.location.origin}/lndhub/ext/`;
});
</script>
