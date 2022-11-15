import { ref, watch } from 'vue'
import { getLocalObj, setLocalObj } from './utils'

export const useLocalRef = <T>(keyName: string, defaultValue?: T) => {
  const localInfo = ref<T>(getLocalObj(keyName) || defaultValue || null)

  watch(localInfo, (newVal) => {
    setLocalObj(keyName, newVal)
  })

  return localInfo
}
