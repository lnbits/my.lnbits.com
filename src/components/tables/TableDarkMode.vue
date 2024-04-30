<template>
  <q-card class="table-bg no-shadow" bordered>
    <q-card-section>
      <div class="text-h6 text-white">
        <span v-text="header"></span>
        <q-btn
          label="New Instance"
          icon="add_to_queue"
          color="blue"
          class="float-right text-capitalize shadow-3"
        />
      </div>
    </q-card-section>
    <q-separator color="white" />
    <q-card-section class="q-pa-none">
      <q-table
        dark
        class="table-bg"
        :rows="data"
        :columns="columns"
        hide-bottom
      >
        <template v-slot:body-cell-Action="props">
          <q-td :props="props">
            <q-btn
              type="a"
              :href="props.row.instanceLink"
              target="_blank"
              icon="launch"
              size="sm"
              flat
              dense
            >
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                Open the instance in a new tab.
              </q-tooltip>
            </q-btn>
            <q-btn
              type="a"
              :href="props.row.backupLink"
              target="_blank"
              icon="download"
              size="sm"
              flat
              dense
            >
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                Download Backup.
              </q-tooltip>
            </q-btn>
            <q-btn icon="restart_alt"  size="sm" flat dense>
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                Restart: restarting will make your instance temporarly
                unavailable.
              </q-tooltip>
            </q-btn>

            <q-btn icon="power_off"  size="sm" flat dense>
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                Reset: delete all your admin settings including your super user.
              </q-tooltip> </q-btn
            >
            <q-btn icon="stop"  size="sm" flat dense>
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                Stop: it will make your instance unavailable.
              </q-tooltip>
            </q-btn>
            <q-btn icon="delete" size="sm" class="q-ml-sm" flat dense>
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                Destroy: destroying will delete your instance and every bit of
                data.
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template v-slot:body-cell-Progress="props">
          <q-td :props="props">
            <q-linear-progress
              dark
              :color="getColor(props.row.progress)"
              :value="props.row.progress / 100"
              class="q-mt-md"
            />
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "TableDarkMode",
  props: ["columns", "data", "header"],
  watch: {
    data(o, n) {
      console.log("### o n", o, n);
    },
  },
  setup() {
    return {
      getColor(val) {
        if (val > 70 && val <= 100) {
          return "red";
        } else if (val > 50 && val <= 70) {
          return "blue";
        }
        return "green";
      },
    };
  },
});
</script>

<style>
.table-bg {
  background-color: #162b4d;
}
</style>
