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
