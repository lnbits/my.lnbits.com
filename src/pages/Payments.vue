<template>
  <q-page class="q-pa-sm">
    <div class="q-gutter-y-md">
      <q-card class="no-shadow" bordered>
        <q-card-section class="q-pa-none">
          <q-table
            flat
            row-key="id"
            class="table-bg payments-table"
            :rows="payments"
            :columns="columns"
            v-model:pagination="pagination"
            title="Payments"
            :loading="inProgress"
          >
            <template v-slot:top-right>
              <q-select
                @update:model-value="showPayments"
                v-model="selectedInstance"
                :options="instances"
                outlined
                dense
                clearable
                label="Filter by instance or relay"
                class="payments-filter"
                data-testid="payments-filter"
              ></q-select>
            </template>
            <template v-slot:body-cell-id="props">
              <q-td :props="props" class="payment-id">#{{ props.value }}</q-td>
            </template>
            <template v-slot:body-cell-instance_name="props">
              <q-td :props="props">
                <router-link
                  :to="{path: '/activity', query: {instance_id: props.row.instance_id}}"
                  class="payment-instance"
                  :title="props.value"
                >{{ props.value }}</router-link>
              </q-td>
            </template>
            <template v-slot:body-cell-paid="props">
              <q-td :props="props">
                <span class="payment-status" :class="{'payment-status--paid': props.value}">
                  <q-icon :name="props.value ? 'check_circle' : 'schedule'" size="14px" />
                  {{ props.value ? 'Paid' : 'Unpaid' }}
                </span>
              </q-td>
            </template>
            <template v-slot:body-cell-amount_sats="props">
              <q-td :props="props" class="payment-amount">
                {{ formatAmount(props.value) }}
              </q-td>
            </template>
            <template v-slot:body-cell-payment_plan_name="props">
              <q-td :props="props" class="payment-details">
                <div class="payment-plan">
                  {{ formatPlan(props.value) }}
                  <span v-if="props.row.quantity != null" class="payment-quantity">
                    × {{ props.row.quantity }}
                    <q-tooltip>Quantity: {{ props.row.quantity }}</q-tooltip>
                  </span>
                </div>
                <div v-if="props.row.memo" class="payment-memo">{{ props.row.memo }}</div>
              </q-td>
            </template>
            <template v-for="column in ['created', 'paid_at']" :key="column" v-slot:[`body-cell-${column}`]="props">
              <q-td :props="props" class="payment-date">
                <time v-if="props.value" :datetime="dateIso(props.value)">
                  <span>{{ formatDate(props.value) }}</span>
                  <small>{{ formatTime(props.value) }}</small>
                </time>
                <span v-else class="payment-empty">—</span>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import {defineComponent} from 'vue'
import {saas} from 'src/boot/saas'

export default defineComponent({
  name: 'Payments',
  data() {
    return {
      inProgress: false,
      instances: [],
      selectedInstance: null,
      payments: [],
      pagination: {
        rowsPerPage: 20,
        page: 1
      },
      columns: [
        {name: 'id', label: 'Payment', field: 'id', align: 'left', sortable: true},
        {name: 'instance_name', label: 'Instance / Relay', field: 'instance_name', align: 'left', sortable: true},
        {name: 'paid', label: 'Status', field: 'paid', align: 'left', sortable: true},
        {name: 'amount_sats', label: 'Amount (sats)', field: 'amount_sats', align: 'right', sortable: true},
        {name: 'payment_plan_name', label: 'Details', field: 'payment_plan_name', align: 'left', sortable: true},
        {name: 'created', label: 'Created', field: 'created_at', align: 'left', sortable: true},
        {name: 'paid_at', label: 'Paid at', field: 'paid_at', align: 'left', sortable: true}
      ]
    }
  },
  methods: {
    formatAmount(value) {
      return Number(value).toLocaleString()
    },
    formatPlan(value) {
      return value
        ? value.replace(/[_-]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
        : 'No payment plan'
    },
    dateIso(value) {
      return new Date(value * 1000).toISOString()
    },
    formatDate(value) {
      return new Date(value * 1000).toLocaleDateString(undefined, {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    },
    formatTime(value) {
      return new Date(value * 1000).toLocaleTimeString()
    },
    showPayments: async function (instance) {
      try {
        this.inProgress = true
        this.pagination.page = 1
        if (!instance) {
          await this.fetchUserPayments()
        } else {
          await this.fetchInstancePayments(instance.value)
        }
      } catch (error) {
      } finally {
        this.inProgress = false
      }
    },
    fetchUserInstances: async function () {
      try {
        const {data} = await saas.getInstances()
        this.instances = data.map(i => ({
          value: i.id,
          label: `[${i.id}] ${i.relay_url || i.domain}`,
          name: i.relay_url || i.domain
        }))
      } catch (error) {
        console.warn(error)
        this.$q.notify({
          message: 'Failed to fetch instances!',
          caption: saas.mapErrorToString(error),
          color: 'negative'
        })
      }
    },
    fetchUserPayments: async function () {
      try {
        const {data} = await saas.getUserPayments()
        this.payments = data.map(i => ({
          ...i,
          instance_name: this.instanceNameFromId(i.instance_id),
          created_at: Number(i.created_at) || null,
          paid_at: Number(i.paid_at) || null
        }))
      } catch (error) {
        console.warn(error)
        this.$q.notify({
          message: 'Failed to fetch payments!',
          caption: saas.mapErrorToString(error),
          color: 'negative',
          icon: 'warning'
        })
      }
    },
    fetchInstancePayments: async function (id) {
      try {
        const {data} = await saas.getInstancePayments(id)
        this.payments = data.map(i => ({
          ...i,
          instance_name: this.instanceNameFromId(i.instance_id),
          created_at: Number(i.created_at) || null,
          paid_at: Number(i.paid_at) || null
        }))
      } catch (error) {
        this.$q.notify({
          message: 'Failed to fetch instance payments!',
          caption: saas.mapErrorToString(error),
          color: 'negative',
          icon: 'warning'
        })
      }
    },
    instanceNameFromId: function (id) {
      const instance = this.instances.find(i => i.value === id)
      if (instance?.name) {
        return instance.name
      }
      return id ? `Instance ${id}` : 'Unavailable instance'
    }
  },
  async created() {
    try {
      this.inProgress = true
      await this.fetchUserInstances()
      const urlParams = new URLSearchParams(window.location.search)

      this.selectedInstance = this.instances.find(
        i => `${i.value}` === urlParams.get('instance_id')
      )
      await this.showPayments(this.selectedInstance)
    } catch (error) {
    } finally {
      this.inProgress = false
    }
  }
})
</script>

<style scoped>
.payments-filter { width: 260px; }
.payments-table :deep(.q-table) { min-width: 1040px; }
.payments-table :deep(.q-table th) { padding-block: 14px; background: var(--backend-page); }
.payments-table :deep(.q-table tbody td) { padding: 14px 16px; height: 76px; font-size: 13px; }
.payments-table :deep(.q-table tbody td:first-child) { padding-left: 28px; }
.payments-table :deep(.q-table tbody td:last-child) { padding-right: 28px; }
.payments-table :deep(.q-table tbody tr:hover td) { background: var(--backend-hover); }
.payment-id { color: var(--backend-muted); font-variant-numeric: tabular-nums; }
.payment-instance {
  display: block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  color: var(--backend-text);
  text-decoration: none;
}
.payment-instance:hover { color: var(--q-primary); }
.payment-instance:focus-visible { outline: 2px solid var(--q-primary); outline-offset: 3px; }
.payment-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--backend-muted);
  background: var(--backend-page);
  border: 1px solid var(--backend-border);
}
.payment-status--paid {
  color: var(--q-primary);
  background: var(--backend-tint);
  border-color: var(--backend-accent-border);
}
.payment-amount { font-weight: 600; font-variant-numeric: tabular-nums; }
.payment-details { min-width: 220px; max-width: 320px; white-space: normal; }
.payment-plan { font-weight: 600; line-height: 1.5; }
.payment-quantity { margin-left: 6px; color: var(--backend-muted); font-weight: 400; white-space: nowrap; }
.payment-memo { margin-top: 4px; color: var(--backend-muted); font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; }
.payment-date time { display: flex; flex-direction: column; gap: 4px; font-variant-numeric: tabular-nums; }
.payment-date small { color: var(--backend-muted); font-size: 12px; }
.payment-empty { color: var(--backend-muted); }

@media (max-width: 599px) {
  .payments-filter { width: 100%; }
  .payments-table :deep(.q-table__top) { align-items: stretch; }
  .payments-table :deep(.q-table__top > .q-table__separator) { display: none; }
  .payments-table :deep(.q-table__top > .q-table__control:last-child) { width: 100%; }
}
</style>
