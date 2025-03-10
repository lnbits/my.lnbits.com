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
    }
  }),
  getters: {
    getItemByName(state) {
      return name =>
        Array.from(state.items.auctions.data.values()).find(
          item => item.name === name
        ) ||
        Array.from(state.items.fixedPrice.data.values()).find(
          item => item.name === name
        )
    }
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
    addBid(data, id) {
      return
    }
  }
})
