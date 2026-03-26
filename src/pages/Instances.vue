<template>
  <q-page class="instances-page q-pa-sm">
    <instances-table :plan="plan"></instances-table>
  </q-page>
</template>

<script>
import {defineComponent, defineAsyncComponent} from 'vue'

export default defineComponent({
  name: 'Instances',
  components: {
    InstancesTable: defineAsyncComponent(() =>
      import('components/tables/InstancesTable.vue')
    )
  },
  data() {
    return {
      plan: null
    }
  },
  created() {
    if (this.$route.query.plan) {
      this.plan = this.$route.query.plan
    }
  }
})
</script>

<style scoped>
.instances-page {
  padding-bottom: 7rem;
}
</style>
