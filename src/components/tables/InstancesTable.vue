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
    <q-card-section class="q-pa-none">
      <div class="row q-col-gutter-sm q-mt-md">
        <div class="col">
          <q-item class="q-pa-none bg-grey-8">
            <q-item-section side class="q-pa-lg q-mr-none text-white bg-black">
              <q-icon name="info" color="white" size="24px"></q-icon>
            </q-item-section>
            <q-item-section class="q-pa-md q-ml-none text-white">
              <q-item-label class="text-white text-h6 text-weight-bolder"
                >New Instances Creation</q-item-label
              >
              <q-item-label
                >It takes a few minutes to create a new instance after the
                payment is confirmed. Please wait.</q-item-label
              >
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

        <template v-slot:body-cell-methods="props">
          <q-td :props="props">
            <q-btn
              @click="subscriptionInstance(props.row.id, false)"
              icon="currency_bitcoin"
              size="sm"
              flat
              dense
            >
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                Pay for a one-time plan with BTC.
              </q-tooltip>
            </q-btn>
            <q-btn
              @click="subscriptionInstance(props.row.id, true)"
              icon="attach_money"
              size="sm"
              flat
              dense
            >
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                Get a subscription plan or pay once with USD.
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
  <q-dialog v-model="qrCodeDialog.show" position="top">
    <q-card style="min-height: 200px" class="q-pa-lg">
      <h5 class="q-mt-sm">
        <span>Instance: &nbsp;</span><span v-text="activeInstance.id"></span>
      </h5>
      <div v-if="qrCodeDialog.dataIsUrl">
        <p>
          Scan the QR code to open the link for the checkount page. Or open the
          link in a new tab.
          <q-btn
            type="a"
            :href="qrCodeDialog.data"
            target="_blank"
            class="full-width"
            outline
            >Open Checkout Page</q-btn
          >
        </p>
      </div>
      <p v-else>
        Scan the QR code below using a lightning wallet to add credit to your
        balance for this instance.
      </p>

      <p style="color: white" class="text-center">
        <q-img
          class="qrcode"
          style="width: 100%; height: auto; max-width: 350px"
          :src="qrUrl()"
          alt="LNURLp"
        />
      </p>
      <h5><span v-text="activeInstance.name"></span></h5>
      <q-linear-progress indeterminate color="secondary" class="q-mt-sm" />
      <div class="row q-mt-md">
        <q-btn
          v-close-popup
          flat
          color="primary"
          class="q-mr-auto"
          v-text="'Close'"
        ></q-btn>
        <q-btn color="primary" @click="copyData" v-text="'Copy'"></q-btn>
      </div>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showProvisioning" backdrop-filter="blur(4px)" persistent>
    <q-card style="width: 95%; max-width: 1200px" class="q-mx-auto">
      <q-card-section class="q-py-lg bg-secondary text-white column">
        <div class="text-h6">Your VPS is being provisioned...</div>
        <div>
          Please wait while we set up your server. This may take a few minutes.
        </div>
      </q-card-section>
      <q-linear-progress indeterminate></q-linear-progress>
      <q-carousel
        v-model="slide"
        arrows
        infinite
        :autoplay="10000"
        transition-prev="slide-right"
        transition-next="slide-left"
        animated
        height="800px"
        control-type="regular"
        control-color="secondary"
        style="max-height: 75vh"
      >
        <q-carousel-slide
          v-for="(slide, index) in slides"
          :key="index"
          :name="index"
          :img-src="slide.image"
          class=""
        >
          <div class="absolute-bottom custom-caption">
            <div class="text-h5">{{ slide.title }}</div>
            <div class="text-subtitle1">{{ slide.description }}</div>
          </div>
        </q-carousel-slide>
      </q-carousel>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog
    v-model="planDialog.show"
    backdrop-filter="blur(4px)"
    persistent
    @hide="resetSubscriptionDialog"
  >
    <q-card style="width: 95%; max-width: 700px" class="q-mx-auto">
      <q-card-section class="q-py-lg bg-secondary text-white column">
        <div class="text-h6">
          {{
            planDialog.instanceId
              ? `${
                  planDialog.fiat ? 'Add Subscription to' : 'Extend'
                } Instance (${planDialog.instanceId})`
              : 'Create New Instance'
          }}
        </div>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <div v-if="!planDialog.hideFeatures.tab">
          <q-btn-toggle
            v-model="planDialog.subscription"
            spread
            style="border-radius: 0"
            unelevated
            toggle-color="primary"
            color="white"
            text-color="grey-5"
            :disable="planDialog.disabled_tab"
            :options="[
              {
                label: 'Subscription Plan',
                value: true
              },
              {
                label: 'One Time',
                value: false
              }
            ]"
          />
        </div>
      </q-card-section>
      <q-card-section class="q-mb-lg">
        <div>
          <div v-if="planDialog.subscription">
            Choose a subscription plan and we'll automatically renew it for you.
            Cancel anytime with no commitments or hidden fees.
          </div>
          <div v-else>
            Pay once for immediate access—no recurring charges. Perfect for
            temporary projects or when you need flexibility without a
            subscription.
          </div>
        </div>
        <div class="q-py-lg">
          <q-list padding class="">
            <ItemPricing
              v-model:plan="planDialog.plan"
              v-model:count="planDialog.count"
              :subscription="planDialog.subscription"
              :caption="
                planDialog.subscription
                  ? 'Automatically renews every week. Great for ongoing projects without long-term commitment. Cancel anytime before renewal.'
                  : 'Pay once for 1 week, or more, of access. No automatic renewal. Perfect for testing, demos, or short-term projects.'
              "
              :price="2.99"
              :min="1"
              :max="8"
              :step="1"
              plan-value="weekly"
            />
            <ItemPricing
              v-model:plan="planDialog.plan"
              v-model:count="planDialog.count"
              :subscription="planDialog.subscription"
              :caption="
                planDialog.subscription
                  ? 'Best value for regular use. Renews monthly and saves you 25% compared to weekly billing. Cancel anytime, no questions asked.'
                  : 'Pay once for 1 month, or more, of access with no recurring charges. Ideal when you need a month of service without ongoing commitment.'
              "
              :price="10.99"
              :min="1"
              :max="12"
              :step="1"
              plan-value="monthly"
            />
            <ItemPricing
              v-model:plan="planDialog.plan"
              v-model:count="planDialog.count"
              :subscription="planDialog.subscription"
              :caption="
                planDialog.subscription
                  ? 'Maximum savings with 38% off—like getting 2+ months free. Renews annually. Perfect for businesses and power users.'
                  : 'Pay once for 365 days of access. Maximum value with 38% savings and zero subscription management. Set it and forget it.'
              "
              :price="109.99"
              :min="1"
              :max="5"
              :step="1"
              plan-value="yearly"
            />
          </q-list>
        </div>
        <div
          v-if="!planDialog.subscription && !planDialog.hideFeatures.currency"
          class="flex-center"
        >
          <div class="text-subtitle1 q-mb-md">Choose payment method</div>
          <q-btn-toggle
            v-model="planDialog.fiat"
            toggle-color="primary"
            text-color="grey-5"
            class="no-shadow"
            :options="[
              {label: 'USD', value: true},
              {label: 'BTC', value: false}
            ]"
          />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          class="q-mr-auto"
          flat
          label="Close"
          color="primary"
          v-close-popup
        ></q-btn>
        <q-btn
          :disable="!planDialog.plan"
          :label="planDialog.subscription ? 'Subscribe Plan' : 'Buy Now'"
          color="positive"
          @click="submitPlan"
        ></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {defineComponent} from 'vue'

import {useQuasar, copyToClipboard} from 'quasar'
import {saas} from 'src/boot/saas'
import {secondsToDhm} from 'src/boot/utils'

import ItemPricing from 'components/cards/ItemPricing.vue'

export default defineComponent({
  name: 'TableDarkMode',
  props: {
    plan: String
  },
  components: {
    ItemPricing
  },
  data() {
    return {
      data: [],
      qrCodeData: null,
      qrCodeDialog: {
        show: false,
        data: null,
        dataIsUrl: false
      },
      activeInstance: null,
      pagination: {
        rowsPerPage: 25,
        page: 1
      },
      inProgress: false,
      showProvisioning: false,
      columns: [
        {
          name: 'action',
          label: '',
          field: 'action',
          sortable: false,
          align: 'center'
        },
        {
          name: 'methods',
          label: 'Payment Plans',
          field: 'methods',
          sortable: false,
          align: 'left'
        },
        {
          name: 'name',
          label: 'Name',
          field: 'name',
          sortable: true,
          align: 'left'
        },
        {
          name: 'id',
          label: 'Instance ID',
          field: 'id',
          sortable: true,
          align: 'left'
        },
        {
          name: 'status',
          label: 'Status',
          field: 'statusText',
          sortable: true,
          align: 'left'
        },
        {
          name: 'progress',
          label: 'Time Left',
          field: 'progress',
          align: 'left'
        },
        // {
        //   name: "enabled",
        //   label: "Enabled",
        //   field: "enabled",
        //   sortable: true,
        //   align: "left",
        // },
        // {
        //   name: "active",
        //   label: "Deployed",
        //   field: "active",
        //   sortable: true,
        //   align: "left",
        // },

        {
          name: 'Created Date',
          label: 'Created Date',
          field: 'createdDate',
          sortable: true,
          align: 'left'
        },
        {
          name: 'Stop Date',
          label: 'Stop Date',
          field: 'stopDate',
          sortable: true,
          align: 'left'
        }
      ],

      activityStats: [
        {
          title: 'Instances',
          icon: 'dns',
          value: 0,
          color1: '#546bfa',
          color2: '#3e51b5'
        },
        {
          title: 'Enabled',
          icon: 'power_settings_new',
          value: '0',
          color1: '#3a9688',
          color2: '#3e51b5'
        },
        {
          title: 'Deployed',
          icon: 'cloud_done',
          value: '0',
          color1: '#7cb342',
          color2: '#3e51b5'
        },
        {
          title: 'Total Time Left',
          icon: 'running_with_errors',
          value: '0',
          color1: '#f88c2b',
          color2: '#3e51b5'
        }
      ],
      slide: 0,
      slides: [
        {
          image: 'images/slide_1.jpg',
          title: 'Choose Your Funding Source',
          description:
            'Your LNbits will use a Liquid sidechain wallet to receive bitcoin payments. You can change to another funding source in the Settings > Funding screen.'
        },
        {
          image: 'images/slide_2.jpg',
          title: 'Your LNbits Wallet for Everyday Use',
          description: 'Send and receive bitcoin using your LNbits wallet.'
        },
        {
          image: 'images/slide_3.jpg',
          title: 'Extend LNbits with Powerful Extensions',
          description:
            'LNbits has dozens of extensions including a Point of Sale device, Split Payments and Boltz swaps.'
        },
        {
          image: 'images/slide_4.jpg',
          title: 'Connect LNbits to Your Favourite Apps and Services',
          description:
            'LNbits supports Nostr Wallet Connect and LNDHub, so you can easily integrate it with external wallets, apps or your own projects.'
        },
        {
          image: 'images/slide_5.jpg',
          title: 'Awesome for Developers with an API-First Architecture',
          description:
            'Excellent REST and WebSocket APIs to build and automate on Bitcoin.'
        },
        {
          image: 'images/slide_6.jpg',
          title: 'Hardware Support for Real-World Bitcoin Use',
          description:
            'LNbits works with Bitcoin ATMs, Point of Sale devices, Bolt Cards, and more, making it easy to bring bitcoin into shops, events, and everyday transactions. Visit the shop at shop.lnbits.com'
        }
      ],
      planDialog: {
        show: false,
        subscription: true,
        fiat: true,
        plan: null,
        count: 1,
        instanceId: null,
        hideFeatures: {
          tab: false,
          currency: false
        }
      }
    }
  },
  setup() {
    const $q = useQuasar()

    return {
      q: $q,
      confirm(title, message) {
        return $q.dialog({
          title,
          message,
          cancel: true,
          persistent: true
        })
      },
      getColor(val) {
        if (val > 95 && val <= 100) {
          return 'red'
        }
        if (val > 70 && val <= 95) {
          return 'orange'
        }
        if (val > 50 && val <= 70) {
          return 'blue'
        }
        return 'green'
      }
    }
  },
  methods: {
    createInstance: function () {
      this.confirm(
        'Create New Instance',
        'You are about the create a new LNbits instance.' +
          ' You will be shown a payment request QR code.' +
          ' Scan this QR code with a lightning wallet and deposit at least 21 sats to start your LNbits instance.' +
          ' It costs 21 sats to run an instance for one hour.'
      ).onOk(async () => {
        try {
          this.inProgress = true
          const {data} = await saas.createInstance()
          const instance = saas.mapInstance(data)
          this.data.push(instance)
          this.extendInstance(instance)
        } catch (error) {
          console.warn(error)
          this.q.notify({
            message: 'Failed to create instance',
            caption: saas.mapErrorToString(error),
            color: 'negative'
          })
        } finally {
          this.inProgress = false
        }
      })
    },
    resetSubscriptionDialog() {
      this.planDialog = {
        show: false,
        subscription: false,
        fiat: false,
        plan: null,
        count: 1,
        instanceId: null,
        hideFeatures: {
          tab: false,
          currency: false
        }
      }
    },
    subscriptionInstance(id, fiat) {
      this.planDialog.fiat = fiat
      this.planDialog.subscription = fiat
      this.planDialog.plan = 'monthly'
      if (id) {
        this.planDialog.instanceId = id
      }
      this.planDialog.hideFeatures.tab = true
      this.planDialog.hideFeatures.currency = true
      this.planDialog.show = true
    },
    async submitPlan() {
      // validate planDialog data, make saas request for payment details
      console.log('### planDialog', this.planDialog)
      if (this.planDialog.subscription) {
        console.log('### subscribe plan')
        return
      } else {
        const {data} = await saas.createOneTimePlan(
          this.planDialog.instanceId,
          this.planDialog.plan,
          this.planDialog.count,
          this.planDialog.fiat
        )
        console.log('### one time plan data', data)
        this.extendInstance(
          this.data.find(i => i.id === this.planDialog.instanceId),
          data.payment_request,
          true
        )
      }
      return
    },
    resetInstance: function (id) {
      this.confirm(
        `Reset ${id}`,
        'Are you sure you want to reset?' +
          ' Resetting will delete all your admin settings including your super user.'
      ).onOk(async () => {
        try {
          this.inProgress = true
          const {data} = await saas.updateInstance(id, 'reset')
          this.q.notify({
            message: data.message || `${data}`,
            color: 'positive'
          })
          await this.refreshState()
        } catch (error) {
          console.warn(error)
          this.q.notify({
            message: `Failed to reset instance ${id}.`,
            caption: saas.mapErrorToString(error),
            color: 'negative'
          })
        } finally {
          this.inProgress = false
        }
      })
    },
    disableInstance: function (id) {
      this.confirm(
        `Disable ${id}`,
        'Are you sure you want to disable?' +
          ' Disabling will make your instance unavailable.' +
          ' The clock is still ticking!'
      ).onOk(async () => {
        try {
          this.inProgress = true
          const {data} = await saas.updateInstance(id, 'disable')

          this.q.notify({
            message: data.message || `${data}`,
            color: 'positive'
          })
          await this.refreshState()
        } catch (error) {
          console.warn(error)
          this.q.notify({
            message: `Failed to disable instance ${id}.`,
            caption: saas.mapErrorToString(error),
            color: 'negative'
          })
        } finally {
          this.inProgress = false
        }
      })
    },
    enableInstance: function (id) {
      this.confirm(`Enable ${id}`, 'Are you sure you want to enable?').onOk(
        async () => {
          try {
            this.inProgress = true
            const {data} = await saas.updateInstance(id, 'enable')

            this.q.notify({
              message: data.message || `${data}`,
              color: 'positive'
            })
            await this.refreshState()
          } catch (error) {
            console.warn(error)
            this.q.notify({
              message: `Failed to enable instance ${id}.`,
              caption: saas.mapErrorToString(error),
              color: 'negative'
            })
          } finally {
            this.inProgress = false
          }
        }
      )
    },
    destroyInstance: function (id) {
      this.confirm(
        `Destroy ${id}`,
        'Are you sure you want to destroy?' +
          ' This action will delete all data and is not recoverable.'
      ).onOk(async () => {
        try {
          this.inProgress = true
          const {data} = await saas.updateInstance(id, 'destroy')
          const index = this.data.findIndex(i => i.id == id)
          if (index >= 0) {
            this.data.splice(index, 1)
          }
          this.q.notify({
            message: data.message || `${data}`,
            color: 'positive'
          })
          await this.refreshState()
        } catch (error) {
          console.warn(error)
          this.q.notify({
            message: `Failed to destroy instance '${id}'`,
            caption: saas.mapErrorToString(error),
            color: 'negative'
          })
        } finally {
          this.inProgress = false
        }
      })
    },
    checkInstanceStatus: function (instance) {
      const retryId = setInterval(async () => {
        try {
          const {data} = await saas.getInstances()
          const updatedInstance = (data || [])
            .map(i => saas.mapInstance(i))
            .find(i => i.id === instance.id)
          if (
            updatedInstance &&
            updatedInstance.timestampStop > instance.timestampStop
          ) {
            this.qrCodeDialog.show = false
            this.q.notify({
              message: `Instance ${instance.name} (${instance.id}) extended!`,
              color: 'positive'
            })
            await this.checkInstanceProvisioning(updatedInstance)
          }
          if (!this.qrCodeDialog.show) {
            await this.refreshState()
            clearInterval(retryId)
          }
        } catch (error) {
          console.warn(error)
        }
      }, 3000)
    },
    async checkInstanceProvisioning(instance) {
      let timeout = 5 * 60 * 1000 // 5 minutes max wait
      this.showProvisioning = true
      const intervalId = setInterval(async () => {
        try {
          const response = await fetch(
            `https://${instance.name}/static/i18n/en.js`
          )
          if (response.status === 200) {
            this.showProvisioning = false
            this.q.notify({
              message: `Instance ${instance.name} (${instance.id}) is ready!`,
              color: 'positive'
            })
            await this.refreshState()
            clearInterval(intervalId)
          } else if (response.status === 503) {
            // Service unavailable, keep waiting
            return
          }
          timeout -= 5000
          if (timeout <= 0) {
            this.showProvisioning = false
            this.q.notify({
              message: `Instance ${instance.name} (${instance.id}) is taking too long to be ready. Please try again later.`,
              color: 'warning'
            })
            await this.refreshState()
            clearInterval(intervalId)
          }
        } catch (error) {
          // Ignore CORS errors and other network errors, just continue polling
          console.debug('Provisioning ping error (ignored):', error)
        }
      }, 5000)
    },
    serverStatus: async function () {
      try {
        return await saas.status()
      } catch (error) {
        console.warn(error)
        this.q.notify({
          message: 'Failed to check SaaS Server status!',
          caption: saas.mapErrorToString(error),
          color: 'negative'
        })
      }
    },
    extendInstance: function (instance, qrCodeData, dataIsUrl = false) {
      this.activeInstance = instance

      this.qrCodeDialog.data = qrCodeData || instance.lnurl
      this.qrCodeDialog.dataIsUrl = dataIsUrl
      this.qrCodeDialog.show = true

      this.checkInstanceStatus(instance)
    },
    qrUrl: function () {
      const encoded = encodeURIComponent(this.qrCodeDialog.data)
      // return `https://prod.lnbits.com/api/v1/qrcode?data=${encoded}`
      return `http://localhost:5000/api/v1/qrcode?data=${encoded}`
    },
    copyData: function () {
      copyToClipboard(this.qrCodeDialog.data)

      this.q.notify({
        message: 'Copied',
        color: 'grey'
      })
    },
    refreshState: async function () {
      try {
        const {data} = await saas.getInstances()

        await this.serverStatus()
        const tableData = (data || []).map(i => saas.mapInstance(i))

        this.activityStats[0].value = tableData.length
        this.activityStats[1].value = tableData.filter(
          i => i.enabled === true
        ).length
        this.activityStats[2].value = tableData.filter(
          i => i.active === true
        ).length
        this.activityStats[3].value = secondsToDhm(
          tableData.reduce((t, i) => t + i.timeLeft, 0)
        )

        this.data = tableData
      } catch (error) {
        console.warn(error)
      }
    }
  },
  async created() {
    try {
      this.inProgress = true
      await this.refreshState()
    } catch (error) {
      console.warn(error)
    } finally {
      this.inProgress = false
      if (this.plan) {
        this.planDialog.plan = this.plan
        this.planDialog.show = true
        // remove query params from URL
        this.$router.replace({query: null}).catch(() => {
          // Ignore errors
        })
      }
    }
  }
})
</script>

<style>
.table-bg {
  background-color: #162b4d;
}

.custom-caption {
  padding: 12px;
  color: white;
  background-color: rgba(0, 0, 0, 0.35);
}
</style>
