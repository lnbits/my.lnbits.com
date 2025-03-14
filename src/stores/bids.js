import {defineStore} from 'pinia'

export const useBidStore = defineStore('bids', {
  state: () => ({
    buying: false,
    identities: new Map(),
    interval: null,
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
    rooms: new Map()
  }),
  getters: {
    getItem(state) {
      return id =>
        state.items.auctions.data.get(id) || state.items.fixedPrice.data.get(id)
    },
    bidHistory: state => id => state.bids.data.get(id) || [],
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
    addRooms(data) {
      data.forEach(room => {
        this.rooms.set(room.id, room)
      })
    }
  }
})
