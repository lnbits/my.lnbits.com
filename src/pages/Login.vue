<template>
  <q-page class="flex flex-center">
    <q-card
      v-bind:style="
        q.screen.lt.sm
          ? { width: '80%' }
          : { width: '30%', minWidth: '350px', maxWidth: '400px' }
      "
    >
      <q-card-section class="q-mb-md">
        <q-avatar
          size="150px"
          class="absolute-center shadow-10"
          color="primary"
        >
          <img src="~assets/nostrich-head-32.svg" class="q-pa-md" />
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
            Manage your <strong>Nostr</strong> accounts.
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <q-form @submit="onSubmit">
          <q-input
            filled
            v-model="username"
            :rules="[checkUsername]"
            label="Username"
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
</template>

<script>
import { defineComponent } from "vue";
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useAppStore } from "src/stores/store";

import { saas } from "boot/saas";

export default defineComponent({
  setup() {
    const $q = useQuasar();
    const $store = useAppStore();

    return {
      q: $q,
      store: $store,
      username: ref(""),
      password: ref(""),
      passwordRepeat: ref(""),
      isSignupRequest: ref(false),
      inProgress: ref(false),
    };
  },
  created() {
    if (this.$route.query.signup) {
      this.isSignupRequest = true;
    }
  },
  methods: {
    async login() {
      try {
        this.inProgress = true;
        const message = this.validateForm();
        if (message) {
          this.q.notify({
            message,
            color: "negative",
            icon: "warning",
          });
          return false;
        }
        await saas.login(this.username, this.password);
        this.q.notify({
          message: "Logged in!",
          color: "positive",
        });
        this.store.username = this.username;
        const path = this.store.newCartIdentifier ? '/cart' : '/'
        setTimeout(() => this.$router.push(path), 500);
      } catch (error) {
        console.warn(error);
        this.q.notify({
          message: "Failed to login!",
          color: "negative",
          icon: "warning",
        });
        return false;
      } finally {
        this.inProgress = false;
      }
    },
    checkUsername(val) {
      return (
        (val && val.length >= 3) || "Username must have at least 3 characters"
      );
    },
    checkPassword(val) {
      return (
        (val && val.length >= 8) || "Password must have at least 8 characters"
      );
    },
    validateForm() {
      const usernameMessage = this.checkUsername(this.username);
      if (usernameMessage !== true) {
        return usernameMessage;
      }
      const passwordMessage = this.checkPassword(this.password);
      if (passwordMessage !== true) {
        return passwordMessage;
      }
      return null;
    },
    validateSignupForm() {
      const message = this.validateForm();
      if (message) {
        return message;
      }
      const passwordRepeatMessage = this.checkPassword(this.passwordRepeat);
      if (passwordRepeatMessage !== true) {
        return passwordRepeatMessage;
      }
      if (this.password !== this.passwordRepeat) {
        return "Passwords do not match!";
      }

      return null;
    },

    async onSubmit() {
      if (this.isSignupRequest) {
        await this.signup();
      } else {
        await this.login();
      }
    },
    async signup() {
      if (!this.isSignupRequest) {
        this.isSignupRequest = true;
        return;
      }
      const message = this.validateSignupForm();
      if (message) {
        this.q.notify({
          message,
          color: "negative",
          icon: "warning",
        });
        return;
      }

      try {
        this.inProgress = true;
        await saas.signup(this.username, this.password, this.passwordRepeat);
        this.q.notify({
          message: "Signed Up!",
          color: "positive",
        });
        this.store.username = this.username;
        setTimeout(() => this.$router.push("/"), 500);
      } catch (error) {
        console.warn(error);
        this.q.notify({
          message: "Failed to register!",
          caption: saas.mapErrorToString(error),
          color: "negative",
          icon: "warning",
        });
        return false;
      } finally {
        this.inProgress = false;
      }
    },
  },
});
</script>

<style lang="scss">
.bg-image {
  background: $primary;
  background: linear-gradient(
    142deg,
    $primary 0%,
    $primary 75%,
    $secondary 120%
  );

  svg {
    opacity: 50%;
  }
}
</style>
