<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          icon="menu"
          aria-label="Menu"
        />
        <q-toolbar-title> My Bits </q-toolbar-title>
        <q-space />
        <div class="q-gutter-sm row items-center no-wrap">
          <span v-text="username"></span>

          <q-btn
            round
            dense
            flat
            color="white"
            icon="fab fa-github"
            type="a"
            href="https://github.com/lnbits"
            target="_blank"
          >
          </q-btn>

          <q-btn round flat>
            <q-avatar @click="logout()" icon="logout" size="26px"> </q-avatar>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-primary text-white"
    >
      <q-list>
        <q-item></q-item>
        <q-item to="/instances" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="table_chart" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Instances</q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/activity" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="manage_history" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Activity</q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/pricing" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="currency_bitcoin" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Pricing</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from "components/EssentialLink.vue";

import { defineComponent, ref } from "vue";
import { useQuasar } from "quasar";
import { saas } from "boot/saas";

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
  },

  setup() {
    const $q = useQuasar();
    const leftDrawerOpen = ref(false);

    return {
      q: $q,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
  computed: {
    username: function () {
      return saas.username;
    },
  },
  methods: {
    logout: async function () {
      try {
        await saas.logout();
        this.q.notify({
          message: "Logged out!",
          color: "positive",
        });
        setTimeout(() => (window.location.href = "/login"), 500);
      } catch (error) {
        this.q.notify({
          message: "Failed to logout!",
          caption: saas.mapErrorToString(error),
          color: "negative",
          icon: "warning",
        });
      }
    },
  },
});
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
