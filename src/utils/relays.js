// Backend identifiers are shared by creation, filtering and connection addresses.
export const RELAY_TYPES = [
  {value: 'nostr_strfry', label: 'Nostr', fundingValue: 'nostr_strfry'},
  {value: 'iroh_relay', label: 'Iroh', fundingValue: 'iroh_relay'}
]

export const getRelayType = instance => {
  const type = instance?.instance_type || instance?.instanceType
  return RELAY_TYPES.find(option => option.value === type) || null
}

export const getServiceAddress = instance => {
  if (instance?.relay_url) return instance.relay_url
  const relay = getRelayType(instance)
  if (!relay) return instance?.domain || ''
  const scheme = relay.value === 'nostr_strfry' ? 'wss' : 'https'
  return instance?.domain ? `${scheme}://${instance.domain}` : ''
}

// Fixed relay rates are independent of LNbits tiers. The API enforces these
// prices; keep this fallback in sync for display when pricing is unavailable.
export const buildRelayPlans = plans => {
  const reference = plans.find(plan => plan.tierKey === 'relay')
  const fallback = [
    {key: 'hourly', amount: '60', currency: 'sats', interval: 'per hour'},
    {key: 'weekly', amount: '5.71', currency: 'USD', symbol: '$', interval: 'per week'},
    {key: 'monthly', amount: '20', currency: 'USD', symbol: '$', interval: 'per month'},
    {key: 'yearly', amount: '200.00', currency: 'USD', symbol: '$', interval: 'per year'}
  ]
  return [{
    tierKey: 'relay', title: 'Relay', badge: '', features: [],
    defaultBilling: 'monthly',
    billingOptions: fallback.map(option => {
      const supplied = reference?.billingOptions.find(item => item.key === option.key)
      return supplied ? {...option, ...supplied} : option
    })
  }]
}
