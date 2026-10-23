<template>
  <q-page class="q-pa-sm">
    <div class="q-gutter-y-md">
      <q-card class="no-shadow" bordered>
        <q-card-section class="q-pa-none">
          <q-table
            dense
            flat
            row-key="id"
            class="table-bg compact-table payments-table"
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
                class="table-instance-filter"
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
                <span class="payment-status">
                  <q-icon :name="props.value ? 'done' : 'schedule'" :color="props.value ? 'green' : 'grey'" size="14px" />
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
                <span v-if="props.row.memo" class="payment-memo" :title="props.row.memo">{{ props.row.memo }}</span>
              </q-td>
            </template>
            <template v-for="column in ['created', 'paid_at']" :key="column" v-slot:[`body-cell-${column}`]="props">
              <q-td :props="props" class="payment-date">
                <time v-if="props.value" :datetime="dateIso(props.value)">
                  {{ formatDate(props.value) }}
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
import {getServiceAddress} from 'src/utils/relays'
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
      return new Date(value * 1000).toLocaleString()
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
          label: `[${i.id}] ${getServiceAddress(i)}`,
          name: getServiceAddress(i)
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
.payments-table :deep(.q-table) { min-width: 1040px; }
.payment-id { font-variant-numeric: tabular-nums; }
.payment-instance {
  display: block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
  color: var(--backend-text);
  text-decoration: none;
}
.payment-instance:hover { color: var(--q-primary); }
.payment-instance:focus-visible { outline: 2px solid var(--q-primary); outline-offset: 3px; }
.payment-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--backend-text);
}
.payment-amount { font-variant-numeric: tabular-nums; }
.payment-details { min-width: 220px; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.payment-plan { display: inline; }
.payment-quantity { margin-left: 6px; color: var(--backend-muted); font-weight: 400; white-space: nowrap; }
.payment-memo { margin-left: 10px; color: var(--backend-muted); }
.payment-date time { font-variant-numeric: tabular-nums; white-space: nowrap; }
.payment-empty { color: var(--backend-muted); }

</style>
