const {expect, test} = require('@playwright/test')

const getInstanceTypeLabels = payload => {
  const images = Array.isArray(payload?.instance_types?.images)
    ? payload.instance_types.images
    : Array.isArray(payload?.images)
      ? payload.images
      : []

  return images.map(image => image.label).filter(Boolean)
}

const instanceTypesPayload = {
  instance_types: {
    images: [
      {
        tag: 'lnbits-spark',
        label: 'LNbits with Spark L2',
        description: 'Hosted Spark funding',
        sidecar_tag: 'spark'
      },
      {
        tag: 'lnbits-lndhub',
        label: 'LNbits with LndHub',
        description: 'Hosted LndHub funding',
        sidecar_tag: 'lndhub'
      },
      {
        tag: 'lnbits-own-funding',
        label: 'LNbits with your own funding',
        description: 'Bring your own funding source'
      }
    ]
  }
}

const pricingPayload = {
  premium: {
    label: 'Premium - most popular',
    storage: '13Gi',
    users: 10,
    extensions: 10,
    custom_subdomain: false,
    custom_domain: false,
    hourly: 42,
    weekly: {price: 5},
    monthly: {price: 15},
    yearly: {price: 150}
  }
}

test('renders pricing plans from the dev pricing API', async ({page}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('apiEnv', 'dev')
  })

  const pricingResponse = page.waitForResponse(
    response =>
      response.url().includes('https://api.dev.lnbits.com/pricing') &&
      response.status() === 200
  )

  await page.goto('/pricing')
  await pricingResponse

  const pricingCards = page.locator('.pc')

  await expect(pricingCards).toHaveCount(4)
  await expect(page.getByRole('heading', {name: 'Personal'})).toBeVisible()
  await expect(page.getByRole('heading', {name: 'Premium'})).toBeVisible()
  await expect(page.getByRole('heading', {name: 'Business'})).toBeVisible()
  await expect(page.getByRole('heading', {name: 'Enterprise'})).toBeVisible()
  await expect(page.locator('.pc__badge').filter({hasText: 'Most Popular'})).toBeVisible()
  await expect(page.locator('.p-plans__grid')).toContainText('Monthly')
  await expect(page.locator('.p-plans__grid')).toContainText('$10')

  await page.locator('.pc').first().locator('.pc__select').first().click()
  await expect(page.locator('.q-menu .q-item')).toHaveText([
    /Hourly/,
    /Weekly/,
    /Monthly/,
    /Yearly/
  ])
  await page.keyboard.press('Escape')
})

test('shows every instance type returned by the API in the pricing cards', async ({page}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('apiEnv', 'dev')
    window.localStorage.setItem('email', 'pricing-test@example.com')
  })

  await page.route('https://api.dev.lnbits.com/instance/types', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(instanceTypesPayload)
    })
  )

  const instanceTypesResponse = page.waitForResponse(
    response =>
      response.url() === 'https://api.dev.lnbits.com/instance/types' &&
      response.status() === 200
  )

  await page.goto('/pricing')

  const responseJson = await (await instanceTypesResponse).json()
  const expectedLabels = getInstanceTypeLabels(responseJson)

  await expect(page.locator('.pc')).toHaveCount(4)
  const instanceTypeSelect = page.locator('.pc').first().locator('.pc__select--stacked')

  await expect(instanceTypeSelect).toContainText(expectedLabels[0])
  await instanceTypeSelect.click()
  await expect(page.locator('.q-menu .q-item')).toHaveCount(expectedLabels.length)

  const optionLabels = await page.locator('.q-menu .q-item').evaluateAll(items =>
    items.map(item => item.textContent.trim()).filter(Boolean)
  )

  expect(optionLabels).toEqual(expectedLabels)
})

test('shows every instance type returned by the API in the create instance funding select', async ({page}) => {
  let createInstanceRequestBody = null

  await page.addInitScript(() => {
    window.localStorage.setItem('apiEnv', 'dev')
    window.localStorage.setItem('email', 'pricing-test@example.com')
  })

  await page.route('https://api.dev.lnbits.com/pricing', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(pricingPayload)
    })
  )
  await page.route('https://api.dev.lnbits.com/instance', route =>
    route.request().method() === 'POST'
      ? (() => {
          createInstanceRequestBody = route.request().postDataJSON()
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'instance-1',
              domain: 'instance-1.example.com',
              is_enabled: true,
              is_active: true,
              timestamp: 1700000000,
              timestamp_start: 1700000000,
              timestamp_stop: 1700086400,
              installtoken: 'install-token',
              lnurl: ''
            })
          })
        })()
      : route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        })
  )
  await page.route('https://api.dev.lnbits.com/', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({timestamp: Math.floor(Date.now() / 1000)})
    })
  )
  await page.route('https://api.dev.lnbits.com/instance/types', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(instanceTypesPayload)
    })
  )
  await page.route('https://api.dev.lnbits.com/instance/subscribe', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        payment_request: 'lnbc1test',
        payment_hash: 'payment-hash'
      })
    })
  )

  const instanceTypesResponse = page.waitForResponse(
    response =>
      response.url() === 'https://api.dev.lnbits.com/instance/types' &&
      response.status() === 200
  )

  await page.goto('/instances?tier=premium&billing=monthly&funding=spark_l2')

  const responseJson = await (await instanceTypesResponse).json()
  const expectedLabels = getInstanceTypeLabels(responseJson)
  const fundingSelect = page.getByTestId('instance-funding-select')

  await expect(fundingSelect).toContainText(expectedLabels[0])
  await fundingSelect.click()
  await expect(page.locator('.q-menu .q-item')).toHaveCount(expectedLabels.length)

  const optionLabels = await page.locator('.q-menu .q-item').evaluateAll(items =>
    items.map(item => item.textContent.trim()).filter(Boolean)
  )

  expect(optionLabels).toEqual(expectedLabels)
  await page.keyboard.press('Escape')

  await page.getByRole('button', {name: 'Payment'}).click()
  await expect.poll(() => createInstanceRequestBody).toMatchObject({
    instance_type: 'lnbits-spark',
    payment_plan_tier: 'premium',
    payment_plan_interval: 'monthly'
  })
})
