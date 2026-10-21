const {expect, test} = require('@playwright/test')

const storagePrefix = 'instance-action:'
const storedActions = page => page.evaluate(prefix =>
  Object.fromEntries(Object.entries(localStorage).filter(([key]) => key.startsWith(prefix))), storagePrefix)

async function setup(page, {enabled = true, probeStatus = 503, rejectAction = false, probeError = false, relay = false} = {}) {
  const requests = []
  const probes = []
  const instance = {
    id: 'instance-1', domain: 'instance-1.example.com',
    instance_type: relay ? 'nostr' : 'lnbits',
    timestamp: 1700000000, timestamp_start: 1700000000, timestamp_stop: 1900000000,
    is_enabled: enabled, is_active: true, installtoken: 'test-token', lnurl: ''
  }
  await page.addInitScript(() => {
    localStorage.setItem('apiEnv', 'dev')
    localStorage.setItem('email', 'lifecycle@example.com')
  })
  await page.route('https://support.lnbits.com/**', route => route.fulfill({status: 204}))
  await page.route('https://api.dev.lnbits.com/**', route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/instance' && route.request().method() === 'PUT') {
      const body = route.request().postDataJSON()
      requests.push(body)
      if (rejectAction) return route.fulfill({status: 400, json: {detail: 'Action rejected'}})
      instance.is_enabled = body.action === 'enable'
      return route.fulfill({json: {message: 'queued'}})
    }
    const json = path === '/instance' ? [instance, {...instance, id: 'instance-2', domain: 'instance-2.example.com', is_enabled: true}]
      : path === '/' ? {timestamp: 1800000000}
      : path === '/pricing' ? {premium: {label: 'Premium', monthly: {price: 15}}}
      : path === '/user/preferences' ? {chat_id: null}
      : []
    return route.fulfill({json})
  })
  await page.route('https://instance-1.example.com/static/i18n/en.js', route => {
    probes.push(route.request())
    if (probeError) return route.abort('failed')
    return route.fulfill({status: probeStatus, contentType: 'application/javascript', headers: {'access-control-allow-origin': '*'}, body: probeStatus === 200 ? 'window.locales = {}' : 'Unavailable'})
  })
  return {requests, probes}
}

for (const scenario of [
  {action: 'Disable', enabled: true, probeStatus: 503, next: 'Enable'},
  {action: 'Enable', enabled: false, probeStatus: 200, next: 'Disable'},
  {action: 'Disable', enabled: true, probeStatus: 200, next: 'Disable'},
  {action: 'Enable', enabled: false, probeStatus: 503, next: 'Enable'}
]) {
  test(`${scenario.action} waits five minutes then uses en.js ${scenario.probeStatus}`, async ({page}) => {
    await page.clock.install()
    const {requests, probes} = await setup(page, scenario)
    await page.goto('/instances')
    const button = page.getByRole('button', {name: `${scenario.action} instance instance-1`, exact: true})
    const before = await button.boundingBox()
    await button.click()
    await page.getByRole('button', {name: 'OK', exact: true}).click()
    const spinner = page.getByTestId('instance-processing-instance-1')
    await expect(spinner).toBeVisible()
    await expect.poll(() => requests.length).toBe(1)
    await expect(page.getByRole('button', {name: 'Disable instance instance-2', exact: true})).toBeEnabled()
    const after = await spinner.boundingBox()
    expect(after.width).toBeCloseTo(before.width, 0)
    expect(after.height).toBeCloseTo(before.height, 0)
    await spinner.hover()
    await expect(page.getByRole('tooltip')).toHaveText('processing, can take up to 5mins')
    await spinner.dispatchEvent('click')
    expect(requests).toHaveLength(1)
    expect(Object.values(await storedActions(page))).toHaveLength(1)
    await page.clock.fastForward(240000)
    await expect(spinner).toBeVisible()
    expect(probes).toHaveLength(0)
    await page.clock.fastForward(60000)
    await expect(page.getByRole('button', {name: `${scenario.next} instance instance-1`, exact: true})).toBeEnabled()
    await expect(spinner).toHaveCount(0)
    expect(probes).toHaveLength(1)
    expect(await storedActions(page)).toEqual({})
  })
}

test('restores the original cooldown after reload and syncs another tab', async ({page, context}) => {
  await page.clock.install()
  await setup(page)
  const other = await context.newPage()
  await setup(other)
  await other.goto('/instances')
  await page.goto('/instances')
  await page.getByRole('button', {name: 'Disable instance instance-1', exact: true}).click()
  await page.getByRole('button', {name: 'OK', exact: true}).click()
  await expect(other.getByTestId('instance-processing-instance-1')).toBeVisible()
  const original = await storedActions(page)
  await page.clock.fastForward(240000)
  await page.reload()
  await expect(page.getByTestId('instance-processing-instance-1')).toBeVisible()
  expect(await storedActions(page)).toEqual(original)
  await page.clock.fastForward(60000)
  await expect(page.getByRole('button', {name: 'Enable instance instance-1', exact: true})).toBeEnabled()
  expect(await storedActions(page)).toEqual({})
  await other.close()
})

test('a rejected request removes the cooldown immediately', async ({page}) => {
  await setup(page, {rejectAction: true})
  await page.goto('/instances')
  await page.getByRole('button', {name: 'Disable instance instance-1', exact: true}).click()
  await page.getByRole('button', {name: 'OK', exact: true}).click()
  await expect(page.getByText('Failed to disable instance instance-1.', {exact: true})).toBeVisible()
  await expect(page.getByRole('button', {name: 'Disable instance instance-1', exact: true})).toBeEnabled()
  expect(await storedActions(page)).toEqual({})
})

test('a failed probe unlocks using the saved state and explains the fallback', async ({page}) => {
  await page.clock.install()
  await setup(page, {enabled: false, probeError: true})
  await page.goto('/instances')
  await page.getByRole('button', {name: 'Enable instance instance-1', exact: true}).click()
  await page.getByRole('button', {name: 'OK', exact: true}).click()
  await expect(page.getByTestId('instance-processing-instance-1')).toBeVisible()
  await page.clock.fastForward(300000)
  await expect(page.getByRole('button', {name: 'Disable instance instance-1', exact: true})).toBeEnabled()
  await expect(page.getByText('Could not check availability. Showing the saved enable/disable state.')).toBeVisible()
  expect(await storedActions(page)).toEqual({})
})

test('relays use the cooldown and API state without probing an LNbits URL', async ({page}) => {
  await page.clock.install()
  const {probes} = await setup(page, {relay: true})
  await page.goto('/relays')
  await page.getByRole('button', {name: 'Disable relay instance-1', exact: true}).click()
  await page.getByRole('button', {name: 'OK', exact: true}).click()
  await expect(page.getByTestId('instance-processing-instance-1')).toBeVisible()
  await page.clock.fastForward(300000)
  await expect(page.getByRole('button', {name: 'Enable relay instance-1', exact: true})).toBeEnabled()
  expect(probes).toHaveLength(0)
})
