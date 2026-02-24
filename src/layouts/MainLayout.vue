<template>
  <q-layout view="hHh Lpr lFf" class="app-shell">
    <q-header class="bg-transparent" style="color: inherit">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          icon="menu"
          aria-label="Menu"
        />
        <q-toolbar-title>
          <span class="text-subtitle1 text-italic text-weight-light">my</span>
          <span class="q-ml-xs text-weight-bold">Bits</span>
        </q-toolbar-title>
        <q-space />
        <div class="q-mr-md">
          <q-icon name="light_mode" size="xs" />
          <q-toggle
            v-model="darkMode"
            @update:model-value="toggleDarkMode"
            :icon="darkMode ? 'light_mode' : 'dark_mode'"
            color="primary"
          ></q-toggle>
          <q-icon name="dark_mode" size="xs" />
        </div>
        <q-btn-dropdown icon="account_circle" flat>
          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label>
                  {{ email }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable @click="logout()">
              <q-item-section>
                <q-item-label>Logout</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="logout" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list class="q-mt-xl">
        <q-item to="/instances" active-class="text-primary">
          <q-item-section avatar>
            <q-icon name="table_chart" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Instances</q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/payments" active-class="text-primary">
          <q-item-section avatar>
            <q-icon name="payment" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Payments</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          v-if="showFeatureFlag"
          to="/subscriptions"
          active-class="text-primary"
        >
          <q-item-section avatar>
            <q-icon name="subscriptions" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Subscriptions</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/activity" active-class="text-primary">
          <q-item-section avatar>
            <q-icon name="manage_history" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Activity</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/pricing" active-class="text-primary">
          <q-item-section avatar>
            <q-icon name="currency_bitcoin" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Pricing</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
  <chat-card />
</template>
<script>
import EssentialLink from 'components/EssentialLink.vue'
import ChatCard from 'src/components/cards/ChatCard.vue'

import {defineComponent, ref} from 'vue'
import {useQuasar} from 'quasar'
import {saas} from 'boot/saas'

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink,
    ChatCard
  },
  data() {
    return {
      showFeatureFlag: false,
      toggleDarkMode: () => {
        this.q.dark.toggle()
        localStorage.setItem('darkMode', this.q.dark.isActive)
      },
      darkMode: false
    }
  },

  setup() {
    const $q = useQuasar()
    const leftDrawerOpen = ref(false)

    return {
      q: $q,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  },
  computed: {
    email: function () {
      return saas.email
    }
  },
  methods: {
    logout: async function () {
      try {
        await saas.logout()
        this.q.notify({
          message: 'Logged out!',
          color: 'positive'
        })
        setTimeout(() => (window.location.href = '/login'), 500)
      } catch (error) {
        this.q.notify({
          message: 'Failed to logout!',
          caption: saas.mapErrorToString(error),
          color: 'negative',
          icon: 'warning'
        })
      }
    },
    isLinkActive(link) {
      return this.$route.path === link
    }
  },
  async created() {
    const storedDarkMode = localStorage.getItem('darkMode')
    this.darkMode = storedDarkMode === null ? true : storedDarkMode === 'true'
    this.q.dark.set(this.darkMode)
    if (this.$route.path === '/') {
      this.$router.replace('/instances').catch(() => {
        // Ignore errors
      })
    }
    try {
      // temporary feature flag for alan
      this.showFeatureFlag = saas.email === 'alan@lnbits.com'
    } catch (error) {
      console.warn(error)
    } finally {
      this.inProgress = false
      if (this.plan) {
        this.planDialog.plan = this.plan
        this.planDialog.show = true
        // remove query params from URL
        this.$router.replace({query: null}).catch(() => {
          // Ignore errors
        })
      }
    }
  }
})
</script>

<style>
/* FONT AWESOME GENERIC BEAT */
.fa-beat {
  animation: fa-beat 5s ease infinite;
}

@keyframes fa-beat {
  0% {
    transform: scale(1);
  }
  5% {
    transform: scale(1.25);
  }
  20% {
    transform: scale(1);
  }
  30% {
    transform: scale(1);
  }
  35% {
    transform: scale(1.25);
  }
  50% {
    transform: scale(1);
  }
  55% {
    transform: scale(1.25);
  }
  70% {
    transform: scale(1);
  }
}
</style>
