<template>
  <q-layout
    view="lHh Lpr lFf"
    style="background: linear-gradient(135deg, #5b6a82 10%, #162b4d 100%)"
  >
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
            label="Dashboard"
            icon="dashboard"
          >
            <q-tooltip>Dashboard</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <section
        style="min-height: 25vh"
        class="flex text-white flex-center layout_bg"
      >
        <div style="position: relative">
          <div class="text-h4 text-center">
            The world's most powerful suite of bitcoin tools.
          </div>
          <div class="text-subtitle2 q-pt-sm text-center">
            Run for yourself, for others, or as part of a stack.
          </div>
        </div>
      </section>
      <section class="q-pb-lg">
        <div class="row q-col-gutter-sm q-px-sm">
          <div
            class="col-lg-3 col-md-3 col-xs-12 col-sm-12"
            v-for="(pricing_item, pricing_index) in pricing_data"
          >
            <card-pricing
              :title="pricing_item.title"
              :icon="pricing_item.icon"
              :price="pricing_item.price"
              :background_image="pricing_item.background_image"
              :text="pricing_item.text"
            ></card-pricing>
          </div>
        </div>
      </section>
    </q-page-container>

    <section class="flex row flex-center q-py-sm"></section>
  </q-layout>
</template>

<script>
import { defineComponent, defineAsyncComponent } from "vue";

const pricing_data = [
  {
    title: "Basic",
    price: "21 sats per hour",
    icon: "home_work",
    background_image: "linear-gradient(to right, #ed6ea0 0%, #ec8c69 100%)",
    text: "Start Now",
  },
  {
    title: "Small Company",
    price: "0 sats",
    icon: "home",
    background_image: "linear-gradient(-225deg, #5D9FFF 0%, #6BBBFF 100%)",
    text: "Comming Soon",
  },
  {
    title: "Extended",
    price: "0 sats",
    icon: "apartment",
    background_image: "linear-gradient(to right, #2B86C5 0%, #2B86C5 100%)",
    text: "Comming Soon",
  },
  {
    title: "Extra Pack",
    price: "0 sats",
    icon: "business_center",
    background_image:
      "linear-gradient(87deg, rgb(17, 205, 239), rgb(17, 113, 239)) !important",
    text: "Comming Soon",
  },
];
export default defineComponent({
  name: "Pricing",
  components: {
    CardPricing: defineAsyncComponent(() =>
      import("components/cards/CardPricing.vue")
    ),
  },
  setup() {
    return {
      year: new Date().getFullYear(),
      pricing_data,
    };
  },
});
</script>

<style scoped></style>
