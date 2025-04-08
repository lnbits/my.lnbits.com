<template>
  <q-page class="q-pa-sm container">
    <div class="q-gutter-md q-mb-lg">
      <q-breadcrumbs class="text-grey-4 q-mb-lg" active-color="secondary">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Bid" />
      </q-breadcrumbs>
    </div>
    <q-input
      dark
      standout
      rounded
      v-model.trim="filterText"
      class="input q-mb-lg"
      placeholder="Search..."
      label-color="blue-grey-4"
      :input-style="{fontSize: $q.screen.gt.sm ? '22px' : null}"
      @keydown.enter.prevent="handleSearch"
    >
      <template v-slot:prepend>
        <NostrHeadIcon color="blue-grey-4" />
      </template>

      <template v-slot:error> Failed to filter. </template>

      <template v-slot:after>
        <q-btn
          unelevated
          :outline="$q.screen.gt.xs"
          rounded
          class="text-capitalize"
          text-color="secondary"
          color="primary"
          icon-right="filter_alt"
          :label="$q.screen.gt.xs ? 'Filter' : null"
        >
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item>
                <q-btn
                  icon="close"
                  flat
                  round
                  v-close-popup
                  class="q-ml-auto"
                  size="sm"
                />
              </q-item>
              <q-item
                v-if="$store.isLoggedIn"
                clickable
                @click="handleFilters('showMineOnly')"
              >
                <q-item-section>Show Only Mine</q-item-section>
                <q-item-section avatar>
                  <q-icon
                    :color="$bids.filter.showMineOnly ? 'primary' : 'grey-4'"
                    name="check"
                  />
                </q-item-section>
              </q-item>
              <q-item
                v-if="$store.isLoggedIn"
                clickable
                @click="handleFilters('showMyBidsOnly')"
              >
                <q-item-section>Show Participating</q-item-section>
                <q-item-section avatar>
                  <q-icon
                    :color="$bids.filter.showMyBidsOnly ? 'primary' : 'grey-4'"
                    name="check"
                  />
                </q-item-section>
              </q-item>
              <q-item clickable @click="handleFilters('showCompleted')">
                <q-item-section>Show Completed</q-item-section>
                <q-item-section avatar>
                  <q-icon
                    :color="$bids.filter.showCompleted ? 'primary' : 'grey-4'"
                    name="check"
                  />
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable @click="handleFilters('reset')">
                <q-item-section>Reset Filters</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <!-- <q-btn
          v-if="$store.isLoggedIn && participating.length"
          unelevated
          :outline="$q.screen.gt.xs"
          rounded
          class="text-capitalize q-ml-sm"
          text-color="secondary"
          color="primary"
          icon-right="dangerous"
          :label="$q.screen.gt.xs ? 'Outbids' : null"
          @click="showOutbidded = !showOutbidded"
        >
          <q-badge
            v-if="outbidded.length"
            class="q-ml-sm"
            color="negative"
            floating
            :label="outbidded.length"
            style="font-size: 0.8em"
          />
        </q-btn> -->
      </template>
    </q-input>
    <div class="container q-mt-lg">
      <div class="pitch q-mx-auto">
        <CardOutbid :items="outbidded" v-if="outbidded.length" />
        <!-- <div class="flex-center q-my-md q-px-md" v-if="showOutbidded">
          <div v-if="!outbidded.length" class="q-pa-md">
            <div class="text-center text-white q-mt-xl">
              <q-icon
                name="military_tech"
                size="64px"
                color="secondary"
                class="q-mb-lg"
              />
              <q-item-label
                class="text-h6"
                v-text="'Seems like you are winning all your bids'"
              ></q-item-label>
            </div>
          </div>
          <q-list dark>
            <CardOutbid
              v-for="item in outbidded"
              :key="item.id"
              :item="item"
              class="q-my-sm"
              :to="`/bid/${item.id}`"
            />
          </q-list>
        </div> -->
        <q-tabs
          v-model="$bids.openTab"
          dense
          :inline-label="$q.screen.gt.sm"
          align="justify"
          class="text-grey q-pa-sm"
          active-color="secondary"
          indicator-color="secondary"
          @update:model-value="handleFilters()"
        >
          <q-tab name="auction" icon="currency_exchange" label="On Auction" />
          <q-tab name="buy" icon="attach_money" label="For Sale" />
        </q-tabs>
        <q-tab-panels
          v-model="$bids.openTab"
          animated
          style="background: transparent"
        >
          <q-tab-panel name="auction">
            <div v-if="!auctions.data || !auctions.data.length" class="q-pa-md">
              <div class="text-center text-white q-mt-xl">
                <q-icon
                  name="search"
                  size="64px"
                  color="grey"
                  class="q-mb-lg"
                />
                <q-item-label
                  class="text-h6"
                  v-text="'No Auctions available'"
                ></q-item-label>
              </div>
            </div>
            <q-table
              v-else
              dark
              :rows="auctions.data || []"
              title="Auctions"
              :columns="itemsTable.columns"
              row-key="id"
              color="secondary"
              card-class="nostr-card"
              v-model:pagination="itemsTable.pagination"
              @request="getAuctions"
              :visible-columns="
                $q.screen.gt.sm
                  ? ['name', 'ask_price', 'current_price', 'expires_at']
                  : ['name', 'current_price']
              "
            >
              <template v-slot:header="props">
                <q-tr :props="props" class="text-h5 text-uppercase">
                  <q-th auto-width v-if="$q.screen.gt.xs"></q-th>
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                  >
                    {{ col.label }}
                  </q-th>
                  <q-th auto-width></q-th>
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
                  <q-td auto-width v-if="$q.screen.gt.xs">
                    <q-badge
                      v-if="props.row.user_is_owner"
                      rounded
                      color="secondary"
                    />
                    <q-tooltip v-if="props.row.user_is_owner"
                      >My item</q-tooltip
                    >
                  </q-td>
                  <q-td
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    :class="{
                      'text-accent':
                        props.row.user_is_participant &&
                        !props.row.user_is_top_bidder,
                      'text-light-green-11':
                        props.row.user_is_participant &&
                        props.row.user_is_top_bidder
                    }"
                  >
                    {{ col.value }}
                  </q-td>
                  <q-td auto-width>
                    <q-btn
                      rounded
                      :outline="props.row.active ? false : true"
                      color="secondary"
                      :text-color="props.row.active ? 'primary' : null"
                      padding="sm lg"
                      :to="`/bid/${props.row.id}`"
                      class="text-capitalize q-my-sm float-right"
                      no-wrap
                      :label="props.row.active ? 'Bid' : 'View'"
                    >
                      <!-- <div v-if="buttonIcon(props)">
                        <q-icon
                          :name="buttonIcon(props)"
                          size="xs"
                          color="primary"
                          class="q-ml-xs"
                        />
                      </div> -->
                    </q-btn>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-tab-panel>
          <q-tab-panel name="buy">
            <div
              v-if="!fixedPrice.data || !fixedPrice.data.length"
              class="q-pa-md"
            >
              <div class="text-center text-white q-mt-xl">
                <q-icon
                  name="search"
                  size="64px"
                  color="grey"
                  class="q-mb-lg"
                />
                <q-item-label
                  class="text-h6"
                  v-text="'No Buy Now identifiers available'"
                ></q-item-label>
              </div>
            </div>
            <q-table
              v-else
              dark
              :rows="fixedPrice.data || []"
              title="On Sale"
              :columns="itemsTable.columns"
              row-key="id"
              color="secondary"
              card-class="nostr-card"
              v-model:pagination="itemsTable.pagination"
              @request="getFixedPrice"
              :visible-columns="['name', 'ask_price']"
            >
              <template v-slot:header="props">
                <q-tr :props="props" class="text-h5 text-uppercase">
                  <q-th auto-width v-if="$q.screen.gt.xs"></q-th>
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                  >
                    {{ col.label }}
                  </q-th>
                  <q-th auto-width></q-th>
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
                  <q-td auto-width v-if="$q.screen.gt.xs">
                    <q-badge
                      v-if="props.row.user_is_owner"
                      rounded
                      color="secondary"
                    />
                    <q-tooltip v-if="props.row.user_is_owner"
                      >My item</q-tooltip
                    >
                  </q-td>
                  <q-td
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                  >
                    {{ col.value }}
                  </q-td>
                  <q-td auto-width>
                    <q-btn
                      rounded
                      :outline="props.row.active ? false : true"
                      color="secondary"
                      :text-color="props.row.active ? 'primary' : null"
                      text-color="primary"
                      padding="sm lg"
                      :label="props.row.active ? 'Buy' : 'View'"
                      :to="`/bid/${props.row.id}`"
                      class="text-capitalize q-my-sm"
                    />
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import {ref, onMounted, watch, reactive, onBeforeUnmount} from 'vue'
import {saas} from 'src/boot/saas'
import {useQuasar} from 'quasar'
import {formatCurrency, prepareFilterQuery} from 'src/boot/utils'
import {useBidStore} from 'src/stores/bids'
import {useAppStore} from 'src/stores/store'

import NostrHeadIcon from 'components/NostrHeadIcon.vue'
import CardOutbid from 'src/components/cards/CardOutbid.vue'

const $q = useQuasar()
const $bids = useBidStore()
const $store = useAppStore()

const auctions = ref({})
const fixedPrice = ref({})

const filterText = ref('')

const auctionWs = ref(null)
const participating = ref([])
const outbidded = ref([])
// const showOutbidded = ref(false)
const loadingParticipating = ref(false)

onBeforeUnmount(() => {
  if (auctionWs.value) {
    auctionWs.value.close()
  }
})

const itemsTable = reactive({
  columns: [
    {
      name: 'name',
      align: 'left',
      label: 'Name',
      field: 'name',
      sortable: true,
      classes: 'text-weight-bold'
    },
    {
      name: 'ask_price',
      align: 'left',
      label: 'Ask Price',
      field: 'ask_price',
      sortable: true,
      format: (_, row) => formatCurrency(row.ask_price, row.currency)
    },
    {
      name: 'current_price',
      align: 'left',
      label: $q.screen.gt.xs ? 'Current Price' : 'Price',
      field: 'current_price',
      sortable: true,
      format: (_, row) => formatCurrency(row.current_price, row.currency)
    },
    {
      name: 'expires_at',
      align: 'left',
      label: 'Ends At',
      field: 'expires_at',
      format: val => new Date(val).toLocaleString(),
      sortable: true
    }
  ],
  pagination: {
    sortBy: $bids.openTab == 'auction' ? 'current_price' : 'ask_price',
    rowsPerPage: 100,
    page: 1,
    descending: true,
    rowsNumber: 100
  }
})

watch(filterText, () => handleSearch(), {immediate: true})

async function handleSearch() {
  itemsTable.search = filterText.value
  if ($bids.openTab == 'auction') {
    await getAuctions()
  } else {
    await getFixedPrice()
  }
}

async function handleFilters(filter) {
  switch (filter) {
    case 'showMineOnly':
      $bids.filter.showMineOnly = !$bids.filter.showMineOnly
      break
    case 'showCompleted':
      $bids.filter.showCompleted = !$bids.filter.showCompleted
      break
    case 'showMyBidsOnly':
      $bids.filter.showMyBidsOnly = !$bids.filter.showMyBidsOnly
      break
    case 'reset':
      $bids.resetFilters()
      break
    default:
      break
  }
  if ($bids.openTab == 'auction') {
    await getAuctions()
  } else {
    await getFixedPrice()
  }
}

async function getAuctions(props) {
  itemsTable.filter = {
    only_mine: $bids.filter.showMineOnly,
    include_inactive: $bids.filter.showCompleted,
    user_is_participant: $bids.filter.showMyBidsOnly
  }
  const params = prepareFilterQuery(itemsTable, props)
  try {
    const {data} = await saas.getAuctions(params)
    itemsTable.pagination.rowsNumber = data.total
    auctions.value = {...data}
    $bids.addAuctions(auctions.value)
  } catch (error) {
    console.error('Error getting sell offers: ', error)
    $q.notify({
      message: 'Failed to get sell offers',
      color: 'negative'
    })
  }
}

async function getFixedPrice(props) {
  itemsTable.filter = {
    only_mine: $bids.filter.showMineOnly,
    include_inactive: $bids.filter.showCompleted,
    user_is_participant: $bids.filter.showMyBidsOnly
  }
  const params = prepareFilterQuery(itemsTable, props)
  try {
    const {data} = await saas.getFixedPrice(params)
    fixedPrice.value = {...data}
    itemsTable.pagination.rowsNumber = data.total
    $bids.addFixedPrice(fixedPrice.value)
  } catch (error) {
    console.error('Error getting fixed price offers: ', error)
    $q.notify({
      message: 'Failed to get fixed price offers',
      color: 'negative'
    })
  }
}

function getParticipating() {
  return auctions.value.data.filter(
    auction => auction.active && auction.user_is_participant
  )
}

function findOutbids() {
  const outbids = participating.value.filter(item => !item.user_is_top_bidder)
  return outbids
}

// const buttonIcon = props => {
//   const {active, user_is_participant, user_is_top_bidder} = props.row
//   if (!active) return null
//   if (user_is_participant) {
//     return user_is_top_bidder ? 'military_tech' : 'sentiment_dissatisfied'
//   }
//   return null
// }

onMounted(async () => {
  await getAuctions()
  await getFixedPrice()
  if ($store.isLoggedIn) {
    loadingParticipating.value = true
    participating.value = getParticipating()
    outbidded.value = findOutbids()
    loadingParticipating.value = false

    auctionWs.value = saas.subscribeToWS()
    auctionWs.value.onmessage = async ({data}) => {
      const resp = JSON.parse(data)
      if (resp.status == 'new_bid') {
        const isUserParticipating = participating.value.find(
          item => item.id == resp.auction_item_id
        )
        if (isUserParticipating && isUserParticipating.user_is_top_bidder) {
          const index = participating.value.findIndex(
            item => item.id == resp.auction_item_id
          )
          participating.value[index].user_is_top_bidder = false
          $q.notify({
            message: 'You have been outbid',
            color: 'negative'
          })
          await getAuctions()
          participating.value = getParticipating()
          outbidded.value = findOutbids()
        }
      }
    }
  }
})
</script>
