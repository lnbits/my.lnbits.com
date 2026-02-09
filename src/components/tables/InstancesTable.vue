<template>
  <q-card class="bg-transparent no-shadow no-border q-mb-md" bordered>
    <q-card-section class="q-pa-none">
      <div class="row q-col-gutter-sm">
        <div
          v-for="(item, index) in activityStats"
          :key="index"
          class="col-md-3 col-sm-12 col-xs-12"
        >
          <CardStats
            :title="item.title"
            :icon="item.icon"
            :value="item.value"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
  <q-card class="no-shadow">
    <q-card-section class="q-pa-none q-mb-md">
      <div class="row q-mt-md">
        <div class="col-12">
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
  <q-card class="no-shadow" bordered>
    <q-card-section class="q-pa-none">
      <q-table
        class="table-bg"
        :rows="data"
        :columns="columns"
        :pagination.sync="pagination"
        title="LNbits Instances"
        :loading="inProgress"
      >
        <template v-slot:top-right>
          <q-btn
            @click="selectPlan.show = true"
            label="New Instance"
            icon="add_to_queue"
            color="primary"
            class="float-right text-capitalize"
          />
        </template>
        <template v-slot:body-cell-action="props">
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
              @click="extendInstance(props.row)"
              icon="qr_code_2"
              size="sm"
              flat
              dense
            >
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                Extend the life of this instance per hour. Pay with BTC.
              </q-tooltip>
            </q-btn>
            <q-btn
              @click="subscriptionInstance(props.row.id, 'BTC')"
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
              v-if="showFeatureFlag"
              @click="subscriptionInstance(props.row.id, 'USD')"
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
        <q-responsive :ratio="1" class="q-mx-xl">
          <qrcode-vue
            :value="qrCodeDialog.data"
            :options="{width: 340}"
            level="Q"
            render-as="svg"
            class="rounded-borders"
          ></qrcode-vue>
        </q-responsive>
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
      <q-card-section
        class="row items-center q-py-lg gradient-bg--primary text-white"
      >
        <div>
          <div
            class="text-h6"
            v-text="
              isProvisioning
                ? 'Your VPS is being provisioned...'
                : 'Provisioned'
            "
          ></div>
          <div
            v-text="
              isProvisioning
                ? 'Please wait while we set up your server. This may take a few minutes.'
                : 'Your VPS is ready!'
            "
          ></div>
        </div>
        <q-space></q-space>
        <q-btn icon="close" flat round dense v-close-popup></q-btn>
      </q-card-section>
      <q-linear-progress
        v-if="isProvisioning"
        indeterminate
      ></q-linear-progress>
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
    </q-card>
  </q-dialog>
  <q-dialog
    v-model="planDialog.show"
    backdrop-filter="blur(4px)"
    persistent
    @hide="resetSubscriptionDialog"
  >
    <q-card style="width: 95%; max-width: 700px" class="table-bg q-mx-auto">
      <q-card-section class="q-py-lg gradient-bg--primary text-white column">
        <div class="text-h6">
          {{
            planDialog.instanceId
              ? `${
                  planDialog.fiatOnly ? 'Add Subscription to' : 'Extend'
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
            Cancel anytime with no commitments or hidden fees. Fiat payments
            only.
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
              :price="2.0"
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
                  ? 'Best value for regular use. Renews monthly. Cancel anytime, no questions asked.'
                  : 'Pay once for 1 month, or more, of access with no recurring charges. Ideal when you need a month of service without ongoing commitment.'
              "
              :price="7.0"
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
                  ? 'Renews annually. Buy 12 months for the price of 10.'
                  : 'Buy 12 months for the price of 10. Set it and forget it. '
              "
              :price="70.0"
              :min="1"
              :max="5"
              :step="1"
              plan-value="yearly"
            />
          </q-list>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          class="q-mr-auto"
          label="Close"
          color="primary"
          outline
          v-close-popup
        ></q-btn>
        <q-spinner-bars
          v-if="planDialog.inProgress"
          color="primary"
          size="2.55em"
        ></q-spinner-bars>
        <q-btn
          v-else-if="planDialog.subscription"
          :disable="!planDialog.plan"
          label="Subscribe"
          color="positive"
          @click="submitPlanRequest"
        ></q-btn>
        <div v-else>
          <q-btn
            v-if="!planDialog.bitcoinOnly && showFeatureFlag"
            :disable="!planDialog.plan"
            label="Buy with USD"
            color="positive"
            outline
            @click="submitPlanRequest(true)"
          ></q-btn>
          <q-btn
            v-if="!planDialog.fiatOnly"
            :disable="!planDialog.plan"
            label="Buy with BTC"
            color="positive"
            class="q-ml-sm"
            @click="submitPlanRequest"
          ></q-btn>
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="selectPlan.show" backdrop-filter="blur(4px)" persistent>
    <q-card style="width: 95%; max-width: 700px" class="table-bg q-mx-auto">
      <q-card-section class="q-py-lg gradient-bg--primary text-white column">
        <div class="text-h6">Select a method</div>
      </q-card-section>
      <q-card-section class="q-mb-lg">
        <div>
          <div>
            Choose a subscription plan and we'll automatically renew it for you.
            Cancel anytime with no commitments or hidden fees.
          </div>
        </div>
        <div class="q-py-lg">
          <q-list padding class="">
            <q-item tag="label">
              <q-item-section avatar top>
                <q-radio
                  v-model="selectPlan.method"
                  val="one-time"
                  color="secondary"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-capitalize"
                  >One Time Payment</q-item-label
                >
                <q-item-label caption
                  >Choose a one time plan, pay in Bitcoin or Fiat</q-item-label
                >
              </q-item-section>
              <q-item-section side>
                <div>
                  <q-icon
                    v-if="showFeatureFlag"
                    name="attach_money"
                    color="green"
                    size="xs"
                  />
                  <q-icon name="currency_bitcoin" color="orange" size="xs" />
                </div>
              </q-item-section>
            </q-item>
            <q-item v-if="showFeatureFlag" tag="label">
              <q-item-section avatar top>
                <q-radio
                  v-model="selectPlan.method"
                  val="subscription"
                  color="secondary"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-capitalize"
                  >Subscription Plans</q-item-label
                >
                <q-item-label caption
                  >Choose a subscription plan, pay in Fiat</q-item-label
                >
              </q-item-section>
              <q-item-section side>
                <q-icon name="attach_money" color="green" size="xs" />
              </q-item-section>
            </q-item>
            <q-item tag="label">
              <q-item-section avatar top>
                <q-radio
                  v-model="selectPlan.method"
                  val="on-demand"
                  color="secondary"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-capitalize">On-Demand</q-item-label>
                <q-item-label caption
                  >Pay as you go, 21 sats per hour</q-item-label
                >
              </q-item-section>
              <q-item-section side>
                <q-icon name="currency_bitcoin" color="orange" size="xs" />
              </q-item-section>
            </q-item>
          </q-list>
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
          :disable="!selectPlan.method"
          label="Proceed"
          color="positive"
          @click="showNewInstanceProvisioning"
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
import QrcodeVue from 'qrcode.vue'

import ItemPricing from 'components/cards/ItemPricing.vue'
import CardStats from 'components/cards/CardStats.vue'

export default defineComponent({
  name: 'TableDarkMode',
  props: {
    plan: String
  },
  components: {
    ItemPricing,
    CardStats,
    QrcodeVue
  },
  data() {
    return {
      showFeatureFlag: false,
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
      isProvisioning: true,
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
        inProgress: false,
        fiat: true,
        plan: null,
        count: 1,
        instanceId: null,
        hideFeatures: {
          tab: false
        }
      },
      selectPlan: {
        show: false,
        method: null
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
    showNewInstanceProvisioning: async function () {
      this.selectPlan.show = false
      if (this.selectPlan.method === 'one-time') {
        this.planDialog.hideFeatures.tab = true
        this.planDialog.subscription = false
        this.planDialog.fiatOnly = false
        this.planDialog.bitcoinOnly = false
        this.planDialog.show = true
      } else if (this.selectPlan.method === 'subscription') {
        this.planDialog.plan = 'monthly'
        this.planDialog.hideFeatures.tab = true
        this.planDialog.subscription = true
        this.planDialog.fiatOnly = true
        this.planDialog.bitcoinOnly = false
        this.planDialog.show = true
      } else if (this.selectPlan.method === 'on-demand') {
        this.confirm('You are about the create a new LNbits instance.').onOk(
          async () => {
            const instance = await this.createInstance()
            if (instance) {
              await this.extendInstance(instance)
            }
          }
        )
      }
      this.selectPlan.method = null
    },
    subscriptionInstance(instanceId, currency) {
      currency = (currency || 'USD').trim().toUpperCase()
      this.planDialog.fiatOnly = currency == 'USD'
      this.planDialog.bitcoinOnly = currency == 'BTC'
      this.planDialog.subscription = currency == 'USD'
      this.planDialog.plan = 'monthly'
      if (instanceId) {
        this.planDialog.instanceId = instanceId
      }
      this.planDialog.hideFeatures.tab = currency !== 'USD'

      this.planDialog.show = true
    },

    createInstance: async function () {
      try {
        this.inProgress = true
        const {data} = await saas.createInstance()
        const instance = saas.mapInstance(data)
        this.data.push(instance)
        return instance
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
    },
    resetSubscriptionDialog() {
      this.planDialog = {
        show: false,
        subscription: false,
        fiatOnly: false,
        bitcoinOnly: false,
        plan: null,
        count: 1,
        instanceId: null,
        hideFeatures: {
          tab: false
        }
      }
    },

    async submitPlanRequest(useFiat) {
      // validate planDialog data, make saas request for payment details
      this.planDialog.fiatOnly = useFiat === true
      console.log('### planDialog', this.planDialog)

      if (this.planDialog.instanceId) {
        this.submitPlan()
      } else {
        this.confirm('You are about the create a new LNbits instance.').onOk(
          async () => {
            const instance = await this.createInstance()
            if (instance) {
              this.planDialog.instanceId = instance.id
              await this.submitPlan()
            }
          }
        )
      }
    },
    async submitPlan() {
      if (this.planDialog.subscription) {
        return await this.submitSubscriptionPlan()
      }
      await this.submitOneTimePlan()
    },
    async submitSubscriptionPlan() {
      try {
        this.planDialog.inProgress = true
        const {data} = await saas.subscribeToPlan(
          this.planDialog.instanceId,
          this.planDialog.plan
        )
        console.log('### subscribe data', data)
        this.planDialog.show = false
        this.extendInstance(
          this.data.find(i => i.id === this.planDialog.instanceId),
          data.checkout_session_url
        )
        return true
      } catch (error) {
        console.warn(error)
        this.q.notify({
          message: 'Failed to create subscription plan',
          caption: saas.mapErrorToString(error),
          color: 'negative'
        })
        return false
      } finally {
        this.planDialog.inProgress = false
      }
    },
    async submitOneTimePlan() {
      try {
        this.planDialog.inProgress = true
        const {data} = await saas.createOneTimePlan(
          this.planDialog.instanceId,
          this.planDialog.plan,
          this.planDialog.count,
          this.planDialog.fiatOnly
        )
        console.log('### one time plan data', data)
        this.planDialog.show = false
        this.extendInstance(
          this.data.find(i => i.id === this.planDialog.instanceId),
          data.payment_request
        )
        return true
      } catch (error) {
        console.warn(error)
        this.q.notify({
          message: 'Failed to create one time plan',
          caption: saas.mapErrorToString(error),
          color: 'negative'
        })
        return false
      } finally {
        this.planDialog.inProgress = false
      }
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
              message: `Instance ${instance.id} extended!`,
              color: 'positive'
            })
            await this.checkInstanceProvisioning(updatedInstance.id)
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
    async checkInstanceProvisioning(instanceId) {
      let timeout = 5 * 60 * 1000 // 5 minutes max wait
      this.showProvisioning = true
      const intervalId = setInterval(async () => {
        try {
          const instance = this.data.find(i => i.id === instanceId)
          if (!instance) {
            throw new Error(`Instance ${instanceId} not found`)
          }
          const response = await fetch(
            `https://${instance.name}/static/i18n/en.js`
          )
          if (response.status === 200) {
            this.isProvisioning = false
            setTimeout(() => {
              this.showProvisioning = false
              this.isProvisioning = true
            }, 20000)
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
    extendInstance: function (instance, qrCodeData) {
      console.log('### extendInstance', instance, qrCodeData)
      this.activeInstance = instance

      this.qrCodeDialog.data = qrCodeData || instance.lnurl
      this.qrCodeDialog.dataIsUrl = this.isValidUrl(this.qrCodeDialog.data)
      this.qrCodeDialog.show = true

      console.log('### qrCodeDialog', this.qrCodeDialog)

      this.checkInstanceStatus(instance)
    },
    copyData: function () {
      copyToClipboard(this.qrCodeDialog.data)

      this.q.notify({
        message: 'Copied',
        color: 'grey'
      })
    },
    isValidUrl: function (str) {
      try {
        new URL(str)
        return true
      } catch {
        return false
      }
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
      // temporary feature flag for alan
      this.showFeatureFlag = saas.username === 'alan@lnbits.com'

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
.custom-caption {
  padding: 12px;
  color: white;
  background-color: rgba(0, 0, 0, 0.35);
}
</style>
