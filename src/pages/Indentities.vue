<template>
  <q-page class="q-pa-sm container">
    <div class="q-gutter-md">
      <q-breadcrumbs class="text-grey-4 q-mb-lg" active-color="secondary">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el
          label="Docs"
          icon="widgets"
          to="/start/pick-quasar-flavour"
        />
        <q-breadcrumbs-el
          label="Breadcrumbs"
          icon="navigation"
          to="/vue-components/breadcrumbs"
        />
        <q-breadcrumbs-el label="Build" icon="build" />
      </q-breadcrumbs>
    </div>
    <q-input
      v-if="showSearch"
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
      bottom-slots
      :hint="isValid"
    >
      <template v-slot:prepend>
        <NostrHeadIcon color="blue-grey-4" />
      </template>
      <template v-slot:append>
        <q-btn
          v-if="
            handleData.available == undefined ||
            !handleData.available ||
            dialogHandle != handle
          "
          rounded
          unelevated
          text-color="primary"
          color="secondary"
          label="Search"
          @click="handleSearch"
          class="text-capitalize"
        />
        <q-btn
          v-else
          rounded
          unelevated
          text-color="primary"
          color="secondary"
          label="Buy"
          @click="handleBuy"
          class="text-capitalize"
        />
      </template>
      <template v-slot:error>
        Identity is not available. Try another.
      </template>
    </q-input>
    <q-card class="no-shadow" bordered>
      <q-card-section>
        <div class="text-h6 text-grey-8">Custom Grid View</div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-none">
        <q-table
          grid
          :rows="identities"
          :columns="columns"
          hide-bottom
          :rows-per-page-options="[0]"
        >
          <template v-slot:item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3">
              <CardProfile
                :name="props.row.local_part"
                :pubkey="props.row.pubkey"
                :time="props.row.time"
              ></CardProfile>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <!-- <q-card class="q-mt-lg no-shadow" bordered>
      <q-card-section class="row">
        <div class="text-h6 text-weight-bolder text-grey-8">My Identities</div>
        <q-space></q-space>
        <q-btn
          class="text-capitalize"
          outline
          :label="showSearch ? 'Close Search' : 'Add Identity'"
          color="primary"
          @click="showSearch = !showSearch"
        ></q-btn>
      </q-card-section>
      <q-separator></q-separator>
      <q-list>
        <q-expansion-item v-for="identity in identities">
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar>
                <NostrHeadIcon color="blue-grey-4" />
              </q-avatar>
            </q-item-section>

            <q-item-section class="ellipsis">
              <q-item-label lines="1"
                >{{ identity.local_part }}@nostr.com</q-item-label
              >
              <q-item-label caption lines="2">
                <span class="text-weight-bold">Pubkey:</span>
                &nbsp;
                <span>{{ identity.pubkey }}</span>
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              {{ timeFromNow(identity.time * 1000) }}
            </q-item-section>
          </template>

          <q-card class="q-pa-md">
            <q-card-actions>
              <q-btn
                color="secondary"
                text-color="primary"
                class="text-capitalize"
                label="Renew"
                ><q-tooltip>Renew your identity subscription</q-tooltip></q-btn
              >
              <q-btn
                color="secondary"
                text-color="primary"
                class="text-capitalize q-ml-md"
                label="Rotate"
                ><q-tooltip
                  >Change the public key associated to this @nostr.com
                  identity</q-tooltip
                ></q-btn
              >
            </q-card-actions>
          </q-card>
          <q-separator />
        </q-expansion-item>
      </q-list>
    </q-card> -->
    <q-dialog
      v-model="dataDialog"
      :backdrop-filter="'blur(4px) saturate(150%)'"
      @hide="resetDataDialog"
    >
      <q-card
        v-if="paymentDetails?.payment_request"
        style="width: 350px"
        class="q-pa-md text-center"
      >
        <h6><span>Identity: </span><span v-text="dialogHandle"></span></h6>
        <p class="caption">
          Scan the QR code below using a lightning wallet to secure your Nostr
          identity.
        </p>
        <div class="responsive">
          <a :href="'lightning:' + paymentDetails.payment_request">
            <vue-qrcode
              :value="paymentDetails.payment_request"
              :options="{ width: 500 }"
            ></vue-qrcode>
          </a>
        </div>
        <q-linear-progress indeterminate color="secondary" class="q-mt-sm" />
        <div class="row q-mt-md">
          <q-btn
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
      </q-card>
      <q-card v-else style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Buy Identity</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="resetDataDialog" />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model.trim="dialogHandle"
            label="Identity"
            :readonly="dialogHandleReadonly"
          />
          <q-input v-model.trim="dialogPubkey" label="Nostr Public Key" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Submit"
            color="primary"
            @click="submitIdentityBuy"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useQuasar, copyToClipboard } from "quasar";
import { useAppStore } from "src/stores/store";
import { onMounted, ref, computed } from "vue";
import { saas } from "boot/saas";
import { timeFromNow } from "src/boot/utils";

import NostrHeadIcon from "components/NostrHeadIcon.vue";
import CardProfile from "components/cards/CardProfile.vue";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import { time } from "echarts";

const $q = useQuasar();
const $store = useAppStore();
let paymentCheckInterval;

const handle = ref("");
const handleData = ref({});
const showSearch = ref(false);

const isValid = computed(() => {
  if (handleData.value.available === undefined) return "";
  return handleData.value.available
    ? `Identity is available`
    : `Identity is not available`;
});

const identities = ref([]);

const dataDialog = ref(false);
const dialogHandle = ref("");
const dialogPubkey = ref("");
const dialogHandleReadonly = ref(false);

const paymentDetails = ref({});

const columns = [
  {
    name: "Name",
    label: "Name",
    field: "local_part",
    sortable: true,
    align: "left",
  },
  {
    name: "Pubkey",
    label: "Pubkey",
    field: "pubkey",
    sortable: true,
    align: "left",
  },
  {
    name: "Created",
    label: "Created",
    field: "time",
    sortable: true,
    align: "left",
  },
];

const getIdentities = async () => {
  try {
    const { data } = await saas.getUsrIdentities();
    identities.value = [...data];
    console.log("Identities: ", data);
  } catch (error) {
    console.error("error", error);
  }
};

const submitIdentityBuy = async () => {
  try {
    const { data } = await saas.createIdentity(
      dialogHandle.value,
      dialogPubkey.value
    );
    console.log("Identity created: ", data);
    // resetDataDialog();
    // await getIdentities();
    if (data.payment_request) {
      paymentDetails.value = { ...data };
      paymentCheckInterval = setInterval(
        async () => await paymentChecker(),
        5000
      );
      $q.notify({
        message: "Pay the invoice to complete the purchase",
        color: "positive",
        position: "bottom",
        timeout: 5000,
      });
    }
  } catch (error) {
    console.error("Error buying identifier: ", error);
  }
};

const resetDataDialog = () => {
  dialogHandle.value = dialogPubkey.value = "";
  dataDialog.value = false;
  paymentDetails.value = {};
  $store.buying = false;
  $store.handle = "";
  if (paymentCheckInterval) {
    clearInterval(paymentCheckInterval);
    paymentCheckInterval = null;
  }
};

const paymentChecker = async () => {
  try {
    const { data } = await saas.checkIdentityPayment(
      paymentDetails.value.payment_hash
    );
    console.log("Payment status: ", data);
    if (data.paid) {
      clearInterval(paymentCheckInterval);
      paymentCheckInterval = null;
      $q.notify({
        message: "Payment successful",
        color: "positive",
        position: "bottom",
        timeout: 2000,
      });
      resetDataDialog();
      await getIdentities();
    }
  } catch (error) {
    console.error("Error checking payment: ", error);
  }
};

const copyData = (data) => {
  copyToClipboard(data);

  $q.notify({
    message: "Copied",
    color: "grey",
  });
};

const handleSearch = async () => {
  try {
    const { data } = await saas.queryIdentifier(handle.value);
    dialogHandle.value = handle.value;
    handleData.value = data;
    if (data.available) {
      $q.notify({
        message: "Identity available",
        color: "positive",
        position: "top",
        timeout: 2000,
      });
    } else {
      $q.notify({
        message: "Identity not available",
        color: "negative",
        position: "top",
        timeout: 2000,
      });
    }
  } catch (error) {
    console.error("Error searching for identifier: ", error);
  }
};

const handleBuy = () => {
  dataDialog.value = true;
  dialogHandle.value = handle.value;
  dialogHandleReadonly.value = true;
  handle.value = "";
  showSearch.value = false;
};

onMounted(async () => {
  if ($store.buying) {
    dataDialog.value = true;
    dialogHandle.value = $store.handle;
    dialogHandleReadonly.value = true;
  }
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
</style>
