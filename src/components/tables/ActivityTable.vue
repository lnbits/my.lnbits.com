<template>
  <q-card class="bg-transparent no-shadow no-border q-mb-md" bordered>
    <q-card-section class="q-pa-none">
      <div class="row q-col-gutter-sm">
        <div
          v-for="(item, index) in activityStats"
          :key="index"
          class="col-md-3 col-sm-12 col-xs-12"
        >
          <card-stats
            :title="item.title"
            :icon="item.icon"
            :value="item.value"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
  <q-card class="no-shadow" bordered>
    <q-card-section class="q-pa-none">
      <q-table
        dense
        class="table-bg"
        :rows="data"
        :columns="columns"
        :pagination.sync="pagination"
        title="Instances Activity"
        :loading="inProgress"
      >
        <template v-slot:top-right>
          <q-select
            @update:model-value="showActivty"
            v-model="selectedInstance"
            :options="instances"
            outlined
            dense
            clearable
            label="Select Instance"
          ></q-select>
        </template>
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
</template>

<script>
import {defineComponent} from 'vue'

import {useQuasar} from 'quasar'
import {saas} from 'src/boot/saas'
import CardStats from '../cards/CardStats.vue'

export default defineComponent({
  name: 'TableDarkMode',

  components: {
    CardStats
  },

  data() {
    return {
      data: [],
      instances: [],
      selectedInstance: null,

      activityStats: [
        {
          title: 'Instances',
          icon: 'dns',
          value: 0,
          color1: '#546bfa',
          color2: '#3e51b5'
        },
        {
          title: 'Hours Bought',
          icon: 'timer',
          value: '20',
          color1: '#3a9688',
          color2: '#3e51b5'
        },
        {
          title: 'Sats Paid',
          icon: 'currency_bitcoin',
          value: '321',
          color1: '#7cb342',
          color2: '#3e51b5'
        },
        {
          title: 'Activity Entries',
          icon: 'reorder',
          value: '82',
          color1: '#f88c2b',
          color2: '#3e51b5'
        }
      ],

      pagination: {
        rowsPerPage: 20,
        page: 1
      },
      inProgress: false,
      columns: [
        {
          name: 'success',
          label: '',
          field: 'success',
          sortable: false,
          align: 'center'
        },
        {
          name: 'id',
          label: 'Instance ID',
          field: 'instance_id',
          sortable: true,
          align: 'left'
        },
        {
          name: 'instance_name',
          label: 'Instance Name',
          field: 'instance_name',
          sortable: true,
          align: 'left'
        },
        {
          name: 'name',
          label: 'Action',
          field: 'name',
          sortable: true,
          align: 'left'
        },
        {
          name: 'description',
          label: 'Description',
          field: 'description',
          sortable: true,
          align: 'left'
        },
        {
          name: 'time',
          label: 'Time',
          field: 'time',
          sortable: true,
          align: 'left'
        },
        {
          name: 'cost_sats',
          label: 'Sats',
          field: 'cost_sats',
          sortable: true,
          align: 'left'
        },
        {
          name: 'extra_hours',
          label: 'Hours',
          field: 'extra_hours',
          sortable: true,
          align: 'left'
        }
      ]
    }
  },
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
  methods: {
    fetchUserActivity: async function () {
      try {
        const {data} = await saas.getUserInstancesLogs()
        this.data = this.mapInstanceLogs(data)
      } catch (error) {
        console.warn(error)
        this.q.notify({
          message: 'Failed to fetch activity!',
          caption: saas.mapErrorToString(error),
          color: 'negative'
        })
      }
    },
    fetchInstanceActivity: async function (id) {
      try {
        const {data} = await saas.getInstancesLogs(id)
        this.data = this.mapInstanceLogs(data)
      } catch (error) {
        console.warn(error)
        this.q.notify({
          message: 'Failed to fetch instance activity!',
          caption: saas.mapErrorToString(error),
          color: 'negative'
        })
      }
    },
    fetchUserInstances: async function () {
      try {
        const {data} = await saas.getInstances()
        this.activityStats[0].value = data.length
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
    showActivty: async function (instance) {
      try {
        this.inProgress = true
        if (!instance) {
          await this.fetchUserActivity()
        } else {
          await this.fetchInstanceActivity(instance.value)
        }
      } catch (error) {
      } finally {
        this.inProgress = false
      }
    },
    instanceNameFromId: function (id) {
      const instance = this.instances.find(i => i.value === id)
      if (instance) {
        return instance.name
      }
      return '?'
    },
    mapInstanceLogs: function (logs) {
      this.activityStats[1].value = logs.reduce((t, l) => t + l.extra_hours, 0)
      this.activityStats[2].value = logs.reduce((t, l) => t + l.cost_sats, 0)
      this.activityStats[3].value = logs.length
      return logs
        .map(i => ({
          ...i,
          instance_name: this.instanceNameFromId(i.instance_id),
          time: new Date(i.timestamp * 1000).toLocaleString()
        }))
        .reverse()
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
      this.showActivty(this.selectedInstance)
    } catch (error) {
    } finally {
      this.inProgress = false
    }
  }
})
</script>
