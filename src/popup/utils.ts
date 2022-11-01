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
