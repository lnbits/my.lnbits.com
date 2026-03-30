<template>
  <public-auth-shell>
    <template #hero>
      <div class="public-auth-hero-top">
        <img src="/profile.svg" alt="LNbits" class="public-auth-hero-logo" />
        <p class="public-auth-hero-tagline">Manage your LNbits instances in the cloud.</p>
      </div>

      <div class="public-auth-hero-middle">
        <div>
          <h1 class="public-auth-hero-title">Accept Bitcoin.<br />Skip the setup.</h1>
          <p class="public-auth-hero-copy">
            A fully managed Lightning wallet with built-in tools
            for payments, point-of-sale, tipping, and more.
            Live in minutes.
          </p>
        </div>

        <div class="public-auth-features">
          <div class="public-auth-feature">
            <q-icon name="rocket_launch" size="16px" class="public-auth-feature-icon" />
            <span>Live in under 3 minutes</span>
          </div>
          <div class="public-auth-feature">
            <q-icon name="savings" size="16px" class="public-auth-feature-icon" />
            <span>From $2/week, cancel anytime</span>
          </div>
          <div class="public-auth-feature">
            <q-icon name="widgets" size="16px" class="public-auth-feature-icon" />
            <span>40+ tools and extensions</span>
          </div>
          <div class="public-auth-feature">
            <q-icon name="bolt" size="16px" class="public-auth-feature-icon" />
            <span>21 sats on-demand spin-up per hour</span>
          </div>
        </div>
      </div>

      <div class="public-auth-hero-bottom">
        <div class="public-auth-status">
          <span v-if="apiEnv !== 'prod'" class="public-auth-env-badge">{{ apiEnv }}</span>
          <router-link to="/pricing" class="public-auth-bottom-link">See full pricing &rarr;</router-link>
        </div>
      </div>
    </template>

    <div class="public-auth-panel-head">
      <h2>{{ isSignupRequest ? 'Create your account' : 'Sign in' }}</h2>
      <p>{{ isSignupRequest ? 'One account for all your LNbits instances.' : 'to manage your instances in the cloud' }}</p>
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

      <q-input
        v-model="password"
        outlined
        type="password"
        autocomplete="current-password"
        label="Password"
        lazy-rules
        :rules="[checkPassword]"
      />

      <q-input
        v-if="isSignupRequest"
        v-model="passwordRepeat"
        outlined
        type="password"
        autocomplete="new-password"
        label="Confirm password"
        lazy-rules
        :rules="[checkPassword]"
      />

      <q-linear-progress
        v-if="inProgress"
        indeterminate
        color="primary"
        class="q-mt-xs"
      />

      <q-btn
        :label="isSignupRequest ? 'Create account' : 'Sign in'"
        type="submit"
        color="primary"
        no-caps
        unelevated
        class="full-width public-auth-submit"
        :disable="inProgress"
      />

      <div class="public-auth-links">
        <router-link v-if="!isSignupRequest" to="/forgot-password">
          Forgot password?
        </router-link>
        <router-link to="/terms-of-service">Terms of service</router-link>
      </div>
    </q-form>

    <div class="public-auth-switch">
      <template v-if="!isSignupRequest">
        New here?
        <a href="#" @click.prevent="setMode('signup')">Create an account</a>
      </template>
      <template v-else>
        Have an account?
        <a href="#" @click.prevent="setMode('login')">Sign in</a>
      </template>
    </div>
  </public-auth-shell>
</template>

<script>
import {defineComponent, ref} from 'vue'
import {useQuasar} from 'quasar'

import {normalizeApiEnv, saas} from 'boot/saas'
import PublicAuthShell from 'src/components/PublicAuthShell.vue'

export default defineComponent({
  components: {
    PublicAuthShell
  },
  setup() {
    const $q = useQuasar()
    return {
      q: $q,
      apiEnv: ref('prod'),
      email: ref(''),
      password: ref(''),
      passwordRepeat: ref(''),
      isSignupRequest: ref(false),
      inProgress: ref(false)
    }
  },

  watch: {
    '$route.query.env': {
      immediate: true,
      handler(env) {
        const apiEnv = normalizeApiEnv(env)

        this.apiEnv = apiEnv
        localStorage.setItem('apiEnv', apiEnv)
      }
    }
  },

  methods: {
    setMode(mode) {
      this.isSignupRequest = mode === 'signup'
    },
    syncApiEnvFromQuery() {
      const apiEnv = normalizeApiEnv(this.$route.query.env)

      this.apiEnv = apiEnv
      localStorage.setItem('apiEnv', apiEnv)
    },
    async login() {
      this.syncApiEnvFromQuery()

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
    goBack() {
      this.syncApiEnvFromQuery()
      this.setMode('login')
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
      this.syncApiEnvFromQuery()

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
        setTimeout(() => {
          this.$router.push('/confirm')
        }, 500)
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
  },

})
</script>
