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
      showCompleted: false
    }
  }),
  getters: {
    getItem(state) {
      return id =>
        state.items.auctions.data.get(id) || state.items.fixedPrice.data.get(id)
    },
    isAuction: state => id => state.rooms.get(id).type === 'auction',
    // bidHistory: state => id => state.bids.data.get(id) || [],
    roomByType: state => type => state.rooms.values().find(r => r.type === type)
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
      this.rooms.set(room.id, room)
    },
    toggleShowMineOnly() {
      this.filters.showMineOnly = !this.filters.showMineOnly
    }
  }
})
