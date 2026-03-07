<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex bg-image flex-center">
        <q-card v-bind:style="q.screen.lt.sm ? {width: '80%'} : {width: '30%'}">
          <q-card-section class="q-mb-md">
            <q-avatar
              size="150px"
              class="absolute-center shadow-10"
              color="grey-10"
            >
              <img src="profile.svg" class="q-pa-md" />
            </q-avatar>
          </q-card-section>
          <q-card-section>
            <div class="text-center q-mt-lg q-pt-lg">
              <div class="col text-h6 ellipsis">Forgot Password</div>
            </div>
            <div class="text-center q-pt-lg">
              <div class="col ellipsis">
                Enter your email and we will send you a recovery link.
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form @submit="onSubmit">
              <q-input
                filled
                type="email"
                autocomplete="email"
                v-model="email"
                :rules="[checkEmail]"
                label="Email"
                lazy-rules
              />

              <q-linear-progress
                v-if="inProgress"
                indeterminate
                color="secondary"
                class="q-mt-sm"
              />

              <q-btn
                label="Send Recovery Email"
                type="submit"
                color="primary"
                class="full-width"
                :disable="inProgress"
              />

              <div class="q-mt-md text-center">
                <router-link to="/login" class="text-primary">
                  Back to login
                </router-link>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import {defineComponent} from 'vue'
import {ref} from 'vue'
import {useQuasar} from 'quasar'

import {saas} from 'boot/saas'

export default defineComponent({
  setup() {
    const $q = useQuasar()
    return {
      q: $q,
      email: ref(''),
      inProgress: ref(false)
    }
  },

  methods: {
    checkEmail(val) {
      return (
        (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) ||
        'Please enter a valid email address'
      )
    },
    async onSubmit() {
      const message = this.checkEmail(this.email)
      if (message !== true) {
        this.q.notify({
          message,
          color: 'negative',
          icon: 'warning'
        })
        return
      }

      try {
        this.inProgress = true
        await saas.requestPasswordRecovery(this.email)
        this.q.notify({
          message: 'Recovery email sent!',
          color: 'positive'
        })
      } catch (error) {
        console.warn(error)
        this.q.notify({
          message: 'Failed to send recovery email!',
          caption: saas.mapErrorToString(error),
          color: 'negative',
          icon: 'warning'
        })
      } finally {
        this.inProgress = false
      }
    }
  }
})
</script>
