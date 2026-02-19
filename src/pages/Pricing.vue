<template>
  <q-layout view="lHh Lpr lFf" class="pricing-shell">
    <q-header class="bg-transparent" style="color: inherit">
      <q-toolbar class="q-pa-md">
        <q-toolbar-title>
          <span class="text-subtitle1 text-italic text-weight-light">my</span>
          <span class="q-ml-xs text-weight-bold">Bits</span>
        </q-toolbar-title>
        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn square dense flat to="/" label="Home" icon="dashboard">
            <q-tooltip>Home</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <section class="flex flex-center pricing-hero">
        <div class="pricing-hero__content">
          <div class="text-h2 q-mb-md text-center">
            <span class="text-weight-bold">LN</span>bits
          </div>
          <div class="text-h4 text-center pricing-hero__title">
            The world's most powerful suite of bitcoin tools.
          </div>
          <div class="text-subtitle1 q-pt-sm text-center pricing-hero__subtitle">
            Run for yourself, for others, or as part of a stack.
          </div>
        </div>
      </section>
      <section class="pricing-intro">
        <div class="text-h5 text-center">Pricing plans</div>
        <div class="text-subtitle2 text-center pricing-intro__hint">
          Choose a plan that fits your timeline.
        </div>
      </section>
      <section class="q-pa-xl pricing-section">
        <div class="row q-col-gutter-md q-mx-auto pricing-grid">
          <div class="col-12 col-md-4" v-for="pricing_item in pricing_data">
            <card-pricing
              :title="pricing_item.title"
              :subtitle="pricing_item.subtitle"
              :description="pricing_item.description"
              :price="pricing_item.price"
              :price_text="pricing_item.price_text"
              :price_savings="pricing_item.price_savings"
              :active="pricing_item.active"
              :link="pricing_item.link"
              :popular="pricing_item.popular"
            ></card-pricing>
          </div>
        </div>
      </section>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import CardPricing from 'src/components/cards/CardPricing.vue'
import {ref, onMounted} from 'vue'
import {useQuasar} from 'quasar'

const q = useQuasar()

const pricing_data = [
  // {
  //   title: 'Daily',
  //   subtitle: 'Pay As You Go',
  //   description: 'Perfect for testing and short-term projects',
  //   price: 0.49,
  //   price_text: 'USD / per day',
  //   price_savings: 'Just $0.021 per hour',
  //   active: true,
  //   link: {path: '/instances', query: {plan: 'daily'}}
  // },
  {
    title: 'Weekly',
    subtitle: 'Great Start',
    description: 'Perfect for testing and short-term projects',
    price: 2.0,
    price_text: 'USD / per week',
    price_savings: '',
    active: true,
    link: {path: '/instances', query: {plan: 'weekly'}}
  },
  {
    title: 'Monthly',
    subtitle: 'Most Popular',
    description: 'Ideal for developers and growing businesses',
    price: 7.0,
    price_text: 'USD / per month',
    price_savings: '',
    active: true,
    link: {path: '/instances', query: {plan: 'monthly'}},
    popular: true
  },
  {
    title: 'Yearly',
    subtitle: 'Best Value',
    description: 'Buy 12 months for the price of 10.',
    price: 70.0,
    price_text: 'USD / per year',
    price_savings: '',
    active: true,
    link: {path: '/instances', query: {plan: 'yearly'}}
  }
]
const darkMode = ref(false)

onMounted(() => {
  darkMode.value = localStorage.getItem('darkMode') === 'true'
  q.dark.set(darkMode.value)
})
</script>

<style scoped></style>
