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
          </q-item>
        </div>
      </div>
    </q-card-section>
  </q-card>
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
        <template v-slot:body-cell-action="props">
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
              :disable="!props.row.enabled"
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
              @click="resetInstance(props.row.id)"
              :disable="!props.row.enabled"
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
              v-if="props.row.enabled"
              :disable="props.row.expired"
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
              v-else
              :disable="props.row.expired"
              @click="enableInstance(props.row.id)"
              icon="play_circle_outline"
              size="sm"
              flat
              dense
            >
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                Enable: it will make your instance available again.
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

        <template v-slot:body-cell-progress="props">
          <q-td :props="props">
            <q-tooltip
              ><span v-text="props.row.progress + '%'"></span
            ></q-tooltip>
            <span
              v-text="props.row.timeLeftFormatted"
              class="float-right"
            ></span>
            <q-linear-progress
              dark
              :color="getColor(props.row.progress)"
              :value="props.row.progress / 100"
              class="q-mt-sm"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-id="props">
          <q-td :props="props">
            <q-btn
              type="a"
              :href="`/activity?instance_id=${props.row.id}`"
              :label="props.row.id"
              no-caps
              flat
              dense
            >
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                <span> Show activity for this instance. </span>
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <q-btn
              type="a"
              :href="props.row.instanceLink"
              :label="props.row.name"
              :disable="!props.row.enabled"
              target="_blank"
              no-caps
              flat
              dense
            >
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                <span v-if="props.row.expired"
                  >Instance was stopped because you ran out of time. Pay the
                  LNURL to start it again.</span
                >
                <span v-else> Open the instance in a new tab. </span>
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template v-slot:body-cell-enabled="props">
          <q-td :props="props">
            <q-icon
              v-if="props.row.enabled"
              name="done"
              size="sm"
              color="green"
            ></q-icon>
            <q-icon v-else name="close" size="sm" color="grey"></q-icon>
          </q-td>
        </template>
        <template v-slot:body-cell-active="props">
          <q-td :props="props">
            <q-icon
              v-if="props.row.active"
              name="cloud_done"
              size="sm"
              color="green"
            ></q-icon>
            <q-icon v-else name="cloud_off" size="sm" color="grey"></q-icon>
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

import { useQuasar, copyToClipboard } from "quasar";
import { saas } from "src/boot/saas";
import { secondsToDhm } from "src/boot/utils";

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
          name: "action",
          label: "",
          field: "action",
          sortable: false,
          align: "center",
        },
        {
          name: "name",
          label: "Name",
          field: "name",
          sortable: true,
          align: "left",
        },
        {
          name: "id",
          label: "Instance ID",
          field: "id",
          sortable: true,
          align: "left",
        },
        // {
        //   name: "timeLeft",
        //   label: "Time Left",
        //   field: "timeLeftFormatted",
        //   sortable: true,
        //   align: "left",
        // },
        {
          name: "progress",
          label: "Time Left",
          field: "progress",
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
          label: "Deployed",
          field: "active",
          sortable: true,
          align: "left",
        },

        {
          name: "Created Date",
          label: "Created Date",
          field: "createdDate",
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
      ],

      activityStats: [
        {
          title: "Instances",
          icon: "dns",
          value: 0,
          color1: "#546bfa",
          color2: "#3e51b5",
        },
        {
          title: "Enabled",
          icon: "power_settings_new",
          value: "0",
          color1: "#3a9688",
          color2: "#3e51b5",
        },
        {
          title: "Deployed",
          icon: "cloud_done",
          value: "0",
          color1: "#7cb342",
          color2: "#3e51b5",
        },
        {
          title: "Total Time Left",
          icon: "running_with_errors",
          value: "0",
          color1: "#f88c2b",
          color2: "#3e51b5",
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
        if (val > 95 && val <= 100) {
          return "red";
        }
        if (val > 70 && val <= 95) {
          return "orange";
        }
        if (val > 50 && val <= 70) {
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
            caption: saas.mapErrorToString(error),
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
          await this.refreshState();
        } catch (error) {
          console.warn(error);
          this.q.notify({
            message: `Failed to reset instance ${id}.`,
            caption: saas.mapErrorToString(error),
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
          " Disabling will make your instance unavailable." +
          " The clock is still ticking!"
      ).onOk(async () => {
        try {
          this.inProgress = true;
          const { data } = await saas.updateInstance(id, "disable");

          this.q.notify({
            message: data.message || `${data}`,
            color: "positive",
          });
          await this.refreshState();
        } catch (error) {
          console.warn(error);
          this.q.notify({
            message: `Failed to disable instance ${id}.`,
            caption: saas.mapErrorToString(error),
            color: "negative",
          });
        } finally {
          this.inProgress = false;
        }
      });
    },
    enableInstance: function (id) {
      this.confirm(`Enable ${id}`, "Are you sure you want to enable?").onOk(
        async () => {
          try {
            this.inProgress = true;
            const { data } = await saas.updateInstance(id, "enable");

            this.q.notify({
              message: data.message || `${data}`,
              color: "positive",
            });
            await this.refreshState();
          } catch (error) {
            console.warn(error);
            this.q.notify({
              message: `Failed to enable instance ${id}.`,
              caption: saas.mapErrorToString(error),
              color: "negative",
            });
          } finally {
            this.inProgress = false;
          }
        }
      );
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
          await this.refreshState();
        } catch (error) {
          console.warn(error);
          this.q.notify({
            message: `Failed to destroy instance '${id}'`,
            caption: saas.mapErrorToString(error),
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
          const updatedInstance = (data || [])
            .map((i) => saas.mapInstance(i))
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
            await this.refreshState();
            clearInterval(retryId);
          }
        } catch (error) {
          console.warn(error);
        }
      }, 3000);
    },
    serverStatus: async function () {
      try {
        await saas.status();
      } catch (error) {
        console.warn(error);
        this.q.notify({
          message: "Failed to check SaaS Server status!",
          caption: saas.mapErrorToString(error),
          color: "negative",
        });
      }
    },
    extendInstance: function (instance) {
      this.activeInstance = instance;
      this.showPaymentQrDialog = true;
      this.checkInstanceStatus(instance);
    },
    qrUrl: function () {
      return `https://demo.lnbits.com/api/v1/qrcode/${this.activeInstance.lnurl}`;
    },
    copyData: function () {
      copyToClipboard(this.activeInstance.lnurl);

      this.q.notify({
        message: "Copied",
        color: "grey",
      });
    },
    refreshState: async function () {
      try {
        const { data } = await saas.getInstances();
        await this.serverStatus();
        const tableData = (data || []).map((i) => saas.mapInstance(i));

        this.activityStats[0].value = tableData.length;
        this.activityStats[1].value = tableData.filter(
          (i) => i.enabled === true
        ).length;
        this.activityStats[2].value = tableData.filter(
          (i) => i.active === true
        ).length;
        this.activityStats[3].value = secondsToDhm(
          tableData.reduce((t, i) => t + i.timeLeft, 0)
        );

        this.data = tableData;
      } catch (error) {
        console.warn(error);
      }
    },
  },
  async created() {
    try {
      this.inProgress = true;
      await this.refreshState();
    } catch (error) {
      console.warn(error);
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
