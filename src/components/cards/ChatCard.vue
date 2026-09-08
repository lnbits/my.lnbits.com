<template>
  <div id="lnbits-chat-embed-root" class="chat-widget">
    <q-btn
      id="lnbits-chat-button"
      round
      color="primary"
      icon="chat"
      class="chat-widget__button"
      :aria-label="iframeSrc ? 'Start a New Chat Session' : 'Open chat'"
      :loading="loadingPreferences || openingChat || savingPreference"
      @click="handleChatClick"
    />
    <iframe
      v-if="iframeSrc"
      id="lnbits-chat-embed-iframe"
      :key="iframeKey"
      ref="chatIframe"
      :src="iframeSrc"
      title="LNbits support chat"
      class="lnbits-chat-embed-iframe"
      :class="{'lnbits-chat-embed-iframe--expanded': chatExpanded}"
    ></iframe>
  </div>

  <q-dialog v-model="showSessionChoices">
    <q-card class="chat-session-dialog">
      <q-card-section class="text-h6">Chat with us</q-card-section>
      <q-card-section class="q-pt-none column q-gutter-sm">
        <q-btn
          color="primary"
          no-caps
          label="Continue Previous Chat"
          @click="continueChat"
        />
        <q-btn
          outline
          color="primary"
          no-caps
          label="Start a New Chat Session"
          @click="confirmNewChat"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn v-close-popup flat no-caps label="Cancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showNewSessionConfirmation">
    <q-card class="chat-session-dialog">
      <q-card-section class="text-h6">
        Start a New Chat Session?
      </q-card-section>
      <q-card-section class="q-pt-none">
        <p>
          Your previous session will be closed here. You can only reopen it
          using its saved URL. Copy the URL before starting a new session if you
          want to return to it later.
        </p>
        <q-input
          :model-value="savedChatUrl"
          outlined
          readonly
          label="Previous Chat URL"
          class="q-mb-sm"
        />
        <q-btn
          flat
          color="primary"
          icon="content_copy"
          no-caps
          label="Copy Previous Chat URL"
          @click="copyPreviousChatUrl"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn v-close-popup flat no-caps label="Cancel" />
        <q-btn
          color="primary"
          no-caps
          label="Start New Session"
          @click="startNewChat"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {copyToClipboard, useQuasar} from 'quasar'
import {saas} from 'src/boot/saas'
import {getChatIdFromUrl, getChatUrlForId, isValidChatId} from 'src/utils/chat'

const q = useQuasar()
const chatIframe = ref(null)
const iframeSrc = ref('')
const iframeKey = ref(0)
const savedChatUrl = ref('')
const chatExpanded = ref(false)
const loadingPreferences = ref(false)
const openingChat = ref(false)
const savingPreference = ref(false)
const showSessionChoices = ref(false)
const showNewSessionConfirmation = ref(false)
const chatTemplate = new URL(saas.chatUrl)
// The user's click should open the conversation, not another launcher.
chatTemplate.searchParams.set('min', '0')
const chatOrigin = chatTemplate.origin

let mounted = true
let preferencesLoaded = false
let syncedChatId = null
let expectedChatId = null
let startingNewChat = false
let openingTimeout = null
let dismissSaveError = null

function syncChatLayout(isOpen) {
  chatExpanded.value = isOpen
  const height = isOpen ? 'min(520px, calc(100dvh - 48px))' : '56px'
  document.documentElement.style.setProperty(
    '--chat-embed-safe-space',
    `calc(${height} + 48px)`
  )
}

function getTrustedChatUrl(value) {
  try {
    const url = new URL(value)
    const chatId = getChatIdFromUrl(url)
    const canonicalUrl = getChatUrlForId(chatId, chatTemplate)
    return canonicalUrl &&
      url.origin === chatOrigin &&
      url.pathname === new URL(canonicalUrl).pathname
      ? canonicalUrl
      : null
  } catch {
    return null
  }
}

async function persistChatId() {
  const chatId = getChatIdFromUrl(savedChatUrl.value)
  if (
    !mounted ||
    !chatId ||
    savingPreference.value ||
    chatId === syncedChatId
  ) {
    return
  }

  savingPreference.value = true
  try {
    await saas.updateUserChatId(chatId)
    if (mounted) {
      syncedChatId = chatId
      dismissSaveError?.()
      dismissSaveError = null
    }
  } catch {
    if (mounted && !dismissSaveError) {
      dismissSaveError = q.notify({
        type: 'negative',
        group: false,
        position: 'top',
        message:
          'Your chat is open, but its session could not be saved to your account.',
        caption:
          'The URL is saved on this device. Retry before starting another session.',
        timeout: 0,
        actions: [
          {label: 'Retry', noDismiss: true, handler: () => void persistChatId()}
        ]
      })
    }
  } finally {
    savingPreference.value = false
  }
}

function openChat(url, isNew = false) {
  showSessionChoices.value = false
  showNewSessionConfirmation.value = false
  startingNewChat = isNew
  expectedChatId = isNew ? null : getChatIdFromUrl(url)
  openingChat.value = true
  iframeKey.value += 1
  iframeSrc.value = url
  syncChatLayout(true)
  clearTimeout(openingTimeout)
  openingTimeout = setTimeout(() => {
    iframeSrc.value = ''
    openingChat.value = false
    syncChatLayout(false)
    q.notify({
      type: 'negative',
      message: 'Chat could not be opened. Please try again.'
    })
  }, 30000)
}

function continueChat() {
  openChat(savedChatUrl.value)
}

function confirmNewChat() {
  showSessionChoices.value = false
  showNewSessionConfirmation.value = true
}

function startNewChat() {
  // Keep the previous preference until the new iframe reports its session ID.
  openChat(chatTemplate.toString(), true)
}

async function copyPreviousChatUrl() {
  try {
    await copyToClipboard(savedChatUrl.value)
    q.notify({type: 'positive', message: 'Previous chat URL copied.'})
  } catch {
    q.notify({
      type: 'negative',
      message:
        'Could not copy the URL. Select and copy it from the field above.'
    })
  }
}

function handleMessage(event) {
  const iframe = chatIframe.value
  if (
    !mounted ||
    !saas.email ||
    !event.data ||
    event.data.source !== 'lnbits-chat-embed' ||
    !iframe ||
    event.source !== iframe.contentWindow ||
    event.origin !== chatOrigin
  ) {
    return
  }

  const nextChatUrl = getTrustedChatUrl(event.data.url)
  if (!nextChatUrl) return

  const nextChatId = getChatIdFromUrl(nextChatUrl)
  if (expectedChatId && nextChatId !== expectedChatId) return
  if (startingNewChat && nextChatId === getChatIdFromUrl(savedChatUrl.value)) {
    return
  }

  clearTimeout(openingTimeout)
  openingChat.value = false
  startingNewChat = false
  expectedChatId = nextChatId
  savedChatUrl.value = nextChatUrl
  localStorage.setItem('chatUrl', nextChatUrl)
  // The iframe already updated its own URL; changing src would reload it.
  void persistChatId()
  syncChatLayout(Boolean(event.data.open))
}

async function handleChatClick() {
  if (loadingPreferences.value || openingChat.value || savingPreference.value) {
    return
  }
  if (iframeSrc.value) {
    await persistChatId()
    if (mounted && getChatIdFromUrl(savedChatUrl.value) === syncedChatId) {
      confirmNewChat()
    }
    return
  }

  if (!preferencesLoaded) {
    loadingPreferences.value = true
    try {
      const {data} = await saas.getUserPreferences()
      if (!mounted || !saas.email) return
      const backendChatId = data?.chat_id ?? null
      if (isValidChatId(backendChatId)) {
        syncedChatId = backendChatId
        savedChatUrl.value = getChatUrlForId(backendChatId, chatTemplate)
        localStorage.setItem('chatUrl', savedChatUrl.value)
      } else if (backendChatId === null || backendChatId === '') {
        savedChatUrl.value =
          getTrustedChatUrl(localStorage.getItem('chatUrl')) || ''
      } else {
        throw new Error('Invalid chat preference')
      }
      preferencesLoaded = true
    } catch {
      if (mounted) {
        q.notify({
          type: 'negative',
          message: 'Could not load your chat session. Please try again.'
        })
      }
      return
    } finally {
      loadingPreferences.value = false
    }
  }

  if (savedChatUrl.value) {
    showSessionChoices.value = true
  } else {
    startNewChat()
  }
}

onMounted(() => {
  syncChatLayout(false)
  window.addEventListener('message', handleMessage)
})

onBeforeUnmount(() => {
  mounted = false
  clearTimeout(openingTimeout)
  dismissSaveError?.()
  window.removeEventListener('message', handleMessage)
  document.documentElement.style.removeProperty('--chat-embed-safe-space')
})
</script>

<style scoped>
.chat-widget {
  position: fixed;
  right: 24px;
  bottom: 24px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  z-index: 2000;
}

.chat-widget__button {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.lnbits-chat-embed-iframe {
  width: min(360px, calc(100vw - 116px));
  height: 56px;
  border: 0;
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
  transition: height 0.2s ease;
  overflow: hidden;
}

.lnbits-chat-embed-iframe--expanded {
  height: min(520px, calc(100dvh - 48px));
}

.chat-session-dialog {
  width: 440px;
  max-width: calc(100vw - 48px);
}
</style>
