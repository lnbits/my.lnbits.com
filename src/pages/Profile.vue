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
    <q-card class="card-bg text-white no-shadow" bordered>
      <q-card-section class="text-h6">
        <div class="text-h6">Edit Profile</div>
        <div class="text-subtitle2">Complete your profile</div>
      </q-card-section>
      <q-card-section class="q-pa-sm">
        <q-list class="row">
          <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <q-item-section side>
              <q-avatar size="100px">
                <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-btn
                label="Add Photo"
                class="text-capitalize"
                rounded
                color="info"
                style="max-width: 120px"
              ></q-btn>
            </q-item-section>
          </q-item>

          <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input
                dense
                v-model="user_details.user_name"
                label="User Name"
              />
            </q-item-section>
          </q-item>
          <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input
                dense
                v-model="user_details.email"
                label="Email Address"
              />
            </q-item-section>
          </q-item>
          <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input
                dense
                v-model="user_details.first_name"
                label="First Name"
              />
            </q-item-section>
          </q-item>
          <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input
                dense
                v-model="user_details.last_name"
                label="Last Name"
              />
            </q-item-section>
          </q-item>
          <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input
                autogrow
                dense
                v-model="user_details.address"
                label="Address"
              />
            </q-item-section>
          </q-item>
          <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input dense v-model="user_details.city" label="City" />
            </q-item-section>
          </q-item>
          <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input
                dense
                v-model="user_details.post_code"
                label="Postal Code"
              />
            </q-item-section>
          </q-item>
          <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <q-item-section>
              <q-input
                type="textarea"
                dense
                v-model="user_details.about"
                label="About"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn class="text-capitalize bg-info text-white"
          >Update User Info</q-btn
        >
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from "vue";

defineProps(["profile"]);

const user_details = ref({});
</script>
