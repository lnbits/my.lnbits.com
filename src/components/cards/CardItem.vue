<template>
  <q-card class="no-shadow q-pa-md bg-blue-grey-1" bordered>
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">
        {{ data.available ? "Great News" : "Oh... Try again!" }}
      </div>
      <q-btn class="q-ml-auto" icon="close" flat round dense @click="close" />
    </q-card-section>
    <q-card-section class="text-grey-8 q-mb-lg">
      <div v-if="data.available" class="text-h6">
        <span>
          {{
            data.available
              ? `${name} is available!`
              : `${name} is not available!`
          }}
        </span>
        &nbsp;Get it now for
        <span class="text-primary">{{
          data.currency != "sats"
            ? formatCurrency(data.price, data.currency)
            : formatSat(data.price)
        }}</span>
      </div>
      <div v-else class="text-h6">
        <span>
          The handle <span class="text-primary">{{ name }}</span> is not
          available!
        </span>
      </div>
    </q-card-section>
    <q-card-actions v-if="data.available">
      <q-btn
        color="positive"
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

<style scoped></style>
