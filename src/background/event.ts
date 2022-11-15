import { getNoticeCount } from './apis'
import job from './schedule'
import { onMessage } from './utils'

const formatText = (count: number) => {
  if (count === 0) {
    return ''
  }
  return String(count)
}

export const noticeBadge = () => {
  const fetchCount = async () => {
    const countInfo = await getNoticeCount()
    chrome.action.setBadgeText({ text: formatText(countInfo.total) })
  }
  chrome.action.setBadgeBackgroundColor({
    color: '#cb0004'
  })
  fetchCount()

  onMessage('set-badge-bg', (params) => {
    chrome.action.setBadgeText({ text: formatText(params.total) })
  })

  onMessage('refresh-badge-bg', () => {
    fetchCount()
  })

  job.register(fetchCount)
}
