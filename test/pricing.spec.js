const {expect, test} = require('@playwright/test')

const getInstanceTypeLabels = payload => {
  const images = Array.isArray(payload?.instance_types?.images)
    ? payload.instance_types.images
    : Array.isArray(payload?.images)
      ? payload.images
      : []

  return images.map(image => image.label).filter(Boolean)
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
