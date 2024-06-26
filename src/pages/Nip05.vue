<template>
  <q-page class="q-pa-sm">
    <div class="hero">
      <div class="pitch text-center text-primary">
        <h1 class="text-h2 text-bold">Get your Nostr Handle</h1>
        <p class="text-h6">
          Simplifying Nostr keys into easy-to-read handles, like @username for
          social media.
        </p>
      </div>
      <q-input
        rounded
        v-model.trim="handle"
        class="input"
        label="Find and buy a nostr.com handle"
        label-color="blue-grey-4"
        suffix="@nostr.com"
      >
        <template v-slot:append>
          <q-btn unelevated color="secondary" label="Search" />
        </template>
      </q-input>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent } from "vue";

export default defineComponent({
  name: "Nip05",
  components: {
    // ActivityTable: defineAsyncComponent(() =>
    //   import("components/tables/ActivityTable.vue")
    // ),
  },
  data() {
    return {
      handle: "",
    };
  },
});
</script>

<style lang="scss">
.hero {
  // height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6.875rem 0 6.875rem;

  .pitch {
    width: 80%;
    margin-bottom: 4rem;
  }

  .input {
    width: 80%;
    max-width: 800px;
  }
}
</style>
