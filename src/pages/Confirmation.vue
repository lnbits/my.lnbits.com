<template>
  <public-auth-shell>
    <template #hero>
      <div class="public-auth-hero-top">
        <img src="/profile.svg" alt="LNbits" class="public-auth-hero-logo" />
        <p class="public-auth-hero-tagline">Almost there</p>
      </div>

      <div class="public-auth-hero-middle">
        <div>
          <h1 class="public-auth-hero-title">Check your inbox.</h1>
          <p class="public-auth-hero-copy">
            A confirmation email has been sent.
            Click the link inside to activate your account.
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
      <h2>Waiting for confirmation</h2>
      <p>Once confirmed you'll be redirected to your dashboard.</p>
    </div>

    <div class="public-auth-confirm-block">
      <q-icon name="mark_email_read" size="48px" />
      <h3>Check your inbox</h3>
      <p>
        We sent a confirmation link to your email address.
        Click it to activate your account.
      </p>
      <p class="public-auth-confirm-hint">
        Didn't receive it? Check your spam folder or
        <router-link to="/login">try signing up again</router-link>.
      </p>
    </div>
  </public-auth-shell>
</template>

<script>
import {defineComponent} from 'vue'
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
      q: $q
    }
  },
  methods: {
    async checkEmailConfirmation(token) {
      try {
        const data = await saas.confirmEmail(token)
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
    }
  },
  async created() {
    const urlParams = new URLSearchParams(window.location.search)
    const emailConfirmationToken = urlParams.get('email_confirmation_token')

    if (emailConfirmationToken) {
      await this.checkEmailConfirmation(emailConfirmationToken)
    }
  }
})
</script>
