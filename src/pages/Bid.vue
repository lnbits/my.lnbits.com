<template>
  <q-page class="q-pa-sm container">
    <div class="q-gutter-md">
      <q-breadcrumbs class="text-grey-4 q-mb-lg" active-color="secondary">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Bids" to="/bid" />
        <q-breadcrumbs-el :label="identity.name" />
      </q-breadcrumbs>
    </div>
    <div class="row justify-center q-col-gutter-md">
      <div :class="identity.ask_price ? 'col-12 col-md-7' : 'col-8'">
        <q-card class="nostr-card text-white no-shadow" bordered>
          <q-card-section>
            <div class="text-h6">{{ identity.name }}</div>
          </q-card-section>
          <q-separator color="secondary" />
          <template v-if="identity.ask_price">
            <q-card-section class="row flex">
              <div class="col-12 col-sm-4">
                <div class="text-h6 text-weight-regular">Time Left</div>
              </div>
              <div class="col-12 col-sm-8">
                <div class="row counter">
                  <div class="q-pr-md">
                    <h4 class="q-my-sm">{{ timeLeft.days }}</h4>
                    <p>Days</p>
                  </div>
                  <div class="q-px-md">
                    <h4 class="q-my-sm">{{ timeLeft.hours }}</h4>
                    <p>Hours</p>
                  </div>
                  <div class="q-px-md">
                    <h4 class="q-my-sm">{{ timeLeft.minutes }}</h4>
                    <p>Min.</p>
                  </div>
                  <div class="q-pl-md">
                    <h4 class="q-my-sm">{{ timeLeft.seconds }}</h4>
                    <p>Sec.</p>
                  </div>
                </div>
                <div class="counter">
                  <p>{{ expiresOn }}</p>
                </div>
              </div>
            </q-card-section>
            <q-separator color="secondary" />
            <q-card-section class="row flex">
              <div class="col-12 col-sm-4">
                <div class="text-h6 text-weight-regular">Current Bid</div>
              </div>
              <div class="col-12 col-sm-8">
                <div class="row last-bid">
                  <div class="q-pr-md">
                    <h4 class="q-my-sm">
                      {{ `${identity.current_price} ${identity.currency}` }}
                    </h4>
                  </div>
                </div>
              </div>
            </q-card-section>
            <q-card-section class="q-mb-lg">
              <div class="row q-gutter-md">
                <q-input
                  class="col"
                  dark
                  standout
                  v-model="bidOffer"
                  label="Place your bid"
                  :rules="[
                    val =>
                      val >= identity.next_min_bid ||
                      'Offer must be higher than current bid'
                  ]"
                  type="number"
                  :min="identity.next_min_bid"
                  :hint="`Minimum bid: ${identity.next_min_bid} ${identity.currency}`"
                />
                <q-card-actions class="q-ma-none col-auto">
                  <q-btn
                    class="text-capitalize"
                    rounded
                    color="secondary"
                    text-color="primary"
                    label="Place Bid"
                    @click="placeBid"
                  />
                </q-card-actions>
              </div>
            </q-card-section>
          </template>
          <template v-else>
            <q-card-section>
              <div class="text-h6">Price</div>
              <div class="text-h5">{{ identity.price }} sats</div>
            </q-card-section>
            <q-separator color="secondary" />
            <q-card-actions align="right">
              <q-btn
                class="text-capitalize"
                rounded
                color="secondary"
                text-color="primary"
                label="Buy"
                @click="handleBuy"
                padding="sm lg"
              />
            </q-card-actions>
          </template>
        </q-card>
      </div>
      <div class="col-12 col-md-5" v-if="identity.ask_price">
        <q-card
          class="nostr-card text-white no-shadow q-mb-xl q-mx-auto"
          bordered
        >
          <q-table
            dark
            title="Bid History"
            :rows="bidHistory.data"
            :columns="columns"
            row-key="name"
            color="secondary"
            card-class="nostr-card"
          />
        </q-card>
      </div>
    </div>
    <q-dialog
      v-model="dataDialog"
      :backdrop-filter="'blur(4px) saturate(150%)'"
    >
      <q-card style="width: 350px" class="q-pa-md text-center">
        <q-card-section v-if="paymentDetails?.bolt11">
          <p class="caption">
            Scan the QR code below using a lightning wallet to secure your Nostr
            identity.
          </p>
          <div class="text-h6">
            <span v-text="paymentDetails.local_part"></span>
          </div>
          <div class="responsive">
            <a :href="'lightning:' + paymentDetails.bolt11">
              <vue-qrcode :value="paymentDetails.bolt11"></vue-qrcode>
            </a>
          </div>
        </q-card-section>
        <q-card-section>
          <q-linear-progress indeterminate color="secondary" class="q-mt-sm" />
          <div class="row q-mt-md">
            <q-btn
              v-if="paymentDetails?.bolt11"
              rounded
              unelevated
              text-color="primary"
              color="secondary"
              @click="copyData(paymentDetails.bolt11)"
              label="Copy Invoice"
              class="text-capitalize"
            ></q-btn>
            <q-btn
              @click="resetDataDialog"
              flat
              color="grey"
              class="q-ml-auto text-capitalize"
              label="Close"
            ></q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, computed} from 'vue'
import {countDownTimer, timeFromNow} from 'src/boot/utils'
import {useBidStore} from 'src/stores/bids'
import {useQuasar, copyToClipboard} from 'quasar'
import {useAppStore} from 'src/stores/store'
import {saas} from 'boot/saas'
import VueQrcode from '@chenfengyuan/vue-qrcode'

const props = defineProps(['id'])
const $bid = useBidStore()
const $q = useQuasar()
const $store = useAppStore()

const identity = ref({})
const timeLeft = ref({days: '00', hours: '00', minutes: '00', seconds: '00'})
const bidOffer = ref(0)
const dataDialog = ref(false)
const paymentDetails = ref({})

const bidHistory = ref({data: [], total: 0})

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Bidder',
    align: 'left',
    field: val => 'Anon',
    sortable: true
  },
  {
    name: 'bid',
    align: 'center',
    label: 'Bid',
    // field: 'amount_sat',
    format: (val, row) =>
      row.currency === 'sat' ? row.amount_sat : row.amount,
    sortable: true
  },
  {
    name: 'time',
    label: 'Time',
    field: 'created_at',
    format: val => timeFromNow(val),
    sortable: true
  }
]

const expiresOn = computed(() => {
  return `Expires on ${new Date(identity.value.expires_at).toDateString()}`
})

const copyData = data => {
  copyToClipboard(data)

  $q.notify({
    message: 'Copied',
    color: 'grey'
  })
}

async function getIdentifier(id) {
  let item = $bid.getItem(id)
  if (!item) {
    // fetch auctions and fixed price from API
    let {data: auctions} = await saas.getAuctions()
    let {data: fixed} = await saas.getFixedPrice()

    $bid.addAuctions(auctions)
    $bid.addFixedPrice(fixed)
    item = $bid.getItem(id)
  }
  console.log('Identity: ', item)
  identity.value = item
  bidOffer.value = item.next_min_bid
  return item
}

async function getBidHistory() {
  const {data} = await saas.getBidHistory(identity.value.id)
  console.log('Bid history: ', data)
  bidHistory.value = {...data}
  return {...data}
}

async function placeBid() {
  if (!$store.isLoggedIn) {
    $q.notify({
      message: 'Please login to bid',
      color: 'warning',
      textColor: 'black'
    })
    return
  }
  try {
    // place bid
    dataDialog.value = true
    const bidData = {
      amount: bidOffer.value,
      memo: `Bid for ${identity.value.name}`
    }
    const {data} = await saas.createBid(identity.value.id, bidData)
    data.bolt11 = data.payment_request
    if (data.bolt11) {
      paymentDetails.value = {...data}
      subscribeToPaylinkWs(data.payment_hash)
      $q.notify({
        message: 'Pay the invoice to complete the purchase',
        color: 'positive',
        position: 'bottom',
        timeout: 5000
      })
    }
  } catch (error) {
    console.error(error)
    dataDialog.value = false
    $q.notify({
      message: 'Failed to generate invoice',
      caption: error.response?.data?.detail,
      color: 'negative'
    })
  }
}

async function handleBuy() {
  if (!$store.isLoggedIn) {
    $q.notify({
      message: 'Please login to buy',
      color: 'warning',
      textColor: 'black'
    })
    return
  }
  // buy identity
  console.log('Buying identity')
}

const subscribeToPaylinkWs = payment_hash => {
  const url = new URL(process.env.apiUrl || window.location)
  url.protocol = url.protocol === 'https:' ? 'wss' : 'ws'
  url.pathname = `/api/v1/ws/${payment_hash}`
  const ws = new WebSocket(url)
  ws.addEventListener('message', async ({data}) => {
    const resp = JSON.parse(data)
    if (!resp.pending || resp.paid) {
      $q.notify({
        type: 'positive',
        message: 'Invoice Paid!'
      })
      resetDataDialog()
      await getBidHistory()
      await getIdentifier(props.id)
      ws.close()
    }
  })
}

const resetDataDialog = () => {
  console.log('Resetting invoice dialog')
  dataDialog.value = false
  paymentDetails.value = {}
}

onBeforeUnmount(() => {
  clearInterval($bid.interval)
})

onMounted(async () => {
  await getIdentifier(props.id)
  await getBidHistory()
  identity.value.next_min_bid
  const expires = new Date(identity.value.expires_at).getTime()
  clearInterval($bid.interval)
  if (expires) {
    $bid.interval = setInterval(() => {
      const {days, hours, minutes, seconds} = countDownTimer(expires)
      timeLeft.value = {
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      }
    }, 1000)
  }
})
</script>

<style lang="scss">
@media (min-width: $breakpoint-sm-min) {
  .counter,
  .last-bid {
    text-align: center;
    justify-content: center;
  }
}
</style>
