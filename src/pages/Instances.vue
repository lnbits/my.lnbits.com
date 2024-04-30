<template>
  <q-page class="q-pa-sm">
    <table-dark-mode
    v-if="data"
      :data="data"
      :columns="columns"
      header="LNbits Instances"
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
  data() {
    return {
      data: null,
      columns: [
        { name: "ID", label: "Instance ID", field: "id", sortable: true, align: "left" },
        { name: "enabled", label: "Enabled", field: "enabled", sortable: true, align: "left" },
        { name: "active", label: "Active", field: "active", sortable: true, align: "left" },
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
      const tableData = (data || []).map((instance, index) => {
        return {
          id: instance.id,
          instanceLink: `https://${instance.domain}/wallet?usr=${instance.adminuser}`,
          backupLink: `https://${instance.domain}/admin/api/v1/backup/?usr=${instance.adminuser}`,
          enabled: instance.is_enabled,
          active: instance.is_active,
          name: instance.domain,
          cratedDate: instance.timestamp,
          stopDate: instance.timestamp_stop,
          progress: 100 / (index + 1),
        };
      });
      // this.$set(this, "data", tableData )
      this.data = tableData
      console.log("### this.data", this.data);
    } catch (error) {
      console.log("## error 1", error);
    }
  },
});
</script>

<style></style>
