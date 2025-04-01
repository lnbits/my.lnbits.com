import {defineStore} from 'pinia'

export const useBidStore = defineStore('bids', {
  state: () => ({
    buying: false,
    identities: new Map(),
    interval: null,
    bidHistoryInterval: null,
    items: {
      auctions: {
        data: new Map(),
        total: 0
      },
      fixedPrice: {
        data: new Map(),
        total: 0
      }
    },
    rooms: new Map(),
    openTab: 'auction',
    filter: {
      showMineOnly: false,
      showMyBidsOnly: false,
      showCompleted: false
    }
  }),
  getters: {
    getItem(state) {
      return id =>
        state.items.auctions.data.get(id) || state.items.fixedPrice.data.get(id)
    },
    getItemByName: state => name => {
      for (const item of state.items.auctions.data.values()) {
        if (item.name === name) {
          return item
        }
      }
      for (const item of state.items.fixedPrice.data.values()) {
        if (item.name === name) {
          return item
        }
      }
      return null
    },
    isAuction: state => id => state.rooms.get(id).type === 'auction',
    // bidHistory: state => id => state.bids.data.get(id) || [],
    roomByType: state => type => state.rooms.get(type)
  },
  actions: {
    addAuctions({data, total}) {
      data.forEach(item => {
        this.items.auctions.data.set(item.id, item)
      })
      this.items.auctions.total = total
    },
    addFixedPrice({data, total}) {
      data.forEach(item => {
        this.items.fixedPrice.data.set(item.id, item)
      })
      this.items.fixedPrice.total = total
    },
    updateItem(data) {
      if (data.type === 'auction') {
        this.items.auctions.data.set(data.id, data)
      } else {
        this.items.fixedPrice.data.set(data.id, data)
      }
    },
    addRoom(room) {
      this.rooms.set(room.type, room)
    },
    toggleShowMineOnly() {
      this.filters.showMineOnly = !this.filters.showMineOnly
    },
    resetFilters() {
      this.filter.showMineOnly = false
      this.filter.showCompleted = false
    }
  }
})
