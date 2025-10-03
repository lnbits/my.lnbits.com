<template>
  <q-layout view="lHh Lpr lFf" class="bg-image">
    <q-header class="bg-transparent text-white">
      <q-toolbar class="q-pa-md">
        <q-toolbar-title> </q-toolbar-title>
        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn
            square
            dense
            flat
            color="text-grey-7"
            to="/"
            label="Home"
            icon="dashboard"
          >
            <q-tooltip>Home</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <section
        style="min-height: 20vh"
        class="flex text-white flex-center layout_bg"
      >
        <div style="position: relative">
          <div class="text-h2 q-mb-lg text-center">
            <span class="text-weight-bold">LN</span>bits
          </div>
          <div class="text-h4 text-center">
            The world's most powerful suite of bitcoin tools.
          </div>
          <div class="text-subtitle1 q-pt-sm text-center">
            Run for yourself, for others, or as part of a stack.
          </div>
        </div>
      </section>
      <section>
        <div class="text-h5 text-center q-mt-xl q-mb-md text-white">
          Pricing plans
        </div>
      </section>
      <section class="q-pa-xl">
        <div class="row q-col-gutter-md q-mx-auto" style="max-width: 1200px">
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

    <section class="flex row flex-center q-py-sm"></section>
  </q-layout>
</template>

<script>
import {defineComponent, defineAsyncComponent} from 'vue'

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
    price: 2.99,
    price_text: 'USD / per week',
    price_savings: 'Just $0.43/day',
    active: true,
    link: {path: '/instances', query: {plan: 'weekly'}}
  },
  {
    title: 'Monthly',
    subtitle: 'Most Popular',
    description: 'Ideal for developers and growing businesses',
    price: 10.99,
    price_text: 'USD / per month',
    price_savings: 'Save 25% • Only $0.37/day',
    active: true,
    link: {path: '/instances', query: {plan: 'monthly'}},
    popular: true
  },
  {
    title: 'Yearly',
    subtitle: 'Best Value',
    description: 'For businesses and power users',
    price: 109.99,
    price_text: 'USD / per year',
    price_savings: 'Save 38% • 2+ months FREE',
    active: true,
    link: {path: '/instances', query: {plan: 'yearly'}}
  }
]
export default defineComponent({
  name: 'Pricing',
  components: {
    CardPricing: defineAsyncComponent(() =>
      import('components/cards/CardPricing.vue')
    )
  },
  setup() {
    return {
      year: new Date().getFullYear(),
      pricing_data
    }
  }
})
</script>

<style scoped></style>
