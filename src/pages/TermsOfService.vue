<template>
  <q-layout view="lHh Lpr lFf" class="pricing-shell">
    <q-header class="bg-transparent" style="color: inherit">
      <q-toolbar class="q-pa-md">
        <q-toolbar-title>
          <span class="text-subtitle1 text-italic text-weight-light">my</span>
          <span class="q-ml-xs text-weight-bold">Bits</span>
        </q-toolbar-title>
        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn square dense flat to="/" label="Home" icon="dashboard">
            <q-tooltip>Home</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <section class="flex flex-center pricing-hero">
        <div class="pricing-hero__content">
          <div class="text-h2 q-mb-md text-center">
            <span class="text-weight-bold">LN</span>bits
          </div>
          <div class="text-h4 text-center pricing-hero__title">
            Terms of Service
          </div>
          <div class="text-subtitle1 q-pt-sm text-center pricing-hero__subtitle">
            Please review these terms before using the hosted service.
          </div>
        </div>
      </section>
      <section class="pricing-intro">
        <div class="text-h5 text-center">Terms of Service</div>
        <div class="text-subtitle2 text-center pricing-intro__hint">
          This page contains the complete service terms.
        </div>
      </section>
      <section class="q-pa-xl pricing-section">
        <div class="q-mx-auto tos-grid">
          <q-card class="pricing-card no-shadow">
            <q-card-section class="pricing-card__header text-white">
              <div class="text-h6">LNbits SaaS Terms of Service</div>
            </q-card-section>
            <q-card-section class="tos-content" v-html="termsOfServiceHtml" />
          </q-card>
        </div>
      </section>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useQuasar} from 'quasar'
import termsOfServiceMarkdown from '../../terms_of_service.md?raw'

const q = useQuasar()
const darkMode = ref(false)

const escapeHtml = value =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const renderInline = line =>
  escapeHtml(line).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

const markdownToHtml = markdown => {
  const lines = markdown.split('\n')
  const html = []
  let inList = false

  const closeList = () => {
    if (inList) {
      html.push('</ul>')
      inList = false
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      closeList()
      continue
    }

    if (line === '---') {
      closeList()
      html.push('<hr />')
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      closeList()
      const level = headingMatch[1].length
      html.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`)
      continue
    }

    const listMatch = line.match(/^\*\s+(.*)$/)
    if (listMatch) {
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      html.push(`<li>${renderInline(listMatch[1])}</li>`)
      continue
    }

    closeList()
    html.push(`<p>${renderInline(line)}</p>`)
  }

  closeList()
  return html.join('\n')
}

const termsOfServiceHtml = computed(() =>
  markdownToHtml(termsOfServiceMarkdown)
)

onMounted(() => {
  darkMode.value = localStorage.getItem('darkMode') === 'true'
  q.dark.set(darkMode.value)
})
</script>

<style scoped>
.tos-grid {
  max-width: 1080px;
}

.tos-content {
  color: #f4eeff;
  font-size: 0.98rem;
  line-height: 1.65;
}

.tos-content :deep(h1) {
  font-size: 1.8rem;
  line-height: 1.25;
  margin: 0 0 1rem;
}

.tos-content :deep(h2) {
  font-size: 1.35rem;
  line-height: 1.3;
  margin: 1.7rem 0 0.75rem;
}

.tos-content :deep(h3),
.tos-content :deep(h4),
.tos-content :deep(h5),
.tos-content :deep(h6) {
  font-size: 1.1rem;
  margin: 1.2rem 0 0.65rem;
}

.tos-content :deep(p) {
  margin: 0.6rem 0;
  opacity: 0.95;
}

.tos-content :deep(ul) {
  margin: 0.5rem 0 0.9rem;
  padding-left: 1.25rem;
}

.tos-content :deep(li) {
  margin: 0.35rem 0;
}

.tos-content :deep(hr) {
  border: none;
  height: 1px;
  margin: 1.25rem 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
}
</style>
