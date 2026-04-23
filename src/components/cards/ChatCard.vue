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

const chatIframe = ref(null)
const chatUrl = ref('')

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

function handleMessage(event) {
  if (!event.data || event.data.source !== 'lnbits-chat-embed') return

  const iframe = chatIframe.value
  if (!iframe) return

  if (event.data.url && event.data.url !== chatUrl.value) {
    chatUrl.value = event.data.url
    localStorage.setItem('chatUrl', chatUrl.value)
    iframe.src = chatUrl.value
  }

  syncChatLayout(Boolean(event.data.open))
}

onMounted(() => {
  const iframe = chatIframe.value
  if (!iframe) return

  chatUrl.value = localStorage.getItem('chatUrl') || saas.chatUrl
  iframe.src = chatUrl.value
  syncChatLayout(false)
  window.addEventListener('message', handleMessage)
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
