<template>
  <component
    :is="isLoggedIn ? QPage : QLayout"
    :class="isLoggedIn ? 'public-info-page' : 'public-info-shell'"
    v-bind="isLoggedIn ? {} : {view: 'lHh Lpr lFf'}"
  >
    <q-header v-if="!isLoggedIn">
      <q-toolbar class="p-toolbar">
        <router-link to="/login" class="p-logo">
          <img src="/profile.svg" alt="LNbits" class="p-logo__img" />
          <span class="p-logo__text">
            <span class="text-italic" style="font-weight: 300; font-size: 0.88rem"
              >my</span
            ><span class="q-ml-xs" style="font-weight: 700">LNbits</span>
          </span>
        </router-link>
        <q-space />
        <nav class="p-nav">
          <router-link to="/login" class="p-nav__link gt-xs">Sign in</router-link>
          <q-btn
            to="/login"
            label="Get Started"
            no-caps
            unelevated
            size="md"
            class="p-nav__cta"
          />
        </nav>
      </q-toolbar>
    </q-header>

    <component :is="isLoggedIn ? 'div' : QPageContainer">
      <!-- ━━━━━━ HERO ━━━━━━ -->
      <section v-if="!isLoggedIn" class="p-hero">
        <div class="p-hero__inner">
          <h1 class="p-hero__h1">
            Launch LNbits in minutes
          </h1>
          <p class="p-hero__sub">Pick a plan. Cancel anytime. Includes daily backups.</p>
        </div>
      </section>

      <!-- ━━━━━━ PLANS ━━━━━━ -->
      <section class="p-plans" :class="{'p-plans--account': isLoggedIn}">
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
            v-for="plan in pricingData"
            :key="plan.title"
            class="p-plans__cell"
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
      <footer v-if="!isLoggedIn" class="p-foot">
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
    </component>
  </component>
</template>

<script setup>
import CardPricing from 'src/components/cards/CardPricing.vue'
import {
  getPricingPlans,
  mapInstanceTypesToImageOptions
} from 'src/utils/pricing'
import {computed, onMounted, ref} from 'vue'
import {QLayout, QPage, QPageContainer} from 'quasar'
import {usePublicTheme} from 'src/composables/usePublicTheme'
import {saas} from 'boot/saas'

usePublicTheme()
const isLoggedIn = computed(() => !!saas.email)
const pricingData = ref([])
const fundingOptions = ref([])
const pricingLoading = ref(true)
const pricingError = ref('')

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
.p-toolbar {
  min-height: 68px;
  padding: 12px 24px;
}

.p-logo, .p-foot__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--backend-text);
  text-decoration: none;
}

.p-logo__img { width: 36px; height: 36px; object-fit: contain; }
.p-foot__logo { width: 28px; height: 28px; object-fit: contain; }
.p-nav, .p-foot__nav { display: flex; align-items: center; gap: 24px; }

.p-nav__link, .p-foot__nav a {
  color: var(--backend-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.p-nav__link:hover, .p-foot__nav a:hover { color: var(--q-primary); }

.p-nav__cta {
  background: var(--backend-tint);
  color: var(--q-primary);
  border: 1px solid var(--backend-accent-border);
}

.p-hero { padding: 56px 24px 32px; text-align: center; }
.p-hero__inner { max-width: 800px; margin: 0 auto; }

.p-hero__h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.03em;
}

.p-hero__sub {
  margin: 16px 0 0;
  font-size: 16px;
  line-height: 1.6;
  color: var(--backend-muted);
}

.p-plans { padding: 0 32px 48px; container-type: inline-size; }
.p-plans--account { padding-top: 32px; }
.p-plans__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  max-width: 1440px;
  margin: 0 auto;
  align-items: stretch;
}

.p-plans__cell { min-width: 0; }
.p-plans__status {
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px;
  text-align: center;
  color: var(--backend-muted);
  background: var(--backend-surface);
  border: 1px solid var(--backend-border);
  border-radius: 18px;
}

.p-sh {
  margin: 0;
  font-size: clamp(24px, 2.5vw, 30px);
  line-height: 1.3;
  font-weight: 600;
  text-align: center;
  letter-spacing: -0.02em;
}

.p-sh-sub {
  margin: 12px 0 0;
  text-align: center;
  font-size: 15px;
  color: var(--backend-muted);
}

.p-incl { padding: 32px 32px 56px; }
.p-incl__wrap { max-width: 1120px; margin: 0 auto; }
.p-incl__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.p-incl__card {
  padding: 24px;
  border-radius: 18px;
  background: var(--backend-surface);
  border: 1px solid var(--backend-border);
}

.p-incl__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--backend-tint);
  border: 1px solid var(--backend-accent-border);
  color: var(--q-primary);
  margin-bottom: 16px;
}

.p-incl__label { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
.p-incl__desc { font-size: 14px; line-height: 1.6; color: var(--backend-muted); }
.p-faq { padding: 24px 32px 64px; }
.p-faq__wrap { max-width: 800px; margin: 0 auto; }
.p-faq__list { margin-top: 32px; display: flex; flex-direction: column; gap: 12px; }

.p-faq__item {
  border-radius: 14px;
  background: var(--backend-surface);
  border: 1px solid var(--backend-border);
  overflow: hidden;
}

.p-faq__item :deep(.q-item) {
  color: var(--backend-text);
  font-weight: 600;
  font-size: 15px;
  padding: 20px 24px;
}

.p-faq__item :deep(.q-item__section--side) { color: var(--backend-muted); }
.p-faq__a { padding: 20px 24px; border-top: 1px solid var(--backend-border); }
.p-faq__a p { margin: 0; font-size: 14px; line-height: 1.75; color: var(--backend-muted); }
.p-faq__a p + p { margin-top: 12px; }
.p-foot { padding: 24px 32px; border-top: 1px solid var(--backend-border); }
.p-foot__inner { max-width: 1440px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 24px; }

@media (max-width: 1199px) {
  .p-plans__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@container (max-width: 1100px) {
  .p-plans__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 799px) {
  .p-incl__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 599px) {
  .p-toolbar { min-height: 56px; padding: 8px 16px; }
  .p-hero { padding: 32px 16px 24px; }
  .p-hero__sub { font-size: 14px; }
  .p-plans { padding: 0 16px 32px; }
  .p-plans--account { padding-top: 16px; }
  .p-plans__grid { grid-template-columns: 1fr; gap: 16px; }
  .p-incl { padding: 24px 16px 32px; }
  .p-incl__grid { grid-template-columns: 1fr; gap: 16px; margin-top: 24px; }
  .p-incl__card { border-radius: 14px; padding: 20px; }
  .p-faq { padding: 24px 16px 40px; }
  .p-faq__item :deep(.q-item), .p-faq__a { padding: 16px; }
  .p-foot { padding: 24px 16px; }
  .p-foot__inner { flex-direction: column; }
  .p-foot__nav { flex-wrap: wrap; justify-content: center; gap: 20px; }
}
</style>
