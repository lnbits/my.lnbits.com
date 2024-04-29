<template>
  <q-page class="q-pa-sm">
    <table-dark-mode
      :data="data"
      :columns="columns"
      header="XXXX"
      class="q-mt-lg"
    ></table-dark-mode>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent } from "vue";

import { saas } from "boot/saas";

export default defineComponent({
  name: "Instences",
  components: {
    TableDarkMode: defineAsyncComponent(() =>
      import("components/tables/TableDarkMode.vue")
    ),
  },
  setup() {
    return {
      data: [
        {
          name: "Pratik Patel",
          Crated_Date: "15/3/2020",
          Project: "Quasar Admin",
          avatar:
            "https://avatars3.githubusercontent.com/u/34883558?s=400&u=09455019882ac53dc69b23df570629fd84d37dd1&v=4",
          progress: 80,
          des: "Solutions Developer",
        },
      ],
      columns: [
        { name: "ID", label: "ID", field: "ID", sortable: true, align: "left" },
        {
          name: "Name",
          label: "Name",
          field: "name",
          sortable: true,
          align: "left",
        },
        {
          name: "Crated Date",
          label: "Crated Date",
          field: "cratedDate",
          sortable: true,
          align: "left",
        },
        {
          name: "Stop Date",
          label: "Stop Date",
          field: "stopDate",
          sortable: true,
          align: "left",
        },
        {
          name: "Progress",
          label: "Progress",
          field: "Progress",
          sortable: true,
          align: "left",
        },
        {
          name: "Action",
          label: "",
          field: "Action",
          sortable: false,
          align: "center",
        },
      ],
    };
  },
  async created() {
    try {
      const { data } = await saas.getInstances();
      this.data = (data || []).forEach((instance, index) => {
        return {
          id: instance.id,
          name: instance.domain,
          cratedDate: instance.timestamp,
          stopDate: instance.timestamp_stop,
          progress: 100 / (index + 1),
          des: "Solutions Developer",
        };
      });
    } catch (error) {
      console.log("## error 1", error);
    }
  },
});
</script>

<style></style>
