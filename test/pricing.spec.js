const {expect, test} = require('@playwright/test')

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
  await expect(page.locator('.pc__badge')).toContainText('Most Popular')
  await expect(page.locator('.p-plans__grid')).toContainText('Monthly')
  await expect(page.locator('.p-plans__grid')).toContainText('$10')
})
