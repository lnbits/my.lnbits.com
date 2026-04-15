import {saas} from 'src/boot/saas'

const BILLING_ORDER = ['hourly', 'daily', 'weekly', 'monthly', 'yearly']
const PLAN_META_KEYS = [
  'badge',
  'badge_tone',
  'button_label',
  'custom_domain',
  'custom_subdomain',
  'default_billing',
  'description',
  'extensions',
  'featured',
  'features',
  'label',
  'storage',
  'title',
  'users'
]

const normalizePricingRoot = payload => {
  if (payload?.saas) {
    return payload.saas
  }

  if (payload?.data?.saas) {
    return payload.data.saas
  }

  if (payload?.data?.payment_plans) {
    return payload.data
  }

  if (
    payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    !payload.payment_plans &&
    Object.values(payload).every(
      tier =>
        tier &&
        typeof tier === 'object' &&
        !Array.isArray(tier) &&
        ('hourly' in tier ||
          'weekly' in tier ||
          'monthly' in tier ||
          'yearly' in tier ||
          'daily' in tier)
    )
  ) {
    return {payment_plans: payload}
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

const formatLabel = value => {
  if (typeof value !== 'string') {
    return ''
  }

  return value
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

const getCurrencySymbol = currency => {
  switch (currency) {
    case 'EUR':
      return '€'
    case 'GBP':
      return '£'
    case 'USD':
    default:
      return '$'
  }
}

const formatStorageLabel = storage => {
  if (typeof storage !== 'string') {
    return '0 GB storage'
  }

  return `${storage.replace(/g$/i, ' GB')} storage`
}

const formatQuotaLabel = (value, noun) => {
  const count = Number(value)
  const displayCount = count === 0 ? 'Unlimited' : normalizeDisplayAmount(count)

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

const normalizeFeature = (feature, index) => {
  if (typeof feature === 'string') {
    return {key: `${index}-${feature}`, label: feature, hint: ''}
  }

  if (!feature || typeof feature !== 'object') {
    return null
  }

  const label = feature.label || feature.name || feature.title || ''

  if (!label) {
    return null
  }

  return {
    key: feature.key || `${index}-${label}`,
    label,
    hint: feature.hint || feature.description || ''
  }
}

const buildFeatureList = tier => {
  if (Array.isArray(tier?.features)) {
    return tier.features.map(normalizeFeature).filter(Boolean)
  }

  const features = []

  if (tier?.users != null) {
    features.push({
      key: 'users',
      label: formatQuotaLabel(tier.users, 'user'),
      hint: ''
    })
  }

  if (tier?.extensions != null) {
    features.push({
      key: 'extensions',
      label: formatQuotaLabel(tier.extensions, 'extension'),
      hint: ''
    })
  }

  if (tier?.storage != null) {
    features.push({
      key: 'storage',
      label: formatStorageLabel(tier.storage),
      hint: ''
    })
  }

  if (tier?.custom_domain != null || tier?.custom_subdomain != null) {
    features.push(getDomainFeature(tier))
  }

  return features
}

const buildBillingOption = (billingKey, value, fiatCurrency) => {
  const label = formatLabel(billingKey)

  if (billingKey === 'hourly') {
    const amount = normalizeDisplayAmount(value?.price ?? value?.amount ?? value)

    return {
      key: 'hourly',
      label,
      selectLabel: `${label} · ${amount} sats`,
      amount,
      currency: 'sats',
      interval: 'per hour'
    }
  }

  const currency = value?.currency || fiatCurrency || 'USD'
  const symbol = value?.symbol || getCurrencySymbol(currency)
  const amount = normalizeDisplayAmount(value?.price ?? value?.amount ?? value)

  return {
    key: billingKey,
    label,
    selectLabel: `${label} · ${symbol}${amount}`,
    amount,
    currency,
    symbol,
    interval: value?.interval || `per ${billingKey.replace(/ly$/, '')}`
  }
}

const parseTierLabel = (tierKey, tier) => {
  const rawLabel = typeof tier?.label === 'string' ? tier.label.trim() : ''

  if (rawLabel.length) {
    const [title, ...badgeParts] = rawLabel.split(/\s+-\s+/)

    return {
      title,
      badge: badgeParts.join(' - ')
    }
  }

  return {
    title: tier?.title || formatLabel(tierKey),
    badge: ''
  }
}

const getFallbackBadge = tierKey => {
  if (tierKey === 'premium') {
    return 'Most popular'
  }

  if (tierKey === 'business') {
    return 'Best value'
  }

  return ''
}

const getBillingKeys = tier =>
  Object.keys(tier || {})
    .filter(key => !PLAN_META_KEYS.includes(key))
    .filter(key => {
      const value = tier[key]

      if (value == null) {
        return false
      }

      return (
        BILLING_ORDER.includes(key) ||
        (typeof value === 'object' && (value.price != null || value.amount != null))
      )
    })
    .sort((a, b) => {
      const indexA = BILLING_ORDER.indexOf(a)
      const indexB = BILLING_ORDER.indexOf(b)

      if (indexA === -1 && indexB === -1) {
        return a.localeCompare(b)
      }

      if (indexA === -1) {
        return 1
      }

      if (indexB === -1) {
        return -1
      }

      return indexA - indexB
    })

const getDefaultBilling = (tier, billingOptions, saas) => {
  const preferred = tier?.default_billing || saas?.default_billing || 'monthly'

  if (billingOptions.some(option => option.key === preferred)) {
    return preferred
  }

  return billingOptions[0]?.key || ''
}

export const mapPricingResponseToPlans = payload => {
  const saas = normalizePricingRoot(payload)
  const paymentPlans = saas?.payment_plans || {}
  const paymentPlanEntries = Object.entries(paymentPlans)

  return paymentPlanEntries.map(([tierKey, tier]) => {
    const {title, badge: parsedBadge} = parseTierLabel(tierKey, tier)
    const badge = tier?.badge || parsedBadge || getFallbackBadge(tierKey)
    const billingOptions = getBillingKeys(tier).map(key =>
      buildBillingOption(key, tier[key], saas?.fiat_currency)
    )

    return {
      tierKey,
      title,
      description: tier?.description || '',
      buttonLabel: tier?.button_label || `Get ${title}`,
      defaultBilling: getDefaultBilling(tier, billingOptions, saas),
      badge: formatLabel(badge),
      badgeTone:
        tier?.badge_tone || (tierKey === 'business' ? 'accent' : 'default'),
      featured:
        tier?.featured === true ||
        (typeof badge === 'string' && badge.toLowerCase().includes('popular')),
      billingOptions,
      features: buildFeatureList(tier)
    }
  })
}

export const getPricingPlans = async () => {
  const response = await saas.getPricing()
  const payload = response?.data ?? response

  return mapPricingResponseToPlans(payload)
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
