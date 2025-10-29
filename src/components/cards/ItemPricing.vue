<template>
  <q-item tag="label">
    <q-item-section avatar top>
      <q-radio v-model="localPlan" :val="planValue" color="secondary" />
    </q-item-section>
    <q-item-section>
      <q-item-label class="text-capitalize">{{ planValue }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
      <div v-if="!subscription && activePlan" class="q-mt-md">
        <div>{{ sliderString }}</div>
        <q-slider
          v-model="localCount"
          :min="min"
          :max="max"
          :step="step"
          label
          marker-labels
          snap
          color="primary"
          switch-label-side
        />
      </div>
    </q-item-section>
    <q-item-section side top>
      <q-item-label v-if="!activePlan">
        {{
          new Intl.NumberFormat('en', {
            style: 'currency',
            currency: 'USD'
          }).format(price)
        }}
      </q-item-label>
      <q-item-label v-else>
        {{
          new Intl.NumberFormat('en', {
            style: 'currency',
            currency: 'USD'
          }).format(price * localCount)
        }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import {computed, ref, watch} from 'vue'
const props = defineProps({
  plan: String,
  count: Number,
  subscription: Boolean,
  planValue: {type: String, default: 'monthly'},
  caption: {type: String, default: '...'},
  price: {type: Number, default: 5.0},
  min: {type: Number, default: 1},
  max: {type: Number, default: 12},
  step: {type: Number, default: 1}
})
const emits = defineEmits(['update:plan', 'update:count'])

const localPlan = ref(props.plan)
const localCount = ref(props.count)
const activePlan = computed(() => props.plan === props.planValue)
const sliderString = computed(() => {
  switch (localPlan.value) {
    case 'weekly':
      return 'How many weeks:'
    case 'monthly':
      return 'How many months:'
    case 'yearly':
      return 'How many years:'
    default:
      return 'How many:'
  }
})

watch(
  () => props.plan,
  val => {
    localPlan.value = val
    // Reset count when switching plans
    localCount.value = props.min
    emits('update:count', localCount.value)
  }
)
watch(
  () => props.count,
  val => {
    localCount.value = val
  }
)

watch(localPlan, val => emits('update:plan', val))
watch(localCount, val => emits('update:count', val))
</script>
