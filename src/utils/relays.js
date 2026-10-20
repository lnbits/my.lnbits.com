// Relay instances share the instance lifecycle and payment endpoints.
// These type/tier keys are the frontend contract for the relay backend.
export const RELAY_TYPES = [
  {value: 'nostr', label: 'Nostr', fundingValue: 'nostr'},
  {value: 'iroh', label: 'Iroh', fundingValue: 'iroh'}
]

export const getRelayType = instance => {
  const type = instance?.instance_type || instance?.instanceType
  return RELAY_TYPES.find(option => option.value === type) || null
}

// Use the LNbits Premium interval ratios, including its annual discount and
// sats/hour rate. The legacy LNbits rates are the fallback when pricing is down.
export const buildRelayPlans = plans => {
  const reference =
    plans.find(plan => plan.tierKey === 'premium') ||
    plans.find(plan =>
      plan.billingOptions.some(option => option.key === 'monthly')
    )
  const monthly = reference?.billingOptions.find(
    option => option.key === 'monthly'
  )
  const ratio =
    Number(monthly?.amount) > 0 ? 20 / Number(monthly.amount) : 20 / 7
  const fallback = [
    {key: 'hourly', amount: 21, currency: 'sats', interval: 'per hour'},
    {
      key: 'weekly',
      amount: 2,
      currency: 'USD',
      symbol: '$',
      interval: 'per week'
    },
    {
      key: 'monthly',
      amount: 7,
      currency: 'USD',
      symbol: '$',
      interval: 'per month'
    },
    {
      key: 'yearly',
      amount: 70,
      currency: 'USD',
      symbol: '$',
      interval: 'per year'
    }
  ]
  const billingOptions = fallback.map(defaultOption => {
    const option = reference?.billingOptions.find(
      item => item.key === defaultOption.key
    )
    const amount = option
      ? Number(option.amount) * ratio
      : defaultOption.amount * (20 / 7)
    return {
      ...defaultOption,
      amount:
        defaultOption.key === 'monthly'
          ? '20'
          : defaultOption.key === 'hourly'
            ? String(Math.ceil(amount))
            : amount.toFixed(2)
    }
  })

  return [
    {
      tierKey: 'relay',
      title: 'Relay',
      badge: '',
      features: [],
      defaultBilling: 'monthly',
      billingOptions
    }
  ]
}
