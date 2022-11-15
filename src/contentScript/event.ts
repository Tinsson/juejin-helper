import { sendMessage } from './utils'

export const monitorBadgeFresh = () => {
  const triggerPath = [
    '/notification',
    '/notification/digg',
    '/notification/follow',
    '/notification/im',
    '/notification/system'
  ]
  if (window.location.host === 'juejin.cn') {
    if (triggerPath.includes(window.location.pathname)) {
      sendMessage('fresh-badge-bg', {})
    }
  }
}
