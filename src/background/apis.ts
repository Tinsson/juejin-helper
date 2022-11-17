const methods = ['post', 'get']

const ajax: any = {}
methods.forEach((method) => {
  ajax[method] = (url, data) => {
    data = data || {}

    const options: any = {
      method: method.toLocaleUpperCase()
    }
    if (method === 'post') {
      options.body = data
    } else if (method === 'get') {
      const paramsStr = Object.keys(data)
        .map((keyName) => {
          return `${keyName}=${data[keyName]}`
        })
        .join('&')
      url += `?${paramsStr}`
    }

    return new Promise((resolve, reject) => {
      fetch(url, options)
        .then((res) => {
          return res.json()
        })
        .then((result) => {
          if (result.err_no !== 200 && result.err_no !== 0) {
            reject(result)
          }
          resolve(result.data || {})
        })
    })
  }
})

const urlSite = (base: 'juejin', path: string) => {
  const hostMap = {
    juejin: 'https://api.juejin.cn'
  }
  return `${hostMap[base]}${path}`
}

export const getNoticeCount = () => {
  return ajax.get(urlSite('juejin', '/interact_api/v1/message/count'))
}
