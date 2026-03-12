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
              <div class="col text-h6 ellipsis">Reset Password</div>
            </div>
            <div class="text-center q-pt-lg">
              <div class="col ellipsis">
                Enter your new password and the reset token from your recovery
                email.
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form @submit="onSubmit">
              <q-input
                type="password"
                filled
                v-model="password"
                :rules="[checkPassword]"
                label="Password"
                lazy-rules
              />

              <q-input
                type="password"
                filled
                v-model="passwordRepeat"
                :rules="[checkPassword]"
                label="Confirm password"
                lazy-rules
              />

              <q-input
                type="password"
                filled
                v-model="resetToken"
                :rules="[checkResetToken]"
                label="Reset Token"
                lazy-rules
              />

              <q-linear-progress
                v-if="inProgress"
                indeterminate
                color="secondary"
                class="q-mt-sm"
              />

              <q-btn
                label="Reset Password"
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
