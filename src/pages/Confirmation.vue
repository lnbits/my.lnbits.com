<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex bg-image flex-center">
        <q-card v-bind:style="q.screen.lt.sm ? {width: '80%'} : {width: '30%'}">
          <q-card-section class="text-center q-pa-xl text-h6">
            The confirmation email has been sent.
          </q-card-section>
          <q-card-section class="text-center text-h6">
            Please check your inbox.
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import {defineComponent} from 'vue'
import {useQuasar} from 'quasar'
import {saas} from 'boot/saas'

export default defineComponent({
  setup() {
    const $q = useQuasar()
    return {
      q: $q
    }
  },
  methods: {
    async checkEmailConfirmation() {
      try {
        const data = await saas.checkEmailConfirmation()
        if (data.status === 'success') {
          this.$q.notify({
            message: 'Email confirmed!',
            color: 'positive'
          })
          this.$router.push('/')
        } else {
          this.$q.notify({
            message: 'Email confirmation failed!',
            caption: data.error,
            color: 'negative',
            icon: 'warning'
          })
        }
      } catch (error) {
        console.warn(error)
        this.$q.notify({
          message: 'Email confirmation failed!',
          caption: saas.mapErrorToString(error),
          color: 'negative',
          icon: 'warning'
        })
      }
    },
    async created() {
      const urlParams = new URLSearchParams(window.location.search)
      const emailConfirmationToken = urlParams.get('email_confirmation_token')

      if (emailConfirmationToken) {
        await this.checkEmailConfirmation()
      }
    }
  }
})
</script>
