const {expect, test} = require('@playwright/test')

const pricing = Object.fromEntries(
  ['Personal', 'Premium', 'Business', 'Enterprise'].map(label => [
    label.toLowerCase(),
    {label, users: 10, extensions: 10, storage: '13Gi', monthly: {price: 15}}
  ])
)

test.beforeEach(async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('apiEnv', 'dev'))
  await page.route('https://support.lnbits.com/**', route => route.fulfill({status: 204}))
  await page.route('https://api.dev.lnbits.com/**', route => {
    const path = new URL(route.request().url()).pathname
    const json = path === '/pricing' ? pricing
      : path === '/instance/types' ? {images: [{tag: 'lnbits-phoenixd', label: 'Phoenixd (easy)'}]}
      : path === '/user/preferences' ? {chat_id: null}
      : path === '/' ? {timestamp: Math.floor(Date.now() / 1000)}
      : []
    return route.fulfill({json})
  })
})

test('guests can open pricing and terms without the account menu', async ({page}) => {
  await page.goto('/pricing')
  await expect(page.getByRole('heading', {name: 'Launch LNbits in minutes'})).toBeVisible()
  await expect(page.getByRole('link', {name: 'Register', exact: true})).toHaveCount(4)
  await expect(page.getByRole('link', {name: 'Sign in', exact: true})).toBeVisible()
  await expect(page.getByRole('button', {name: 'Menu', exact: true})).toHaveCount(0)
  await page.locator('.p-foot__nav').getByRole('link', {name: 'Terms', exact: true}).click()
  await expect(page).toHaveURL(/\/terms-of-service$/)
  await expect(page.getByRole('heading', {name: 'Terms of Service', exact: true})).toBeVisible()
  await expect(page.getByRole('button', {name: 'Menu', exact: true})).toHaveCount(0)
  await expect(page.locator('footer')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('link', {name: 'Back to Sign in'})).toBeVisible()
  await page.getByRole('link', {name: 'Back to Sign in'}).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.locator('body')).not.toHaveClass(/backend-ui/)
})

test('signed-in terms keep the account menu and selected theme', async ({page}) => {
  await page.addInitScript(() => {
    localStorage.setItem('email', 'public-pages@example.com')
    if (localStorage.getItem('darkMode') === null) localStorage.setItem('darkMode', 'true')
  })
  await page.goto('/instances')
  const navigation = page.locator('.app-navigation')
  await expect(navigation.getByRole('link', {name: 'Pricing', exact: true})).toHaveCount(0)
  await expect(page.locator('.q-header')).toHaveCount(1)
  await expect(page.locator('.q-layout')).toHaveCount(1)
  await page.getByRole('switch').click()
  await expect(page.locator('body')).toHaveClass(/body--light/)
  await navigation.getByRole('link', {name: 'Terms of Service', exact: true}).click()
  await expect(page.getByRole('heading', {name: 'Terms of Service', exact: true})).toBeVisible()
  await expect(page.locator('footer')).toHaveCount(0)
  await expect(navigation.getByRole('link', {name: 'Terms of Service', exact: true})).toHaveClass(/q-router-link--exact-active/)
  await expect(page.locator('body')).toHaveClass(/body--light/)
  await expect(page.getByRole('link', {name: 'Back to Sign in'})).toHaveCount(0)
  await page.reload()
  await expect(navigation).toBeVisible()
  await expect(page.locator('body')).toHaveClass(/body--light/)
  await navigation.getByRole('link', {name: 'LNbits Instances'}).click()
  await expect(page).toHaveURL(/\/instances$/)
  await expect(page.locator('body')).toHaveClass(/backend-ui/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('signed-in mobile users can navigate from terms to instances with the menu', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844})
  await page.addInitScript(() => localStorage.setItem('email', 'public-pages@example.com'))
  await page.goto('/terms-of-service')
  await expect(page.getByRole('heading', {name: 'Terms of Service', exact: true})).toBeVisible()
  await page.getByRole('button', {name: 'Menu', exact: true}).click()
  await expect(page.locator('.app-navigation').getByRole('link', {name: 'Pricing', exact: true})).toHaveCount(0)
  await page.locator('.app-navigation').getByRole('link', {name: 'LNbits Instances'}).click()
  await expect(page).toHaveURL(/\/instances$/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
