import { useQuasar } from 'quasar'

export function useNotify() {
  const $q = useQuasar()

  const notifySuccess = (message, options = {}) => {
    $q.notify({
      type: 'positive',
      message,
      icon: 'check_circle',
      position: 'top-right',
      timeout: 3000,
      actions: [
        {
          icon: 'close',
          color: 'white',
          round: true,
          handler: () => {}
        }
      ],
      ...options
    })
  }

  const notifyError = (message, options = {}) => {
    $q.notify({
      type: 'negative',
      message,
      icon: 'error',
      position: 'top-right',
      timeout: 5000,
      actions: [
        {
          icon: 'close',
          color: 'white',
          round: true,
          handler: () => {}
        }
      ],
      ...options
    })
  }

  const notifyWarning = (message, options = {}) => {
    $q.notify({
      type: 'warning',
      message,
      icon: 'warning',
      position: 'top-right',
      timeout: 4000,
      actions: [
        {
          icon: 'close',
          color: 'white',
          round: true,
          handler: () => {}
        }
      ],
      ...options
    })
  }

  const notifyInfo = (message, options = {}) => {
    $q.notify({
      type: 'info',
      message,
      icon: 'info',
      position: 'top-right',
      timeout: 3000,
      actions: [
        {
          icon: 'close',
          color: 'white',
          round: true,
          handler: () => {}
        }
      ],
      ...options
    })
  }

  const notifyProgress = (message, options = {}) => {
    return $q.notify({
      type: 'ongoing',
      message,
      icon: 'cloud_upload',
      position: 'bottom-right',
      timeout: 0, // Don't auto-dismiss
      spinner: true,
      actions: [
        {
          icon: 'close',
          color: 'white',
          round: true,
          handler: () => {}
        }
      ],
      ...options
    })
  }

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyProgress
  }
}
