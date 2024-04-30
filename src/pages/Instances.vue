<template>
  <q-page class="q-pa-sm">
    <table-dark-mode></table-dark-mode>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent } from "vue";

export default defineComponent({
  name: "Instences",
  components: {
    TableDarkMode: defineAsyncComponent(() =>
      import("components/tables/TableDarkMode.vue")
    ),
  },
  data() {
    return {};
  },
});
</script>

<style></style>
