<template>
  <q-page class="q-pa-sm container">
    <div class="q-gutter-md">
      <q-breadcrumbs class="text-grey-4 q-mb-lg" active-color="secondary">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Bids" to="/bid" />
        <q-breadcrumbs-el :label="item.name" />
      </q-breadcrumbs>
    </div>
    <div class="row justify-center q-col-gutter-md q-mt-lg">
      <div :class="isAuction ? 'col-12 col-md-7' : 'col-12 col-md-10'">
        <q-card class="nostr-card text-white no-shadow" bordered>
          <q-card-section>
            <div class="text-h6">{{ item.name }}</div>
          </q-card-section>
          <q-separator color="secondary" />
          <template v-if="isAuction">
            <q-card-section class="row flex">
              <time-left
                v-if="item.active"
                :time-left="timeLeft"
                :time-loading="timeLoading"
                :expires-on="expiresOn"
              />
              <div v-else class="full-width text-h5 text-center q-my-xl">
                Auction Ended
              </div>
            </q-card-section>
            <q-separator color="secondary" />
            <q-card-section class="row flex">
              <div class="col-12 col-sm-4">
                <div class="text-h6 text-weight-regular">
                  <span
                    v-text="
                      item.active
                        ? 'Current Bid'
                        : bidHistory.total > 0
                        ? 'Winning Bid'
                        : 'No Bids Made'
                    "
                  ></span>
                </div>
              </div>
              <div class="col-12 col-sm-8 text-center">
                <h4 class="q-my-none">
                  {{ formatCurrency(item.current_price, item.currency) }}
                </h4>
                <div v-if="item.active">
                  <q-chip
                    v-if="outBid"
                    class="q-mt-sm"
                    color="negative"
                    text-color="white"
                    icon-right="sentiment_dissatisfied"
                    size="md"
                  >
                    You've been outbid
                  </q-chip>
                  <q-chip
                    v-if="winner"
                    class="q-mt-sm"
                    color="secondary"
                    text-color="primary"
                    icon-right="mood"
                    size="md"
                  >
                    You're winning
                  </q-chip>
                </div>
              </div>
            </q-card-section>
          </template>
          <template v-else>
            <q-card-section>
              <div class="text-h6">Price</div>
              <div class="text-h5">
                {{ formatCurrency(item.ask_price, item.currency) }}
              </div>
            </q-card-section>
          </template>
          <q-card-section class="q-mb-lg" v-if="item.active">
            <div class="row q-col-gutter-md">
              <q-input
                class="col-12"
                dark
                standout
                v-model.trim="memo"
                type="textarea"
                rows="3"
                label="Memo"
                :hint="
                  isAuction
                    ? 'Displayed on the bid history (Required)'
                    : 'Memo (Required)'
                "
              />
              <q-input
                class="col-6 col-md-8"
                dark
                standout
                v-model.trim="refundLNAddress"
                label="LN Address"
                :hint="
                  isAuction
                    ? 'Refund address in case of being outbid (Optional)'
                    : 'Refund address (Optional)'
                "
              />
              <q-input
                v-if="isAuction"
                class="col-6 col-md-4"
                dark
                standout
                v-model="bidOffer"
                label="Place your bid"
                :rules="[
                  val =>
                    val >= minBid || 'Offer must be higher than current bid'
                ]"
                type="number"
                :min="minBid"
                :hint="`Minimum bid: ${formatCurrency(minBid, item.currency)}`"
              />
              <q-input
                v-else
                class="col-6 col-md-4"
                dark
                standout
                v-model="bidOffer"
                type="number"
                readonly
                hint="Amount to pay"
              />
            </div>
          </q-card-section>
          <q-separator color="secondary" />
          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              v-if="canBeClosed"
              class="text-capitalize"
              rounded
              color="negative"
              label="Close"
              @click="closeItem"
              padding="sm md"
            />
            <q-space />
            <q-btn
              class="text-capitalize"
              rounded
              color="secondary"
              text-color="primary"
              :label="isAuction ? 'Place Bid' : 'Buy Now'"
              @click="placeBid"
              :disable="!item.active"
            />
          </q-card-actions>
        </q-card>
      </div>
      <div class="col-12 col-md-5" v-if="isAuction">
        <q-card
          class="nostr-card text-white no-shadow q-mb-xl q-mx-auto"
          bordered
        >
          <q-table
            dark
            title="Bid History"
            :rows="bidHistory.data"
            :columns="bidsTable.columns"
            row-key="id"
            color="secondary"
            card-class="nostr-card"
            v-model:pagination="bidsTable.pagination"
            @request="getBidHistory"
          >
            <template v-slot:top>
              <div class="text-h5 q-my-sm">Bid History</div>
              <q-space />

              <q-toggle
                color="secondary"
                v-model="onlyMine"
                dark
                size="xs"
                label="Only mine"
                left-label
                @update:model-value="handleFilters"
              />
            </template>
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th auto-width></q-th>
                <q-th v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
            <template v-slot:body="props">
              <q-tr
                :props="props"
                :style="
                  props.row.user_is_owner
                    ? 'background-color: rgb(9 87 131 / 8%)'
                    : ''
                "
              >
                <q-td auto-width>
                  <q-badge
                    v-if="props.row.user_is_owner"
                    rounded
                    color="secondary"
                  />
                  <q-tooltip v-if="props.row.user_is_owner">My bid</q-tooltip>
                </q-td>
                <q-td v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.value }}
                </q-td>
              </q-tr>
            </template>
          </q-table>
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
            item.
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
import {ref, onMounted, onBeforeUnmount, computed, reactive} from 'vue'
import {
  countDownTimer,
  timeFromNow,
  formatCurrency,
  prepareFilterQuery
} from 'src/boot/utils'
import {useBidStore} from 'src/stores/bids'
import {useQuasar, copyToClipboard} from 'quasar'
import {useAppStore} from 'src/stores/store'
import {useRouter} from 'vue-router'
import {saas} from 'boot/saas'
import VueQrcode from '@chenfengyuan/vue-qrcode'
import TimeLeft from 'src/components/TimeLeft.vue'

const props = defineProps(['id'])
const $bid = useBidStore()
const $q = useQuasar()
const $store = useAppStore()
const $router = useRouter()

const item = ref({})
const isAuction = ref(false)
const timeLoading = ref(true)
const timeLeft = ref({days: '00', hours: '00', minutes: '00', seconds: '00'})
const bidOffer = ref(0)
const memo = ref('')
const refundLNAddress = ref('')

const minBid = ref(0)
const dataDialog = ref(false)
const paymentDetails = ref({})

const bidHistory = ref({data: [], total: 0})
const onlyMine = ref(false)
const outBid = ref(false)
const winner = ref(false)

const canBeClosed = computed(() => {
  if (!item.value.user_is_owner) return false
  if (!item.value.active) return true
  if (bidHistory.value.total > 0) return false
  return true
})

const itemWS = ref(null)

const bidsTable = reactive({
  columns: [
    {
      name: 'amount',
      align: 'left',
      label: 'Amount',
      field: 'amount',
      sortable: true,
      format: (val, row) =>
        row.currency != 'sats' ? formatCurrency(val, row.currency) : val
    },
    {
      name: 'amount_sat',
      align: 'right',
      label: 'Sats',
      field: 'amount_sat',
      sortable: true,
      format: val => `${val || 0}`.toLocaleString()
    },
    {
      name: 'created_at',
      align: 'left',
      label: 'Date',
      field: 'created_at',
      format: val => timeFromNow(val),
      sortable: true
    },
    {
      name: 'memo',
      align: 'left',
      label: 'Memo',
      field: 'memo',
      sortable: true
    }
  ],
  pagination: {
    sortBy: 'amount',
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 10
  }
})

const handleFilters = async () => {
  bidsTable.filters = {
    only_mine: onlyMine.value
  }
  await getBidHistory()
}

const expiresOn = computed(() => {
  return `Expires on ${new Date(item.value.expires_at).toDateString()}`
})

const copyData = data => {
  copyToClipboard(data)

  $q.notify({
    message: 'Copied',
    color: 'grey'
  })
}

async function getItem(id) {
  try {
    const {data} = await saas.getItem(id)
    $bid.updateItem(data)
    item.value = {...data}
    bidOffer.value = data.next_min_bid == 0 ? data.ask_price : data.next_min_bid
    minBid.value = data.next_min_bid == 0 ? data.ask_price : data.next_min_bid
  } catch (error) {
    console.error(error)
    $q.notify({
      message: 'Failed to fetch item',
      caption: error.response?.data?.detail,
      color: 'negative'
    })
  }
}

async function checkOutBid() {
  if (!$store.isLoggedIn) return
  const {data} = await saas.getBidHistory(item.value.id, {
    only_mine: true
  })
  if (data.total == 0) return
  const myLastBid = data.data.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )[0]
  if (myLastBid.higher_bid_made) {
    if (outBid.value) return
    winner.value = false
    outBid.value = true
    $q.notify({
      message: 'You have been outbid',
      color: 'warning',
      textColor: 'black'
    })
  } else {
    winner.value = true
    outBid.value = false
  }
}

async function getBidHistory(props) {
  bidsTable.filter = {
    only_mine: onlyMine.value
  }
  const params = prepareFilterQuery(bidsTable, props)
  const {data} = await saas.getBidHistory(item.value.id, params)
  bidHistory.value = {...data}
  bidsTable.pagination.rowsNumber = data.total
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
  if (bidOffer.value < minBid.value) {
    $q.notify({
      message: 'Offer must be higher than current bid',
      color: 'warning',
      textColor: 'black'
    })
    return
  }
  if (!memo.value) {
    $q.notify({
      message: 'Memo is required',
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
      memo: memo.value,
      ln_address: refundLNAddress.value
    }
    const {data} = await saas.createBid(item.value.id, bidData)
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
      color: 'warning'
    })
  }
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
      memo.value = ''
      refundLNAddress.value = ''
      ws.close()
      setTimeout(() => {
        if (isAuction.value) {
          Promise.resolve(updateItemData(item.value.id))
        } else {
          $router.push('/identities')
        }
      }, 1000)
    }
  })
}

function closeItem() {
  $q.dialog({
    title: 'End Bidding',
    message: 'Are you sure you want to end the bidding?'
  }).onOk(async () => {
    try {
      await saas.closeItem(item.value.id)
      $q.notify({
        message: 'Close request sent!',
        color: 'positive'
      })
      setTimeout(() => {
        $router.push('/identities')
      }, 500)
    } catch (error) {
      console.error(error)
      $q.notify({
        message: 'Failed to close item',
        caption: error.response?.data?.detail,
        color: 'negative'
      })
    }
  })
}

const resetDataDialog = () => {
  dataDialog.value = false
  paymentDetails.value = {}
}

async function updateItemData(itemID) {
  await getItem(itemID)
  if (isAuction.value) {
    await getBidHistory()
    await checkOutBid()
  }
}

const updateTime = expireDate => {
  const {days, hours, minutes, seconds} = countDownTimer(expireDate)
  timeLeft.value = {
    days: days.toString().padStart(2, '0'),
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  }
}

onBeforeUnmount(() => {
  clearInterval($bid.interval)
  if (itemWS.value) {
    itemWS.value.close()
  }
})

onMounted(async () => {
  try {
    await getItem(props.id)
    const {data} = await saas.getRoomInfo(item.value.auction_room_id)
    $bid.addRoom(data)
    isAuction.value = data.type == 'auction'
    if (isAuction.value) {
      await getBidHistory()
      if (item.value.active) {
        await checkOutBid()
        if ($store.isLoggedIn) {
          itemWS.value = saas.subscribeToWS(item.value.id)
          itemWS.value.onmessage = async ({data}) => {
            const resp = JSON.parse(data)
            if (resp.status == 'new_bid') {
              await updateItemData(item.value.id)
            }
            if (resp.status == 'closed') {
              clearInterval($bid.interval)
              item.value.active = false
            }
          }
        }
      }
    }

    const expires = new Date(item.value.expires_at).getTime()
    clearInterval($bid.interval)
    if (expires) {
      updateTime(expires)
      timeLoading.value = false

      $bid.interval = setInterval(() => {
        updateTime(expires)
      }, 1000)
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      message: 'Failed to fetch item',
      caption: error.response?.data?.detail,
      color: 'negative'
    })
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
