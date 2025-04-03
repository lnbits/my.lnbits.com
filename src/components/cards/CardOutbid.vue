<template>
  <q-item clickable v-ripple class="nostr-card q-py-md">
    <q-item-section class="ellipsis">
      <q-item-label lines="1" class="text-weight-bold text-white q-mb-md">{{
        item.name
      }}</q-item-label>
    </q-item-section>

    <q-item-section>
      <q-item-label caption>
        <span class="text-weight-bold text-white">Ends in</span>
      </q-item-label>
      <q-item-label caption>
        <span class="text-white">{{
          timeFromSeconds(item.time_left_seconds)
        }}</span>
      </q-item-label>
    </q-item-section>

    <q-item-section side top>
      <q-item-label caption>
        <span class="text-weight-bold text-white">Current Bid</span>
      </q-item-label>
      <q-item-label caption>
        <span class="text-white">{{
          formatCurrency(item.current_price, item.currency)
        }}</span>
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import {formatCurrency, timeFromSeconds} from 'src/boot/utils'
defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>
