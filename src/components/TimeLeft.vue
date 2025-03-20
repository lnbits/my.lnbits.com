<template>
  <div class="col-12 col-sm-4">
    <div class="text-h6 text-weight-regular">Time Left</div>
  </div>
  <div class="col-12 col-sm-8">
    <div class="row counter">
      <div class="q-pr-md">
        <h4 class="q-my-sm">
          <q-spinner-clock v-if="timeLoading" color="secondary" size="1em" />
          <span v-show="!timeLoading">{{ timeLeft.days }}</span>
        </h4>
        <p>Days</p>
      </div>
      <div class="q-px-md">
        <h4 class="q-my-sm">
          <q-spinner-clock v-if="timeLoading" color="secondary" size="1em" />
          <span v-show="!timeLoading">{{ timeLeft.hours }}</span>
        </h4>
        <p>Hours</p>
      </div>
      <div class="q-px-md">
        <h4 class="q-my-sm">
          <q-spinner-clock v-if="timeLoading" color="secondary" size="1em" />
          <span v-show="!timeLoading">{{ timeLeft.minutes }}</span>
        </h4>
        <p>Min.</p>
      </div>
      <div class="q-pl-md">
        <h4 class="q-my-sm">
          <q-spinner-clock v-if="timeLoading" color="secondary" size="1em" />
          <span v-show="!timeLoading">{{ timeLeft.seconds }}</span>
        </h4>
        <p>Sec.</p>
      </div>
    </div>
    <div class="counter">
      <p>{{ expiresOn }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  timeLeft: {
    type: Object,
    required: true
  },
  timeLoading: {
    type: Boolean,
    required: true
  },
  expiresOn: {
    type: String,
    required: true
  }
})
</script>
