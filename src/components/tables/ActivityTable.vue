<template>
  <q-card class="table-bg no-shadow" bordered>
    <q-card-section>
      <div class="text-h6 text-white">
        <span>Instances Activity</span>
        <q-btn

          label="New Instance"
          icon="add_to_queue"
          color="blue"
          class="float-right text-capitalize shadow-3"
        />
      </div>
    </q-card-section>
    <q-linear-progress
      v-if="inProgress"
      indeterminate
      color="secondary"
      class="q-mt-sm"
    />
    <q-separator color="white" />
    <q-card-section class="q-pa-none">
      <q-table
        dark
        class="table-bg"
        :rows="data"
        :columns="columns"
        :pagination.sync="pagination"
      >



        <template v-slot:body-cell-success="props">
          <q-td :props="props">
            <q-icon v-if="props.row.success === true" name="done" color="green"/>
            <q-icon v-else name="warning" color="yellow" />

          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
  <q-dialog v-model="showPaymentQrDialog" position="top">
    <q-card style="min-height: 200px" class="q-pa-lg">
      <h3>
        <span>Instance: &nbsp;</span><span v-text="activeInstance.id"></span>
      </h3>

      <p style="color: white">
        <q-img
          class="qrcode"
          style="width: 100%; height: auto"
          :src="qrUrl()"
          alt="LNURLp"
        />
      </p>
      <h5><span v-text="activeInstance.name"></span></h5>
      <q-linear-progress indeterminate color="secondary" class="q-mt-sm" />
      <div class="row q-mt-md">
        <q-btn
          color="deep-purple"
          @click="copyData"
          v-text="'Copy LNURL'"
        ></q-btn>
        <q-btn
          v-close-popup
          flat
          color="grey"
          class="q-ml-auto"
          v-text="'Close'"
        ></q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";

import { useQuasar } from "quasar";
import { saas } from "src/boot/saas";

export default defineComponent({
  name: "TableDarkMode",

  data() {
    return {
      data: [],
      showPaymentQrDialog: false,
      activeInstance: null,
      pagination: {
        rowsPerPage: 50,
        page: 1,
      },
      inProgress: false,
      columns: [
        {
          name: "success",
          label: "",
          field: "success",
          sortable: false,
          align: "center",
        },
        {
          name: "id",
          label: "Instance ID",
          field: "instance_id",
          sortable: true,
          align: "left",
        },
        {
          name: "name",
          label: "Name",
          field: "name",
          sortable: true,
          align: "left",
        },
        {
          name: "description",
          label: "Description",
          field: "description",
          sortable: true,
          align: "left",
        },
        {
          name: "cost_sats",
          label: "Sats",
          field: "cost_sats",
          sortable: true,
          align: "left",
        },
        {
          name: "extra_hours",
          label: "Hours",
          field: "extra_hours",
          sortable: true,
          align: "left",
        }
      ],
    };
  },
  setup() {
    const $q = useQuasar();

    return {
      q: $q,
      confirm(title, message) {
        return $q.dialog({
          title,
          message,
          cancel: true,
          persistent: true,
        });
      }
    };
  },
  methods: {
    refreshUserActivity: async function () {
      try {
        const {data} = await saas.getUserInstancesLogs();
        this.data = data
        console.log("### this.data", this.data)
      } catch (error) {
        console.warn(error);
        this.q.notify({
          message: "Failed to fetch activity!",
          caption: saas.mapErrorToString(error),
          color: "negative",
        });
      }
    },
  },
  async created() {
    await this.refreshUserActivity();
  },
});
</script>

<style>
.table-bg {
  background-color: #162b4d;
}
</style>
