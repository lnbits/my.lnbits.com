<template>
  <q-page class="q-pa-sm">
    <instances-table></instances-table>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent } from "vue";

export default defineComponent({
  name: "Instances",
  components: {
    InstancesTable: defineAsyncComponent(() =>
      import("components/tables/InstancesTable.vue")
    ),
  },
  data() {
    return {};
  },
});
</script>

<style></style>
