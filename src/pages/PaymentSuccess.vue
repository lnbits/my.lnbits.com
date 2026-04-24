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
      <section class="p-hero p-hero--success">
        <div class="p-hero__glow p-hero__glow--a" aria-hidden="true" />
        <div class="p-hero__glow p-hero__glow--b" aria-hidden="true" />

        <div class="p-hero__inner">
          <div class="p-success">
            <div class="p-success__icon">
              <q-icon name="check" size="32px" />
            </div>
            <h1 class="p-hero__h1">Payment Successful</h1>
            <p class="p-hero__sub">
              Please close this tab and return to the previous tab.
            </p>
          </div>
        </div>
      </section>

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
import {computed, onMounted, ref} from 'vue'
import {useQuasar} from 'quasar'
import {saas} from 'boot/saas'

const q = useQuasar()
const darkMode = ref(false)
const isLoggedIn = computed(() => !!saas.email)

onMounted(() => {
  darkMode.value = localStorage.getItem('darkMode') === 'true'
  q.dark.set(darkMode.value)
})
</script>

<style scoped>
.pricing-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(178, 56, 255, 0.18), transparent 30%),
    radial-gradient(circle at bottom right, rgba(255, 79, 216, 0.14), transparent 28%),
    linear-gradient(180deg, #12071b 0%, #0d0917 48%, #09060f 100%);
  color: rgba(244, 238, 255, 0.88);
}

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

.p-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: calc(100vh - 152px);
  padding: 3.2rem 2rem 4rem;
  overflow: hidden;
}

.p-hero--success {
  min-height: calc(100vh - 137px);
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
  width: 100%;
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

.p-success {
  padding: 3rem 2.25rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(16px);
}

.p-success__icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 1.5rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #41c98d, #2ea66f);
  box-shadow: 0 12px 36px rgba(65, 201, 141, 0.28);
}

.p-hero__h1 {
  margin: 0;
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.025em;
  color: #fff;
}

.p-hero__sub {
  margin: 1.25rem auto 0;
  max-width: 36rem;
  font-size: 1.05rem;
  line-height: 1.65;
  color: rgba(244, 238, 255, 0.65);
}

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

@media (max-width: 599px) {
  .p-toolbar {
    padding: 0.5rem 1rem;
  }

  .p-hero {
    min-height: calc(100vh - 144px);
    padding: 2.75rem 1.25rem 3rem;
  }

  .p-hero__glow {
    display: none;
  }

  .p-success {
    padding: 2.25rem 1.4rem;
    border-radius: 20px;
  }

  .p-success__icon {
    width: 64px;
    height: 64px;
    margin-bottom: 1.25rem;
  }

  .p-hero__h1 {
    font-size: 1.8rem;
  }

  .p-hero__sub {
    font-size: 0.95rem;
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
