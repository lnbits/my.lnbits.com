import {onBeforeUnmount, reactive} from 'vue'
import {saas} from 'src/boot/saas'
import {getRelayType} from 'src/utils/relays'

const COOLDOWN_MS = 5 * 60 * 1000
const CHECK_TIMEOUT_MS = 10000

export function useInstanceLifecycle(onCheckError) {
  const pending = reactive({})
  const observedEnabled = reactive({})
  const instances = new Map()
  const timers = new Map()
  const checks = new Map()
  const prefix = `instance-action:${encodeURIComponent(saas.url())}:${encodeURIComponent(saas.email || '')}:`
  let disposed = false

  const key = id => `${prefix}${id}`
  const read = id => {
    try {
      const timestamp = Number(localStorage.getItem(key(id)))
      return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null
    } catch {
      return null
    }
  }
  const remove = (id, timestamp) => {
    try {
      if (read(id) === timestamp) localStorage.removeItem(key(id))
    } catch {
      // The in-memory cooldown still works if browser storage is unavailable.
    }
  }

  function clearLocal(id) {
    clearTimeout(timers.get(id))
    timers.delete(id)
    checks.get(id)?.abort()
    checks.delete(id)
    delete pending[id]
  }

  async function check(id, timestamp) {
    if (disposed || pending[id] !== timestamp || checks.has(id)) return
    const instance = instances.get(id)
    if (!instance) return
    const controller = new AbortController()
    checks.set(id, controller)
    let timeout
    try {
      const result = await Promise.race([
        (async () => {
          // Relays do not serve LNbits' en.js endpoint.
          if (getRelayType(instance)) {
            const {data} = await saas.getInstances()
            const current = data.find(row => String(row.id) === id)
            if (!current) throw new Error('Instance no longer available')
            return current.is_enabled
          }
          const response = await fetch(`https://${instance.name}/static/i18n/en.js`, {
            cache: 'no-store',
            redirect: 'error',
            signal: controller.signal
          })
          if (response.status === 200) return true
          if (response.status === 503) return false
          throw new Error(`Unexpected availability response: ${response.status}`)
        })(),
        new Promise((_, reject) => {
          timeout = setTimeout(() => {
            controller.abort()
            reject(new Error('Availability check timed out'))
          }, CHECK_TIMEOUT_MS)
        })
      ])
      if (!disposed && pending[id] === timestamp) observedEnabled[id] = result
    } catch {
      if (!disposed && pending[id] === timestamp) {
        // A network/CORS failure does not prove that an instance is disabled.
        delete observedEnabled[id]
        onCheckError?.()
      }
    } finally {
      clearTimeout(timeout)
      if (checks.get(id) === controller) checks.delete(id)
      if (!disposed && pending[id] === timestamp) {
        remove(id, timestamp)
        clearLocal(id)
      }
    }
  }

  function schedule(id, timestamp) {
    if (pending[id] === timestamp) return
    clearLocal(id)
    delete observedEnabled[id]
    pending[id] = timestamp
    timers.set(id, setTimeout(() => check(id, timestamp), Math.max(0, timestamp + COOLDOWN_MS - Date.now())))
  }

  function sync(rows) {
    instances.clear()
    rows.forEach(row => {
      const id = String(row.id)
      instances.set(id, row)
      const timestamp = read(id)
      if (timestamp) schedule(id, timestamp)
    })
    Object.keys(pending).forEach(id => {
      if (!instances.has(id)) clearLocal(id)
    })
  }

  function begin(instanceId) {
    const id = String(instanceId)
    const stored = read(id)
    if (stored) schedule(id, stored)
    if (pending[id]) return false
    const timestamp = Date.now()
    schedule(id, timestamp)
    try {
      localStorage.setItem(key(id), String(timestamp))
    } catch {
      // Keep the current tab locked even if storage is unavailable.
    }
    return true
  }

  function cancel(instanceId) {
    const id = String(instanceId)
    remove(id, pending[id])
    clearLocal(id)
  }

  function onStorage(event) {
    for (const id of instances.keys()) {
      if (event.key !== null && event.key !== key(id)) continue
      const timestamp = read(id)
      if (timestamp) schedule(id, timestamp)
      else if (pending[id] && Date.now() >= pending[id] + COOLDOWN_MS) check(id, pending[id])
      else clearLocal(id)
    }
  }

  function onFocus() {
    sync([...instances.values()])
    Object.keys(pending).forEach(id => {
      if (Date.now() >= pending[id] + COOLDOWN_MS) check(id, pending[id])
    })
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener('focus', onFocus)
  onBeforeUnmount(() => {
    disposed = true
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('focus', onFocus)
    Object.keys(pending).forEach(clearLocal)
  })

  return {
    pending, sync, begin, cancel,
    isEnabled: row => observedEnabled[row.id] ?? row.enabled
  }
}
