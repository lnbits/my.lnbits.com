<template>
  <q-page class="q-pa-sm">
    <div class="q-gutter-y-md">
      <q-card class="table-bg no-shadow" bordered>
        <q-card-section>
          <div class="row">
            <div class="col-9">
              <div class="text-h6 text-white">
                <span>Payments</span>
              </div>
            </div>
            <div class="col-3">
              <q-select
                @update:model-value="showPayments"
                v-model="selectedInstance"
                :options="instances"
                outlined
                dark
                dense
                clearable
                color="white"
                label="Select Instance"
              ></q-select>
            </div>
          </div>
        </q-card-section>
        <q-linear-progress
          v-if="inProgress"
          indeterminate
          color="secondary"
          class="q-mt-sm"
        />
        <q-separator color="white" />
        <q-card-section class="q-pa-none">
          <q-table
            dark
            dense
            class="table-bg"
            :rows="payments"
            :columns="columns"
            :pagination.sync="pagination"
          >
            <template v-slot:body-cell-success="props">
              <q-td :props="props">
                <q-icon
                  v-if="props.row.success === true"
                  name="done"
                  color="green"
                />
                <q-icon v-else name="warning" color="yellow" />
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
        {name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true},
        {
          name: 'instance_name',
          label: 'Instance',
          field: 'instance_name',
          sortable: true
        },
        {name: 'paid', label: 'Paid', field: 'paid', sortable: true},
        {
          name: 'amount_sats',
          label: 'Amount Sats',
          field: 'amount_sats',
          sortable: true
        },
        {name: 'memo', label: 'Memo', field: 'memo', sortable: true},
        {
          name: 'payment_plan_name',
          label: 'Payment Plan',
          field: 'payment_plan_name',
          sortable: true
        },
        {
          name: 'quantity',
          label: 'Quantity',
          field: 'quantity',
          sortable: true
        },
        {
          name: 'created',
          label: 'Created At',
          field: 'created_at',
          sortable: true
        },
        {name: 'paid', label: 'Paid At', field: 'paid_at', sortable: true}
      ]
    }
  },
  methods: {
    showPayments: async function (instance) {
      try {
        console.log('### show payments', instance)
        this.inProgress = true
        if (!instance) {
          console.log('### fetch user payments 1000')
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
          label: `[${i.id}] ${i.domain}`,
          name: i.domain
        }))
      } catch (error) {
        console.warn(error)
        this.q.notify({
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
          created_at: new Date(i.created_at * 1000).toLocaleString(),
          paid_at: +i.paid_at
            ? new Date(i.paid_at * 1000).toLocaleString()
            : '--'
        }))
      } catch (error) {
        console.warn(error)
        this.$q.notify({
          message: 'Failed to fetch payments!',
          caption: this.saas.mapErrorToString(error),
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
          created_at: new Date(i.created_at * 1000).toLocaleString(),
          paid_at: +i.paid_at
            ? new Date(i.paid_at * 1000).toLocaleString()
            : '--'
        }))
      } catch (error) {
        this.$q.notify({
          message: 'Failed to fetch instance payments!',
          caption: this.saas.mapErrorToString(error),
          color: 'negative',
          icon: 'warning'
        })
      }
    },
    instanceNameFromId: function (id) {
      const instance = this.instances.find(i => i.value === id)
      if (instance) {
        return instance.name
      }
      return '?'
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
      //  || this.instances[0]
      this.showPayments(this.selectedInstance)
    } catch (error) {
    } finally {
      this.inProgress = false
    }
  }
})
</script>

<style></style>
