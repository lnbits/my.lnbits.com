const {expect, test} = require('@playwright/test')

const CHAT_ORIGIN = 'https://support.lnbits.com'
const CHAT_EMBED_ID = 'hMn4ptqCuMSiUB8nVWWCWo'
const EXISTING_CHAT_ID = 'Qk8zYu8gPqUrwczcyJrgjh'
const DEFAULT_CHAT_URL =
  `${CHAT_ORIGIN}/chat/embed/${CHAT_EMBED_ID}` + '?min=0&label=Chat+to+us'

const chatUrl = chatId =>
  `${CHAT_ORIGIN}/chat/embed/${CHAT_EMBED_ID}/${chatId}` +
  '?min=0&label=Chat+to+us'
const iframe = page => page.locator('#lnbits-chat-embed-iframe')
const launcher = page => page.locator('#lnbits-chat-button')
const clickLauncher = async page => {
  await expect(launcher(page).locator('.q-spinner')).toHaveCount(0)
  await launcher(page).click()
}

const setupApi = async (page, {chatId = null, getStatus = 200} = {}) => {
  const state = {
    chatId,
    getStatus,
    patchStatus: 200,
    getCount: 0,
    patches: [],
    chatRequests: []
  }

  await page.route('https://api.dev.lnbits.com/**', route => {
    const request = route.request()
    const {pathname} = new URL(request.url())

    if (pathname === '/user/preferences' && request.method() === 'GET') {
      state.getCount += 1
      return route.fulfill({
        status: state.getStatus,
        contentType: 'application/json',
        body: JSON.stringify(
          state.getStatus === 200 ? {chat_id: state.chatId} : {detail: 'Failed'}
        )
      })
    }

    if (pathname === '/user/preferences' && request.method() === 'PATCH') {
      const body = request.postDataJSON()
      state.patches.push(body)
      if (state.patchStatus === 200) state.chatId = body.chat_id
      return route.fulfill({
        status: state.patchStatus,
        contentType: 'application/json',
        body: JSON.stringify({chat_id: state.chatId})
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
  await page.route(`${CHAT_ORIGIN}/**`, route => {
    state.chatRequests.push(route.request().url())
    return route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>Chat</title><body>Support chat</body>'
    })
  })

  return state
}

const openAuthenticatedPage = async (page, localChatUrl = null) => {
  await page.goto('/login')
  await page.evaluate(url => {
    window.localStorage.setItem('apiEnv', 'dev')
    window.localStorage.setItem('email', 'chat-test@example.com')
    if (url) window.localStorage.setItem('chatUrl', url)
  }, localChatUrl)
  await page.goto('/instances')
  await expect(launcher(page)).toBeVisible()
}

const emitChatUrl = (page, url, options = {}) =>
  page.evaluate(
    ({nextUrl, origin, open, source}) => {
      const frame = document.querySelector('#lnbits-chat-embed-iframe')
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {source: 'lnbits-chat-embed', url: nextUrl, open},
          origin,
          source: source === 'parent' ? window : frame.contentWindow
        })
      )
    },
    {nextUrl: url, origin: CHAT_ORIGIN, open: true, ...options}
  )

const storedChatUrl = page =>
  page.evaluate(() => localStorage.getItem('chatUrl'))

const continuePreviousChat = async page => {
  await clickLauncher(page)
  await page.getByRole('button', {name: 'Continue Previous Chat'}).click()
  await expect(iframe(page)).toBeVisible()
}

const confirmNewSession = async page => {
  await clickLauncher(page)
  await page
    .getByRole('button', {name: 'Start New Session', exact: true})
    .click()
  await expect(iframe(page)).toHaveAttribute('src', DEFAULT_CHAT_URL)
}

test('loads only the round bottom-right button before interaction', async ({
  page
}) => {
  const state = await setupApi(page, {chatId: EXISTING_CHAT_ID})
  await openAuthenticatedPage(page)

  await expect(iframe(page)).toHaveCount(0)
  expect(state.getCount).toBe(0)
  expect(state.chatRequests).toEqual([])
  expect(state.patches).toEqual([])
  const button = await launcher(page).boundingBox()
  const viewport = page.viewportSize()
  expect(button.width).toBe(56)
  expect(button.height).toBe(56)
  expect(viewport.width - button.x - button.width).toBe(24)
  expect(viewport.height - button.y - button.height).toBe(24)
})

test('offers choices using the backend chat ID and continues without reloading', async ({
  page
}) => {
  const state = await setupApi(page, {chatId: 'backend-session'})
  await openAuthenticatedPage(page, chatUrl(EXISTING_CHAT_ID))
  await clickLauncher(page)

  await expect(
    page.getByRole('button', {name: 'Continue Previous Chat'})
  ).toBeVisible()
  await expect(
    page.getByRole('button', {name: 'Start a New Chat Session', exact: true})
  ).toBeVisible()
  await expect(iframe(page)).toHaveCount(0)
  expect(state.chatRequests).toEqual([])

  await page.getByRole('button', {name: 'Continue Previous Chat'}).click()
  await expect(iframe(page)).toHaveAttribute('src', chatUrl('backend-session'))
  await emitChatUrl(page, chatUrl('backend-session'))
  await expect.poll(() => storedChatUrl(page)).toBe(chatUrl('backend-session'))
  expect(state.getCount).toBe(1)
  expect(state.patches).toEqual([])
  await expect.poll(() => state.chatRequests.length).toBe(1)

  await clickLauncher(page)
  await expect(
    page.getByText('Start a New Chat Session?', {exact: true})
  ).toBeVisible()
  await expect(
    page.getByRole('button', {name: 'Continue Previous Chat'})
  ).toHaveCount(0)
  await page.getByRole('button', {name: 'Cancel', exact: true}).click()
  await expect(iframe(page)).toHaveAttribute('src', chatUrl('backend-session'))
})

for (const emptyChatId of [null, '']) {
  test(`preserves and migrates a local chat when the backend returns ${String(emptyChatId)}`, async ({
    page
  }) => {
    const state = await setupApi(page, {chatId: emptyChatId})
    await openAuthenticatedPage(
      page,
      chatUrl(EXISTING_CHAT_ID).replace('min=0', 'min=1')
    )
    await continuePreviousChat(page)
    await expect(iframe(page)).toHaveAttribute('src', chatUrl(EXISTING_CHAT_ID))
    await emitChatUrl(page, chatUrl(EXISTING_CHAT_ID))
    await expect
      .poll(() => state.patches)
      .toEqual([{chat_id: EXISTING_CHAT_ID}])
  })
}

test('retries a failed preference lookup without opening or overwriting a session', async ({
  page
}) => {
  const state = await setupApi(page, {chatId: EXISTING_CHAT_ID, getStatus: 500})
  await openAuthenticatedPage(page, chatUrl(EXISTING_CHAT_ID))
  await clickLauncher(page)
  await expect(
    page.getByText('Could not load your chat session. Please try again.')
  ).toBeVisible()
  await expect(iframe(page)).toHaveCount(0)
  expect(state.patches).toEqual([])
  expect(await storedChatUrl(page)).toBe(chatUrl(EXISTING_CHAT_ID))

  state.getStatus = 200
  await continuePreviousChat(page)
  await expect(iframe(page)).toHaveAttribute('src', chatUrl(EXISTING_CHAT_ID))
  expect(state.getCount).toBe(2)
})

test('automatically opens a first chat and saves its new ID once without reloading', async ({
  page
}) => {
  const state = await setupApi(page)
  await openAuthenticatedPage(page)
  await clickLauncher(page)
  await expect(iframe(page)).toHaveAttribute('src', DEFAULT_CHAT_URL)
  expect(await storedChatUrl(page)).toBeNull()
  expect(state.patches).toEqual([])

  await emitChatUrl(page, chatUrl('first-session'))
  await expect.poll(() => state.patches).toEqual([{chat_id: 'first-session'}])
  await expect.poll(() => storedChatUrl(page)).toBe(chatUrl('first-session'))
  await emitChatUrl(page, chatUrl('first-session'), {open: false})
  await expect(iframe(page)).toHaveCSS('height', '56px')
  await expect(iframe(page)).toHaveAttribute('src', DEFAULT_CHAT_URL)
  expect(state.patches).toHaveLength(1)
  expect(state.chatRequests).toHaveLength(1)

  await clickLauncher(page)
  await expect(
    page.getByText('Start a New Chat Session?', {exact: true})
  ).toBeVisible()
  await expect(
    page.getByRole('button', {name: 'Continue Previous Chat'})
  ).toHaveCount(0)
})

test('warns, copies the previous URL, and replaces the saved session only after creation', async ({
  page,
  context
}) => {
  const state = await setupApi(page, {chatId: EXISTING_CHAT_ID})
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await openAuthenticatedPage(page)
  await clickLauncher(page)
  await page
    .getByRole('button', {name: 'Start a New Chat Session', exact: true})
    .click()
  await expect(
    page.getByText(/You can only reopen it using its saved URL/)
  ).toBeVisible()
  await expect(page.getByLabel('Previous Chat URL', {exact: true})).toHaveValue(
    chatUrl(EXISTING_CHAT_ID)
  )
  await page.getByRole('button', {name: 'Copy Previous Chat URL'}).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    chatUrl(EXISTING_CHAT_ID)
  )
  await page.getByRole('button', {name: 'Cancel', exact: true}).click()
  await expect(iframe(page)).toHaveCount(0)
  expect(state.patches).toEqual([])

  await clickLauncher(page)
  await page
    .getByRole('button', {name: 'Start a New Chat Session', exact: true})
    .click()
  await page
    .getByRole('button', {name: 'Start New Session', exact: true})
    .click()
  await expect(iframe(page)).toHaveAttribute('src', DEFAULT_CHAT_URL)
  expect(await storedChatUrl(page)).toBe(chatUrl(EXISTING_CHAT_ID))
  expect(state.patches).toEqual([])

  await emitChatUrl(page, chatUrl('replacement-session'))
  await expect
    .poll(() => state.patches)
    .toEqual([{chat_id: 'replacement-session'}])
  await expect
    .poll(() => storedChatUrl(page))
    .toBe(chatUrl('replacement-session'))
  await page.reload()
  await continuePreviousChat(page)
  await expect(iframe(page)).toHaveAttribute(
    'src',
    chatUrl('replacement-session')
  )
})

test('remounts on every new session and ignores messages from the old iframe', async ({
  page
}) => {
  const state = await setupApi(page, {chatId: EXISTING_CHAT_ID})
  await openAuthenticatedPage(page)
  await continuePreviousChat(page)
  await emitChatUrl(page, chatUrl(EXISTING_CHAT_ID))
  await page.evaluate(() => {
    window.previousChatWindow = document.querySelector(
      '#lnbits-chat-embed-iframe'
    ).contentWindow
  })
  await confirmNewSession(page)
  await page.evaluate(
    ({origin, url}) => {
      const nextWindow = document.querySelector(
        '#lnbits-chat-embed-iframe'
      ).contentWindow
      if (nextWindow === window.previousChatWindow)
        throw new Error('Iframe was reused')
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {source: 'lnbits-chat-embed', url, open: false},
          origin,
          source: window.previousChatWindow
        })
      )
    },
    {origin: CHAT_ORIGIN, url: chatUrl('stale-session')}
  )
  expect(state.patches).toEqual([])
  expect(await storedChatUrl(page)).toBe(chatUrl(EXISTING_CHAT_ID))

  await emitChatUrl(page, chatUrl('second-session'))
  await expect.poll(() => state.chatId).toBe('second-session')
  await confirmNewSession(page)
  await emitChatUrl(page, chatUrl('third-session'))
  await expect
    .poll(() => state.patches)
    .toEqual([{chat_id: 'second-session'}, {chat_id: 'third-session'}])
  await expect.poll(() => state.chatRequests.length).toBe(3)
})

test('keeps the previous preference when a new iframe fails to create a session', async ({
  page
}) => {
  const state = await setupApi(page, {chatId: EXISTING_CHAT_ID})
  await openAuthenticatedPage(page)
  await continuePreviousChat(page)
  await emitChatUrl(page, chatUrl(EXISTING_CHAT_ID))
  await page.clock.install()
  await confirmNewSession(page)
  await page.clock.fastForward(30001)
  await expect(
    page.getByText('Chat could not be opened. Please try again.')
  ).toBeVisible()
  await expect(iframe(page)).toHaveCount(0)
  expect(await storedChatUrl(page)).toBe(chatUrl(EXISTING_CHAT_ID))
  expect(state.patches).toEqual([])
  await continuePreviousChat(page)
  await expect(iframe(page)).toHaveAttribute('src', chatUrl(EXISTING_CHAT_ID))
})

test('keeps a newly created URL locally and retries a failed backend save', async ({
  page
}) => {
  const state = await setupApi(page, {chatId: EXISTING_CHAT_ID})
  await openAuthenticatedPage(page)
  await continuePreviousChat(page)
  await emitChatUrl(page, chatUrl(EXISTING_CHAT_ID))
  await confirmNewSession(page)
  state.patchStatus = 500
  await emitChatUrl(page, chatUrl('unsynced-session'))
  await expect(
    page.getByText(
      'Your chat is open, but its session could not be saved to your account.'
    )
  ).toBeVisible()
  expect(await storedChatUrl(page)).toBe(chatUrl('unsynced-session'))
  expect(state.chatId).toBe(EXISTING_CHAT_ID)

  await clickLauncher(page)
  await expect.poll(() => state.patches.length).toBe(2)
  await expect(
    page.getByText('Start a New Chat Session?', {exact: true})
  ).toHaveCount(0)
  await expect(launcher(page).locator('.q-spinner')).toHaveCount(0)
  state.patchStatus = 200
  await page.getByRole('button', {name: 'Retry', exact: true}).click()
  await expect.poll(() => state.chatId).toBe('unsynced-session')
  await expect(
    page.getByRole('button', {name: 'Retry', exact: true})
  ).toHaveCount(0)
  await clickLauncher(page)
  await expect(page.getByLabel('Previous Chat URL', {exact: true})).toHaveValue(
    chatUrl('unsynced-session')
  )
})

test('ignores untrusted URLs, origins, and message senders', async ({page}) => {
  const state = await setupApi(page)
  await openAuthenticatedPage(
    page,
    chatUrl('untrusted').replace(CHAT_ORIGIN, 'https://example.com')
  )
  await clickLauncher(page)
  await expect(iframe(page)).toHaveAttribute('src', DEFAULT_CHAT_URL)

  await emitChatUrl(page, chatUrl('wrong-origin'), {
    origin: 'https://example.com'
  })
  await emitChatUrl(page, chatUrl('wrong-sender'), {source: 'parent'})
  await emitChatUrl(
    page,
    chatUrl('wrong-url').replace(CHAT_ORIGIN, 'https://example.com')
  )
  await emitChatUrl(
    page,
    chatUrl('wrong-embed').replace(CHAT_EMBED_ID, 'another-embed')
  )
  await emitChatUrl(page, 'invalid URL')
  expect(state.patches).toEqual([])
  await emitChatUrl(page, chatUrl('trusted-session'))
  await expect.poll(() => state.patches).toEqual([{chat_id: 'trusted-session'}])
})

for (const viewport of [
  {width: 1280, height: 800},
  {width: 640, height: 480}
]) {
  test(`keeps the launcher left of the iframe at ${viewport.width}x${viewport.height}`, async ({
    page
  }) => {
    await page.setViewportSize(viewport)
    await setupApi(page)
    await openAuthenticatedPage(page)
    await clickLauncher(page)
    await expect(iframe(page)).toBeVisible()
    await emitChatUrl(page, chatUrl('layout-session'))
    await expect(iframe(page)).toHaveCSS(
      'height',
      `${Math.min(520, viewport.height - 48)}px`
    )
    const button = await launcher(page).boundingBox()
    const frame = await iframe(page).boundingBox()
    expect(frame.x - button.x - button.width).toBe(12)
    expect(viewport.width - frame.x - frame.width).toBe(24)
    expect(viewport.height - frame.y - frame.height).toBe(24)
    expect(frame.y).toBeGreaterThanOrEqual(24)
    await page.screenshot({
      path: test.info().outputPath('chat-open.png'),
      animations: 'disabled'
    })
    await clickLauncher(page)
    await expect(
      page.getByRole('button', {name: 'Copy Previous Chat URL'})
    ).toBeVisible()
    await page.screenshot({
      path: test.info().outputPath('new-session-confirmation.png'),
      animations: 'disabled'
    })
    await page.getByRole('button', {name: 'Cancel', exact: true}).click()
  })
}

test('clears the local chat URL when logging out', async ({page}) => {
  await setupApi(page)
  await openAuthenticatedPage(page, chatUrl('logout-session'))
  await continuePreviousChat(page)
  await emitChatUrl(page, chatUrl('logout-session'))
  await page.locator('header .q-btn-dropdown').click()
  await page.getByText('Logout', {exact: true}).click()

  await expect(page).toHaveURL(/\/login$/)
  await expect.poll(() => storedChatUrl(page)).toBeNull()
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('email')))
    .toBeNull()
})
