const {expect, test} = require('@playwright/test')

for (const dark of [false, true]) {
  test(`remaining time and themed feedback in ${dark ? 'dark' : 'light'} mode`, async ({page}) => {
    const now = 1800000000
    const cases = [
      {id: 'trial', start: now - 60, stop: now + 660, time: '11m', percent: '91% remaining'},
      {id: 'monthly', start: now - 30 * 86400, stop: now + 660, time: '11m', percent: 'Less than 1% remaining'},
      {id: 'last-seconds', start: now - 3600, stop: now + 30, time: '<1m', percent: 'Less than 1% remaining'},
      {id: 'expired', start: now - 720, stop: now, time: 'Expired', percent: '0% remaining'},
      {id: 'new', start: now, stop: now + 720, time: '12m', percent: '100% remaining'}
    ]
    await page.addInitScript(dark => {
      localStorage.setItem('apiEnv', 'dev')
      localStorage.setItem('email', 'time-left@example.com')
      localStorage.setItem('darkMode', String(dark))
    }, dark)
    await page.route('https://support.lnbits.com/**', route => route.fulfill({status: 204}))
    await page.route('https://api.dev.lnbits.com/**', route => {
      const path = new URL(route.request().url()).pathname
      const json = route.request().method() === 'PUT' ? {message: 'queued'}
        : path === '/instance' ? cases.map(({id, start, stop}) => ({
          id, domain: `${id}.example.com`, instance_type: 'lnbits',
          timestamp: start, timestamp_start: start, timestamp_stop: stop,
          is_enabled: true, is_active: true, installtoken: 'test-token'
        }))
        : path === '/' ? {timestamp: now}
        : path === '/user/preferences' ? {chat_id: null}
        : []
      return route.fulfill({json})
    })
    await page.goto('/instances')
    for (const item of cases) {
      await expect(page.getByTestId(`instance-time-left-${item.id}`)).toHaveText(item.time)
      await page.getByTestId(`extend-instance-progress-${item.id}`).hover()
      await expect(page.getByRole('tooltip')).toHaveText(item.percent)
      await page.mouse.move(0, 0)
      await expect(page.getByRole('tooltip')).toHaveCount(0)
    }
    await expect(page.getByRole('button', {name: 'Disable instance expired', exact: true})).toBeDisabled()
    await page.getByRole('button', {name: 'Disable instance trial', exact: true}).click()
    await page.getByRole('button', {name: 'OK', exact: true}).click()
    const notification = page.locator('.q-notification').filter({hasText: 'queued'})
    await expect(notification).toBeVisible()
    await page.getByTestId('instance-processing-trial').hover()
    const tooltip = page.getByRole('tooltip')
    await expect(tooltip).toHaveText('processing, can take up to 5mins')
    // Both floating surfaces follow the same light/dark palette as the cards.
    const surface = await page.locator('.q-table__container').first().evaluate(el => {
      const style = getComputedStyle(el)
      return {background: style.backgroundColor, color: style.color}
    })
    for (const overlay of [notification, tooltip]) {
      await expect(overlay).toHaveCSS('background-color', surface.background)
      await expect(overlay).toHaveCSS('color', surface.color)
    }
    await page.screenshot({path: `/tmp/instance-feedback-${dark ? 'dark' : 'light'}.png`})
  })
}
