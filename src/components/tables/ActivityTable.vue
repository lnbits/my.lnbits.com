<template>
  <q-card class="table-bg no-shadow" bordered>
    <q-card-section>
      <div class="row">
        <div class="col-9">
          <div class="text-h6 text-white">
            <span>Instances Activity</span>
          </div>
        </div>
        <div class="col-3">
          <q-select
            @update:model-value="showActivty"
            v-model="selectedInstance"
            :options="instances"
            outlined
            dark
            dense
            color="white"
            clearable
            label="Instance activity"
          ></q-select>
        </div>
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
            <q-icon
              v-if="props.row.success === true"
              name="done"
              color="green"
            />
            <q-icon v-else name="warning" color="yellow" />
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
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
      instances: [],
      selectedInstance: null,

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
        },
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
      },
    };
  },
  methods: {
    fetchUserActivity: async function () {
      try {
        const { data } = await saas.getUserInstancesLogs();
        this.data = data;
      } catch (error) {
        console.warn(error);
        this.q.notify({
          message: "Failed to fetch activity!",
          caption: saas.mapErrorToString(error),
          color: "negative",
        });
      }
    },
    fetchInstanceActivity: async function (id) {
      try {
        const { data } = await saas.getInstancesLogs(id);
        this.data = data;
      } catch (error) {
        console.warn(error);
        this.q.notify({
          message: "Failed to fetch instance activity!",
          caption: saas.mapErrorToString(error),
          color: "negative",
        });
      }
    },
    fetchUserInstances: async function () {
      try {
        const { data } = await saas.getInstances();
        this.instances = data.map((i) => ({
          label: `[${i.id}] ${i.domain}`,
          value: i.id,
        }));
      } catch (error) {
        console.warn(error);
        this.q.notify({
          message: "Failed to fetch instances!",
          caption: saas.mapErrorToString(error),
          color: "negative",
        });
      }
    },
    showActivty: async function (instance) {
      try {
        this.inProgress = true;
        if (!instance) {
          await this.fetchUserActivity();
        } else {
          await this.fetchInstanceActivity(instance.value);
        }
      } catch (error) {
      } finally {
        this.inProgress = false;
      }
    },
  },
  async created() {
    try {
      this.inProgress = true;
      await this.fetchUserActivity();
      await this.fetchUserInstances();
    } catch (error) {
    } finally {
      this.inProgress = false;
    }
  },
});
</script>

<style>
.table-bg {
  background-color: #162b4d;
}
</style>
