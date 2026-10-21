<template>
  <div class="pc" :class="{'pc--featured': featured}">
    <div class="pc__badge-row">
      <span v-if="badge" class="pc__badge" :class="badgeClass">{{ badge }}</span>
    </div>

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
          <q-tooltip class="bg-primary" :offset="[10, 10]">
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
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  border-radius: 18px;
  background: var(--backend-surface);
  border: 1px solid var(--backend-border);
  color: var(--backend-text);
}

.pc--featured { border-color: var(--backend-accent-border); }
.pc__badge-row { min-height: 32px; margin-bottom: 12px; }
.pc__badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 20px;
  font-weight: 600;
  background: var(--backend-tint);
  border: 1px solid var(--backend-accent-border);
  color: var(--q-primary);
}

.pc__header { min-height: 136px; }
.pc__title {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.03em;
}

.pc__desc { margin: 12px 0 0; font-size: 14px; line-height: 1.6; color: var(--backend-muted); }
.pc__price-block { margin-top: 24px; }
.pc__price-line { display: flex; align-items: flex-start; gap: 4px; }
.pc__currency { margin-top: 6px; font-size: 24px; line-height: 1; }
.pc__amount { font-size: 44px; line-height: 1; font-weight: 600; letter-spacing: -0.04em; }
.pc__suffix { margin-top: 16px; font-size: 18px; font-weight: 600; }
.pc__interval { margin-top: 8px; font-size: 14px; color: var(--backend-muted); }
.pc__funding-row { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
.pc__funding-label { font-size: 14px; color: var(--backend-muted); }
.pc__control { margin-top: 24px; }
.pc__select :deep(.q-field__control) { min-height: 46px; border-radius: 10px; background: var(--backend-page); }
.pc__select :deep(.q-field__native), .pc__select :deep(.q-field__input) { color: var(--backend-text); font-size: 14px; }
.pc__select :deep(.q-field__marginal) { color: var(--backend-muted); }
.pc__select--stacked { margin-top: 12px; }

.pc__cta {
  margin-top: 16px;
  min-height: 46px;
  border-radius: 10px;
  border: 1px solid var(--backend-accent-border);
  background: var(--backend-tint);
  color: var(--q-primary);
  font-size: 14px;
  font-weight: 600;
}

.pc__features {
  list-style: none;
  padding: 24px 0 0;
  margin: 24px 0 0;
  border-top: 1px solid var(--backend-border);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pc__features li { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; line-height: 1.5; }
.pc__feature-copy { display: flex; flex-direction: column; min-width: 0; }
.pc__feature-hint { margin-top: 4px; font-size: 13px; line-height: 1.5; color: var(--backend-muted); white-space: pre-line; }
.pc__check { margin-top: 3px; color: var(--q-primary); }
.pc__funding-tooltip { max-width: 320px; white-space: normal; line-height: 1.45; }

@media (max-width: 599px) {
  .pc { padding: 20px; border-radius: 14px; }
  .pc__header { min-height: auto; }
  .pc__badge-row:empty { display: none; }
}
</style>
