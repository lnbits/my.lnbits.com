<template>
  <q-page class="q-pa-sm">
    <div class="q-gutter-y-md">
      <q-card class="no-shadow" bordered>
        <q-card-section class="q-pa-none">
          <q-table
            grid
            flat
            bordered
            hide-header
            class="table-bg subscriptions-table"
            :rows="sortedSubscriptions"
            row-key="subscription_request_id"
            :columns="columns"
            v-model:pagination="pagination"
            title="Subscriptions"
            :loading="inProgress"
          >
            <template v-slot:top-right>
              <q-btn
                @click="showSubscriptions(selectedInstance)"
                label="Refresh"
                color="primary"
                outline
                :loading="inProgress"
              >
                <q-tooltip class="bg-indigo" :offset="[10, 10]">
                  <span> Refresh subscriptions. </span>
                </q-tooltip>
              </q-btn>
            </template>
            <template v-slot:item="props">
              <div class="subscription-cell">
                <q-card
                  class="subscription-card"
                  :class="{'subscription-card--active': props.row.is_enabled}"
                  :data-subscription-id="props.row.subscription_request_id"
                  flat
                  bordered
                >
                  <div class="subscription-card__header">
                    <q-icon name="subscriptions" class="subscription-card__icon" size="20px" />
                    <div class="subscription-card__identity">
                      <router-link
                        :to="{path: '/activity', query: {instance_id: props.row.instance_id}}"
                        :title="props.row.instance_name"
                        class="subscription-card__name"
                      >
                        {{ props.row.instance_name }}
                      </router-link>
                      <div class="subscription-card__plan">
                        {{ formatPlan(props.row.payment_plan_name) }}
                      </div>
                    </div>
                    <span
                      class="subscription-card__status"
                      :class="{'subscription-card__status--active': props.row.is_enabled}"
                    >
                      {{ props.row.is_enabled ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                  <dl class="subscription-card__dates">
                    <div>
                      <dt>Created</dt>
                      <dd>{{ props.row.created_at }}</dd>
                    </div>
                    <div v-if="props.row.ended_at !== '--'">
                      <dt>Ended</dt>
                      <dd>{{ props.row.ended_at }}</dd>
                    </div>
                  </dl>
                  <div v-if="props.row.is_enabled" class="subscription-card__actions">
                    <q-btn
                      @click="requestUnsubscribe(props.row.instance_id, props.row.subscription_request_id)"
                      label="End subscription"
                      color="negative"
                      flat
                      dense
                      no-caps
                      :disable="inProgress"
                    />
                  </div>
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
import {getServiceAddress} from 'src/utils/relays'
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
      columns: []
    }
  },
  computed: {
    sortedSubscriptions() {
      return [...this.subscriptions].sort(
        (a, b) => Number(Boolean(b.is_enabled)) - Number(Boolean(a.is_enabled))
      )
    }
  },
  methods: {
    formatPlan(name) {
      return name
        ? name.replace(/[_-]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
        : 'No payment plan'
    },
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
        await this.showSubscriptions(this.selectedInstance)
      } catch (error) {
        console.warn(error)
        this.$q.notify({
          message: 'Failed to end subscription!',
          caption: saas.mapErrorToString(error),
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
          label: `[${i.id}] ${getServiceAddress(i)}`,
          name: getServiceAddress(i)
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
          caption: saas.mapErrorToString(error),
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
      await this.showSubscriptions(this.selectedInstance)
    } catch (error) {
    } finally {
      this.inProgress = false
    }
  }
})
</script>

<style scoped>
.subscriptions-table :deep(.q-table__grid-content) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  align-items: start;
  gap: 12px;
  padding: 0 24px 24px;
}

.subscription-cell { min-width: 0; }
.subscription-card { padding: 16px; border-radius: 14px; }
.subscription-card.subscription-card--active { border-color: var(--backend-accent-border); }
.subscription-card__header { display: flex; align-items: flex-start; gap: 10px; }
.subscription-card__icon {
  flex: 0 0 auto;
  padding: 8px;
  border-radius: 10px;
  color: var(--q-primary);
  background: var(--backend-tint);
}
.subscription-card__identity { min-width: 0; flex: 1; }
.subscription-card__name {
  display: block;
  color: var(--backend-text);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.subscription-card__name:hover { color: var(--q-primary); }
.subscription-card__name:focus-visible { outline: 2px solid var(--q-primary); outline-offset: 3px; }
.subscription-card__plan { margin-top: 4px; color: var(--backend-muted); font-size: 13px; line-height: 1.4; }
.subscription-card__status {
  flex-shrink: 0;
  border: 1px solid var(--backend-border);
  border-radius: 6px;
  padding: 3px 7px;
  color: var(--backend-muted);
  background: var(--backend-page);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
}
.subscription-card__status--active {
  border-color: var(--backend-accent-border);
  background: var(--backend-tint);
  color: var(--q-primary);
}
.subscription-card__dates { margin: 16px 0 0; font-size: 12px; line-height: 1.5; }
.subscription-card__dates > div { display: flex; justify-content: space-between; gap: 12px; }
.subscription-card__dates > div + div { margin-top: 6px; }
.subscription-card__dates dt { color: var(--backend-muted); }
.subscription-card__dates dd { margin: 0; text-align: right; }
.subscription-card__actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--backend-border);
  margin-top: 12px;
  padding-top: 8px;
}
.subscription-card__actions .q-btn { font-size: 12px; padding: 4px 8px; }

@media (max-width: 599px) {
  .subscriptions-table :deep(.q-table__grid-content) { padding: 0 12px 16px; }
  .subscription-card { padding: 14px; }
}
</style>
