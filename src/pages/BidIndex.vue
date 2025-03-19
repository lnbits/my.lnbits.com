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
    </q-input>
    <div class="container q-mt-lg">
      <div class="pitch q-mx-auto">
        <q-tabs
          v-model="tab"
          dense
          :inline-label="$q.screen.gt.sm"
          align="justify"
          class="text-grey q-pa-sm"
          active-color="secondary"
          indicator-color="secondary"
          @update:model-value="resetPagination"
        >
          <q-tab name="auction" icon="currency_exchange" label="On Auction" />
          <q-tab name="buy" icon="attach_money" label="For Sale" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated style="background: transparent">
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
              v-model:pagination.sync="itemsTable.pagination"
              @request="getAuctions"
              :visible-columns="
                $q.screen.gt.sm
                  ? ['name', 'ask_price', 'current_price', 'expires_at']
                  : ['name', 'current_price']
              "
            >
              <template v-slot:header="props">
                <q-tr :props="props" class="text-h5 text-uppercase">
                  <!-- <q-th auto-width></q-th> -->
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
                <q-tr :props="props">
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
                      color="secondary"
                      text-color="primary"
                      padding="sm lg"
                      label="Bid"
                      :to="`/bid/${props.row.id}`"
                      class="text-capitalize q-my-sm"
                    />
                  </q-td>
                </q-tr>
              </template>
            </q-table>
            <!-- <BidList :items="auctions.data" :columns :auction="true" /> -->
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
              v-model:pagination.sync="itemsTable.pagination"
              @request="getFixedPrice"
              :visible-columns="['name', 'ask_price']"
            >
              <template v-slot:header="props">
                <q-tr :props="props" class="text-h5 text-uppercase">
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
                <q-tr :props="props">
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
                      color="secondary"
                      text-color="primary"
                      padding="sm lg"
                      label="Buy"
                      :to="`/bid/${props.row.id}`"
                      class="text-capitalize q-my-sm"
                    />
                  </q-td>
                </q-tr>
              </template>
            </q-table>
            <!-- <BidList :identities="fixedPrice.data || []" :auction="false" /> -->
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import {ref, onMounted, watch, watchEffect} from 'vue'
import {saas} from 'src/boot/saas'
import {useQuasar} from 'quasar'
import {formatCurrency, prepareFilterQuery} from 'src/boot/utils'

import NostrHeadIcon from 'components/NostrHeadIcon.vue'

const $q = useQuasar()

const tab = ref('auction')

const auctions = ref({})
const fixedPrice = ref({})

const filterText = ref('')

const itemsTable = {
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
      label: 'Current Price',
      field: 'current_price',
      sortable: true,
      format: (_, row) => formatCurrency(row.current_price, row.currency)
    },
    {
      name: 'expires_at',
      align: 'left',
      label: 'Expires At',
      field: 'expires_at',
      format: val => new Date(val).toLocaleString(),
      sortable: true
    }
  ],
  pagination: {
    sortBy: tab.value == 'auction' ? 'current_price' : 'ask_price',
    rowsPerPage: 25,
    page: 1,
    descending: true,
    rowsNumber: 25
  }
}

const resetPagination = () => {
  itemsTable.pagination = {
    sortBy: tab.value == 'auction' ? 'current_price' : 'ask_price',
    rowsPerPage: 25,
    page: 1,
    descending: true,
    rowsNumber:
      tab.value == 'auction' ? auctions.value.total : fixedPrice.value.total
  }
}

watch(filterText, () => handleSearch(), {immediate: true})

async function handleSearch() {
  itemsTable.search = filterText.value
  if (tab.value == 'auction') {
    await getAuctions()
  } else {
    await getFixedPrice()
  }
}

async function getAuctions(props) {
  const params = prepareFilterQuery(itemsTable, props)
  try {
    const {data} = await saas.getAuctions(params)
    auctions.value = {...data}
    itemsTable.pagination.rowsNumber = data.total
    console.log('Auctions: ', data)
    // return {...data}
  } catch (error) {
    console.error('Error getting sell offers: ', error)
  }
}

async function getFixedPrice(props) {
  const params = prepareFilterQuery(itemsTable, props)
  try {
    const {data} = await saas.getFixedPrice(params)
    fixedPrice.value = {...data}
    itemsTable.pagination.rowsNumber = data.total
    console.log('Fixed price: ', fixedPrice.value)
  } catch (error) {
    console.error('Error getting fixed price offers: ', error)
  }
}

onMounted(async () => {
  await getAuctions()
  await getFixedPrice()
  // $bids.addAuctions(auctions.value)
  // $bids.addFixedPrice(fixedPrice.value)
})
</script>

<!-- <style lang="scss">
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2.5rem;
  box-sizing: content-box;

  .pitch {
    width: 80%;
    margin-bottom: 4rem;
  }

  .input {
    margin-bottom: 3rem;
    max-width: 800px;
  }
}
</style> -->
