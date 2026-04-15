<template>
  <q-page class="instances-page q-pa-sm">
    <instances-table
      :plan="plan"
      :tier="tier"
      :billing="billing"
      :funding="funding"
    ></instances-table>
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
      plan: null,
      tier: null,
      billing: null,
      funding: null
    }
  },
  created() {
    if (this.$route.query.plan) {
      this.plan = this.$route.query.plan
    }
    if (this.$route.query.tier) {
      this.tier = this.$route.query.tier
    }
    if (this.$route.query.billing) {
      this.billing = this.$route.query.billing
    }
    if (this.$route.query.funding) {
      this.funding = this.$route.query.funding
    }
  }
})
</script>

<style scoped>
.instances-page {
  padding-bottom: 7rem;
}
</style>
