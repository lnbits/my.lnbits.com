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
              @click="extendInstance(props.row.id)"
              icon="qr_code_2"
              size="sm"
              flat
              dense
            >
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                Extend the life of this instance.
              </q-tooltip>
            </q-btn>
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
            <q-btn
              @click="restartInstance(props.row.id)"
              icon="restart_alt"
              size="sm"
              flat
              dense
            >
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                Restart: restarting will make your instance temporarly
                unavailable.
              </q-tooltip>
            </q-btn>

            <q-btn
              @click="resetInstance(props.row.id)"
              icon="power_off"
              size="sm"
              flat
              dense
            >
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                Reset: delete all your admin settings including your super user.
              </q-tooltip>
            </q-btn>
            <q-btn
              @click="disableInstance(props.row.id)"
              icon="stop"
              size="sm"
              flat
              dense
            >
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                Disable: it will make your instance unavailable.
              </q-tooltip>
            </q-btn>
            <q-btn
              @click="destroyInstance(props.row.id)"
              icon="delete"
              size="sm"
              class="q-ml-sm"
              flat
              dense
            >
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
  <q-dialog v-model="instanceDialog" position="top">
    <q-card style="min-height: 200px" class="q-px-lg q-py-lg">
      <h3>Instance Control</h3>

      <p style="color: white">
        <q-img
          class="qrcode"
          style="width: 100%; height: auto"
          :src="qrUrl()"
          alt="LNURLp"
        />
      </p>
      <div class="row q-mt-lg">
        <q-btn
          color="deep-purple"
          @click="copyInvoice"
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

export default defineComponent({
  name: "TableDarkMode",
  props: ["columns", "data", "header"],

  data() {
    return {
      instanceDialog: false,
    };
  },
  setup() {
    const $q = useQuasar();

    return {
      confirm(title, message) {
        return $q.dialog({
          title,
          message,
          cancel: true,
          persistent: true,
        });
      },
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
  methods: {
    restartInstance: function (id) {
      this.confirm(
        `Restart ${id}`,
        "Are you sure you want to restart?" +
          " Restarting will make your instance temporarly unavailable."
      )
        .onOk(() => {
          console.log("###  OK catcher");
        })
        .onCancel(() => {
          console.log("### Cancel");
        });
    },
    resetInstance: function (id) {
      this.confirm(
        `Reset ${id}`,
        "Are you sure you want to reset?" +
          " Resetting will delete all your admin settings including your super user."
      )
        .onOk(() => {
          console.log("###  OK catcher");
        })
        .onCancel(() => {
          console.log("### Cancel");
        });
    },
    disableInstance: function (id) {
      this.confirm(
        `Disable ${id}`,
        "Are you sure you want to disable?" +
          " Disabling will make your instance unavailable."
      )
        .onOk(() => {
          console.log("###  OK catcher");
        })
        .onCancel(() => {
          console.log("### Cancel");
        });
    },
    destroyInstance: function (id) {
      this.confirm(
        `Destroy ${id}`,
        "Are you sure you want to destroy?" +
          " destroying will delete your instance and every bit of data."
      )
        .onOk(() => {
          console.log("###  OK catcher");
        })
        .onCancel(() => {
          console.log("### Cancel");
        });
    },
    extendInstance: function (id) {
      this.instanceDialog = true;
    },
    qrUrl: function () {
      return `https://demo.lnbits.com/api/v1/qrcode/adoringoryx9.lnbits.com`;
    },
  },
});
</script>

<style>
.table-bg {
  background-color: #162b4d;
}
</style>
