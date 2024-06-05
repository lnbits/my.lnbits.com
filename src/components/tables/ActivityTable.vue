<template>
  <q-card class="bg-transparent no-shadow no-border q-mb-md" bordered>
    <q-card-section class="q-pa-none">
      <div class="row q-col-gutter-sm">
        <div
          v-for="(item, index) in activityStats"
          :key="index"
          class="col-md-3 col-sm-12 col-xs-12"
        >
          <q-item :style="`background-color: ${item.color1}`" class="q-pa-none">
            <q-item-section
              side
              :style="`background-color: ${item.color2}`"
              class="q-pa-lg q-mr-none text-white"
            >
              <q-icon :name="item.icon" color="white" size="24px"></q-icon>
            </q-item-section>
            <q-item-section class="q-pa-md q-ml-none text-white">
              <q-item-label class="text-white text-h6 text-weight-bolder">{{
                item.value
              }}</q-item-label>
              <q-item-label>{{ item.title }}</q-item-label>
            </q-item-section>
            <q-item-section
              v-if="icon_position === 'right'"
              side
              class="q-mr-md text-white"
            >
              <q-icon :name="item.icon" color="white" size="44px"></q-icon>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </q-card-section>
  </q-card>
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
        dense
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

      activityStats: [
        {
          title: "Instances",
          icon: "dns",
          value: 0,
          color1: "#546bfa",
          color2: "#3e51b5",
        },
        {
          title: "Hours Bought",
          icon: "timer",
          value: "20",
          color1: "#3a9688",
          color2: "#3e51b5",
        },
        {
          title: "Sats Paid",
          icon: "currency_bitcoin",
          value: "321",
          color1: "#7cb342",
          color2: "#3e51b5",
        },
        {
          title: "Activity Entries",
          icon: "reorder",
          value: "82",
          color1: "#f88c2b",
          color2: "#3e51b5",
        },
      ],

      pagination: {
        rowsPerPage: 20,
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
          name: "instance_name",
          label: "Instance Name",
          field: "instance_name",
          sortable: true,
          align: "left",
        },
        {
          name: "name",
          label: "Action",
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
          name: "time",
          label: "Time",
          field: "time",
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
        this.data = this.mapInstanceLogs(data);
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
        this.data = this.mapInstanceLogs(data);
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
        this.activityStats[0].value = data.length;
        this.instances = data.map((i) => ({
          value: i.id,
          label: `[${i.id}] ${i.domain}`,
          name: i.domain,
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
    instanceNameFromId: function (id) {
      const instance = this.instances.find((i) => i.value === id);
      if (instance) {
        return instance.name;
      }
      return "?";
    },
    mapInstanceLogs: function (logs) {
      this.activityStats[1].value = logs.reduce((t, l) => t + l.extra_hours, 0);
      this.activityStats[2].value = logs.reduce((t, l) => t + l.cost_sats, 0);
      this.activityStats[3].value = logs.length;
      return logs
        .map((i) => ({
          ...i,
          instance_name: this.instanceNameFromId(i.instance_id),
          time: new Date(i.timestamp * 1000).toLocaleString(),
        }))
        .reverse();
    },
  },
  async created() {
    try {
      this.inProgress = true;
      await this.fetchUserInstances();
      await this.fetchUserActivity();
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
