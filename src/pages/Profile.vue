<template>
  <q-page class="q-pa-sm"> </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { useAppStore } from "src/stores/store";
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { saas } from "boot/saas";

const $q = useQuasar();
const $store = useAppStore();
const $router = useRouter();

const handle = ref("");

const getAddresses = async () => {
  try {
    const response = await saas.getUsrAddresses();
    console.log("UI response", response);
  } catch (error) {
    console.error("error", error);
  }
};

onMounted(async () => {
  if ($router.query?.buy) {
    console.log("handle", $store.handle);
  }
  await getAddresses();
});
</script>

<style lang="scss"></style>
