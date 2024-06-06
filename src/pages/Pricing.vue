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
        style="min-height: 25vh"
        class="flex text-white flex-center layout_bg"
      >
        <div style="position: relative">
          <div class="text-h2 q-mb-lg text-center">LNbits</div>
          <div class="text-h4 text-center">
            The world's most powerful suite of bitcoin tools.
          </div>
          <div class="text-subtitle2 q-pt-sm text-center">
            Run for yourself, for others, or as part of a stack.
          </div>
        </div>
      </section>
      <section class="q-pa-xl">
        <div class="row q-col-gutter-sm q-px-sm q-ml-xl q-mr-xl">
          <div
            class="col-lg-4 col-md-4 col-xs-12 col-sm-12"
            v-for="pricing_item in pricing_data"
          >
            <card-pricing
              class="q-ml-lg q-mr-lg"
              :title="pricing_item.title"
              :icon="pricing_item.icon"
              :price="pricing_item.price"
              :active="pricing_item.active"
              :link="pricing_item.link"
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
    title: "Hourly",
    price: "21 sats per hour",
    active: true,
    link: "/instances",
    icon: "hourglass_top",
    background_image: "linear-gradient(to right, #ed6ea0 0%, #ec8c69 100%)",
    text: "Start Now",
  },
  {
    title: "Daily",
    price: "_ _ _ sats per day",
    icon: "today",
    background_image: "linear-gradient(-225deg, #5D9FFF 0%, #6BBBFF 100%)",
    text: "Comming Soon",
  },
  {
    title: "Weekly",
    price: "_ _ _ sats per week",
    icon: "calendar_view_week",
    background_image: "linear-gradient(to right, #2B86C5 0%, #2B86C5 100%)",
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
