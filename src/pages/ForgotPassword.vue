<template>
  <public-auth-shell>
    <template #hero>
      <div class="public-auth-hero-top">
        <img src="/profile.svg" alt="LNbits" class="public-auth-hero-logo" />
        <p class="public-auth-hero-tagline">Account recovery</p>
      </div>

      <div class="public-auth-hero-middle">
        <div>
          <h1 class="public-auth-hero-title">Forgot your password?</h1>
          <p class="public-auth-hero-copy">
            Enter your email and we'll send a recovery link.
            Check your spam folder if it doesn't arrive within a few minutes.
          </p>
        </div>
      </div>

      <div class="public-auth-hero-bottom">
        <div class="public-auth-status">
          <router-link to="/login" class="public-auth-bottom-link">&larr; Back to sign in</router-link>
        </div>
      </div>
    </template>

    <div class="public-auth-panel-head">
      <h2>Send a reset link</h2>
      <p>We'll email you a link to choose a new password.</p>
    </div>

    <q-form class="public-auth-form" @submit="onSubmit">
      <q-input
        v-model="email"
        outlined
        type="email"
        autocomplete="email"
        label="Email"
        lazy-rules
        :rules="[checkEmail]"
      />

      <q-linear-progress
        v-if="inProgress"
        indeterminate
        color="primary"
        class="q-mt-xs"
      />

      <q-btn
        label="Send recovery email"
        type="submit"
        color="primary"
        no-caps
        unelevated
        class="full-width public-auth-submit"
        :disable="inProgress"
      />

      <div class="public-auth-links">
        <router-link to="/login">Back to sign in</router-link>
      </div>
    </q-form>
  </public-auth-shell>
</template>

<script>
import {defineComponent} from 'vue'
import {ref} from 'vue'
import {useQuasar} from 'quasar'

import {saas} from 'boot/saas'
import PublicAuthShell from 'src/components/PublicAuthShell.vue'

export default defineComponent({
  components: {
    PublicAuthShell
  },
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
