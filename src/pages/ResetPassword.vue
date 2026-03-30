<template>
  <public-auth-shell>
    <template #hero>
      <div class="public-auth-hero-top">
        <img src="/profile.svg" alt="LNbits" class="public-auth-hero-logo" />
        <p class="public-auth-hero-tagline">Reset account access</p>
      </div>

      <div class="public-auth-hero-middle">
        <div>
          <h1 class="public-auth-hero-title">Set a new password.</h1>
          <p class="public-auth-hero-copy">
            Use the token from your recovery email.
            If you arrived through the email link, the token is prefilled.
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
      <h2>Choose a new password</h2>
      <p>Enter the recovery token and confirm the new password.</p>
    </div>

    <q-form class="public-auth-form" @submit="onSubmit">
      <q-input
        v-model="password"
        type="password"
        outlined
        autocomplete="new-password"
        label="Password"
        lazy-rules
        :rules="[checkPassword]"
      />

      <q-input
        v-model="passwordRepeat"
        type="password"
        outlined
        autocomplete="new-password"
        label="Confirm password"
        lazy-rules
        :rules="[checkPassword]"
      />

      <q-input
        v-model="resetToken"
        type="password"
        outlined
        label="Reset token"
        lazy-rules
        :rules="[checkResetToken]"
      />

      <q-linear-progress
        v-if="inProgress"
        indeterminate
        color="primary"
        class="q-mt-xs"
      />

      <q-btn
        label="Reset password"
        type="submit"
        color="primary"
        no-caps
        unelevated
        class="full-width public-auth-submit"
        :disable="inProgress"
      />

      <div class="public-auth-links">
        <router-link to="/login">Back to sign in</router-link>
        <router-link to="/forgot-password">Need a new recovery email?</router-link>
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
      password: ref(''),
      passwordRepeat: ref(''),
      resetToken: ref(''),
      inProgress: ref(false)
    }
  },

  watch: {
    $route: {
      immediate: true,
      handler() {
        this.populateResetTokenFromQuery()
      }
    }
  },

  methods: {
    populateResetTokenFromQuery() {
      const query = this.$route.query || {}
      const tokenFromQuery = query.token_reset || query.reset_token
      const resetToken =
        typeof tokenFromQuery === 'string'
          ? tokenFromQuery
          : Array.isArray(tokenFromQuery)
          ? tokenFromQuery[0]
          : ''

      if (!resetToken) {
        return
      }

      this.resetToken = resetToken

      const nextQuery = {...query}
      delete nextQuery.token_reset
      delete nextQuery.reset_token

      this.$router
        .replace({
          path: this.$route.path,
          query: nextQuery,
          hash: this.$route.hash
        })
        .catch(() => {})
    },
    checkPassword(val) {
      return (
        (val && val.length >= 8) || 'Password must have at least 8 characters'
      )
    },
    checkResetToken(val) {
      return (val && val.length > 0) || 'Reset token is required'
    },
    validateForm() {
      const passwordMessage = this.checkPassword(this.password)
      if (passwordMessage !== true) {
        return passwordMessage
      }

      const passwordRepeatMessage = this.checkPassword(this.passwordRepeat)
      if (passwordRepeatMessage !== true) {
        return passwordRepeatMessage
      }

      if (this.password !== this.passwordRepeat) {
        return 'Passwords do not match!'
      }

      const resetTokenMessage = this.checkResetToken(this.resetToken)
      if (resetTokenMessage !== true) {
        return resetTokenMessage
      }

      return null
    },
    async onSubmit() {
      const message = this.validateForm()
      if (message) {
        this.q.notify({
          message,
          color: 'negative',
          icon: 'warning'
        })
        return
      }

      try {
        this.inProgress = true
        await saas.resetPassword(
          this.resetToken,
          this.password,
          this.passwordRepeat
        )
        this.q.notify({
          message: 'Password reset!',
          color: 'positive'
        })
        setTimeout(() => {
          this.$router.push('/login')
        }, 500)
      } catch (error) {
        console.warn(error)
        this.q.notify({
          message: 'Failed to reset password!',
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
