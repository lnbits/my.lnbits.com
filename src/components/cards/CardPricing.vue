<template>
  <div class="pc" :class="{'pc--featured': featured}">
    <div v-if="badge" class="pc__badge" :class="badgeClass">{{ badge }}</div>

    <div class="pc__header">
      <h3 class="pc__title">{{ title }}</h3>
      <p v-if="description" class="pc__desc">{{ description }}</p>
    </div>

    <div class="pc__price-block">
      <div class="pc__price-line">
        <template v-if="currentBilling.currency === 'sats'">
          <span class="pc__amount">{{ currentBilling.amount }}</span>
          <span class="pc__suffix">sats</span>
        </template>
        <template v-else>
          <span class="pc__currency">{{ currentBilling.symbol }}</span>
          <span class="pc__amount">{{ currentBilling.amount }}</span>
        </template>
      </div>
      <div class="pc__interval">{{ currentBilling.interval }}</div>
      <div
        v-if="selectedFundingDetails?.label"
        class="pc__funding-row"
      >
        <div class="pc__funding-label">{{ selectedFundingDetails.label }}</div>
        <q-btn
          v-if="selectedFundingDetails?.description"
          round
          dense
          flat
          icon="info"
          size="xs"
          color="grey-6"
        >
          <q-tooltip class="bg-indigo" :offset="[10, 10]">
            <div class="pc__funding-tooltip">
              {{ selectedFundingDetails.description }}
            </div>
          </q-tooltip>
        </q-btn>
      </div>
    </div>

    <div class="pc__control">
      <q-select
        v-model="selectedBillingKey"
        :options="billingSelectOptions"
        dense
        outlined
        emit-value
        map-options
        dropdown-icon="expand_more"
        options-dense
        class="pc__select"
      />
      <q-select
        v-if="loggedIn"
        v-model="selectedFundingOption"
        :options="fundingOptions"
        dense
        outlined
        emit-value
        map-options
        dropdown-icon="expand_more"
        options-dense
        class="pc__select pc__select--stacked"
      />
    </div>

    <q-btn
      :to="ctaTo"
      :label="ctaLabel"
      no-caps
      unelevated
      class="full-width pc__cta"
      :class="{'pc__cta--featured': featured}"
    />

    <ul class="pc__features">
      <li v-for="feature in normalizedFeatures" :key="feature.key">
        <q-icon name="check" size="14px" class="pc__check" />
        <div class="pc__feature-copy">
          <span>{{ feature.label }}</span>
          <span v-if="feature.hint" class="pc__feature-hint">{{ feature.hint }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import {computed, ref, watch} from 'vue'

const props = defineProps({
  tierKey: {type: String, default: ''},
  title: {type: String, default: 'Plan'},
  description: {type: String, default: ''},
  badge: {type: String, default: ''},
  badgeTone: {type: String, default: 'default'},
  buttonLabel: {type: String, default: 'Select Plan'},
  featured: {type: Boolean, default: false},
  loggedIn: {type: Boolean, default: false},
  billingOptions: {type: Array, default: () => []},
  fundingOptions: {type: Array, default: () => []},
  defaultBilling: {type: String, default: ''},
  features: {type: Array, default: () => []}
})

const selectedBillingKey = ref(
  props.defaultBilling || props.billingOptions[0]?.key || ''
)
const selectedFundingOption = ref(props.fundingOptions[0]?.value || '')

const billingSelectOptions = computed(() =>
  props.billingOptions.map(option => ({
    label: option.selectLabel || option.label,
    value: option.key
  }))
)

const currentBilling = computed(
  () =>
    props.billingOptions.find(option => option.key === selectedBillingKey.value) ||
    props.billingOptions[0] || {
      key: '',
      amount: '',
      interval: '',
      symbol: '$',
      currency: 'USD'
    }
)

const normalizedFeatures = computed(() =>
  props.features.map((feature, index) =>
    typeof feature === 'string'
      ? {key: `${index}-${feature}`, label: feature, hint: ''}
      : {
          key: feature.key || `${index}-${feature.label}`,
          label: feature.label || '',
          hint: feature.hint || ''
        }
  )
)

const selectedFundingDetails = computed(
  () =>
    props.fundingOptions.find(option => option.value === selectedFundingOption.value) ||
    null
)

const ctaTo = computed(() => {
  if (!props.loggedIn) {
    return '/'
  }

  return {
    path: '/instances',
    query: {
      tier: props.tierKey || undefined,
      billing: currentBilling.value.key || undefined,
      funding:
        selectedFundingDetails.value?.fundingValue ||
        selectedFundingOption.value ||
        undefined,
      image: selectedFundingOption.value || undefined
    }
  }
})

const ctaLabel = computed(() =>
  props.loggedIn ? props.buttonLabel : 'Register'
)

const badgeClass = computed(() => `pc__badge--${props.badgeTone}`)

watch(
  () => [props.billingOptions, props.defaultBilling],
  ([options, defaultBilling]) => {
    if (!options.some(option => option.key === selectedBillingKey.value)) {
      selectedBillingKey.value = defaultBilling || options[0]?.key || ''
    }
  },
  {immediate: true}
)

watch(
  () => props.fundingOptions,
  options => {
    if (!options.some(option => option.value === selectedFundingOption.value)) {
      selectedFundingOption.value = options[0]?.value || ''
    }
  },
  {immediate: true}
)
</script>

<style scoped>
.pc {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: visible;
  padding: 1.7rem 1.35rem 1.5rem;
  border-radius: 0;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(21, 30, 36, 0.12);
  color: #111827;
  box-shadow: 0 24px 54px rgba(5, 10, 18, 0.18);
  transition: box-shadow 220ms ease, border-color 220ms ease;
}

.pc:hover {
  box-shadow: 0 28px 68px rgba(5, 10, 18, 0.24);
  border-color: rgba(89, 74, 255, 0.25);
}

.pc--featured {
  border-color: rgba(129, 66, 255, 0.5);
  box-shadow: 0 30px 80px rgba(88, 40, 182, 0.28);
}

.pc__badge {
  position: absolute;
  left: -1px;
  right: -1px;
  top: -2.3rem;
  padding: 0.55rem 1rem;
  border-radius: 12px 12px 0 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-align: center;
  z-index: 1;
}

.pc__badge--default {
  background: #2b3036;
  color: #fff;
}

.pc__badge--accent {
  background: linear-gradient(135deg, #6d28d9, #7c3aed);
  color: #fff;
}

.pc__header {
  min-height: 8.2rem;
}

.pc__title {
  margin: 0;
  font-size: clamp(1.8rem, 2vw, 2.3rem);
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: #101828;
}

.pc__desc {
  margin: 0.95rem 0 0;
  font-size: 0.98rem;
  line-height: 1.45;
  color: #445164;
}

.pc__price-block {
  margin-top: 1.35rem;
}

.pc__price-line {
  display: flex;
  align-items: flex-start;
  gap: 0.18rem;
  color: #101828;
}

.pc__currency {
  margin-top: 0.38rem;
  font-size: 1.7rem;
  line-height: 1;
}

.pc__amount {
  font-size: 3.15rem;
  line-height: 0.92;
  font-weight: 500;
  letter-spacing: -0.05em;
}

.pc__suffix {
  margin-top: 0.75rem;
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.pc__interval {
  margin-top: 0.55rem;
  font-size: 0.98rem;
  color: #4b5563;
}

.pc__funding-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.3rem;
}

.pc__funding-label {
  font-size: 0.92rem;
  color: #4b5563;
}

.pc__control {
  margin-top: 1.6rem;
}

.pc__select :deep(.q-field__control) {
  min-height: 46px;
  border-radius: 0;
  background: #fff;
}

.pc__select :deep(.q-field__native),
.pc__select :deep(.q-field__input) {
  color: #101828;
  font-size: 0.98rem;
}

.pc__select :deep(.q-field__marginal) {
  color: #667085;
}

.pc__select--stacked {
  margin-top: 0.75rem;
}

.pc__cta {
  margin-top: 1.2rem;
  min-height: 48px;
  border-radius: 4px !important;
  background: #3040c8 !important;
  color: #fff !important;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.pc__cta--featured {
  background: linear-gradient(135deg, #6d28d9, #7c3aed) !important;
}

.pc__features {
  list-style: none;
  padding: 0;
  margin: 1.6rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  color: #344054;
}

.pc__features li {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  font-size: 0.95rem;
  line-height: 1.45;
}

.pc__feature-copy {
  display: flex;
  flex-direction: column;
}

.pc__feature-hint {
  margin-top: 0.08rem;
  font-size: 0.8rem;
  line-height: 1.35;
  color: #667085;
  white-space: pre-line;
}

.pc__check {
  margin-top: 0.18rem;
  color: #5b34f2;
}

.pc__funding-tooltip {
  max-width: 320px;
  white-space: normal;
  line-height: 1.45;
}

@media (max-width: 599px) {
  .pc {
    padding: 1.4rem 1.15rem 1.25rem;
  }

  .pc__badge {
    top: -2.15rem;
  }

  .pc__header {
    min-height: auto;
  }

  .pc__title {
    font-size: 2rem;
  }

  .pc__amount {
    font-size: 2.8rem;
  }
}
</style>
