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

test('payments show readable details and sort amounts and timestamps correctly', async ({page}) => {
  await setup(page)
  await page.goto('/payments')
  const rows = page.locator('.payments-table tbody tr')
  await expect(rows).toHaveCount(3)
  await expect(rows.nth(0).getByRole('cell', {name: 'Paid', exact: true})).toBeVisible()
  await expect(rows.nth(2).getByRole('cell', {name: 'Unpaid', exact: true})).toBeVisible()
  await expect(rows.nth(2).locator('.payment-amount')).toHaveText('19,320,000')
  await expect(rows.nth(1)).toContainText('Personal Monthly')
  await expect(rows.nth(1)).toContainText('× 2')
  await expect(rows.nth(1)).toContainText('Instance deleted-instance')
  await expect(rows.nth(2).locator('.payment-date').last()).toHaveText('—')
  await page.getByRole('columnheader', {name: 'Amount (sats)'}).click()
  await expect(rows.locator('.payment-id')).toHaveText(['#1663', '#838', '#778'])
  await page.getByRole('columnheader', {name: 'Created', exact: true}).click()
  await expect(rows.locator('.payment-id')).toHaveText(['#838', '#778', '#1663'])
  await page.getByRole('columnheader', {name: 'Paid at', exact: true}).click()
  await expect(rows.locator('.payment-id')).toHaveText(['#778', '#838', '#1663'])
})

test('payments can be filtered and cleared on mobile without page overflow', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844})
  const requests = await setup(page)
  await page.goto('/payments')
  await expect(page.locator('.payments-table tbody tr')).toHaveCount(3)
  await page.getByTestId('payments-filter').click()
  await page.getByRole('option', {name: '[instance-1] my-wallet.lnbits.com'}).click()
  await expect(page.locator('.payments-table tbody tr')).toHaveCount(2)
  expect(requests).toContain('/instance/instance-1/payments')
  await page.locator('.table-instance-filter .q-field__focusable-action').click()
  await expect(page.locator('.payments-table tbody tr')).toHaveCount(3)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
