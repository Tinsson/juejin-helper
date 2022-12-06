import type { ISearchItem } from '~/popup/type'
import dayjs from 'dayjs'

export const getLocalObj = (keyName: string) => {
  const localStr = localStorage.getItem(keyName)
  if (!localStr) {
    return false
  }
  return JSON.parse(localStr)
}

export const setLocalObj = (keyName: string, data: Record<string, any>) => {
  localStorage.setItem(keyName, JSON.stringify(data))
}

export const sendMessage = (taskId: string, params: any) => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        taskId,
        params
      },
      (result) => {
        resolve(result)
      }
    )
  })
}

export const formatChromeHistoryItem = (
  searchWords: string,
  origin: chrome.history.HistoryItem[]
): ISearchItem[] => {
  const reg = new RegExp(`(${searchWords})`, 'gi')
  return origin.map((i) => {
    return {
      id: i.id,
      title: i.title.replace(reg, '<em>$1</em>'),
      desc: i.url.replace(reg, '<em>$1</em>'),
      lastTime: dayjs(i.lastVisitTime).format('YYYY-MM-DD HH:mm:ss'),
      url: i.url
    }
  })
}
