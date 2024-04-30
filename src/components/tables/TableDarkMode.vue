<template>
    <q-card class="table-bg no-shadow" bordered>
        <q-card-section>
            <div class="text-h6 text-white">
                <span v-text="header"></span>
                <q-btn @click="createInstance" label="New Instance" icon="add_to_queue" color="blue" class="float-right text-capitalize shadow-3" />
            </div>
        </q-card-section>
        <q-separator color="white" />
        <q-card-section class="q-pa-none">
            <q-table dark class="table-bg" :rows="data" :columns="columns" >
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
        <q-linear-progress dark :color="getColor(props.row.progress)" :value="props.row.progress / 100" class="q-mt-md" />
    </q-td>
</template>
      </q-table>
    </q-card-section>
  </q-card>
  <q-dialog v-model="qrDialog" position="top">
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
      <div class="row q-mt-md">
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

import { useQuasar, copyToClipboard } from "quasar";
import { saas } from "src/boot/saas";


export default defineComponent({
    name: "TableDarkMode",
    props: ["columns", "data", "header"],

    data() {
        return {
            qrDialog: false,
            activeInstance: null,
        };
    },
    setup() {
        const $q = useQuasar();

        return {
            $q,
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
        createInstance: function() {
            this.confirm(
                    "Create New Instance",
                    "You are about the create a new LNbits instance." +
                    " You will be propmpted with a Payment Request QR Code."
                )
                .onOk(async () => {
                    console.log("###  OK catcher");
                    try {
                        const { data } = await saas.createInstance()
                        console.log("### data", data)
                        const instance = saas.mapInstance(data)
                        this.data.push(instance)
                        this.extendInstance(instance)
                    } catch (error) {
                        console.log("### error", error)
                    }

                })
        },
        restartInstance: function(id) {
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
        resetInstance: function(id) {
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
        disableInstance: function(id) {
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
        destroyInstance: function(id) {
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
        extendInstance: function(instance) {
            this.activeInstance = instance;
            this.qrDialog = true;

            console.log("### activeInstance", this.activeInstance);
        },
        qrUrl: function() {
            return `https://demo.lnbits.com/api/v1/qrcode/${this.activeInstance.name}`;
        },
        copyInvoice: function() {
            copyToClipboard(this.activeInstance.lnurl);
            // this.$q.notify({
            //     message: "Copied to clipboard",
            // })
        },
    },
});
</script>

<style>
.table-bg {
    background-color: #162b4d;
}
</style>
