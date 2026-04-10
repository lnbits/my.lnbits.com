const PRICING_DESCRIPTIONS = {
  personal:
    'Create your own LNbits instance for personal projects and small experiments.',
  premium:
    'A stronger tier for growing teams that need more users, more extensions, and more room.',
  business:
    'Designed for production deployments that need more capacity and room to grow.',
  enterprise:
    'For large LNbits rollouts that need broad access, higher limits, and maximum headroom.'
}

const BADGE_BY_TIER = {
  premium: {badge: 'Most popular', badgeTone: 'default', featured: true},
  business: {badge: 'Best value', badgeTone: 'accent', featured: false}
}

const BILLING_ORDER = ['hourly', 'weekly', 'monthly', 'yearly']

const normalizePricingRoot = payload => {
  if (payload?.saas) {
    return payload.saas
  }

  return payload || {}
}

const normalizeDisplayAmount = amount => {
  const value = Number(amount)

  if (!Number.isFinite(value)) {
    return String(amount ?? '')
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

const formatStorageLabel = storage => {
  if (typeof storage !== 'string') {
    return '0 GB storage'
  }

  return `${storage.replace(/g$/i, ' GB')} storage`
}

const formatQuotaLabel = (value, noun) => {
  const count = Number(value)
  const displayCount = count === 0 ? 'Infinite' : normalizeDisplayAmount(count)

  return `${displayCount} ${noun} slots`
}

const getDomainFeature = tier => {
  if (tier?.custom_domain) {
    return {
      key: 'domain',
      label: 'Custom domain/subdomain',
      hint: 'Choose your own subdomain or point your own domain at LNbits.'
    }
  }

  if (tier?.custom_subdomain) {
    return {
      key: 'domain',
      label: 'Custom subdomain',
      hint: 'Choose your own subdomain'
    }
  }

  return {
    key: 'domain',
    label: 'Assigned subdomain',
    hint: 'Get an assigned subdomain'
  }
}

const buildFeatureList = tier => [
  {key: 'users', label: formatQuotaLabel(tier?.users, 'user'), hint: ''},
  {
    key: 'extensions',
    label: formatQuotaLabel(tier?.extensions, 'extension'),
    hint: ''
  },
  {key: 'storage', label: formatStorageLabel(tier?.storage), hint: ''},
  getDomainFeature(tier)
]

const buildBillingOption = (billingKey, value, fiatCurrency) => {
  const label = billingKey.charAt(0).toUpperCase() + billingKey.slice(1)

  if (billingKey === 'hourly') {
    const amount = normalizeDisplayAmount(value)

    return {
      key: 'hourly',
      label,
      selectLabel: `${label} · ${amount} sats`,
      amount,
      currency: 'sats',
      interval: 'per hour'
    }
  }

  const amount = normalizeDisplayAmount(value?.price)

  return {
    key: billingKey,
    label,
    selectLabel: `${label} · $${amount}`,
    amount,
    currency: fiatCurrency || 'USD',
    symbol: '$',
    interval: `per ${billingKey.slice(0, -2)}`
  }
}

const getTierLabel = (tierKey, tier) => {
  const rawLabel = typeof tier?.label === 'string' ? tier.label.trim() : ''

  if (rawLabel.length) {
    return rawLabel.split(/\s+-\s+/)[0]
  }

  return tierKey.charAt(0).toUpperCase() + tierKey.slice(1)
}

export const mapPricingResponseToPlans = payload => {
  const saas = normalizePricingRoot(payload)
  const paymentPlans = saas?.payment_plans || {}

  return Object.entries(paymentPlans).map(([tierKey, tier]) => {
    const title = getTierLabel(tierKey, tier)
    const badgeConfig = BADGE_BY_TIER[tierKey] || {}

    return {
      tierKey,
      title,
      description: PRICING_DESCRIPTIONS[tierKey] || '',
      buttonLabel: `Get ${title}`,
      defaultBilling: 'monthly',
      badge: badgeConfig.badge || '',
      badgeTone: badgeConfig.badgeTone || 'default',
      featured: badgeConfig.featured === true,
      billingOptions: BILLING_ORDER.filter(key => tier?.[key] != null).map(key =>
        buildBillingOption(key, tier[key], saas?.fiat_currency)
      ),
      features: buildFeatureList(tier)
    }
  })
}

const normalizeInstanceImages = payload => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.images)) {
    return payload.images
  }

  if (payload?.images && typeof payload.images === 'object') {
    return Object.values(payload.images)
  }

  if (Array.isArray(payload?.data?.images)) {
    return payload.data.images
  }

  if (payload?.data?.images && typeof payload.data.images === 'object') {
    return Object.values(payload.data.images)
  }

  if (Array.isArray(payload?.instance_types?.images)) {
    return payload.instance_types.images
  }

  if (
    payload?.instance_types?.images &&
    typeof payload.instance_types.images === 'object'
  ) {
    return Object.values(payload.instance_types.images)
  }

  return []
}

const mapFundingValue = image => {
  if (image?.id === 'lnbits_spark_latest') {
    return 'spark_l2'
  }

  if (image?.id === 'lnbits_latest') {
    return 'own_funding'
  }

  return image?.sidecar_tag ? 'spark_l2' : 'own_funding'
}

const getFundingLabel = image => {
  const rawLabel = typeof image?.label === 'string' ? image.label.trim() : ''
  return rawLabel
}

export const mapInstanceTypesToImageOptions = payload =>
  normalizeInstanceImages(payload)
    .map(image => {
      const tag = typeof image?.tag === 'string' ? image.tag.trim() : ''
      const label = getFundingLabel(image)

      if (!tag || !label) {
        return null
      }

      return {
        value: tag,
        label,
        description: image?.description || '',
        hasSidecarTag: Boolean(image?.sidecar_tag),
        fundingValue: mapFundingValue(image)
      }
    })
    .filter(Boolean)

export const mapInstanceTypesToFundingOptions = payload => {
  const seen = new Set()

  return normalizeInstanceImages(payload)
    .map(image => {
      const value = mapFundingValue(image)
      const label = getFundingLabel(image)
      const description =
        typeof image?.description === 'string' ? image.description.trim() : ''

      if (!value || !label || seen.has(value)) {
        return null
      }

      seen.add(value)

      return {value, label, description}
    })
    .filter(Boolean)
}
