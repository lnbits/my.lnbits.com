<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex bg-image flex-center">
        <q-card
          v-bind:style="q.screen.lt.sm ? { width: '80%' } : { width: '30%' }"
        >
          <q-card-section class="q-mb-md">
            <q-avatar
              size="150px"
              class="absolute-center shadow-10"
              color="primary"
            >
              <img src="profile.svg" class="q-pa-sm" />
            </q-avatar>
          </q-card-section>
          <q-card-section>
            <div class="text-center q-mt-lg q-pt-lg">
              <div v-if="isSignupRequest" class="col text-h6 ellipsis">
                Sign Up
              </div>
              <div v-else class="col text-h6 ellipsis">Login</div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form class="q-gutter-md">
              <q-input
                filled
                v-model="username"
                :rules="[
                  (val) =>
                    (val && val.length >= 3) ||
                    'Username must have at least 3 characters',
                ]"
                label="Username"
                lazy-rules
              />

              <q-input
                type="password"
                filled
                v-model="password"
                :rules="[
                  (val) =>
                    (val && val.length >= 8) ||
                    'Password must have at least 8 characters',
                ]"
                label="Password"
                lazy-rules
              />

              <q-input
                v-if="isSignupRequest"
                type="password"
                filled
                v-model="passwordRepeat"
                :rules="[
                  (val) =>
                    (val && val.length >= 8) ||
                    'Password must have at least 8 characters',
                ]"
                label="Password Repeat"
                lazy-rules
              />
              <q-linear-progress
                v-if="inProgress"
                indeterminate
                color="secondary"
                class="q-mt-sm"
              />
              <div>
                <q-btn
                  v-if="!this.isSignupRequest"
                  label="Login"
                  @click="login"
                  type="button"
                  color="primary"
                  :disable="inProgress"
                />
                <q-btn
                  v-else
                  @click="this.isSignupRequest = false"
                  label="Back"
                  type="button"
                  color="grey"
                />
                <q-btn
                  label="Sign Up"
                  @click="signup"
                  type="button"
                  color="secondary"
                  class="float-right"
                  :disable="inProgress"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import { ref } from "vue";
import { useQuasar } from "quasar";

import { saas } from "boot/saas";

export default defineComponent({
  setup() {
    const $q = useQuasar();
    return {
      q: $q,
      username: ref(""),
      password: ref(""),
      passwordRepeat: ref(""),
      isSignupRequest: ref(false),
      inProgress: ref(false),
    };
  },

  methods: {
    async login() {
      try {
        this.inProgress = true;
        await saas.login(this.username, this.password);
        this.q.notify({
          message: "Logged in!",
          color: "positive",
        });
        setTimeout(() => (window.location.href = "/"), 500);
      } catch (error) {
        console.warn(error);
        this.q.notify({
          message: "Failed to login!",
          caption: saas.mapErrorToString(error),
          color: "negative",
          icon: "warning",
        });
      } finally {
        this.inProgress = false;
      }
    },
    async signup() {
      if (!this.isSignupRequest) {
        this.isSignupRequest = true;
        return;
      }
      if (this.password !== this.passwordRepeat) {
        this.q.notify({
          message: "Passwords do not match!",
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
        setTimeout(() => (window.location.href = "/"), 500);
      } catch (error) {
        console.warn(error);
        this.q.notify({
          message: "Failed to sign up!",
          caption: saas.mapErrorToString(error),
          color: "negative",
          icon: "warning",
        });
      } finally {
        this.inProgress = false;
      }
    },
  },
});
</script>

<style>
.bg-image {
  background-image: linear-gradient(135deg, #7028e4 0%, #e5b2ca 100%);
}
</style>
