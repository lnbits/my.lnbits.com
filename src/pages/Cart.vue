<template>
  <q-page class="q-pa-sm container">
    <div class="q-gutter-md">
      <q-breadcrumbs class="text-grey-4 q-mb-lg" active-color="secondary">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Cart" />
      </q-breadcrumbs>
    </div>

    <div v-if="identities && identities.length">
      <template v-for="cartItem in identities">
        <q-card class="nostr-card no-shadow text-white q-mb-lg q-pa-sm">
          <q-btn
            class="float-right"
            icon="close"
            color="grey-7"
            flat
            round
            dense
            @click="showRemoveItem(cartItem)"
          />
          <q-card-section class="q-mt-md">
            <span class="text-weight-bold text-white"
              >Nostr NIP05 Identifier</span
            >
            <span class="float-right text-grey-7">{{
              timeFromNow(cartItem.time * 1000)
            }}</span>
          </q-card-section>
          <q-card-section class="row">
            <div class="col">
              <span class="text-weight-bold text-white text-h6">
                {{ cartItem.local_part }}</span
              >
            </div>
            <div class="col flex justify-end">
              <q-btn-dropdown
                class="text-capitalize"
                :label="
                  cartItem.config.years +
                  ' Year' +
                  (cartItem.config.years > 1 ? 's' : '')
                "
                size="md"
                rounded
                color="secondary"
                text-color="primary"
              >
                <q-list
                  v-for="(year, index) in Array.from(
                    { length: cartItem.config.max_years },
                    (_, i) => i + 1
                  )"
                  :key="index"
                >
                  <q-item
                    clickable
                    v-close-popup
                    @click="getPriceByYear(cartItem, year)"
                    :active="isSameYear(cartItem.config.years, year)"
                    active-class="bg-teal-1 text-grey-8"
                    ><q-item-section>
                      <q-item-label
                        v-text="year + ' Year' + (year > 1 ? 's' : '')"
                      ></q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
          </q-card-section>
          <q-card-section>
            <q-input
              dark
              standout
              v-model="cartItem.pubkey"
              label="Public Key"
              hint="Public key associated with this identifier. Hex or Npub format."
            >
              <template v-slot:before v-if="$q.screen.gt.xs">
                <q-avatar>
                  <NostrHeadIcon color="secondary" />
                </q-avatar>
              </template>
            </q-input>
          </q-card-section>
          <q-card-section>
            <div>
              <q-toggle
                v-model="cartItem.showPromoCode"
                @update:model-value="togglePromoCode(cartItem)"
                label="I have a promo code"
                color="secondary"
              ></q-toggle>
            </div>
            <div v-if="cartItem.showPromoCode" class="row">
              <div class="col-md-6 col-12 q-mt-md">
                <q-input
                  v-model="cartItem.config.promo_code"
                  @keydown.enter="computeCartItemPrice(cartItem)"
                  dark
                  standout
                  label="Promo Code"
                  hint="Use this code to get a discount when buying your identifier."
                >
                  <template v-slot:before v-if="$q.screen.gt.xs">
                    <q-avatar>
                      <q-icon name="discount"></q-icon>
                    </q-avatar>
                  </template>
                  <template v-slot:append>
                    <q-btn
                      @click="computeCartItemPrice(cartItem)"
                      label="Check"
                      rounded
                      unelevated
                      text-color="primary"
                      color="secondary"
                    ></q-btn>
                  </template>
                </q-input>
              </div>
              <div class="col-md-6 col-12 q-mt-md">
                <q-input
                  v-if="cartItem.promo_code_status.allow_referer"
                  dark
                  standout
                  v-model="cartItem.config.referer"
                  label="Referer"
                  hint="Specify a user that will get a share of the payment (optional)."
                >
                  <template v-slot:before v-if="$q.screen.gt.xs">
                    <q-avatar>
                      <q-icon name="person_pin"></q-icon>
                    </q-avatar>
                  </template>
                </q-input>
                <q-input
                  v-else-if="cartItem.promo_code_status.referer"
                  disable
                  dark
                  standout
                  v-model="cartItem.promo_code_status.referer"
                  label="Referer"
                  hint="This user will get a share of the payment."
                >
                  <template v-slot:before v-if="$q.screen.gt.xs">
                    <q-avatar>
                      <q-icon name="person_pin"></q-icon>
                    </q-avatar>
                  </template>
                </q-input>
              </div>
            </div>
            <div v-if="cartItem.showPromoCode" class="row">
              <div
                v-if="cartItem.promo_code_status.buyer_discount"
                class="col-12"
              >
                <div class="text-h5 float-right q-mt-lg">
                  <span>You have a &nbsp;</span>
                  <q-badge
                    color="secondary"
                    text-color="primary"
                    class="text-h5"
                  >
                    <span
                      v-text="cartItem.promo_code_status.buyer_discount"
                    ></span>
                    %
                  </q-badge>
                  <span> &nbsp; discount! </span>
                </div>
              </div>
              <div v-else class="col-12">
                <div class="text-h5 float-right q-mt-lg">
                  <span>No discount for this code.</span>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-mt-md">
            <q-btn
              @click="submitIdentityBuy(cartItem)"
              :label="`Buy for ${cartItem.config.price} ${cartItem.config.currency}`"
              class="text-capitalize float-left"
              :disabled="!cartItem.pubkey"
              rounded
              color="secondary"
              text-color="primary"
            >
              <q-badge
                v-if="cartItem.promo_code_status.buyer_discount"
                color="primary"
                bordered
                floating
                >-<span
                  v-text="cartItem.promo_code_status.buyer_discount"
                ></span>
                %</q-badge
              >
            </q-btn>
          </q-card-actions>
        </q-card>
      </template>
      <template v-if="loading">
        <q-card class="nostr-card q-mb-lg q-pa-sm">
          <q-card-section>
            <q-skeleton type="text" />
          </q-card-section>
          <q-card-section>
            <q-skeleton type="text" />
          </q-card-section>
          <q-card-section>
            <q-skeleton type="QInput" />
          </q-card-section>
          <q-card-actions align="right">
            <q-skeleton type="QBtn" />
          </q-card-actions>
        </q-card>
      </template>
    </div>
    <div v-else>
      <div class="text-h6 text-white text-center q-pa-md">
        <strong>There are no items in your shopping cart.</strong>
      </div>
    </div>

    <q-dialog
      v-model="dataDialog"
      :backdrop-filter="'blur(4px) saturate(150%)'"
    >
      <q-card style="width: 350px" class="q-pa-md text-center">
        <q-card-section v-if="paymentDetails?.payment_request">
          <p class="caption">
            Scan the QR code below using a lightning wallet to secure your Nostr
            identity.
          </p>
          <div class="text-h6">
            <span v-text="paymentDetails.local_part"></span>
          </div>
          <div class="responsive">
            <a :href="'lightning:' + paymentDetails.payment_request">
              <vue-qrcode
                :value="paymentDetails.payment_request"
                :options="{ width: 500 }"
              ></vue-qrcode>
            </a>
          </div>
        </q-card-section>
        <q-card-section>
          <q-linear-progress indeterminate color="secondary" class="q-mt-sm" />
          <div class="row q-mt-md">
            <q-btn
              v-if="paymentDetails?.payment_request"
              rounded
              unelevated
              text-color="primary"
              color="secondary"
              @click="copyData(paymentDetails.payment_request)"
              label="Copy Invoice"
              class="text-capitalize"
            ></q-btn>
            <q-btn
              @click="resetDataDialog"
              flat
              color="grey"
              class="q-ml-auto text-capitalize"
              label="Close"
            ></q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showRemoveItemDialog">
      <q-card style="width: 350px" class="q-pa-md text-center">
        <h6><span>Remove Cart Item </span></h6>
        <p class="caption">
          Are you sure you want to remove
          <strong> <span v-text="cartItemToRemove.local_part"></span></strong>?
        </p>

        <div class="row q-mt-md">
          <q-btn
            @click="removeCartItem"
            rounded
            unelevated
            text-color="primary"
            color="red"
            label="Remove Item"
            class="text-capitalize"
          ></q-btn>
          <q-btn
            flat
            v-close-popup
            color="grey"
            class="q-ml-auto text-capitalize"
            label="Cancel"
          ></q-btn>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useQuasar, copyToClipboard } from "quasar";
import { useRouter } from "vue-router";
import VueQrcode from "@chenfengyuan/vue-qrcode";

import { useAppStore } from "src/stores/store";
import { onMounted, ref } from "vue";
import { saas } from "boot/saas";
import { timeFromNow } from "src/boot/utils";

import NostrHeadIcon from "components/NostrHeadIcon.vue";

const $q = useQuasar();
const $store = useAppStore();
const $router = useRouter();

const identities = ref([]);

const dataDialog = ref(false);
const showRemoveItemDialog = ref(false);
const cartItemToRemove = ref(null);

const paymentDetails = ref({});
const loading = ref(true);

const isSameYear = (y1, y2) => {
  return y1 === y2;
};

const getPriceByYear = async (cartItem, year) => {
  cartItem.config.years = year;
  await computeCartItemPrice(cartItem);
};

const togglePromoCode = async (cartItem) => {
  if (!cartItem.showPromoCode) {
    cartItem.config.promo_code = null;
    await computeCartItemPrice(cartItem);
  }
};

const computeCartItemPrice = async (cartItem) => {
  const { data } = await saas.createIdentity({
    identifier: cartItem.local_part,
    pubkey: cartItem.pubkey,
    years: cartItem.config.years,
    promo_code: cartItem.config.promo_code,
    referer: cartItem.config.referer,
  });

  Object.assign(cartItem, data);
};

const getIdentities = async () => {
  try {
    const { data } = await saas.getUserIdentities({ active: false });
    identities.value = data.map((a) => ({
      ...a,
      showPromoCode: !!a.config.promo_code,
    }));
    loading.value = false;
  } catch (error) {
    console.error("error", error);
  }
};

const submitIdentityBuy = async (cartItem) => {
  try {
    dataDialog.value = true;

    paymentDetails.value = { local_part: cartItem.local_part };
    const { data } = await saas.createIdentity(
      {
        identifier: cartItem.local_part,
        pubkey: cartItem.pubkey,
        years: cartItem.config.years,
        promo_code: cartItem.config.promo_code,
        referer: cartItem.config.referer,
      },
      true
    );
    // npub to hex
    cartItem.pubkey = data.pubkey;

    if (data.payment_request) {
      paymentDetails.value = { ...data };

      subscribeToPaylinkWs(data.payment_hash, data.local_part);
      $q.notify({
        message: "Pay the invoice to complete the purchase",
        color: "positive",
        position: "bottom",
        timeout: 5000,
      });
    }
    return data;
  } catch (error) {
    console.error(error);
    dataDialog.value = false;
    $q.notify({
      message: "Failed to generate invoice",
      caption: error.response?.data?.detail,
      color: "negative",
    });
  }
};

const subscribeToPaylinkWs = (payment_hash, identity) => {
  const url = new URL(process.env.apiUrl || window.location);
  url.protocol = url.protocol === "https:" ? "wss" : "ws";
  url.pathname = `/api/v1/ws/${payment_hash}`;
  const ws = new WebSocket(url);
  ws.addEventListener("message", async ({ data }) => {
    const resp = JSON.parse(data);
    if (!resp.pending || resp.paid) {
      $q.notify({
        type: "positive",
        message: "Invoice Paid!",
      });
      resetDataDialog();
      ws.close();
      setTimeout(() => $router.push(`/identities/${identity}`), 500);
    }
  });
};

const resetDataDialog = () => {
  dataDialog.value = false;
  paymentDetails.value = {};
};

const showRemoveItem = (cartItem) => {
  cartItemToRemove.value = cartItem;
  showRemoveItemDialog.value = true;
};

const removeCartItem = async () => {
  showRemoveItemDialog.value = false;
  try {
    await saas.deleteIdentity(cartItemToRemove.value.id);

    identities.value = identities.value.filter(
      (i) => i.id !== cartItemToRemove.value.id
    );
    $q.notify({
      message: "Item removed",
      color: "positive",
    });
    if (!identities.value.length) {
      setTimeout(() => $router.push("/"), 500);
    }
  } catch (error) {
    console.error(error);
    $q.notify({
      message: "Failed to remove item",
      caption: error.response?.data?.detail,
      color: "negative",
      position: "bottom",
    });
  }
};

const copyData = (data) => {
  copyToClipboard(data);

  $q.notify({
    message: "Copied",
    color: "grey",
  });
};

onMounted(async () => {
  identities.value = [...$store.identities.values()];
  if (identities.value.length > 0) {
    loading.value = false;
  }
  await getIdentities();
  if ($store.newCartIdentifier) {
    const { data } = await saas.createIdentity({
      identifier: $store.newCartIdentifier,
    });
    identities.value = identities.value.filter((i) => i.id !== data.id);
    identities.value.unshift(data);
  }
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
