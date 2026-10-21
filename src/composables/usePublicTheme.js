import {onBeforeUnmount, onMounted} from 'vue'
import {useQuasar} from 'quasar'
import {saas} from 'boot/saas'

// Public information pages share the dashboard palette, including popup menus.
export function usePublicTheme() {
  const q = useQuasar()
  // MainLayout owns the theme throughout signed-in navigation.
  if (saas.email) return

  onMounted(() => {
    const storedDarkMode = localStorage.getItem('darkMode')
    q.dark.set(storedDarkMode === null || storedDarkMode === 'true')
    document.body.classList.add('backend-ui')
  })

  onBeforeUnmount(() => {
    document.body.classList.remove('backend-ui')
  })
}
