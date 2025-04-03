<template>
  <q-card class="q-mb-md q-mx-md q-pa-none nostr-card text-white no-shadow">
    <q-card-section>
      <div class="text-h6">You're outbid in the following items</div>
    </q-card-section>
    <q-card-section>
      <div class="flex q-gutter-md">
        <template v-for="(item, index) in items" :key="index" class="q-mb-md">
          <q-badge
            color="accent"
            text-color="white"
            :label="item.name"
            class="q-pa-sm text-weight-bold"
            @click="goTo(`/bid/${item.id}`)"
            style="cursor: pointer"
          />
        </template>
      </div>
    </q-card-section>
  </q-card>
  <!-- <q-item clickable v-ripple class="nostr-card q-py-md">
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
  </q-item> -->
</template>
<script setup>
import {useRouter} from 'vue-router'
defineProps({
  items: {
    type: Array,
    default: () => [],
    required: true
  }
})

const $router = useRouter()
const goTo = path => {
  $router.push(path)
}
</script>
