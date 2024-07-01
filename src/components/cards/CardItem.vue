<template>
  <q-card class="no-shadow q-pa-md nostr-card" bordered>
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6 text-white">
        {{ data.available ? "Great News" : "Oh... Try again!" }}
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
    <q-card-section class="text-grey-5 q-mb-lg">
      <div v-if="data.available" class="text-h6">
        <span
          >Identity
          {{
            data.available
              ? `'${name}' is available!`
              : `'${name}' is not available!`
          }}
        </span>
        &nbsp;Get it now for
        <span>{{
          data.currency != "sats"
            ? formatCurrency(data.price, data.currency)
            : formatSat(data.price)
        }}</span>
      </div>
      <div v-else class="text-h6">
        <span>
          The handle <span>{{ name }}</span> is not available!
        </span>
      </div>
    </q-card-section>
    <q-card-actions v-if="data.available">
      <q-btn
        color="secondary"
        text-color="primary"
        label="Buy now"
        size="lg"
        class="text-capitalize q-ml-auto"
        @click="action"
      />
    </q-card-actions>
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
  return new Intl.NumberFormat(window.LOCALE).format(value);
};
</script>

<style scoped lang="scss">
.nostr-card {
  background: lighten($primary, 5%);
  border: 1px solid $secondary;
}
</style>
