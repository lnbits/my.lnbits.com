const {expect, test} = require('@playwright/test')

const payments = [
  {id: 1663, instance_id: 'instance-1', paid: true, amount_sats: 42, payment_plan_name: 'hourly', quantity: 1, memo: 'LNbits instance: hourly price: 42 sats', created_at: 1792499656, paid_at: 1792499656},
  {id: 838, instance_id: 'deleted-instance', paid: true, amount_sats: 128, payment_plan_name: 'personal_monthly', quantity: 2, memo: 'Instance subscription.', created_at: 1747323677, paid_at: 1747323677},
  {id: 778, instance_id: 'instance-1', paid: false, amount_sats: 19320000, payment_plan_name: 'premium_monthly', quantity: 1, memo: 'Payment for instance: 1 × premium monthly', created_at: 1777088340, paid_at: null}
]

async function setup(page) {
  const requests = []
  await page.addInitScript(() => {
    localStorage.setItem('apiEnv', 'dev')
    localStorage.setItem('email', 'payments@example.com')
  })
  await page.route('https://support.lnbits.com/**', route => route.fulfill({status: 204}))
  await page.route('https://api.dev.lnbits.com/**', route => {
    const path = new URL(route.request().url()).pathname
    requests.push(path)
    const json = path === '/instance/payments' ? payments
      : path === '/instance/instance-1/payments' ? payments.filter(payment => payment.instance_id === 'instance-1')
      : path === '/instance' ? [{id: 'instance-1', domain: 'my-wallet.lnbits.com'}]
      : path === '/user/preferences' ? {chat_id: null} : []
    return route.fulfill({json})
  })
  return requests
}

test('preview payments table', async ({page}) => {
  await setup(page)
  await page.setViewportSize({width: 1600, height: 1000})
  await page.goto('/payments')
  await expect(page.locator('.payments-table tbody tr')).toHaveCount(3)
  await page.screenshot({path: '/tmp/payments-dark.png', animations: 'disabled'})
  await page.getByRole('switch').click()
  await expect(page.locator('body')).toHaveClass(/body--light/)
  await page.screenshot({path: '/tmp/payments-light.png', animations: 'disabled'})
  await page.setViewportSize({width: 390, height: 844})
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({path: '/tmp/payments-mobile.png', animations: 'disabled'})
})
