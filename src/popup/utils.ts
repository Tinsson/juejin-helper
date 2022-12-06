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

export const highlightText = (origin: string, words: string) => {
  try {
    const reg = new RegExp(`(${words})`, 'gi')
    const res = origin.replace(reg, '<em>$1</em>')
    return res
  } catch (e) {
    console.log(origin, words)
    return origin
  }
}

export const formatChromeHistoryItem = (
  searchWords: string,
  origin: chrome.history.HistoryItem[]
): ISearchItem[] => {
  return origin.map((i) => {
    return {
      id: i.id,
      title: highlightText(i.title, searchWords),
      desc: highlightText(i.url, searchWords),
      lastTime: dayjs(i.lastVisitTime).format('YYYY-MM-DD HH:mm:ss'),
      url: i.url
    }
  })
}
