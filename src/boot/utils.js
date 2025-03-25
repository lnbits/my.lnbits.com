import axios from 'axios'
import {Converter} from 'showdown'

function secondsToDhm(seconds) {
  seconds = Number(seconds)
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)

  const dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : ''
  const hDisplay = h > 0 ? h + 'h, ' : ''
  const mDisplay = m > 0 ? m + 'm' : ''

  const text = dDisplay + hDisplay + mDisplay
  return text || '0'
}

function timeFromNow(time) {
  // Get timestamps
  let unixTime = new Date(time).getTime()
  if (!unixTime) return
  let now = new Date().getTime()

  // Calculate difference
  let difference = unixTime / 1000 - now / 1000

  // Setup return object
  let tfn = {}

  // Check if time is in the past, present, or future
  tfn.when = 'now'
  if (difference > 0) {
    tfn.when = 'future'
  } else if (difference < -1) {
    tfn.when = 'past'
  }

  // Convert difference to absolute
  difference = Math.abs(difference)

  // Calculate time unit
  if (difference / (60 * 60 * 24 * 365) > 1) {
    // Years
    tfn.unitOfTime = 'years'
    tfn.time = Math.floor(difference / (60 * 60 * 24 * 365))
  } else if (difference / (60 * 60 * 24 * 45) > 1) {
    // Months
    tfn.unitOfTime = 'months'
    tfn.time = Math.floor(difference / (60 * 60 * 24 * 45))
  } else if (difference / (60 * 60 * 24) > 1) {
    // Days
    tfn.unitOfTime = 'days'
    tfn.time = Math.floor(difference / (60 * 60 * 24))
  } else if (difference / (60 * 60) > 1) {
    // Hours
    tfn.unitOfTime = 'hours'
    tfn.time = Math.floor(difference / (60 * 60))
  } else if (difference / 60 > 1) {
    // Minutes
    tfn.unitOfTime = 'minutes'
    tfn.time = Math.floor(difference / 60)
  } else {
    // Seconds
    tfn.unitOfTime = 'seconds'
    tfn.time = Math.floor(difference)
  }

  // Return time from now data
  if (tfn.when === 'now') {
    return 'just now'
  } else if (tfn.when === 'future') {
    return `${tfn.time} ${tfn.unitOfTime}`
  } else {
    return `${tfn.time} ${tfn.unitOfTime} ago`
  }
}

function timeFromSeconds(seconds) {
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)} minutes`
  }
  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)} hours`
  }
  const d = Math.floor(seconds / 86400)
  return `${d} day${d > 1 ? 's' : ''}`
}

let tags = [
  ['r', 'wss://relay.damus.io'],
  ['r', 'wss://nostr-pub.wellorder.net'],
  ['client', 'coracle']
]

function getTagValues(event, tag) {
  return event.tags.filter(([k, v]) => k == tag).map(([k, v]) => v)
}

function getTagValue(event, tag) {
  return event.tags.find(([k, v]) => k == tag)?.[1]
}

async function markdownToHTML(url) {
  const response = await axios({
    method: 'GET',
    withCredentials: false,
    url
  })

  const converter = new Converter()
  converter.setFlavor('github')
  converter.setOption('simpleLineBreaks', true)
  return converter.makeHtml(response.data)
}

function countDownTimer(target) {
  const timeNow = new Date().getTime()
  const timeDifference = target - timeNow
  if (timeDifference < 0) {
    return {days: 0, hours: 0, minutes: 0, seconds: 0}
  }
  // Time calculations for days, hours, minutes and seconds
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
  const hours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  )
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000)

  return {days, hours, minutes, seconds}
}

function prepareFilterQuery(tableConfig, props) {
  tableConfig.filter = tableConfig.filter || {}
  if (props) {
    tableConfig.pagination = props.pagination
    Object.assign(tableConfig.filter, props.filter)
  }
  const pagination = tableConfig.pagination
  tableConfig.loading = true
  const query = {
    limit: pagination.rowsPerPage,
    offset: (pagination.page - 1) * pagination.rowsPerPage,
    sortby: pagination.sortBy ?? '',
    direction: pagination.descending ? 'desc' : 'asc',
    ...tableConfig.filter
  }
  if (tableConfig.search) {
    query.search = tableConfig.search
  }
  return new URLSearchParams(query)
}

function formatCurrency(value, currency) {
  if (currency === 'sat') {
    return `${value.toLocaleString(window.LOCALE, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })} sats`
  }
  return new Intl.NumberFormat(window.LOCALE, {
    style: 'currency',
    currency: currency || 'sat'
  }).format(value)
}

export {
  secondsToDhm,
  timeFromNow,
  timeFromSeconds,
  getTagValues,
  markdownToHTML,
  countDownTimer,
  prepareFilterQuery,
  formatCurrency
}
