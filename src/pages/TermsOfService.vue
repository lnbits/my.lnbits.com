<template>
  <q-layout view="lHh Lpr lFf" class="pricing-shell">
    <q-header class="bg-transparent" style="color: inherit">
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
          <q-btn to="/" label="Home" no-caps unelevated size="sm" icon="dashboard" class="tos-nav__btn" />
        </nav>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <section class="tos-section">
        <div class="tos-card">
          <div class="tos-card__header">
            <h1 class="tos-card__title">Terms of Service</h1>
            <p class="tos-card__sub">LNbits SaaS — last updated March 5, 2026</p>
          </div>
          <div class="tos-content" v-html="termsOfServiceHtml" />
        </div>
      </section>

      <div class="tos-back">
        <q-btn
          to="/login"
          label="Back to Sign in"
          no-caps
          flat
          icon="arrow_back"
          class="tos-back__btn"
        />
      </div>

      <footer class="tos-foot">
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
/* ── Toolbar ── */
.tos-toolbar {
  padding: 0.75rem 1.5rem;
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
  color: rgba(244, 238, 255, 0.5);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
  transition: color 150ms;
}
.tos-nav__link:hover {
  color: #fff;
}
.tos-nav__btn {
  border-radius: 10px !important;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.08) !important;
  color: #fff !important;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

/* ── Content ── */
.tos-section {
  padding: 6rem 2rem 4rem;
  max-width: 820px;
  margin: 0 auto;
}

.tos-card {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  overflow: hidden;
}

.tos-card__header {
  padding: 2rem 2.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.tos-card__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

.tos-card__sub {
  margin: 0.35rem 0 0;
  font-size: 0.82rem;
  color: rgba(244, 238, 255, 0.4);
}

.tos-content {
  padding: 2rem 2.5rem 2.5rem;
  color: rgba(244, 238, 255, 0.85);
  font-size: 0.92rem;
  line-height: 1.75;
}

.tos-content :deep(h1) {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.25;
  margin: 2.5rem 0 1rem;
  color: #fff;
}

.tos-content :deep(h2) {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 2rem 0 0.75rem;
  color: #fff;
}

.tos-content :deep(h3),
.tos-content :deep(h4),
.tos-content :deep(h5),
.tos-content :deep(h6) {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 1.5rem 0 0.65rem;
  color: #fff;
}

.tos-content :deep(p) {
  margin: 0.65rem 0;
  color: rgba(244, 238, 255, 0.7);
}

.tos-content :deep(strong) {
  color: rgba(244, 238, 255, 0.9);
  font-weight: 600;
}

.tos-content :deep(ul) {
  margin: 0.5rem 0 1rem;
  padding-left: 1.25rem;
}

.tos-content :deep(li) {
  margin: 0.4rem 0;
  color: rgba(244, 238, 255, 0.65);
}

.tos-content :deep(li::marker) {
  color: var(--q-primary, #b238ff);
}

.tos-content :deep(hr) {
  border: none;
  height: 1px;
  margin: 1.75rem 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
}

/* ── Back link ── */
.tos-back {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
  text-align: center;
}
.tos-back__btn {
  color: rgba(244, 238, 255, 0.5) !important;
  font-weight: 600;
  font-size: 0.88rem;
  border-radius: 10px !important;
}
.tos-back__btn:hover {
  color: #fff !important;
}

/* ── Footer ── */
.tos-foot {
  padding: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.tos-foot__inner {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tos-foot__brand {
  color: rgba(244, 238, 255, 0.5);
}
.tos-foot__nav {
  display: flex;
  gap: 1.5rem;
}
.tos-foot__nav a {
  font-size: 0.82rem;
  color: rgba(244, 238, 255, 0.35);
  text-decoration: none;
  transition: color 150ms;
}
.tos-foot__nav a:hover {
  color: rgba(244, 238, 255, 0.75);
}

/* ── Tablet ── */
@media (max-width: 1023px) {
  .tos-section {
    padding: 5.5rem 1.5rem 3rem;
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
    padding: 0.5rem 1rem;
  }
  .tos-section {
    padding: 4.5rem 1rem 2rem;
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
    font-size: 0.88rem;
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
