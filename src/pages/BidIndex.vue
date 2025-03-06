<template>
  <q-page class="q-pa-sm container">
    <div class="q-gutter-md">
      <q-breadcrumbs class="text-grey-4 q-mb-lg" active-color="secondary">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Bid" />
      </q-breadcrumbs>
    </div>
    <div class="hero">
      <div class="pitch text-center text-secondary">
        <h1 class="text-bold" :class="$q.screen.gt.sm ? 'text-h4' : 'text-h5'">
          Discover identifiers for sale in our Auctions and Buy Now listings
        </h1>
      </div>
      <q-input
        dark
        standout
        autofocus
        rounded
        v-model.trim="handle"
        class="input q-pa-lg"
        :style="{width: $q.screen.gt.sm ? '100%' : null}"
        placeholder="@nostr.com"
        hint="Powered by LNbits"
        label-color="blue-grey-4"
        :input-style="{
          fontSize: '22px'
        }"
        @keydown.enter.prevent="handleSearch"
      >
        <template v-slot:prepend>
          <NostrHeadIcon color="blue-grey-4" />
        </template>
        <template v-slot:append>
          <q-btn
            rounded
            unelevated
            text-color="primary"
            color="secondary"
            label="Search"
            @click="handleSearch"
            class="text-capitalize"
          />
        </template>
      </q-input>
    </div>
    <div class="container">
      <div class="pitch q-mx-auto">
        <q-tabs
          v-model="tab"
          dense
          :inline-label="$q.screen.gt.sm"
          align="justify"
          class="text-grey q-pa-sm"
          active-color="secondary"
          indicator-color="secondary"
        >
          <q-tab name="buy" icon="attach_money" label="Buy Now" />
          <q-tab name="auction" icon="currency_exchange" label="Auctions" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated style="background: transparent">
          <q-tab-panel name="buy">
            <BidList :identities="identities.filter(i => !i.auction)" />
          </q-tab-panel>

          <q-tab-panel name="auction">
            <BidList :identities="identities.filter(i => i.auction)" />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import {ref} from 'vue'
import {saas} from 'src/boot/saas'
import {useQuasar} from 'quasar'
import {useAppStore} from 'src/stores/store'
import {useRouter} from 'vue-router'

import NostrHeadIcon from 'components/NostrHeadIcon.vue'
import BidList from 'src/components/BidList.vue'

const $q = useQuasar()
const $store = useAppStore()
const $router = useRouter()

const handle = ref('')
const nipCard = ref(null)
const tab = ref('buy')

const identities = ref([
  // mock a few identities
  {
    local_part: 'alice',
    price: 1000,
    auction: true,
    expires: (Date.now() + Math.floor(Math.random() * 86400000)) / 1000
  },
  {
    local_part: 'bob',
    price: 2000,
    auction: true,
    expires: (Date.now() + Math.floor(Math.random() * 86400000)) / 1000
  },
  {
    local_part: 'charlie',
    price: 3000,
    auction: false,
    expires: null
  }
])

const handleSearch = async () => {
  return
  // if (!handle.value) {
  //   return
  // }
  // try {
  //   const {data} = await saas.queryIdentifier(handle.value)
  //   $store.handle = handle.value
  //   data.hasFreeOption = !!data.free_identifier_number
  //   $store.handleData = data
  // } catch (error) {
  //   console.error('Error searching for identifier: ', error)
  //   $q.notify({
  //     message: 'There was a problem while searching',
  //     color: 'negative',
  //     position: 'top',
  //     timeout: 2000
  //   })
  // } finally {
  //   $router.push({query: {q: handle.value}})
  //   const element = nipCard.value
  //   scrollToElement(element)
  // }
}
</script>

<style lang="scss">
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
</style>
