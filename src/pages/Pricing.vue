<template>
  <q-layout view="lHh Lpr lFf" class="pricing-shell">
    <q-header class="bg-transparent" style="color: inherit">
      <q-toolbar class="p-toolbar">
        <router-link :to="isLoggedIn ? '/' : '/login'" class="p-logo">
          <img src="/profile.svg" alt="LNbits" class="p-logo__img" />
          <span class="p-logo__text">
            <span class="text-italic" style="font-weight: 300; font-size: 0.88rem"
              >my</span
            ><span class="q-ml-xs" style="font-weight: 700">LNbits</span>
          </span>
        </router-link>
        <q-space />
        <nav class="p-nav">
          <template v-if="isLoggedIn">
            <router-link to="/" class="p-nav__link gt-xs">Dashboard</router-link>
            <q-btn
              to="/instances"
              label="My Instances"
              no-caps
              unelevated
              size="md"
              class="p-nav__cta"
            />
          </template>
          <template v-else>
            <router-link to="/login" class="p-nav__link gt-xs">Sign in</router-link>
            <q-btn
              to="/login"
              label="Get Started"
              no-caps
              unelevated
              size="md"
              class="p-nav__cta"
            />
          </template>
        </nav>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <!-- ━━━━━━ HERO ━━━━━━ -->
      <section class="p-hero">
        <div class="p-hero__glow p-hero__glow--a" aria-hidden="true" />
        <div class="p-hero__glow p-hero__glow--b" aria-hidden="true" />

        <div class="p-hero__inner">
          <h1 class="p-hero__h1">
            Launch LNbits in minutes
          </h1>
          <p class="p-hero__sub">Pick a plan. Cancel anytime. Includes daily backups.</p>
        </div>
      </section>

      <!-- ━━━━━━ PLANS ━━━━━━ -->
      <section class="p-plans">
        <div v-if="pricingLoading" class="p-plans__status">
          Loading pricing...
        </div>
        <div v-else-if="pricingError" class="p-plans__status">
          {{ pricingError }}
        </div>
        <div v-else-if="pricingData.length === 0" class="p-plans__status">
          No pricing plans are available right now.
        </div>
        <div v-else class="p-plans__grid">
          <div
            v-for="(plan, idx) in pricingData"
            :key="plan.title"
            class="p-plans__cell"
            :class="{
              'p-plans__cell--pop': plan.featured,
              'p-plans__cell--badged': Boolean(plan.badge)
            }"
            :style="{'--i': idx}"
          >
            <card-pricing
              v-bind="plan"
              :logged-in="isLoggedIn"
              :funding-options="fundingOptions"
            />
          </div>
        </div>
      </section>

      <!-- ━━━━━━ EVERYTHING INCLUDED ━━━━━━ -->
      <section class="p-incl">
        <div class="p-incl__wrap">
          <h2 class="p-sh">Benefits of the LNbits ecosystem</h2>
          <p class="p-sh-sub">
            Every plan gives you the full LNbits experience
          </p>
          <div class="p-incl__grid">
            <div
              v-for="feat in features"
              :key="feat.label"
              class="p-incl__card"
            >
              <div class="p-incl__icon">
                <q-icon :name="feat.icon" size="22px" />
              </div>
              <div class="p-incl__label">{{ feat.label }}</div>
              <div class="p-incl__desc">{{ feat.desc }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ━━━━━━ FAQ ━━━━━━ -->
      <section class="p-faq">
        <div class="p-faq__wrap">
          <h2 class="p-sh">Frequently asked questions</h2>
          <div class="p-faq__list">
            <q-expansion-item
              v-for="(item, i) in faqs"
              :key="i"
              :label="item.q"
              class="p-faq__item"
              dense
            >
              <div class="p-faq__a">
                <p v-for="(para, j) in item.a" :key="j">{{ para }}</p>
              </div>
            </q-expansion-item>
          </div>
        </div>
      </section>

      <!-- ━━━━━━ FOOTER ━━━━━━ -->
      <footer class="p-foot">
        <div class="p-foot__inner">
          <div class="p-foot__brand">
            <img src="/profile.svg" alt="" class="p-foot__logo" />
            <span>
              <span
                class="text-italic"
                style="font-weight: 300; font-size: 0.82rem"
                >my</span
              ><span class="q-ml-xs" style="font-weight: 700">LNbits</span>
            </span>
          </div>
          <nav class="p-foot__nav">
            <a href="https://lnbits.com" target="_blank" rel="noopener"
              >LNbits.com</a
            >
            <a href="https://docs.lnbits.com" target="_blank" rel="noopener"
              >Docs</a
            >
            <a
              href="https://github.com/lnbits/lnbits"
              target="_blank"
              rel="noopener"
              >GitHub</a
            >
            <router-link to="/terms-of-service">Terms</router-link>
          </nav>
        </div>
      </footer>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import CardPricing from 'src/components/cards/CardPricing.vue'
import {
  getPricingPlans,
  mapInstanceTypesToImageOptions
} from 'src/utils/pricing'
import {computed, onMounted, ref} from 'vue'
import {useQuasar} from 'quasar'
import {saas} from 'boot/saas'

const q = useQuasar()
const darkMode = ref(false)
const isLoggedIn = computed(() => !!saas.email)
const pricingData = ref([])
const fundingOptions = ref([])
const pricingLoading = ref(true)
const pricingError = ref('')

onMounted(() => {
  darkMode.value = localStorage.getItem('darkMode') === 'true'
  q.dark.set(darkMode.value)
})

onMounted(async () => {
  try {
    pricingData.value = await getPricingPlans()
  } catch (error) {
    console.warn(error)
    pricingError.value = 'We could not load pricing right now.'
  } finally {
    pricingLoading.value = false
  }

  if (!isLoggedIn.value) {
    return
  }

  try {
    const {data: instanceTypes} = await saas.getInstanceTypes()
    fundingOptions.value = mapInstanceTypesToImageOptions(instanceTypes)
  } catch (error) {
    console.warn(error)
    fundingOptions.value = []
  }
})

const features = [
  {
    icon: 'bolt',
    label: 'Lightning Payments',
    desc: 'Send and receive Bitcoin over Lightning instantly with minimal fees'
  },
  {
    icon: 'widgets',
    label: '60+ Extensions',
    desc: 'Point of Sale, Tipping, Paywall, Invoicing, and many more built-in tools'
  },
  {
    icon: 'api',
    label: 'Full API Access',
    desc: 'Complete RESTful API with documentation for every feature and endpoint'
  },
  {
    icon: 'speed',
    label: 'High Performance',
    desc: 'Optimized infrastructure for low-latency payments and high throughput'
  },
  {
    icon: 'support_agent',
    label: 'Community Support',
    desc: 'Active open-source community, comprehensive docs, and Telegram group'
  },
  {
    icon: 'palette',
    label: 'White-label Ready',
    desc: 'Custom branding, theming, and domain support for your business'
  }
]

const faqs = [
  {
    q: 'Can I cancel my subscription anytime?',
    a: [
      'Yes. There are no long-term commitments. You can cancel your subscription at any time and your instance will remain active until the end of your current billing period.'
    ]
  },
  {
    q: 'What payment methods do you accept?',
    a: [
      'We accept Bitcoin (on-chain and Lightning) and PayPal. You can choose payment methods on our behalf.'
    ]
  },
  {
    q: 'Can I change plans?',
    a: [
      'Soon! We are working on it. For now you would need to create a new instance'
    ]
  },
  {
    q: 'Is there a free trial?',
    a: [
      "We don't offer a free trial, but hourly and weekly billing give you a low-commitment way to test things before settling into a longer billing cycle.",
      'Every tier is designed to launch quickly, and you can choose the billing cadence that best fits how long you expect to run your instance.'
    ]
  },
  {
    q: 'What happens when my subscription expires?',
    a: [
      'Your instance data is preserved for 30 days after expiration. During this period you can renew your subscription to restore full access. After 30 days data will be permanently deleted.'
    ]
  },
  {
    q: 'Can I run multiple instances?',
    a: [
      'Yes. Each subscription covers one LNbits instance, but you can create multiple subscriptions from the same account to run as many instances as you need.'
    ]
  }
]
</script>

<style scoped>
/* ──────────────────────────────────
   TOOLBAR / NAV
   ────────────────────────────────── */
.p-toolbar {
  padding: 0.75rem 1.5rem;
}

.p-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: inherit;
  transition: opacity 150ms;
}
.p-logo:hover {
  opacity: 0.85;
}
.p-logo__img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.p-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.p-nav__link {
  color: rgba(244, 238, 255, 0.5);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
  transition: color 150ms;
}
.p-nav__link:hover {
  color: #fff;
}
.p-nav__cta {
  background: linear-gradient(
    135deg,
    var(--q-primary, #b238ff),
    var(--q-secondary, #6d3cff)
  ) !important;
  border-radius: 10px !important;
  font-weight: 700;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 18px rgba(178, 56, 255, 0.2);
  transition: box-shadow 200ms, transform 150ms;
}
.p-nav__cta:hover {
  box-shadow: 0 6px 26px rgba(178, 56, 255, 0.35);
  transform: translateY(-1px);
}

/* ──────────────────────────────────
   HERO
   ────────────────────────────────── */
.p-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3.2rem 2rem 1rem;
  overflow: hidden;
}

.p-hero__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.25;
  pointer-events: none;
  will-change: transform;
}
.p-hero__glow--a {
  width: 520px;
  height: 520px;
  top: -12%;
  left: 12%;
  background: radial-gradient(
    circle,
    rgba(178, 56, 255, 0.55),
    transparent 70%
  );
  animation: p-glow-drift 18s ease-in-out infinite alternate;
}
.p-hero__glow--b {
  width: 420px;
  height: 420px;
  bottom: -8%;
  right: 8%;
  background: radial-gradient(
    circle,
    rgba(255, 79, 216, 0.45),
    transparent 70%
  );
  animation: p-glow-drift 22s ease-in-out infinite alternate-reverse;
}
@keyframes p-glow-drift {
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(30px, -20px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .p-hero__glow {
    animation: none;
  }
}

.p-hero__inner {
  position: relative;
  z-index: 1;
  max-width: 720px;
  animation: p-fade-up 600ms ease-out;
}

@keyframes p-fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.p-hero__h1 {
  margin: 0;
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.025em;
  color: #fff;
}

.p-accent {
  background: linear-gradient(135deg, #b238ff, #ff4fd8 55%, #6d3cff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.p-hero__sub {
  margin: 1.25rem auto 0;
  max-width: 760px;
  font-size: 1.05rem;
  line-height: 1.65;
  color: rgba(244, 238, 255, 0.55);
  padding-bottom: 1rem;
}

/* ──────────────────────────────────
   PLANS GRID
   ────────────────────────────────── */
.p-plans {
  padding: 1.75rem 2rem 4rem;
}

.p-plans__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  max-width: 1280px;
  margin: 0 auto;
  align-items: stretch;
}

.p-plans__status {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem;
  text-align: center;
  color: rgba(244, 238, 255, 0.72);
}

.p-plans__cell {
  opacity: 0;
  animation: p-card-in 550ms ease forwards;
  animation-delay: calc(var(--i) * 120ms);
}

.p-plans__cell--pop {
  z-index: 1;
}

@keyframes p-card-in {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ──────────────────────────────────
   ON-DEMAND BANNER
   ────────────────────────────────── */
.p-ondemand {
  max-width: 1060px;
  margin: 1.5rem auto 0;
}

.p-ondemand__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.25rem 1.75rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 3px solid var(--q-accent, #ff4fd8);
}

.p-ondemand__left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.p-ondemand__icon {
  color: var(--q-accent, #ff4fd8);
  flex-shrink: 0;
}

.p-ondemand__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
}

.p-ondemand__desc {
  font-size: 0.8rem;
  line-height: 1.5;
  color: rgba(244, 238, 255, 0.45);
  margin-top: 0.15rem;
}

.p-ondemand__right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-shrink: 0;
}

.p-ondemand__price {
  text-align: right;
  white-space: nowrap;
}

.p-ondemand__amount {
  font-size: 1.3rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}

.p-ondemand__interval {
  font-size: 0.82rem;
  color: rgba(244, 238, 255, 0.4);
  margin-left: 0.2rem;
}

.p-ondemand__btn {
  border-radius: 10px !important;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08) !important;
  color: #fff !important;
  border: 1px solid rgba(255, 255, 255, 0.12);
  white-space: nowrap;
  transition: background 200ms, border-color 200ms;
}
.p-ondemand__btn:hover {
  background: rgba(255, 255, 255, 0.13) !important;
  border-color: rgba(255, 255, 255, 0.22);
}

/* ──────────────────────────────────
   SECTION TYPOGRAPHY
   ────────────────────────────────── */
.p-sh {
  margin: 0;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 700;
  color: #fff;
  text-align: center;
  letter-spacing: -0.01em;
}

.p-sh-sub {
  margin: 0.5rem 0 0;
  text-align: center;
  font-size: 0.95rem;
  color: rgba(244, 238, 255, 0.45);
}

/* ──────────────────────────────────
   FEATURES INCLUDED
   ────────────────────────────────── */
.p-incl {
  padding: 5rem 2rem;
}

.p-incl__wrap {
  max-width: 1060px;
  margin: 0 auto;
}

.p-incl__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 3rem;
}

.p-incl__card {
  padding: 1.25rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition: border-color 200ms, background 200ms;
}
.p-incl__card:hover {
  border-color: rgba(178, 56, 255, 0.25);
  background: rgba(255, 255, 255, 0.055);
}

.p-incl__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(178, 56, 255, 0.1);
  color: var(--q-primary, #b238ff);
  margin-bottom: 0.75rem;
}

.p-incl__label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.3rem;
}

.p-incl__desc {
  font-size: 0.78rem;
  line-height: 1.55;
  color: rgba(244, 238, 255, 0.45);
}

/* ──────────────────────────────────
   FAQ
   ────────────────────────────────── */
.p-faq {
  padding: 3rem 2rem 5rem;
}

.p-faq__wrap {
  max-width: 720px;
  margin: 0 auto;
}

.p-faq__list {
  margin-top: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.p-faq__item {
  border-radius: 16px !important;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.07);
  overflow: hidden;
  transition: border-color 200ms, background 200ms;
}
.p-faq__item:hover {
  border-color: rgba(178, 56, 255, 0.2);
  background: rgba(255, 255, 255, 0.045);
}

.p-faq__item :deep(.q-item) {
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 1.15rem 1.5rem;
  min-height: auto;
  letter-spacing: -0.005em;
}

.p-faq__item :deep(.q-item__section--side) {
  color: rgba(244, 238, 255, 0.35);
  padding-left: 1rem;
}

.p-faq__a {
  padding: 0 1.5rem 1.5rem;
  padding-left: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin: 0 0.5rem;
  padding-top: 1rem;
}

.p-faq__a p {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.75;
  color: rgba(244, 238, 255, 0.6);
}

.p-faq__a p + p {
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.06);
}

/* ──────────────────────────────────
   BOTTOM CTA
   ────────────────────────────────── */
.p-cta {
  padding: 4rem 2rem;
  text-align: center;
}

.p-cta__wrap {
  max-width: 560px;
  margin: 0 auto;
  padding: 3rem 2.5rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.p-cta__h {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
}

.p-cta__sub {
  margin: 0.75rem 0 0;
  font-size: 0.95rem;
  color: rgba(244, 238, 255, 0.5);
}

.p-cta__btn {
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  border-radius: 12px !important;
  font-weight: 700;
  font-size: 0.95rem;
  background: linear-gradient(
    135deg,
    var(--q-primary, #b238ff),
    var(--q-secondary, #6d3cff)
  ) !important;
  box-shadow: 0 4px 20px rgba(178, 56, 255, 0.25);
  transition: box-shadow 200ms, transform 150ms;
}
.p-cta__btn:hover {
  box-shadow: 0 6px 30px rgba(178, 56, 255, 0.4);
  transform: translateY(-1px);
}

/* ──────────────────────────────────
   FOOTER
   ────────────────────────────────── */
.p-foot {
  padding: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.p-foot__inner {
  max-width: 1060px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.p-foot__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(244, 238, 255, 0.5);
}

.p-foot__logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.p-foot__nav {
  display: flex;
  gap: 1.5rem;
}

.p-foot__nav a {
  font-size: 0.82rem;
  color: rgba(244, 238, 255, 0.35);
  text-decoration: none;
  transition: color 150ms;
}
.p-foot__nav a:hover {
  color: rgba(244, 238, 255, 0.75);
}

/* ──────────────────────────────────
   TABLET (600–1023 px)
   ────────────────────────────────── */
@media (max-width: 1023px) {
  .p-toolbar {
    padding: 0.6rem 1.25rem;
  }

  .p-hero {
    padding: 3.35rem 1.5rem 0.75rem;
  }
  .p-hero__h1 {
    font-size: 2.2rem;
  }
  .p-hero__sub {
    font-size: 0.95rem;
  }
  .p-plans {
    padding: 1.5rem 1.5rem 3.5rem;
  }
  .p-plans__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0;
  }

  .p-ondemand__inner {
    padding: 1rem 1.25rem;
  }
  .p-ondemand__desc {
    display: none;
  }

  .p-incl {
    padding: 3.5rem 1.5rem;
  }
  .p-incl__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .p-faq {
    padding: 2.5rem 1.5rem 4rem;
  }
}

/* ──────────────────────────────────
   MOBILE (< 600 px)
   ────────────────────────────────── */
@media (max-width: 599px) {
  .p-toolbar {
    padding: 0.5rem 1rem;
  }

  .p-hero {
    padding: 2.95rem 1.25rem 0.75rem;
  }
  .p-hero__h1 {
    font-size: 1.65rem;
  }
  .p-hero__sub {
    font-size: 0.9rem;
    margin-top: 1rem;
    padding-bottom: 0.85rem;
  }
  .p-hero__glow {
    display: none;
  }

  .p-plans {
    padding: 1.25rem 1.25rem 3rem;
  }
  .p-plans__grid {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
    gap: 1.25rem;
  }
  .p-plans__cell--badged {
    padding-top: 2.15rem;
  }

  .p-ondemand__inner {
    flex-direction: column;
    text-align: center;
    padding: 1.25rem;
  }
  .p-ondemand__left {
    flex-direction: column;
  }
  .p-ondemand__right {
    flex-direction: column;
    gap: 0.75rem;
  }
  .p-ondemand__price {
    text-align: center;
  }
  .p-ondemand__desc {
    display: block;
  }
  .p-ondemand__btn {
    width: 100%;
  }

  .p-incl {
    padding: 3rem 0;
  }
  .p-incl__wrap > .p-sh,
  .p-incl__wrap > .p-sh-sub {
    padding: 0 1.25rem;
  }
  .p-incl__grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    gap: 0.75rem;
    padding: 0 1.25rem;
    scrollbar-width: none;
  }
  .p-incl__grid::-webkit-scrollbar {
    display: none;
  }
  .p-incl__card {
    min-width: 240px;
    max-width: 260px;
    flex-shrink: 0;
    scroll-snap-align: start;
  }

  .p-faq {
    padding: 2rem 1.25rem 3rem;
  }

  .p-cta {
    padding: 2rem 1.25rem;
  }
  .p-cta__wrap {
    padding: 2rem 1.5rem;
  }
  .p-cta__h {
    font-size: 1.3rem;
  }

  .p-foot__inner {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  .p-foot__nav {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
