<template>
  <q-layout class="public-auth-shell">
    <q-page-container>
      <q-page class="public-auth-page">
        <!-- Left panel — branding & info (hidden on mobile) -->
        <div class="public-auth-left">
          <img src="/images/slide_2.jpg" alt="" class="public-auth-left__bg" />
          <img src="/images/slide_3.jpg" alt="" class="public-auth-left__bg" />
          <div class="public-auth-left__overlay" />

          <div class="public-auth-left__content">
            <slot name="hero" />
          </div>
        </div>

        <!-- Right panel — form -->
        <div class="public-auth-right">
          <div class="public-auth-form-wrap">
            <div class="public-auth-form-badge">
              <img src="/profile.svg" alt="LNbits" />
            </div>
            <div class="public-auth-form-inner">
              <slot />
            </div>
          </div>

          <footer class="public-auth-footer">
            <router-link to="/pricing" class="public-auth-footer-pricing">See full pricing &rarr;</router-link>
            <p>
              <a href="https://lnbits.org" target="_blank" rel="noopener">LNbits</a>
              &middot;
              <a href="https://docs.lnbits.org" target="_blank" rel="noopener">Docs</a>
              &middot;
              <a href="https://github.com/lnbits/lnbits" target="_blank" rel="noopener">GitHub</a>
            </p>
          </footer>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'PublicAuthShell'
})
</script>
