const {expect, test} = require('@playwright/test')

const CHAT_ORIGIN = 'https://support.lnbits.com'
const CHAT_EMBED_ID = 'hMn4ptqCuMSiUB8nVWWCWo'
const EXISTING_CHAT_ID = 'Qk8zYu8gPqUrwczcyJrgjh'
const DEFAULT_CHAT_URL =
  `${CHAT_ORIGIN}/chat/embed/${CHAT_EMBED_ID}` +
  '?min=1&label=Chat%20to%20us'

const chatUrl = chatId =>
  `${CHAT_ORIGIN}/chat/embed/${CHAT_EMBED_ID}/${chatId}` +
  '?min=1&label=Chat%20to%20us'

const setupApi = async (page, {chatId = null, getStatus = 200} = {}) => {
  const state = {
    getCount: 0,
    patches: []
  }

  await page.route('https://api.dev.lnbits.com/**', route => {
    const request = route.request()
    const {pathname} = new URL(request.url())

    if (pathname === '/user/preferences' && request.method() === 'GET') {
      state.getCount += 1
      return route.fulfill({
        status: getStatus,
        contentType: 'application/json',
        body: JSON.stringify(
          getStatus === 200 ? {chat_id: chatId} : {detail: 'Failed'}
        )
      })
    }

    if (pathname === '/user/preferences' && request.method() === 'PATCH') {
      const body = request.postDataJSON()
      state.patches.push(body)
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({chat_id: body.chat_id})
      })
    }

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
  await page.route(`${CHAT_ORIGIN}/**`, route =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>Chat</title>'
    })
  )

  return state
}

const openAuthenticatedPage = async (page, localChatUrl = null) => {
  await page.goto('/login')
  await page.evaluate(url => {
    window.localStorage.setItem('apiEnv', 'dev')
    window.localStorage.setItem('email', 'chat-test@example.com')
    if (url) {
      window.localStorage.setItem('chatUrl', url)
    }
  }, localChatUrl)
  await page.goto('/instances')
}

const emitChatUrl = (page, url) =>
  page.evaluate(
    ({nextUrl, origin}) => {
      const iframe = document.querySelector('#lnbits-chat-embed-iframe')
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            source: 'lnbits-chat-embed',
            url: nextUrl,
            open: false
          },
          origin,
          source: iframe.contentWindow
        })
      )
    },
    {nextUrl: url, origin: CHAT_ORIGIN}
  )

test('uses the backend chat ID as the authenticated source of truth', async ({
  page
}) => {
  const state = await setupApi(page, {chatId: 'backend-session'})

  await openAuthenticatedPage(page, chatUrl(EXISTING_CHAT_ID))

  await expect(page.locator('#lnbits-chat-embed-iframe')).toHaveAttribute(
    'src',
    chatUrl('backend-session')
  )
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('chatUrl')))
    .toBe(chatUrl('backend-session'))
  expect(state.getCount).toBe(1)
  expect(state.patches).toEqual([])
})

for (const emptyChatId of [null, '']) {
  test(`uploads the local chat ID when the backend returns ${String(
    emptyChatId
  )}`, async ({page}) => {
    const state = await setupApi(page, {chatId: emptyChatId})

    await openAuthenticatedPage(page, chatUrl(EXISTING_CHAT_ID))

    await expect(page.locator('#lnbits-chat-embed-iframe')).toHaveAttribute(
      'src',
      chatUrl(EXISTING_CHAT_ID)
    )
    await expect.poll(() => state.patches).toEqual([
      {chat_id: EXISTING_CHAT_ID}
    ])
  })
}

test('does not patch after the preferences GET fails', async ({page}) => {
  const state = await setupApi(page, {getStatus: 500})

  await openAuthenticatedPage(page, chatUrl(EXISTING_CHAT_ID))
  await expect(page.locator('#lnbits-chat-embed-iframe')).toHaveAttribute(
    'src',
    chatUrl(EXISTING_CHAT_ID)
  )

  await emitChatUrl(page, chatUrl('new-session'))
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('chatUrl')))
    .toBe(chatUrl('new-session'))
  await page.waitForTimeout(100)
  expect(state.patches).toEqual([])
})

test('patches a newly created chat ID after a successful empty GET', async ({
  page
}) => {
  const state = await setupApi(page)

  await openAuthenticatedPage(page)
  await expect(page.locator('#lnbits-chat-embed-iframe')).toHaveAttribute(
    'src',
    DEFAULT_CHAT_URL
  )

  await emitChatUrl(page, chatUrl('new-session'))
  await expect.poll(() => state.patches).toEqual([
    {chat_id: 'new-session'}
  ])
})

test('clears the local chat URL when logging out', async ({page}) => {
  await setupApi(page)
  const localChatUrl = chatUrl('logout-session')

  await openAuthenticatedPage(page, localChatUrl)
  await page.locator('header .q-btn-dropdown').click()
  await page.getByText('Logout', {exact: true}).click()

  await expect(page).toHaveURL(/\/login$/)
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('chatUrl')))
    .toBeNull()
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('email')))
    .toBeNull()
})
