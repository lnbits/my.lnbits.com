<template>
  <q-page class="q-pa-sm container">
    <div class="q-gutter-md">
      <q-breadcrumbs class="text-grey-4 q-mb-lg" active-color="secondary">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Indentities" />
      </q-breadcrumbs>
    </div>
    <q-input
      dark
      standout
      rounded
      v-model.trim="filterText"
      class="input q-mb-lg"
      placeholder="Filter by identifier or public key"
      label-color="blue-grey-4"
      :input-style="{ fontSize: '22px' }"
      @keydown.enter.prevent="handleSearch"
    >
      <template v-slot:prepend>
        <NostrHeadIcon color="blue-grey-4" />
      </template>

      <template v-slot:append>
        <q-btn
          v-if="filterText && identityNotOwned"
          rounded
          unelevated
          text-color="primary"
          color="secondary"
          label="Check Identity"
          @click="handleSearch"
          class="text-capitalize"
        />
      </template>

      <template v-slot:after>
        <q-btn
          @click="identitiesDisplay = !identitiesDisplay"
          unelevated
          text-color="secondary"
          color="primary"
          :icon="identitiesDisplay ? 'list' : 'grid_view'"
        />
      </template>

      <template v-slot:error> Failed to filer. </template>
    </q-input>

    <div v-if="identitiesDisplay" class="id-card row q-mt-md">
      <div
        v-for="identity in filteredIdentities"
        class="q-pa-sm col-xs-12 col-sm-6 col-md-4 col-lg-3"
      >
        <CardProfile
          :name="identity.local_part"
          :pubkey="identity.pubkey"
          :time="identity.time"
          :profile="$nostr.profiles.get(identity.pubkey)"
        ></CardProfile>
      </div>
    </div>
    <div v-else>
      <q-list
        v-for="identity in filteredIdentities"
        class="nostr-card no-shadow q-ma-sm"
        bordered
      >
        <q-item
          clickable
          v-ripple
          tag="a"
          :href="`/identities/${identity.local_part}`"
        >
          <q-item-section avatar>
            <q-avatar>
              <q-img
                v-if="
                  $nostr.profiles.has(identity.pubkey) &&
                  $nostr.profiles.get(identity.pubkey).picture
                "
                :src="$nostr.profiles.get(identity.pubkey).picture"
                spinner-color="secondary"
                spinner-size="52px"
                :ratio="1"
              />
              <NostrHeadIcon v-else color="blue-grey-4" />
            </q-avatar>
          </q-item-section>

          <q-item-section class="ellipsis">
            <q-item-label
              lines="1"
              class="text-weight-bold text-white q-mb-md"
              >{{ identity.local_part }}</q-item-label
            >
            <q-item-label caption lines="2">
              <span class="text-weight-bold text-white">Pubkey:</span>
              &nbsp;
              <span class="text-white">{{ identity.pubkey }}</span>
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            {{ timeFromNow(identity.time * 1000) }}
          </q-item-section>
        </q-item>
      </q-list>
    </div>

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
import { useNostrStore } from "src/stores/nostr";
import { onMounted, ref, computed, watch } from "vue";
import { saas } from "boot/saas";
import { timeFromNow, getTagValues } from "src/boot/utils";
// import { SimplePool } from "nostr-tools/pool";

import NostrHeadIcon from "components/NostrHeadIcon.vue";
import CardProfile from "components/cards/CardProfile.vue";
import VueQrcode from "@chenfengyuan/vue-qrcode";

const $q = useQuasar();
const $store = useAppStore();
const $nostr = useNostrStore();

let paymentCheckInterval;

const filterText = ref("");
const handleData = ref({});
const showSearch = ref(false);

const identities = ref([]);
const filteredIdentities = ref([]);
const identityNotOwned = ref(true);
const identitiesDisplay = ref(true);

const dataDialog = ref(false);
const dialogHandle = ref("");
const dialogPubkey = ref("");
const dialogHandleReadonly = ref(false);

const paymentDetails = ref({});

const getIdentities = async () => {
  try {
    const { data } = await saas.getUsrIdentities();
    identities.value = data.filter((i) => i.active);
    data.forEach((i) => {
      $nostr.addPubkey(i.pubkey);
    });
    filteredIdentities.value = identities.value;
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
  $store.filterText = "";
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

const filterIdentifier = (id, filter) => {
  if (!filterText.value) {
    return true;
  }
  if (id.local_part.toLowerCase().indexOf(filter) !== -1) {
    return true;
  }
  if (id.pubkey.toLowerCase().indexOf(filter) !== -1) {
    return true;
  }
  return false;
};

watch(filterText, (n, o) => {
  const filter = filterText.value.toLocaleLowerCase();
  filteredIdentities.value = identities.value.filter((id) =>
    filterIdentifier(id, filter)
  );
  identityNotOwned.value = !identities.value.find(
    (id) => id.local_part.toLowerCase() === filter
  );
});

const handleSearch = async () => {
  try {
    const { data } = await saas.queryIdentifier(filterText.value);
    dialogHandle.value = filterText.value;
    handleData.value = data;
    if (data.available) {
      $q.notify({
        message: "Identity available",
        color: "positive",
        caption: "Todo: details on price",
      });
    } else {
      $q.notify({
        message: "Identity not available",
        color: "negative",
      });
    }
  } catch (error) {
    console.error("Error searching for identifier: ", error);
  }
};

const handleBuy = () => {
  dataDialog.value = true;
  dialogHandle.value = filterText.value;
  dialogHandleReadonly.value = true;
  filterText.value = "";
  showSearch.value = false;
};

// NOSTR
// TODO: MOVE/ABSTRACT TO OTHER FILE

// const pool = new SimplePool();

// let h = pool.subscribeMany(
//   $nostr.relays,
//   [
//     {
//       authors: $nostr.pubkeys,
//       kinds: [0],
//     },
//   ],
//   {
//     onevent(event) {
//       console.log("event", event);
//     },
//     // oneose() {
//     //   h.close();
//     // },
//   }
// );

onMounted(async () => {
  if ($store.buying) {
    dataDialog.value = true;
    dialogHandle.value = $store.filterText;
    dialogHandleReadonly.value = true;
  }
  identities.value = [...$store.identities.values()];
  await getIdentities();
  // const events = await $nostr.pool.querySync([...$nostr.relays], {
  //   authors: [...$nostr.pubkeys],
  //   kinds: [0, 10002],
  // });
  // events.forEach((event) => {
  //   switch (event.kind) {
  //     case 0:
  //       $nostr.addProfile(event);
  //       break;
  //     case 10002:
  //       const relays = getTagValues(event, "r");
  //       $nostr.addRelaysToProfile(event.pubkey, relays);
  //       relays.forEach((r) => {
  //         $nostr.addRelay(r);
  //       });

  //       break;
  //     default:
  //       break;
  //   }
  // });
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
