<template>
  <q-card class="table-bg q-mx-auto no-shadow" :class="{popular: popular}">
    <q-card-section class="gradient-bg--primary text-white">
      <div class="text-h6">{{ title }}</div>
      <div class="text-subtitle2">{{ subtitle }}</div>
      <div class="text-body2 q-mt-sm ellipsis">{{ description }}</div>
    </q-card-section>
    <q-separator />
    <q-card-section class="text-center q-pa-xl">
      <div class="text-h3 text-weight-bolder">
        {{
          new Intl.NumberFormat('en', {
            style: 'currency',
            currency: 'USD'
          }).format(price)
        }}
      </div>
      <div class="text-body2">{{ price_text }}</div>
    </q-card-section>
    <q-card-section class="q-py-lg">
      <q-btn
        v-if="active"
        :to="link"
        label="Select"
        color="primary"
        class="full-width"
      />
      <q-btn
        v-else
        label="Coming Soon"
        color="grey"
        class="full-width"
        disabled
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Title'
  },
  subtitle: {
    type: String,
    default: 'Subtitle'
  },
  description: {
    type: String,
    default: 'Description'
  },
  price: {
    type: Number,
    default: 0
  },
  price_text: {
    type: String,
    default: 'Price Text'
  },
  price_savings: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  },
  link: {
    type: Object,
    default: {path: '/instances', query: {plan: 'monthly'}}
  },
  popular: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.popular {
  /* border: 1px solid var(--q-secondary); */
}
</style>
