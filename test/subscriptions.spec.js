const {expect, test} = require('@playwright/test')

const subscription = (id, enabled, instanceId = 'instance-1') => ({
  subscription_request_id: id,
  instance_id: instanceId,
  is_enabled: enabled,
  payment_plan_name: 'personal_monthly',
  created_at: 1770000000,
  ended_at: enabled ? null : 1770100000
})

async function setup(page, rows) {
  const requests = []
  await page.addInitScript(() => {
    localStorage.setItem('apiEnv', 'dev')
    localStorage.setItem('email', 'subscriptions@example.com')
  })
  await page.route('https://support.lnbits.com/**', route => route.fulfill({status: 204}))
  await page.route('https://api.dev.lnbits.com/**', route => {
    const path = new URL(route.request().url()).pathname
    requests.push({path, body: route.request().postDataJSON()})
    if (path === '/instance/unsubscribe') {
      const {subscription_request_id: id} = route.request().postDataJSON()
      Object.assign(rows.find(row => row.subscription_request_id === id), {is_enabled: false, ended_at: 1770200000})
      return route.fulfill({json: {}})
    }
    const json = path.endsWith('/subscriptions') ? rows
      : path === '/instance' ? [{id: 'instance-1', domain: 'my-wallet.lnbits.com'}]
      : path === '/user/preferences' ? {chat_id: null}
      : []
    return route.fulfill({json})
  })
  return requests
}

test('enabled subscriptions sort ahead of inactive subscriptions before pagination and after refresh', async ({page}) => {
  const rows = Array.from({length: 22}, (_, i) => subscription(`inactive-${i}`, false))
  rows.push(subscription('active-1', true), subscription('active-2', true))
  await setup(page, rows)
  await page.goto('/subscriptions')
  const cards = page.locator('.subscription-card')
  await expect(cards).toHaveCount(20)
  await expect(cards.nth(0)).toHaveAttribute('data-subscription-id', 'active-1')
  await expect(cards.nth(1)).toHaveAttribute('data-subscription-id', 'active-2')
  await expect(cards.nth(2)).toHaveAttribute('data-subscription-id', 'inactive-0')
  await expect(cards.nth(0)).toContainText('Personal Monthly')
  await expect(cards.nth(0).getByRole('link')).toHaveAttribute('href', '/activity?instance_id=instance-1')
  await expect(cards.nth(2).getByRole('button')).toHaveCount(0)
  rows.push(subscription('active-3', true))
  await page.getByRole('button', {name: 'Refresh', exact: true}).click()
  await expect(cards.nth(2)).toHaveAttribute('data-subscription-id', 'active-3')
})

test('filtered subscriptions stay sorted after confirming cancellation', async ({page}) => {
  const requests = await setup(page, [
    subscription('inactive', false), subscription('active-1', true), subscription('active-2', true)
  ])
  await page.goto('/subscriptions?instance_id=instance-1')
  const cards = page.locator('.subscription-card')
  await expect(cards.first()).toHaveAttribute('data-subscription-id', 'active-1')
  expect(requests.some(request => request.path === '/instance/instance-1/subscriptions')).toBe(true)
  await cards.first().getByRole('button', {name: 'End subscription'}).click()
  await page.getByRole('button', {name: 'Cancel', exact: true}).click()
  expect(requests.some(request => request.path === '/instance/unsubscribe')).toBe(false)
  await cards.first().getByRole('button', {name: 'End subscription'}).click()
  await page.getByRole('button', {name: 'OK', exact: true}).click()
  await expect(cards.first()).toHaveAttribute('data-subscription-id', 'active-2')
  expect(requests.find(request => request.path === '/instance/unsubscribe').body).toEqual({
    instance_id: 'instance-1', subscription_request_id: 'active-1'
  })
  await expect(page.locator('[data-subscription-id="active-1"]')).toContainText('Inactive')
  await expect(page.locator('[data-subscription-id="active-1"]').getByRole('button')).toHaveCount(0)
  await page.setViewportSize({width: 390, height: 844})
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
