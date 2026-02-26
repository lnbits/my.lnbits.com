<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex bg-image flex-center">
        <q-card v-bind:style="q.screen.lt.sm ? {width: '80%'} : {width: '30%'}">
          <q-card-section class="text-center q-pa-xl text-h5">
            Subscription paid!
          </q-card-section>
          <q-card-section class="text-center text-h6">
            Your instance is being provisioned.
            <br />
            Please close this tab.
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import {defineComponent} from 'vue'
import {useQuasar} from 'quasar'

export default defineComponent({
  setup() {
    const $q = useQuasar()
    return {
      q: $q
    }
  }
})
</script>
