import axios from 'axios'

// if (!process.env.DEV) {
axios.defaults.withCredentials = true
// }

const saas = {
  domain: process.env.domainID,
  auctionID: process.env.auctionID,
  fixedPriceID: process.env.fixedPriceID,
  url: process.env.apiUrl,
  serverTime: null,

  username: localStorage.getItem('username'),

  signup: async function (username, password, password2) {
    const {data} = await axios({
      method: 'POST',
      url: `${this.url}/api/v1/auth/register`,
      data: {
        username,
        password,
        password_repeat: password2
      }
    })

    this.username = username
    localStorage.setItem('username', username)

    return data
  },
  login: async function (username, password) {
    const {data} = await axios({
      method: 'POST',
      url: `${this.url}/api/v1/auth`,
      data: {
        username,
        password
      }
    })

    this.username = username
    localStorage.setItem('username', username)

    return data
  },
  logout: async function () {
    const response = await axios({
      method: 'POST',
      url: `${this.url}/api/v1/auth/logout`
    })
    this.username = null
    localStorage.clear()
    return response
  },
  getAccountDetails: async function () {
    const response = await axios({
      method: 'GET',
      url: `${this.url}/api/v1/auth`
    })
    return response
  },
  getAuthenticatedUser: async function () {
    const response = await axios({
      method: 'GET',
      url: `${this.url}/api/v1/auth`
    })

    return response
  },
  updateUserPassword: async function (data) {
    const response = await axios({
      method: 'PUT',
      url: `${this.url}/api/v1/auth/password`,
      data: {...data}
    })
    return response
  },

  // NIP05
  queryIdentifier: async function (identifier) {
    const response = await axios({
      method: 'GET',
      url: `${this.url}/nostrnip5/api/v1/domain/${this.domain}/search?q=${identifier}`
    })
    return response
  },
  getUserIdentities: async function ({localPart, active} = {}) {
    let url = `${this.url}/nostrnip5/api/v1/user/addresses`

    const response = await axios({
      method: 'GET',
      url,
      params: {
        local_part: localPart,
        active
      }
    })

    return response
  },
  updateIdentity: async function (addressId, data) {
    const response = await axios({
      method: 'PUT',
      url: `${this.url}/nostrnip5/api/v1/user/domain/${this.domain}/address/${addressId}`,
      data
    })

    return response
  },
  deleteIdentity: async function (addressId) {
    const response = await axios({
      method: 'DELETE',
      url: `${this.url}/nostrnip5/api/v1/user/domain/${this.domain}/address/${addressId}`
    })

    return response
  },
  createIdentity: async function (data, createInvoice = false) {
    // todo: extract object
    const response = await axios({
      method: 'POST',
      url: `${this.url}/nostrnip5/api/v1/user/domain/${this.domain}/address`,
      data: {
        domain_id: this.domain,
        local_part: data.identifier,
        pubkey: data.pubkey || '',
        years: data.years,
        promo_code: data.promo_code,
        referer: data.referer,
        create_invoice: createInvoice
      }
    })

    return response
  },
  checkIdentityPayment: async function (paymentHash) {
    const response = await axios({
      method: 'GET',
      url: `${this.url}/nostrnip5/api/v1/user/domain/${this.domain}/payments/${paymentHash}`
    })

    return response
  },

  updateLNaddress: async function (addressId, data) {
    const response = await axios({
      method: 'PUT',
      url: `${this.url}/nostrnip5/api/v1/user/domain/${this.domain}/address/${addressId}/lnaddress`,
      data
    })

    return response
  },

  // AUCTIONS
  getRoomInfo: async function (roomID) {
    const response = await axios({
      method: 'GET',
      url: `${this.url}/auction_house/api/v1/auction_room/${roomID}`
    })

    return response
  },
  getAuctions: async function (params = {}) {
    if (!this.auctionID) {
      return {data: {data: [], total: 0}}
    }
    // get auctions
    const response = await axios({
      method: 'GET',
      url: `${this.url}/auction_house/api/v1/items/${this.auctionID}/paginated`,
      params: params
    })
    return response
  },

  getFixedPrice: async function (params = {}) {
    if (!this.fixedPriceID) {
      return {data: {data: [], total: 0}}
    }
    const response = await axios({
      method: 'GET',
      url: `${this.url}/auction_house/api/v1/items/${this.fixedPriceID}/paginated`,
      params: params
    })
    return response
  },

  getItem: async function (itemID) {
    const response = await axios({
      method: 'GET',
      url: `${this.url}/auction_house/api/v1/items/${itemID}`
    })
    return response
  },

  getBidHistory: async function (roomID, params = {}) {
    const response = await axios({
      method: 'GET',
      url: `${this.url}/auction_house/api/v1/bids/${roomID}/paginated`,
      params: params
    })

    return response
  },

  sellIdentifier: async function (data) {
    // /api/v1/{auction_room_id}/items
    const roomID = data.type === 'auction' ? this.auctionID : this.fixedPriceID
    const response = await axios({
      method: 'POST',
      url: `${this.url}/auction_house/api/v1/items/${roomID}`,
      data: {
        name: data.name,
        ask_price: +data.price,
        transfer_code: data.transfer_code
      }
    })

    return response
  },

  createBid: async function (itemID, data) {
    const response = await axios({
      method: 'PUT',
      url: `${this.url}/auction_house/api/v1/bids/${itemID}`,
      data: {
        amount: data.amount,
        memo: data.memo,
        ln_address: data.ln_address
      }
    })
    console.log(response)
    return response
  },

  mapAddressToProfile(address) {
    return {
      id: address.id,
      active: address.active,
      name: address.local_part,
      pubkey: address.pubkey,
      relays: address.extra.relays,
      ln_address: address.extra.ln_address,
      expiresAt: address.expires_at
    }
  },

  mapErrorToString(error) {
    const data = error.response?.data
    if (!data) {
      return
    }
    if (typeof data === 'string') {
      return data
    }
    if (typeof data.detail === 'string') {
      return data.detail
    }
    return data?.detail?.map(d => d.msg).join(', ')
  }
}

;(async () => {
  axios.interceptors.response.use(
    response => response,
    err => {
      if (err?.response?.status === 401) {
        saas.logout()
        if (window.location.pathname !== '/login') {
          setTimeout(() => (window.location.href = '/login'), 500)
        }
      }
      return Promise.reject(err)
    }
  )
})()

export {saas}
