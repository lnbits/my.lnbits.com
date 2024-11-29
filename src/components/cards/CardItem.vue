<template>
  <q-card class="no-shadow q-pa-md nostr-card" bordered>
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6 text-white">
        {{ data.available ? "Great News!" : "Oh... Try again!" }}
      </div>
      <q-btn
        class="q-ml-auto"
        icon="close"
        color="white"
        flat
        round
        dense
        @click="close"
      />
    </q-card-section>
    <q-card-section class="text-grey-5 q-mb-sm">
      <div v-if="data.available" class="text-h6">
        <div>
          <q-badge
            class="text-h6 q-mr-sm"
            color="secondary"
            text-color="primary"
          >
            <span v-text="data.identifier + '@nostr.com'"></span>
          </q-badge>
          <span>is available!</span>
          &nbsp;Get it now for
          <span
            >{{
              data.currency !== "sats"
                ? formatCurrency(data.price, data.currency)
                : formatSat(data.price)
            }}!</span
          >
          <q-btn
            v-if="data.available"
            rounded
            color="secondary"
            text-color="primary"
            label="Add to Cart"
            class="text-capitalize q-ml-auto float-right"
            @click="action"
          />
        </div>
      </div>
      <div v-else class="text-h6">
        <span>
          The handle <span>{{ name }}</span> is not available!
        </span>
      </div>

      <div v-if="data.hasFreeOption" class="q-mt-lg text-h6">
        <div class="q-ma-md q-pa-md"></div>
        <q-badge
          outline
          class="text-h6 q-mr-sm"
          color="secondary"
          text-color="secondary"
        >
          <span v-text="data.identifier + '.'"></span>
          <q-input
            v-model="data.free_identifier_number"
            type="number"
            min="0"
            max="999999"
            autofocus
            dense
            :rules="[(val) => val.length <= 6 || 'Max 6 characters']"
            class="my-input q-pb-none"
            :input-style="{
              fontSize: '22px',
              color: '#7dd3fc',
            }"
          >
          </q-input>
          <span>@nostr.com</span>
        </q-badge>

        <span>is available for free!</span>
        <q-btn
          outline
          rounded
          color="primary"
          text-color="secondary"
          label="Get free identifier"
          class="text-capitalize q-ml-auto float-right"
          @click="free"
        />
      </div>
    </q-card-section>
    <q-card-actions v-if="data.available"> </q-card-actions>
  </q-card>
</template>

<script setup>
defineProps(["name", "data", "close", "action", "free"]);

const formatCurrency = (value, currency) => {
  return new Intl.NumberFormat(window.LOCALE, {
    style: "currency",
    currency: currency,
  }).format(value);
};
const formatSat = (value) => {
  return new Intl.NumberFormat(window.LOCALE).format(value) + " sats";
};
</script>

<style lang="scss">
.my-input {
  font-style: "22px";
  color: "#7dd3fc";
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type="number"] {
    -moz-appearance: textfield;
  }
}
</style>
