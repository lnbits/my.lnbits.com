<template>
  <main-layout v-if="isLoggedIn" />
  <router-view v-else />
</template>

<script setup>
import {computed} from 'vue'
import MainLayout from './MainLayout.vue'
import {saas} from 'boot/saas'

const isLoggedIn = computed(() => !!saas.email)
</script>
