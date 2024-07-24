<template>
  <q-page class="q-pa-sm">
    <activity-table></activity-table>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent } from "vue";

export default defineComponent({
  name: "Activity",
  components: {
    ActivityTable: defineAsyncComponent(() =>
      import("components/tables/ActivityTable.vue")
    ),
  },
  data() {
    return {};
  },
});
</script>

<style></style>
