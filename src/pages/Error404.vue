<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div class="text-h2" style="opacity: 0.4">Page Not Found</div>
      <div>
        <q-avatar
          size="300px"
          class="absolute-center shadow-10"
          color="primary"
        >
          <img src="profile.svg" class="q-pa-sm" />
        </q-avatar>
      </div>
      <div style="font-size: 30vh">&nbsp;</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Go Home"
        no-caps
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "Error404",
});
</script>
