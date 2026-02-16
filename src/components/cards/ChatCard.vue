<template>
  <div id="lnbits-chat-embed-root">
    <iframe
      id="lnbits-chat-embed-iframe"
      ref="chatIframe"
      src="https://v1.lnbits.com/chat/embed/d5oaTjnA6bk7WhE5wznHwJ?min=1&label=Chat%20to%20us"
      style="
        position: fixed;
        right: 24px;
        bottom: 24px;
        width: 360px;
        height: 64px;
        border: 0;
        border-radius: 12px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
        z-index: 9999;
        transition: height 0.2s ease;
        overflow: hidden;
      "
    ></iframe>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'

const chatIframe = ref(null)

onMounted(() => {
  const iframe = chatIframe.value
  if (!iframe) return
  const minHeight = 56
  const maxHeight = 520
  window.addEventListener('message', function (event) {
    if (!event.data || event.data.source !== 'lnbits-chat-embed') return
    iframe.style.height = event.data.open ? maxHeight + 'px' : minHeight + 'px'
  })
})
</script>
