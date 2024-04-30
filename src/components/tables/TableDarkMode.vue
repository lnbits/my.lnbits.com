<template>
  <q-card class="table-bg no-shadow" bordered>
    <q-card-section>
      <div class="text-h6 text-white">
        <span>LNbits Instances</span>
        <q-btn
          @click="createInstance"
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
        <template v-slot:body-cell-Action="props">
          <q-td :props="props">
            <q-btn
              @click="extendInstance(props.row)"
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
      <q-linear-progress
        indeterminate
        color="secondary"
        class="q-mt-sm"
      />
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

import { useQuasar, copyToClipboard } from "quasar";
import { saas } from "src/boot/saas";

export default defineComponent({
  name: "TableDarkMode",

  data() {
    return {
      data: [],
      showPaymentQrDialog: false,
      activeInstance: null,
      pagination: {
        rowsPerPage: 25,
        page: 1,
      },
      inProgress: false,
      columns: [
        {
          name: "ID",
          label: "Instance ID",
          field: "id",
          sortable: true,
          align: "left",
        },
        {
          name: "Name",
          label: "Name",
          field: "name",
          sortable: true,
          align: "left",
        },
        {
          name: "enabled",
          label: "Enabled",
          field: "enabled",
          sortable: true,
          align: "left",
        },
        {
          name: "active",
          label: "Active",
          field: "active",
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
    createInstance: function () {
      this.confirm(
        "Create New Instance",
        "You are about the create a new LNbits instance." +
          " You will be propmpted with a Payment Request QR Code."
      ).onOk(async () => {
        try {
          this.inProgress = true;
          const { data } = await saas.createInstance();
          const instance = saas.mapInstance(data);
          this.data.push(instance);
          this.extendInstance(instance);
        } catch (error) {
          console.warn(error);
          this.q.notify({
            message: "Failed to create instance",
            color: "negative",
          });
        } finally {
          this.inProgress = false;
        }
      });
    },
    restartInstance: function (id) {
      this.confirm(
        `Restart ${id}`,
        "Are you sure you want to restart?" +
          " Restarting will make your instance temporarly unavailable."
      ).onOk(async () => {
        try {
          this.inProgress = true;
          const { data } = await saas.updateInstance(id, "restart");
          this.q.notify({
            message: data.message || `${data}`,
            color: "positive",
          });
        } catch (error) {
          console.warn(error);
          this.q.notify({
            message: `Failed to restart instance ${id}.`,
            color: "negative",
          });
        } finally {
          this.inProgress = false;
        }
      });
    },
    resetInstance: function (id) {
      this.confirm(
        `Reset ${id}`,
        "Are you sure you want to reset?" +
          " Resetting will delete all your admin settings including your super user."
      ).onOk(async () => {
        try {
          this.inProgress = true;
          const { data } = await saas.updateInstance(id, "reset");
          this.q.notify({
            message: data.message || `${data}`,
            color: "positive",
          });
        } catch (error) {
          console.warn(error);
          this.q.notify({
            message: `Failed to reset instance ${id}.`,
            color: "negative",
          });
        } finally {
          this.inProgress = false;
        }
      });
    },
    disableInstance: function (id) {
      this.confirm(
        `Disable ${id}`,
        "Are you sure you want to disable?" +
          " Disabling will make your instance unavailable."
      ).onOk(async () => {
        try {
          this.inProgress = true;
          const { data } = await saas.updateInstance(id, "disable");

          this.q.notify({
            message: data.message || `${data}`,
            color: "positive",
          });
        } catch (error) {
          console.warn(error);
          this.q.notify({
            message: `Failed to disable instance ${id}.`,
            color: "negative",
          });
        } finally {
          this.inProgress = false;
        }
      });
    },
    destroyInstance: function (id) {
      this.confirm(
        `Destroy ${id}`,
        "Are you sure you want to destroy?" +
          " destroying will delete your instance and every bit of data."
      ).onOk(async () => {
        try {
          this.inProgress = true;
          const { data } = await saas.updateInstance(id, "destroy");
          const index = this.data.findIndex((i) => i.id == id);
          if (index >= 0) {
            this.data.splice(index, 1);
          }
          this.q.notify({
            message: data.message || `${data}`,
            color: "positive",
          });
        } catch (error) {
          console.warn(error);
          this.q.notify({
            message: `Failed to destroy instance '${id}'`,
            color: "negative",
          });
        } finally {
          this.inProgress = false;
        }
      });
    },
    checkInstanceStatus: function (instance) {
      const retryId = setInterval(async () => {
        try {
          const { data } = await saas.getInstances();
          console.log("### checkInstance", data);
          const updatedInstance = (data || [])
            .map(saas.mapInstance)
            .find((i) => i.id === instance.id);
          if (
            updatedInstance &&
            updatedInstance.timestampStop > instance.timestampStop
          ) {
            this.showPaymentQrDialog = false;
            this.q.notify({
              message: `Instance ${instance.name} (${instance.id}) extended!`,
              color: "positive",
            });
          }
          if (!this.showPaymentQrDialog) {
            console.log("### clearInterval no dialog", retryId);
            clearInterval(retryId);
          }
        } catch (error) {
          console.warn(error);
        }
      }, 3000);
    },
    extendInstance: function (instance) {
      this.activeInstance = instance;
      this.showPaymentQrDialog = true;
      this.checkInstanceStatus(instance);
    },
    qrUrl: function () {
      return `https://demo.lnbits.com/api/v1/qrcode/${this.activeInstance.name}`;
    },
    copyData: function () {
      copyToClipboard(this.activeInstance.lnurl);

      this.q.notify({
        message: "Copied",
        color: "grey",
      });
    },
  },
  async created() {
    try {
      const { data } = await saas.getInstances();
      const tableData = (data || []).map(saas.mapInstance);

      this.data = tableData;
    } catch (error) {
      console.warn(error);
    }
  },
});
</script>

<style>
.table-bg {
  background-color: #162b4d;
}
</style>
