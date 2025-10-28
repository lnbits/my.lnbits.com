<template>
  <q-page class="q-pa-sm">
    <div class="q-gutter-y-md">
      <q-card class="table-bg no-shadow" bordered>
        <q-card-section>
          <div class="row">
            <div class="col-9">
              <div class="text-h6 text-white">
                <span>Subscriptions</span>
              </div>
            </div>
            <div class="col-3">
              <q-select
                @update:model-value="showSubscriptions"
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
            grid
            flat
            bordered
            card-class="bg-primary text-white"
            hide-header
            class="table-bg"
            :rows="subscriptions"
            :columns="columns"
            :pagination.sync="pagination"
          >
            <template v-slot:item="props">
              <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
                <q-card class="my-card" flat bordered>
                  <q-list dense>
                    <q-item
                      v-for="col in props.cols.filter(
                        col => col.name !== 'desc'
                      )"
                      :key="col.name"
                    >
                      <q-item-section>
                        <q-item-label>
                          <span v-text="col.label"></span>
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-item-label caption>
                          <q-btn
                            v-if="col.field === 'instance_name'"
                            type="a"
                            :href="`/activity?instance_id=${props.row.id}`"
                            :label="props.row.instance_name"
                            no-caps
                            flat
                            dense
                          >
                            <q-tooltip class="bg-indigo" :offset="[10, 10]">
                              <span
                                v-text="
                                  `Show activity for instance ${props.row.id}`
                                "
                              >
                              </span>
                            </q-tooltip>
                          </q-btn>

                          <span v-else v-text="col.value"></span
                        ></q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <q-separator />
                  <q-card-section
                    class="flex flex-center"
                    :style="{fontSize: props.row.calories / 2 + 'px'}"
                  >
                    <q-btn
                      v-if="props.row.is_enabled"
                      @click="
                        requestUnsubscribe(
                          props.row.instance_id,
                          props.row.subscription_request_id
                        )
                      "
                      label="End Subscription"
                      color="negative"
                      outline
                    >
                      <q-tooltip class="bg-indigo" :offset="[10, 10]">
                        <span> Unsubscribe. </span>
                      </q-tooltip>
                    </q-btn>
                    <q-btn v-else flat> </q-btn>
                  </q-card-section>
                </q-card>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import {useQuasar} from 'quasar'
import {defineComponent} from 'vue'
import {saas} from 'src/boot/saas'

export default defineComponent({
  name: 'Subscriptions',
  setup() {
    const $q = useQuasar()

    return {
      q: $q,
      confirm(title, message) {
        return $q.dialog({
          title,
          message,
          cancel: true,
          persistent: true
        })
      }
    }
  },
  data() {
    return {
      inProgress: false,
      instances: [],
      selectedInstance: null,
      subscriptions: [],
      pagination: {
        rowsPerPage: 20,
        page: 1
      },
      columns: [
        {
          name: 'instance_name',
          label: 'Instance',
          field: 'instance_name',
          sortable: true
        },
        {
          name: 'is_enabled',
          label: 'Enabled',
          field: 'is_enabled',
          sortable: true
        },

        {
          name: 'payment_plan_name',
          label: 'Payment Plan',
          field: 'payment_plan_name',
          sortable: true
        },

        {
          name: 'created',
          label: 'Created At',
          field: 'created_at',
          sortable: true
        },
        {name: 'ended_at', label: 'Ended At', field: 'ended_at', sortable: true}
      ]
    }
  },
  methods: {
    requestUnsubscribe: async function (instanceId, subscriptionRequestId) {
      this.confirm('You are about to end this subscription.').onOk(async () => {
        await this.unsubscribe(instanceId, subscriptionRequestId)
      })
    },
    unsubscribe: async function (instanceId, subscriptionRequestId) {
      try {
        this.inProgress = true
        await saas.unsubscribe(instanceId, subscriptionRequestId)
        this.$q.notify({
          message: 'Subscription ended',
          color: 'positive',
          icon: 'check_circle'
        })
        this.showSubscriptions(this.selectedInstance)
      } catch (error) {
        console.warn(error)
        this.$q.notify({
          message: 'Failed to end subscription!',
          caption: this.saas.mapErrorToString(error),
          color: 'negative',
          icon: 'warning'
        })
      } finally {
        this.inProgress = false
      }
    },
    showSubscriptions: async function (instance) {
      try {
        this.inProgress = true
        if (!instance) {
          await this.fetchUserSubscriptions()
        } else {
          await this.fetchInstanceSubscriptions(instance.value)
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
    fetchUserSubscriptions: async function () {
      try {
        const {data} = await saas.getUserSubscriptions()
        this.subscriptions = data.map(i => ({
          ...i,
          instance_name: this.instanceNameFromId(i.instance_id),
          created_at: new Date(i.created_at * 1000).toLocaleString(),
          ended_at: +i.ended_at
            ? new Date(i.ended_at * 1000).toLocaleString()
            : '--'
        }))
      } catch (error) {
        console.warn(error)
        this.$q.notify({
          message: 'Failed to fetch subscriptions!',
          caption: this.saas.mapErrorToString(error),
          color: 'negative',
          icon: 'warning'
        })
      }
    },
    fetchInstanceSubscriptions: async function (id) {
      try {
        const {data} = await saas.getInstanceSubscriptions(id)
        this.subscriptions = data.map(i => ({
          ...i,
          instance_name: this.instanceNameFromId(i.instance_id),
          created_at: new Date(i.created_at * 1000).toLocaleString(),
          ended_at: +i.ended_at
            ? new Date(i.ended_at * 1000).toLocaleString()
            : '--'
        }))
      } catch (error) {
        this.$q.notify({
          message: 'Failed to fetch instance subscriptions!',
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
      this.showSubscriptions(this.selectedInstance)
    } catch (error) {
    } finally {
      this.inProgress = false
    }
  }
})
</script>

<style scoped>
.bg-custom {
  background: #26a69a;
  background: linear-gradient(
    145deg,
    var(--q-secondary) 0%,
    rgba(237, 178, 83, 1) 190%
  );
}
</style>
