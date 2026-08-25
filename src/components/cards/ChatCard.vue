<template>
  <div id="lnbits-chat-embed-root">
    <iframe
      id="lnbits-chat-embed-iframe"
      ref="chatIframe"
      class="lnbits-chat-embed-iframe"
      loading="lazy"
    ></iframe>
  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {saas} from 'src/boot/saas'
import {
  getChatIdFromUrl,
  getChatUrlForId,
  isValidChatId
} from 'src/utils/chat'

const chatIframe = ref(null)
const chatUrl = ref('')
const chatOrigin = new URL(saas.chatUrl).origin

let preferenceSyncEnabled = false
let syncedChatId = null
let preferenceUpdateQueue = Promise.resolve()

const CHAT_BOTTOM_OFFSET = 24
const CHAT_COLLAPSED_HEIGHT = 56
const CHAT_EXPANDED_HEIGHT = 520
const CHAT_SCROLL_BUFFER = 24

function syncChatLayout(isOpen) {
  const iframe = chatIframe.value
  if (!iframe) return

  const iframeHeight = isOpen
    ? CHAT_EXPANDED_HEIGHT
    : CHAT_COLLAPSED_HEIGHT

  iframe.style.height = `${iframeHeight}px`
  document.documentElement.style.setProperty(
    '--chat-embed-safe-space',
    `${iframeHeight + CHAT_BOTTOM_OFFSET + CHAT_SCROLL_BUFFER}px`
  )
}

function setChatUrl(url, persist = false) {
  const iframe = chatIframe.value
  if (!iframe || !url) return

  chatUrl.value = url
  iframe.src = url
  if (persist) {
    localStorage.setItem('chatUrl', url)
  }
}

function persistChatId(chatId) {
  if (!preferenceSyncEnabled || chatId === syncedChatId) {
    return preferenceUpdateQueue
  }

  preferenceUpdateQueue = preferenceUpdateQueue.then(async () => {
    if (!preferenceSyncEnabled || chatId === syncedChatId) return

    try {
      await saas.updateUserChatId(chatId)
      syncedChatId = chatId
    } catch (error) {
      console.warn('Failed to update chat preference', error)
    }
  })

  return preferenceUpdateQueue
}

function getTrustedChatUrl(value) {
  try {
    const url = new URL(value)
    return url.origin === chatOrigin && getChatIdFromUrl(url)
      ? url.toString()
      : null
  } catch {
    return null
  }
}

function handleMessage(event) {
  if (!event.data || event.data.source !== 'lnbits-chat-embed') return

  const iframe = chatIframe.value
  if (
    !iframe ||
    event.source !== iframe.contentWindow ||
    event.origin !== chatOrigin
  ) {
    return
  }

  const nextChatUrl = getTrustedChatUrl(event.data.url)
  if (nextChatUrl && nextChatUrl !== chatUrl.value) {
    const nextChatId = getChatIdFromUrl(nextChatUrl)

    setChatUrl(nextChatUrl, true)
    if (nextChatId) {
      void persistChatId(nextChatId)
    }
  }

  syncChatLayout(Boolean(event.data.open))
}

async function initializeChat() {
  const iframe = chatIframe.value
  if (!iframe) return

  const localChatUrl = localStorage.getItem('chatUrl')
  const localChatId = getChatIdFromUrl(localChatUrl)

  try {
    const {data} = await saas.getUserPreferences()
    const backendChatId = data?.chat_id ?? null

    if (isValidChatId(backendChatId)) {
      const backendChatUrl = getChatUrlForId(backendChatId, saas.chatUrl)

      preferenceSyncEnabled = true
      syncedChatId = backendChatId
      setChatUrl(backendChatUrl || localChatUrl || saas.chatUrl, true)
      return
    }

    preferenceSyncEnabled = backendChatId === null || backendChatId === ''
    setChatUrl(localChatUrl || saas.chatUrl)
    if (preferenceSyncEnabled && localChatId) {
      void persistChatId(localChatId)
    }
  } catch (error) {
    preferenceSyncEnabled = false
    setChatUrl(localChatUrl || saas.chatUrl)
    console.warn('Failed to load chat preference', error)
  }
}

onMounted(() => {
  syncChatLayout(false)
  window.addEventListener('message', handleMessage)
  void initializeChat()
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)
  document.documentElement.style.removeProperty('--chat-embed-safe-space')
})
</script>

<style scoped>
.lnbits-chat-embed-iframe {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 360px;
  height: 56px;
  border: 0;
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
  z-index: 9999;
  transition: height 0.2s ease;
  overflow: hidden;
}
</style>
