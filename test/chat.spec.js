const {expect, test} = require('@playwright/test')

test('preserves the chat session URL when logging out', async ({page}) => {
  const chatUrl =
    'https://support.lnbits.com/chat/embed/session-123?min=1&label=Chat'

  await page.route('https://api.dev.lnbits.com/**', route => {
    const {pathname} = new URL(route.request().url())
    const body =
      pathname === '/'
        ? {timestamp: Math.floor(Date.now() / 1000)}
        : pathname === '/pricing'
          ? {}
          : []

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body)
    })
  })
  await page.route('https://support.lnbits.com/**', route =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>Chat</title>'
    })
  )

  await page.goto('/login')
  await page.evaluate(url => {
    window.localStorage.setItem('apiEnv', 'dev')
    window.localStorage.setItem('email', 'chat-test@example.com')
    window.localStorage.setItem('chatUrl', url)
  }, chatUrl)
  await page.goto('/instances')
  await expect(page.locator('#lnbits-chat-embed-iframe')).toHaveAttribute(
    'src',
    chatUrl
  )

  await page.locator('header .q-btn-dropdown').click()
  await page.getByText('Logout', {exact: true}).click()

  await expect(page).toHaveURL(/\/login$/)
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('chatUrl')))
    .toBe(chatUrl)
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('email')))
    .toBeNull()
})
