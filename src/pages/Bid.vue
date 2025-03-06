<template>
  <q-page class="q-pa-sm container">
    <div class="q-gutter-md">
      <q-breadcrumbs class="text-grey-4 q-mb-lg" active-color="secondary">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Bids" to="/bid" />
        <q-breadcrumbs-el :label="identity.local_part" />
      </q-breadcrumbs>
    </div>
    <div class="row justify-center q-col-gutter-md">
      <div :class="identity.auction ? 'col-12 col-md-7' : 'col-8'">
        <q-card class="nostr-card text-white no-shadow" bordered>
          <q-card-section>
            <div class="text-h6">{{ identity.local_part }}</div>
          </q-card-section>
          <q-separator color="secondary" />
          <template v-if="identity.auction">
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
                    <h4 class="q-my-sm">{{ identity.price }} sats</h4>
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
                      val > identity.price ||
                      'Offer must be higher than current bid'
                  ]"
                  type="number"
                  :min="identity.price + 1"
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
      <div class="col-12 col-md-5" v-if="identity.auction">
        <q-card
          class="nostr-card text-white no-shadow q-mb-xl q-mx-auto"
          bordered
        >
          <q-table
            dark
            title="Bid History"
            :rows="rows"
            :columns="columns"
            row-key="name"
            color="secondary"
            card-class="nostr-card"
          />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, computed} from 'vue'
import {countDownTimer} from 'src/boot/utils'
import {useBidStore} from 'src/stores/bids'
import {useQuasar} from 'quasar'
import {useAppStore} from 'src/stores/store'

const props = defineProps(['id'])
const $bid = useBidStore()
const $q = useQuasar()
const $store = useAppStore()

const identity = ref({})
const timeLeft = ref({days: '00', hours: '00', minutes: '00', seconds: '00'})
const bidOffer = ref(0)

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Bidder',
    align: 'left',
    field: row => row.name,
    sortable: true
  },
  {
    name: 'bid',
    align: 'center',
    label: 'Bid (sats)',
    field: 'bid',
    sortable: true
  },
  {name: 'time', label: 'Time', field: 'time', sortable: true}
]

const rows = [
  {name: 'John Doe', bid: 1000, time: '2025-02-01 12:00:00'},
  {name: 'Jane Doe', bid: 1200, time: '2025-02-01 12:05:00'},
  {name: 'John Smith', bid: 1500, time: '2025-02-01 12:15:00'},
  {name: 'Alice Brown', bid: 1800, time: '2025-02-01 12:30:00'},
  {name: 'Bob Wilson', bid: 2000, time: '2025-02-01 13:00:00'},
  {name: 'Emma Davis', bid: 2300, time: '2025-02-01 13:20:00'},
  {name: 'Michael Lee', bid: 2600, time: '2025-02-01 14:00:00'},
  {name: 'Sarah Kim', bid: 2900, time: '2025-02-01 14:30:00'},
  {name: 'David Chen', bid: 3200, time: '2025-02-01 15:00:00'},
  {name: 'Laura Adams', bid: 3500, time: '2025-02-01 15:45:00'},
  {name: 'Chris Evans', bid: 3800, time: '2025-02-01 16:10:00'},
  {name: 'Kelly White', bid: 4100, time: '2025-02-01 16:40:00'},
  {name: 'Tom Harris', bid: 4500, time: '2025-02-01 17:15:00'},
  {name: 'Rachel Green', bid: 4800, time: '2025-02-01 17:50:00'},
  {name: 'Peter Parker', bid: 5100, time: '2025-02-01 18:20:00'},
  {name: 'Mary Johnson', bid: 5500, time: '2025-02-01 19:00:00'},
  {name: 'James Bond', bid: 5900, time: '2025-02-01 19:35:00'},
  {name: 'Lisa Taylor', bid: 6200, time: '2025-02-01 20:10:00'},
  {name: 'Mark Twain', bid: 6500, time: '2025-02-01 20:45:00'},
  {name: 'Anna Lee', bid: 6800, time: '2025-02-01 21:20:00'},
  {name: 'Steve Rogers', bid: 7200, time: '2025-02-01 22:00:00'},
  {name: 'Clara Oswald', bid: 7500, time: '2025-02-01 22:40:00'},
  {name: 'Tony Stark', bid: 7900, time: '2025-02-01 23:15:00'},
  {name: 'Ellen Grey', bid: 8200, time: '2025-02-02 00:05:00'},
  {name: 'Sam Carter', bid: 8500, time: '2025-02-02 01:00:00'},
  {name: 'Bruce Wayne', bid: 8900, time: '2025-02-02 02:30:00'},
  {name: 'Diana Prince', bid: 9300, time: '2025-02-02 03:45:00'},
  {name: 'Clark Kent', bid: 9700, time: '2025-02-02 05:00:00'},
  {name: 'Natasha Romanov', bid: 10000, time: '2025-02-02 06:15:00'},
  {name: 'Wade Wilson', bid: 10400, time: '2025-02-02 07:30:00'},
  {name: 'Carol Danvers', bid: 10800, time: '2025-02-02 08:45:00'},
  {name: 'Scott Summers', bid: 11200, time: '2025-02-02 09:50:00'},
  {name: 'Jean Grey', bid: 11600, time: '2025-02-02 10:55:00'},
  {name: 'Logan Wolf', bid: 12000, time: '2025-02-02 12:00:00'},
  {name: 'Tina Fey', bid: 12500, time: '2025-02-02 13:10:00'},
  {name: 'Amy Poehler', bid: 13000, time: '2025-02-02 14:20:00'},
  {name: 'Will Ferrell', bid: 13500, time: '2025-02-02 15:30:00'},
  {name: 'Kate McKinnon', bid: 14000, time: '2025-02-02 16:40:00'},
  {name: 'Bill Murray', bid: 14500, time: '2025-02-02 17:50:00'},
  {name: 'Dan Aykroyd', bid: 15000, time: '2025-02-02 19:00:00'},
  {name: 'Eddie Murphy', bid: 15500, time: '2025-02-02 20:15:00'},
  {name: 'Chris Pratt', bid: 16000, time: '2025-02-02 21:30:00'},
  {name: 'Zoe Saldana', bid: 16500, time: '2025-02-02 22:45:00'},
  {name: 'Dave Bautista', bid: 17000, time: '2025-02-03 00:00:00'},
  {name: 'Vin Diesel', bid: 17500, time: '2025-02-03 01:15:00'},
  {name: 'Bradley Cooper', bid: 18000, time: '2025-02-03 02:30:00'},
  {name: 'Karen Gillan', bid: 18500, time: '2025-02-03 03:45:00'},
  {name: 'Pom Klementieff', bid: 19000, time: '2025-02-03 05:00:00'},
  {name: 'Chris Hemsworth', bid: 19500, time: '2025-02-03 06:15:00'},
  {name: 'Tessa Thompson', bid: 20000, time: '2025-02-03 07:30:00'}
]

const expiresOn = computed(() => {
  return `Expires on ${new Date(identity.value.expires).toDateString()}`
})

const mockIdentities = [
  {
    local_part: 'alice',
    price: 1000,
    auction: true,
    expires: Date.now() + Math.floor(Math.random() * 86400000)
  },
  {
    local_part: 'bob',
    price: 2000,
    auction: true,
    expires: Date.now() + Math.floor(Math.random() * 86400000)
  },
  {
    local_part: 'charlie',
    price: 3000,
    auction: false,
    expires: null
  }
]

async function getIdentifier() {
  // fetch identity from API or use store
  // for now, mock it
  return mockIdentities.find(i => i.local_part === props.id)
}

async function placeBid() {
  if (!$store.isLoggedIn) {
    $q.notify({
      message: 'Please login to buy',
      color: 'warning',
      textColor: 'black'
    })
    return
  }
  // place bid
  console.log('Placing bid', bidOffer.value)
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

onBeforeUnmount(() => {
  clearInterval($bid.interval)
})

onMounted(async () => {
  identity.value = await getIdentifier()
  bidOffer.value = identity.value.price > 0 ? identity.value.price * 1.1 : 100
  const {expires} = identity.value
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
