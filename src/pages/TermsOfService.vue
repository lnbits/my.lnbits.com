<template>
  <component
    :is="isLoggedIn ? QPage : QLayout"
    :class="isLoggedIn ? 'public-info-page' : 'public-info-shell'"
    v-bind="isLoggedIn ? {} : {view: 'lHh Lpr lFf'}"
  >
    <q-header v-if="!isLoggedIn">
      <q-toolbar class="tos-toolbar">
        <router-link to="/login" class="tos-logo">
          <img src="/profile.svg" alt="LNbits" class="tos-logo__img" />
          <span class="tos-logo__text">
            <span class="text-italic" style="font-weight: 300; font-size: 0.88rem"
              >my</span
            ><span class="q-ml-xs" style="font-weight: 700">LNbits</span>
          </span>
        </router-link>
        <q-space />
        <nav class="tos-nav">
          <router-link to="/pricing" class="tos-nav__link gt-xs">Pricing</router-link>
          <router-link to="/login" class="tos-nav__link gt-xs">Sign in</router-link>
          <q-btn to="/" label="Home" no-caps unelevated size="md" icon="dashboard" class="tos-nav__btn" />
        </nav>
      </q-toolbar>
    </q-header>

    <component :is="isLoggedIn ? 'div' : QPageContainer">
      <section class="tos-section">
        <div class="tos-card">
          <div class="tos-card__header">
            <h1 class="tos-card__title">Terms of Service</h1>
            <p class="tos-card__sub">LNbits SaaS — last updated March 5, 2026</p>
          </div>
          <div class="tos-content" v-html="termsOfServiceHtml" />
        </div>
      </section>

      <div v-if="!isLoggedIn" class="tos-back">
        <q-btn
          to="/login"
          label="Back to Sign in"
          no-caps
          flat
          icon="arrow_back"
          class="tos-back__btn"
        />
      </div>

      <footer v-if="!isLoggedIn" class="tos-foot">
        <div class="tos-foot__inner">
          <span class="tos-foot__brand">
            <span class="text-italic" style="font-weight: 300; font-size: 0.82rem">my</span><span class="q-ml-xs" style="font-weight: 700">LNbits</span>
          </span>
          <nav class="tos-foot__nav">
            <a href="https://lnbits.com" target="_blank" rel="noopener">LNbits.com</a>
            <a href="https://docs.lnbits.com" target="_blank" rel="noopener">Docs</a>
            <router-link to="/pricing">Pricing</router-link>
          </nav>
        </div>
      </footer>
    </component>
  </component>
</template>

<script setup>
import {computed} from 'vue'
import {QLayout, QPage, QPageContainer} from 'quasar'
import {saas} from 'boot/saas'
import {usePublicTheme} from 'src/composables/usePublicTheme'
import termsOfServiceMarkdown from '../../terms_of_service.md?raw'

usePublicTheme()
const isLoggedIn = computed(() => !!saas.email)

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
</script>

<style scoped>
/* ── Toolbar ── */
.tos-toolbar {
  min-height: 68px;
  padding: 12px 24px;
}
.tos-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: inherit;
}
.tos-logo__img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}
.tos-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.tos-nav__link {
  color: var(--backend-muted);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
  transition: color 150ms;
}
.tos-nav__link:hover {
  color: var(--backend-text);
}
.tos-nav__btn {
  background: var(--backend-tint);
  color: var(--q-primary);
  border: 1px solid var(--backend-accent-border);
}

/* ── Content ── */
.tos-section {
  padding: 48px 32px 32px;
  max-width: 960px;
  margin: 0 auto;
}

.tos-card {
  border-radius: 18px;
  background: var(--backend-surface);
  border: 1px solid var(--backend-border);
  overflow: hidden;
}

.tos-card__header {
  padding: 32px 40px;
  background: var(--backend-tint);
  border-bottom: 1px solid var(--backend-border);
}

.tos-card__title {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  color: var(--backend-text);
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.tos-card__sub {
  margin: 12px 0 0;
  font-size: 14px;
  color: var(--backend-muted);
}

.tos-content {
  padding: 2rem 2.5rem 2.5rem;
  color: var(--backend-muted);
  font-size: 16px;
  line-height: 1.75;
}

.tos-content :deep(h1) {
  font-size: 26px;
  font-weight: 600;
  line-height: 1.25;
  margin: 2.5rem 0 1rem;
  color: var(--backend-text);
}

.tos-content :deep(h2) {
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 2rem 0 0.75rem;
  color: var(--backend-text);
}

.tos-content :deep(h3),
.tos-content :deep(h4),
.tos-content :deep(h5),
.tos-content :deep(h6) {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 1.5rem 0 0.65rem;
  color: var(--backend-text);
}

.tos-content :deep(p) {
  margin: 0.65rem 0;
  color: var(--backend-muted);
}

.tos-content :deep(strong) {
  color: var(--backend-text);
  font-weight: 600;
}

.tos-content :deep(ul) {
  margin: 0.5rem 0 1rem;
  padding-left: 1.25rem;
}

.tos-content :deep(li) {
  margin: 0.4rem 0;
  color: var(--backend-muted);
}

.tos-content :deep(li::marker) {
  color: var(--q-primary);
}

.tos-content :deep(hr) {
  border: none;
  height: 1px;
  margin: 1.75rem 0;
  background: var(--backend-border);
}

.tos-content :deep(> :first-child) {
  margin-top: 0;
}

/* ── Back link ── */
.tos-back {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
  text-align: center;
}
.tos-back__btn {
  color: var(--backend-muted) !important;
  font-weight: 600;
  font-size: 0.88rem;
  border-radius: 10px !important;
}
.tos-back__btn:hover {
  color: var(--backend-text) !important;
}

/* ── Footer ── */
.tos-foot {
  padding: 2rem;
  border-top: 1px solid var(--backend-border);
}
.tos-foot__inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tos-foot__brand {
  color: var(--backend-muted);
}
.tos-foot__nav {
  display: flex;
  gap: 1.5rem;
}
.tos-foot__nav a {
  font-size: 14px;
  color: var(--backend-muted);
  text-decoration: none;
  transition: color 150ms;
}
.tos-foot__nav a:hover {
  color: var(--q-primary);
}

/* ── Tablet ── */
@media (max-width: 1023px) {
  .tos-section {
    padding: 32px 24px;
  }
  .tos-card__header {
    padding: 1.75rem 2rem 1.25rem;
  }
  .tos-content {
    padding: 1.75rem 2rem 2rem;
  }
}

/* ── Mobile ── */
@media (max-width: 599px) {
  .tos-toolbar {
    min-height: 56px;
    padding: 8px 16px;
  }
  .tos-section {
    padding: 24px 16px;
  }
  .tos-card {
    border-radius: 14px;
  }
  .tos-card__header {
    padding: 1.5rem 1.25rem 1.25rem;
  }
  .tos-card__title {
    font-size: 1.25rem;
  }
  .tos-content {
    padding: 1.25rem 1.25rem 1.75rem;
    font-size: 15px;
  }
  .tos-foot__inner {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  .tos-foot__nav {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
