<template>
  <q-page class="q-pa-sm container">
    <div class="q-gutter-md">
      <q-breadcrumbs class="text-grey-4 q-mb-lg" active-color="secondary">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Indentities" to="/identities" />
        <q-breadcrumbs-el label="Account" />
      </q-breadcrumbs>
    </div>
    <q-card class="nostr-card text-white no-shadow" bordered>
      <q-card-section class="text-h6">
        <div class="text-h6">Account</div>
      </q-card-section>
      <q-card-section class="q-pa-sm q-mb-md">
        <q-list dark class="row">
          <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <q-item-section side>
              <q-avatar size="100px">
                <q-img
                  v-if="account.config && account.config.picture"
                  :src="account.config.picture"
                  spinner-color="secondary"
                  spinner-size="52px"
                  :ratio="1"
                />
                <NostrHeadIcon v-else color="secondary" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ account.username }}</q-item-label>
              <q-item-label caption class="ellipsis">{{
                account.id
              }}</q-item-label>
            </q-item-section>
            <!-- <q-item-section side>
              <q-btn
                label="Add Photo"
                class="text-capitalize"
                rounded
                color="secondary"
                text-color="primary"
                style="max-width: 120px"
              ></q-btn>
            </q-item-section> -->
          </q-item>
          <template v-if="editAccount">
            <q-item class="col-12">
              <q-item-section>
                <q-input
                  dark
                  v-model="editPassword.currentPassword"
                  :type="isPWD_1 ? 'password' : 'text'"
                  label="Current password"
                  autocomplete="off"
                  :rules="[
                    (val) =>
                      !val ||
                      val.length >= 8 ||
                      'Password must have at least 8 characters',
                  ]"
                  ><template v-slot:append>
                    <q-icon
                      :name="isPWD_1 ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPWD_1 = !isPWD_1"
                    /> </template
                ></q-input>
              </q-item-section>
            </q-item>
            <q-item class="col-12">
              <q-item-section>
                <q-input
                  dark
                  v-model="editPassword.newPassword"
                  label="New password"
                  :type="isPWD_2 ? 'password' : 'text'"
                  autocomplete="off"
                  :rules="[
                    (val) =>
                      !val ||
                      val.length >= 8 ||
                      'Password must have at least 8 characters',
                  ]"
                  lazy-rules
                  ><template v-slot:append>
                    <q-icon
                      :name="isPWD_2 ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPWD_2 = !isPWD_2"
                    /> </template
                ></q-input>
              </q-item-section>
            </q-item>
            <q-item class="col-12">
              <q-item-section>
                <q-input
                  dark
                  v-model="editPassword.confirmPassword"
                  label="Confirm password"
                  :type="isPWD_3 ? 'password' : 'text'"
                  autocomplete="off"
                  :rules="[
                    (val) =>
                      !val ||
                      val === editPassword.newPassword ||
                      'Passwords don\'t match',
                  ]"
                  ><template v-slot:append>
                    <q-icon
                      :name="isPWD_3 ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPWD_3 = !isPWD_3"
                    /> </template
                ></q-input>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-card-section>
      <q-card-actions align="right" class="q-ma-md">
        <q-btn
          v-if="editAccount"
          rounded
          class="text-capitalize q-mr-auto"
          color="secondary"
          text-color="primary"
          label="Cancel"
          @click="editAccount = false"
        />
        <q-btn
          rounded
          class="text-capitalize"
          color="secondary"
          text-color="primary"
          :label="editAccount ? 'Update Password' : 'Change Password'"
          :disable="
            (editAccount &&
              (!editPassword.newPassword || !editPassword.confirmPassword)) ||
            editPassword.newPassword !== editPassword.confirmPassword
          "
          @click="updateAccount"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { saas } from "boot/saas";
import NostrHeadIcon from "components/NostrHeadIcon.vue";
import { useQuasar } from "quasar";

const $q = useQuasar();

const account = ref({});
const editPassword = ref({});
const editAccount = ref(false);

const isPWD_1 = ref(true);
const isPWD_2 = ref(true);
const isPWD_3 = ref(true);

async function updateAccount() {
  if (!editAccount.value) {
    return (editAccount.value = true);
  }
  try {
    await saas.updateUserPassword({
      user_id: account.value.id,
      password: editPassword.value.newPassword,
      password_repeat: editPassword.value.confirmPassword,
      password_old: editPassword.value.currentPassword,
      username: account.value.username,
    });
    editAccount.value = false;
    editPassword.value = {};
    $q.notify({
      message: "Account updated successfully",
      color: "positive",
      position: "top",
    });
  } catch (error) {
    $q.notify({
      message: "Failed to update account",
      color: "negative",
      position: "top",
    });
    console.error(error);
  }
}

onMounted(async () => {
  const { data } = await saas.getAuthenticatedUser();
  account.value = { ...data };
});
</script>
