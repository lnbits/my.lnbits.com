import axios from 'axios'
import {secondsToDhm} from 'src/boot/utils'

const normalizeApiEnv = env => {
  const envValue = Array.isArray(env) ? env[0] : env

  if (envValue === 'local' || envValue === 'dev' || envValue === 'prod') {
    return envValue
  }

  return 'prod'
}

const getApiBaseUrl = apiEnv => {
  if (apiEnv === 'dev') {
    return 'https://api.dev.lnbits.com'
  }

  if (apiEnv === 'local') {
    return '/api'
  }

  return 'https://api.lnbits.com'
}

var saas = {
  slideimg: 'assets/images/hero/bitcoin-accounts.png',
  url: function (path = '') {
    const apiEnv = normalizeApiEnv(localStorage.getItem('apiEnv'))

    return `${getApiBaseUrl(apiEnv)}${path}`
  },
  serverTime: null,
  chatUrl:
    'https://demo.lnbits.com/chat/embed/d5oaTjnA6bk7WhE5wznHwJ?min=1&label=Chat%20to%20us',

  email: localStorage.getItem('email'),

  isTestingMode: function () {
    const env = normalizeApiEnv(localStorage.getItem('apiEnv'))
    return (saas.email === 'alan@lnbits.com') || env === 'dev' || env === 'local'
  },

  signup: async function (email, password, password2) {
    const {data} = await axios({
      method: 'POST',
      url: this.url('/signup'),
      withCredentials: true,
      data: {
        email: email,
        password,
        password_repeat: password2
      }
    })

    localStorage.setItem('email', email)

    return data
  },
  login: async function (email, password) {
    const formData = new FormData()
    formData.append('email', email)
    formData.append('username', email)
    formData.append('password', password)
    const {data} = await axios({
      method: 'POST',
      url: this.url('/login'),
      data: formData,
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    localStorage.setItem('email', email)

    return data
  },
  requestPasswordRecovery: async function (email) {
    const {data} = await axios({
      method: 'POST',
      url: this.url('/password-recovery'),
      withCredentials: true,
      data: {
        email
      }
    })

    return data
  },
  resetPassword: async function (passwordResetCode, password, passwordRepeat) {
    const {data} = await axios({
      method: 'POST',
      url: this.url('/reset-password'),
      withCredentials: true,
      data: {
        password_reset_code: passwordResetCode,
        password,
        password_repeat: passwordRepeat
      }
    })

    return data
  },
  confirmEmail: async function (token) {
    const {data} = await axios({
      method: 'GET',
      url: this.url(`/confirm-email?email_confirmation_token=${token}`),
      withCredentials: true
    })
    localStorage.setItem('email', data.email)

    return data
  },

  createInstance: async function (instanceType, paymentPlan = {}) {
    return axios({
      method: 'POST',
      url: this.url('/instance'),
      withCredentials: true,
      data: {
        instance_type: instanceType,
        domain: paymentPlan.domain || undefined,
        payment_plan_tier: paymentPlan.tier || undefined,
        payment_plan_interval: paymentPlan.interval || undefined
      }
    })
  },

  getInstanceTypes: async function () {
    const response = await axios({
      method: 'GET',
      url: this.url('/instance/types'),
      withCredentials: true
    })

    return response
  },
  getPricing: async function () {
    return axios({
      method: 'GET',
      url: this.url('/pricing'),
      withCredentials: true
    })
  },
  updateInstance: function (id, action) {
    return axios({
      method: 'PUT',
      url: this.url('/instance'),
      withCredentials: true,
      data: {
        action: action,
        instance_id: id
      }
    })
  },

  createOneTimePlan: function (instanceId, planName, quantity, isFiat) {
    return axios({
      method: 'PUT',
      url: this.url('/instance/buy'),
      withCredentials: true,
      data: {
        instance_id: instanceId,
        quantity: quantity,
        payment_plan_name: planName,
        is_fiat: isFiat
      }
    })
  },
  subscribeToPlan: function (instanceId, planName) {
    return axios({
      method: 'PUT',
      url: this.url('/instance/subscribe'),
      withCredentials: true,
      data: {
        instance_id: instanceId,
        payment_plan_name: planName
      }
    })
  },
  unsubscribe: function (instanceId, subscriptionRequestId) {
    return axios({
      method: 'PUT',
      url: this.url('/instance/unsubscribe'),
      withCredentials: true,
      data: {
        instance_id: instanceId,
        subscription_request_id: subscriptionRequestId
      }
    })
  },
  getInstances: async function () {
    const response = await axios({
      method: 'GET',
      url: this.url('/instance'),
      withCredentials: true
    })
    return response
  },
  getUserInstancesLogs: async function () {
    const response = await axios({
      method: 'GET',
      url: this.url('/instance/logs'),
      withCredentials: true
    })

    return response
  },
  getInstancesLogs: async function (id) {
    const response = await axios({
      method: 'GET',
      url: this.url(`/instance/${id}/logs`),
      withCredentials: true
    })

    return response
  },
  getUserPayments: async function () {
    const response = await axios({
      method: 'GET',
      url: this.url('/instance/payments'),
      withCredentials: true
    })

    return response
  },
  getInstancePayments: async function (id) {
    const response = await axios({
      method: 'GET',
      url: this.url(`/instance/${id}/payments`),
      withCredentials: true
    })

    return response
  },
  getUserSubscriptions: async function () {
    const response = await axios({
      method: 'GET',
      url: this.url('/instance/subscriptions'),
      withCredentials: true
    })

    return response
  },
  getInstanceSubscriptions: async function (id) {
    const response = await axios({
      method: 'GET',
      url: this.url(`/instance/${id}/subscriptions`),
      withCredentials: true
    })

    return response
  },
  status: async function () {
    const response = await axios({
      method: 'GET',
      url: this.url(),
      withCredentials: true
    })

    this.serverTime = response.data.timestamp

    return response
  },
  logout: async function () {
    const response = await axios({
      method: 'POST',
      url: this.url('/logout'),
      withCredentials: true
    })
    this.email = null
    localStorage.clear()
    return response
  },

  mapInstance: function (instance) {
    const progress = (start, stop, serverTime) => {
      if (!serverTime) {
        return 0
      }
      if (stop - start <= 0 || stop - serverTime <= 0) {
        return 100
      }

      const percentage = (1 - (stop - serverTime) / (stop - start)) * 100

      return Math.floor(percentage)
    }

    const status = (active, enabled) => {
      if (!active) {
        return 'Not Paid'
      }
      if (!enabled) {
        return 'Disabled'
      }
      return 'Running'
    }

    const timeLeft = Math.floor(
      Math.max(instance.timestamp_stop - this.serverTime, 0)
    )
    return {
      id: instance.id,
      instanceLink: `https://${instance.domain}/wallet`,
      firstInstallLink: `https://${instance.domain}/first_install?token=${instance.installtoken}`,
      installToken: instance.installtoken,
      backupLink: `https://${instance.domain}/admin/api/v1/backup`,
      enabled: instance.is_enabled,
      active: instance.is_active,
      expired: instance.timestamp_stop < this.serverTime,
      name: instance.domain,
      createdDate: new Date(instance.timestamp * 1000).toLocaleString(),
      stopDate: new Date(instance.timestamp_stop * 1000).toLocaleString(),
      timestamp: instance.timestamp,
      timestampStart: instance.timestamp_start,
      timestampStop: instance.timestamp_stop,
      lnurl: instance.lnurl,
      timeLeft: timeLeft,
      timeLeftFormatted: secondsToDhm(timeLeft),
      statusText: status(instance.is_active, instance.is_enabled),
      progress: progress(
        instance.timestamp_start || instance.timestamp,
        instance.timestamp_stop,
        this.serverTime
      )
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

export {normalizeApiEnv, saas}
