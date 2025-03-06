import {defineStore} from 'pinia'

export const useBidStore = defineStore('bids', {
  state: () => ({
    buying: false,
    identities: new Map(),
    interval: null,
    buyNows: [],
    auctions: []
  }),
  getters: {},
  actions: {
    addBid(data, id) {
      return
    }
  }
})
