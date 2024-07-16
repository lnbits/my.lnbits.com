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
        <q-badge class="text-h6 q-mr-sm" color="secondary" text-color="primary">
          {{ name }}
        </q-badge>
        <span>is available!</span>
        &nbsp;Get it now for
        <span
          >{{
            data.currency !== "sats"
              ? formatCurrency(data.price, data.currency)
              : formatSat(data.price)
          }}.</span
        >

        <q-btn
          color="secondary"
          text-color="primary"
          label="Add to Cart"
          class="text-capitalize q-ml-auto float-right"
          @click="action"
        />
      </div>
      <div v-else class="text-h6">
        <span>
          The handle <span>{{ name }}</span> is not available!
        </span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps(["name", "data", "close", "action"]);

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

<style lang="scss"></style>
