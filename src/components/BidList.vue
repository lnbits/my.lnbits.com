<template>
  <!-- <template> -->
  <div v-if="!identities.length">
    <div class="text-center text-white q-mt-xl">
      <q-icon name="search" size="64px" color="grey" class="q-mb-lg" />
      <q-item-label
        class="text-h6"
        v-text="
          `No ${props.auction ? 'Auctions' : 'Buy Now'} identifiers available`
        "
      ></q-item-label>
    </div>
  </div>
  <!-- </template> -->
  <q-list
    v-for="identity in identities"
    class="nostr-card no-shadow q-ma-sm"
    bordered
  >
    <q-item
      clickable
      v-ripple
      tag="a"
      :to="`/bid/${identity.id}`"
      class="q-py-md"
    >
      <q-item-section avatar top>
        <q-avatar>
          <NostrHeadIcon color="blue-grey-4" />
        </q-avatar>
      </q-item-section>

      <q-item-section top class="ellipsis col-3 justify-center">
        <q-item-label lines="1" class="text-weight-bold text-white">{{
          identity.name
        }}</q-item-label>
        <q-item-label caption lines="1" class="text-white">
          {{ `${identity.name}@nostr.com` }}
        </q-item-label>
      </q-item-section>

      <q-item-section v-if="auction" top class="text-white">
        <q-item-label lines="1">
          <span class="text-weight-bold">Initial Price:</span>
          &nbsp;
          <span class="text-weight-medium">{{ identity.starting_price }}</span>
        </q-item-label>
        <q-item-label lines="1">
          <span class="text-weight-bold">Last Bid:</span>
          &nbsp;
          <span class="text-weight-medium">{{ identity.current_price }}</span>
        </q-item-label>
        <q-item-label lines="1">
          <span class="text-weight-bold">Time Left:</span>
          &nbsp;
          <span>{{ timeFromNow(identity.expires_at) }}</span>
        </q-item-label>
      </q-item-section>

      <q-item-section v-else top class="text-white justify-center">
        <q-item-label lines="1">
          <span class="text-weight-bold">Price:</span>
          &nbsp;
          <span class="text-weight-medium">{{ identity.price }}</span>
        </q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-btn
          rounded
          color="accent"
          text-color="white"
          :label="auction ? 'Bid' : 'Buy'"
          :to="`/bid/${identity.id}`"
          class="text-capitalize"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
const props = defineProps({
  auction: {
    type: Boolean,
    default: false
  },
  identities: Array
})

import {timeFromNow} from '../boot/utils'
import NostrHeadIcon from './NostrHeadIcon.vue'
</script>
