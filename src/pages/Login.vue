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
              <div v-if="isSignupRequest" class="col text-h6 ellipsis">
                Register
              </div>
              <div v-else class="col text-h6 ellipsis">Login</div>
            </div>
            <div class="text-center q-pt-lg">
              <div class="col ellipsis">
                Manage your <strong>LNbits</strong> instances in the cloud.
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

              <q-input
                type="password"
                filled
                v-model="password"
                :rules="[checkPassword]"
                label="Password"
                lazy-rules
              />

              <q-input
                v-if="isSignupRequest"
                type="password"
                filled
                v-model="passwordRepeat"
                :rules="[checkPassword]"
                label="Confirm password"
                lazy-rules
              />
              <q-linear-progress
                v-if="inProgress"
                indeterminate
                color="secondary"
                class="q-mt-sm"
              />

              <q-btn
                v-if="!this.isSignupRequest"
                label="Login"
                @click="login"
                type="submit"
                color="primary"
                class="full-width"
                :disable="inProgress"
              />

              <div v-if="!this.isSignupRequest" class="q-mt-sm text-center">
                <span>or</span>
              </div>

              <q-btn
                label="Register"
                @click="signup"
                type="submit"
                color="secondary"
                class="full-width q-mt-sm"
                :disable="inProgress"
              />
              <q-btn
                v-if="this.isSignupRequest"
                @click="this.isSignupRequest = false"
                label="Back"
                type="button"
                class="full-width q-mt-md"
                color="grey"
              />
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
      password: ref(''),
      passwordRepeat: ref(''),
      isSignupRequest: ref(false),
      inProgress: ref(false)
    }
  },

  methods: {
    async login() {
      try {
        this.inProgress = true
        const message = this.validateForm()
        if (message) {
          this.q.notify({
            message,
            color: 'negative',
            icon: 'warning'
          })
          return false
        }
        await saas.login(this.email, this.password)
        this.q.notify({
          message: 'Logged in!',
          color: 'positive'
        })
        setTimeout(() => (window.location.href = '/'), 500)
      } catch (error) {
        console.warn(error)
        this.q.notify({
          message: 'Failed to login!',
          caption: saas.mapErrorToString(error),
          color: 'negative',
          icon: 'warning'
        })
        return false
      } finally {
        this.inProgress = false
      }
    },
    checkEmail(val) {
      return (
        (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) ||
        'Please enter a valid email address'
      )
    },
    checkPassword(val) {
      return (
        (val && val.length >= 8) || 'Password must have at least 8 characters'
      )
    },
    validateForm() {
      // const emailMessage = this.checkEmail(this.email)
      // if (emailMessage !== true) {
      //   return emailMessage
      // }
      const passwordMessage = this.checkPassword(this.password)
      if (passwordMessage !== true) {
        return passwordMessage
      }
      return null
    },
    validateSignupForm() {
      const message = this.validateForm()
      if (message) {
        return message
      }
      const passwordRepeatMessage = this.checkPassword(this.passwordRepeat)
      if (passwordRepeatMessage !== true) {
        return passwordRepeatMessage
      }
      if (this.password !== this.passwordRepeat) {
        return 'Passwords do not match!'
      }

      return null
    },

    async onSubmit() {
      if (this.isSignupRequest) {
        await this.signup()
      } else {
        await this.login()
      }
    },
    async signup() {
      if (!this.isSignupRequest) {
        this.isSignupRequest = true
        return
      }
      const message = this.validateSignupForm()
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
        await saas.signup(this.email, this.password, this.passwordRepeat)
        this.q.notify({
          message: 'Signed Up!',
          color: 'positive'
        })
        setTimeout(() => (window.location.href = '/'), 500)
      } catch (error) {
        console.warn(error)
        this.q.notify({
          message: 'Failed to register!',
          caption: saas.mapErrorToString(error),
          color: 'negative',
          icon: 'warning'
        })
        return false
      } finally {
        this.inProgress = false
      }
    }
  }
})
</script>
