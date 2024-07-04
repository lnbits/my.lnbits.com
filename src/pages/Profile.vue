<template>
  <q-page class="q-pa-sm container">
    <div class="q-gutter-md">
      <q-breadcrumbs class="text-grey-4 q-mb-lg" active-color="secondary">
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el
          label="Indentities"
          icon="alternate_email"
          to="/identities"
        />
        <q-breadcrumbs-el :label="profile" />
      </q-breadcrumbs>
    </div>
    <q-card class="nostr-card text-white no-shadow" bordered>
      <q-card-section class="text-h6">
        <div class="text-h6">Edit Profile</div>
        <div class="text-subtitle2">Complete your Nostr profile</div>
      </q-card-section>
      <q-card-section class="q-pa-sm">
        <q-list dark class="row">
          <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <q-item-section side>
              <q-avatar size="100px">
                <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ profile }}</q-item-label>
              <q-item-label caption>npub.......</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                label="Add Photo"
                class="text-capitalize"
                rounded
                color="secondary"
                text-color="primary"
                style="max-width: 120px"
              ></q-btn>
            </q-item-section>
          </q-item>

          <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input dark v-model="user_details.name" label="Name" />
            </q-item-section>
          </q-item>
          <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input dark v-model="user_details.website" label="Website" />
            </q-item-section>
          </q-item>
          <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input
                dark
                type="textarea"
                v-model="user_details.bio"
                label="Bio"
              />
            </q-item-section>
          </q-item>
          <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input
                dark
                filled
                v-model="addRelayValue"
                @keydown.enter="addRelayFn"
                type="text"
                label="wss://relay....."
                hint="Add a relay"
              >
                <q-btn @click="addRelayFn" dense flat icon="add"></q-btn>
              </q-input>
              <div class="q-mt-md">
                <q-chip
                  v-for="relay in user_details.relays"
                  :key="relay"
                  removable
                  @remove="removeRelayFn(relay)"
                  color="primary"
                  text-color="white"
                >
                  <span v-text="relay"></span>
                </q-chip>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right" class="q-ma-md">
        <q-btn
          rounded
          class="text-capitalize"
          color="secondary"
          text-color="primary"
          label="Update User Info"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";

defineProps({
  profile: String,
});

const user_details = ref({});
const addRelayValue = ref("");

const addRelayFn = () => {
  if (!addRelayValue.value) return;
  if (user_details.value.relays.includes(addRelayValue.value)) return;
  user_details.value.relays.push(addRelayValue.value);
  addRelayValue.value = "";
};

const removeRelayFn = (relay) => {
  user_details.value.relays = user_details.value.relays.filter(
    (r) => r !== relay
  );
};

onMounted(() => {
  user_details.value = {
    name: "John Doe",
    website: "https://www.johndoe.com",
    bio: "I am a software developer",
    relays: [],
  };
});
</script>
