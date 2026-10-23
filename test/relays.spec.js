const {expect, test} = require('@playwright/test')

const pricing = {
  premium: {
    label: 'Premium',
    hourly: 42,
    weekly: {price: 5},
    monthly: {price: 15},
    yearly: {price: 150}
  }
}

const instance = (id, type) => ({
  id,
  instance_type: type,
  domain: `${id}.example.com`,
  relay_url: undefined,
  payment_plan_tier: type === 'lnbits' ? 'premium' : 'relay',
  payment_plan_interval: 'monthly',
  timestamp: 1700000000,
  timestamp_start: 1700000000,
  timestamp_stop: 1900000000,
  is_enabled: true,
  is_active: true,
  lnurl: 'lnurl1test'
})

async function setup(page, {dark = true, failCheckout = false} = {}) {
  const requests = []
  const instances = [
    instance('wallet-1', 'lnbits'),
    instance('nostr-1', 'nostr_strfry'),
    instance('iroh-1', 'iroh_relay')
  ]
  await page.addInitScript(dark => {
    localStorage.setItem('apiEnv', 'dev')
    localStorage.setItem('email', 'relay-test@example.com')
    localStorage.setItem('darkMode', String(dark))
  }, dark)
  await page.route('https://support.lnbits.com/**', route =>
    route.fulfill({status: 204})
  )
  await page.route('https://api.dev.lnbits.com/**', route => {
    const path = new URL(route.request().url()).pathname
    const method = route.request().method()
    const body = route.request().postDataJSON()
    if (method !== 'GET') requests.push({path, body})
    let data
    if (path === '/pricing') data = new URL(route.request().url()).searchParams.has('instance_type') ? {relay: {label: 'Relay', currency: 'USD', hourly: 60, weekly: {price: 5.71}, monthly: {price: 20}, yearly: {price: 200}}} : pricing
    else if (path === '/') data = {timestamp: 1800000000}
    else if (path === '/user/preferences') data = {chat_id: null}
    else if (path === '/instance/types') {
      data = [
        {tag: 'lnbits', label: 'LNbits'},
        {tag: 'nostr_strfry', label: 'Nostr'},
        {tag: 'iroh_relay', label: 'Iroh'}
      ]
    } else if (path === '/instance' && method === 'POST') {
      data = instance('new-relay', body.instance_type)
      instances.push(data)
    } else if (path === '/instance') data = instances
    else if (path === '/instance/subscribe') {
      data = {checkout_session_url: 'https://checkout.example.com/session'}
    } else if (path === '/instance/hourly') data = {lnurl: 'lnurl1test'}
    else if (path === '/instance/buy') {
      if (failCheckout)
        return route.fulfill({status: 503, json: {detail: 'Try again'}})
      data =
        body.payment_method === 'onchain'
          ? {bitcoin_uri: 'bitcoin:bc1qexample?amount=0.0002'}
          : {payment_request: 'lnbc1test'}
    } else data = []
    return route.fulfill({status: 200, json: data})
  })
  return requests
}

async function selectBilling(page, label) {
  await page.getByTestId('instance-billing-select').click()
  await page.getByRole('option').filter({hasText: label}).click()
}

test('separates relay and LNbits lists and changes the theme on navigation', async ({
  page
}) => {
  await setup(page)
  await page.goto('/relays')
  await expect(page.locator('tbody')).toContainText('wss://nostr-1.example.com')
  await expect(page.locator('tbody')).toContainText('iroh-1.example.com')
  await expect(page.locator('tbody')).not.toContainText('wallet-1')
  await expect(page.locator('body')).toHaveClass(/relay-theme/)
  await expect(
    page.getByRole('button', {name: 'Copy relay address'})
  ).toHaveCount(2)
  await page.screenshot({
    path: '/tmp/relays-desktop.png',
    animations: 'disabled'
  })
  await page.getByRole('link', {name: 'LNbits Instances', exact: true}).click()
  await expect(page.locator('tbody')).toContainText('wallet-1.example.com')
  await expect(page.locator('tbody')).not.toContainText('nostr-1')
  await expect(page.locator('body')).not.toHaveClass(/relay-theme/)
  await page.getByRole('button', {name: 'New Instance', exact: true}).click()
  await page.getByTestId('instance-funding-select').click()
  await expect(page.getByRole('option')).toHaveText(['LNbits'])
})

test('prices both relay types independently of LNbits tiers', async ({
  page
}) => {
  await setup(page)
  await page.goto('/relays')
  await page.getByRole('button', {name: 'New Relay', exact: true}).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Nostr · $20 / month')
  await expect(page.getByTestId('instance-tier-select')).toHaveCount(0)
  await page.getByTestId('instance-funding-select').click()
  await page.getByRole('option').filter({hasText: 'Iroh'}).click()
  await expect(dialog).toContainText('Iroh · $20 / month')
  await page.getByTestId('instance-billing-select').click()
  await expect(page.getByRole('option')).toHaveText([
    'Hourly · 60 sats',
    'Weekly · $5.71',
    'Monthly · $20',
    'Yearly · $200'
  ])
  await page.keyboard.press('Escape')
  await selectBilling(page, 'Hourly')
  await expect(dialog).toContainText('60 sats / hour')
  await expect(page.getByRole('radio', {name: 'USD', exact: true})).toHaveCount(
    0
  )
  await expect(dialog).toContainText('prepaid Lightning balance')
})

for (const relayType of ['Nostr', 'Iroh']) {
  test(`creates a ${relayType} relay with the existing USD subscription checkout`, async ({
    page
  }) => {
    const requests = await setup(page)
    await page.goto('/relays')
    await page.getByRole('button', {name: 'New Relay', exact: true}).click()
    await page.getByTestId('instance-funding-select').click()
    await page.getByRole('option').filter({hasText: relayType}).click()
    await page.getByRole('button', {name: 'Pay with USD'}).click()
    await expect(
      page.getByRole('link', {name: 'Open Checkout Page'})
    ).toHaveAttribute('href', 'https://checkout.example.com/session')
    expect(requests).toEqual([
      {
        path: '/instance',
        body: {
          instance_type: relayType === 'Nostr' ? 'nostr_strfry' : 'iroh_relay',
          payment_plan_tier: 'relay',
          payment_plan_interval: 'monthly'
        }
      },
      {
        path: '/instance/subscribe',
        body: {
          instance_id: 'new-relay',
          payment_plan_name: 'monthly'
        }
      }
    ])
  })
}

for (const payment of ['Lightning', 'On-chain']) {
  test(`extends a relay with ${payment} without creating another instance`, async ({
    page
  }) => {
    const requests = await setup(page)
    await page.goto('/relays')
    await page.getByTestId('extend-instance-nostr-1').click()
    await selectBilling(page, 'Yearly')
    await page
      .getByRole('radio', {name: `Bitcoin · ${payment}`, exact: true})
      .click()
    await page.getByRole('button', {name: 'Extend Relay', exact: true}).click()
    await expect(page.getByTestId('payment-dialog')).toContainText(
      payment === 'On-chain'
        ? 'Bitcoin wallet to pay on-chain'
        : 'Lightning wallet'
    )
    await expect(
      page.getByTestId('payment-dialog').locator('svg')
    ).toBeVisible()
    expect(requests).toEqual([
      {
        path: '/instance/buy',
        body: {
          instance_id: 'nostr-1',
          payment_plan_name: 'yearly',
          quantity: 1,
          is_fiat: false,
          ...(payment === 'On-chain' ? {payment_method: 'onchain'} : {})
        }
      }
    ])
  })
}

test('supports one-time USD payments and retries checkout without duplicate creation', async ({
  page
}) => {
  const requests = await setup(page, {failCheckout: true})
  await page.goto('/relays')
  await page.getByRole('button', {name: 'New Relay', exact: true}).click()
  await page
    .getByRole('switch', {name: 'Automatically renew subscription'})
    .click()
  await page.getByRole('button', {name: 'Pay with USD'}).click()
  await expect(page.getByText('Failed to create one time plan')).toBeVisible()
  await page.getByRole('button', {name: 'Extend Relay', exact: true}).click()
  await expect
    .poll(() => requests.filter(item => item.path === '/instance/buy').length)
    .toBe(2)
  expect(requests.filter(item => item.path === '/instance')).toHaveLength(1)
  expect(
    requests.find(item => item.path === '/instance/buy').body
  ).toMatchObject({is_fiat: true})
})

test('uses the existing hourly Lightning balance without a subscription', async ({
  page
}) => {
  const requests = await setup(page)
  await page.goto('/relays')
  await page.getByRole('button', {name: 'New Relay', exact: true}).click()
  await selectBilling(page, 'Hourly')
  await page.getByRole('button', {name: 'Pay with bitcoin'}).click()
  await expect(page.getByTestId('payment-dialog')).toContainText(
    'Lightning wallet'
  )
  expect(requests).toHaveLength(2)
  expect(requests[0].body.payment_plan_interval).toBe('hourly')
  expect(requests[1]).toEqual({path: '/instance/hourly', body: {instance_id: 'new-relay'}})
})

test('keeps the $20 monthly relay price when pricing cannot be loaded', async ({
  page
}) => {
  await setup(page)
  await page.route('https://api.dev.lnbits.com/pricing?**', route =>
    route.fulfill({status: 503, json: {detail: 'Unavailable'}})
  )
  await page.goto('/relays')
  await page.getByRole('button', {name: 'New Relay', exact: true}).click()
  await expect(page.getByRole('dialog')).toContainText('Nostr · $20 / month')
  await selectBilling(page, 'Yearly')
  await expect(page.getByRole('dialog')).toContainText('$200.00 / year')
})

test('does not show a Lightning invoice when on-chain checkout is unavailable', async ({
  page
}) => {
  await setup(page)
  await page.route('https://api.dev.lnbits.com/instance/buy', route =>
    route.fulfill({json: {payment_request: 'lnbc1test'}})
  )
  await page.goto('/relays')
  await page.getByTestId('extend-instance-nostr-1').click()
  await page
    .getByRole('radio', {name: 'Bitcoin · On-chain', exact: true})
    .click()
  await page.getByRole('button', {name: 'Extend Relay', exact: true}).click()
  await expect(page.getByText('Failed to create one time plan')).toBeVisible()
  await expect(page.getByTestId('payment-dialog')).toHaveCount(0)
})

for (const dark of [true, false]) {
  test(`relay dialog fits mobile in ${dark ? 'dark' : 'light'} mode`, async ({
    page
  }) => {
    await page.setViewportSize({width: 390, height: 844})
    await setup(page, {dark})
    await page.goto('/relays')
    await page.getByRole('button', {name: 'New Relay', exact: true}).click()
    await expect(page.getByRole('dialog')).toContainText('Create New Relay')
    const card = page.getByRole('dialog').locator('.q-card').first()
    const box = await card.boundingBox()
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(390)
    expect(await card.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(
      true
    )
    await expect(
      page.getByRole('button', {name: 'Pay with USD'})
    ).toBeInViewport()
    await expect(page.locator('.q-transition--scale-enter-active')).toHaveCount(
      0
    )
    await page.screenshot({
      path: `/tmp/relay-dialog-${dark ? 'dark' : 'light'}.png`
    })
  })
}

test('offers only relay products advertised by the API', async ({page}) => {
  await setup(page)
  await page.route('https://api.dev.lnbits.com/instance/types', route =>
    route.fulfill({json: [
      {tag: 'lnbits', label: 'LNbits'},
      {tag: 'iroh_relay', label: 'Iroh'}
    ]})
  )
  await page.goto('/relays')
  await page.getByRole('button', {name: 'New Relay', exact: true}).click()
  await page.getByTestId('instance-funding-select').click()
  await expect(page.getByRole('option')).toHaveText(['Iroh'])
})

test('extends a monthly relay through the hourly Lightning link', async ({page}) => {
  const requests = await setup(page)
  await page.goto('/relays')
  await page.getByTestId('extend-instance-nostr-1').click()
  await selectBilling(page, 'Hourly')
  await page.getByRole('button', {name: 'Extend Relay', exact: true}).click()
  await expect(page.getByTestId('payment-dialog')).toContainText('Lightning wallet')
  expect(requests).toEqual([
    {path: '/instance/hourly', body: {instance_id: 'nostr-1'}}
  ])
})
