import axios from 'axios'
import { getLocalObj } from '~/popup/utils'

const methods = ['post', 'get', 'put', 'delete', 'patch']

const ajax: Record<
  string,
  (url: string, data?: any, options?: any) => Promise<any>
> = {}

methods.forEach((method) => {
  ajax[method] = (url, data, options): Promise<any> => {
    data = data || {}

    if (method === 'get') {
      data = { params: data }
    } else {
      data = { data }
    }

    let rawResponse = false
    if (options?.rawResponse) {
      rawResponse = true
      delete options.rawResponse
    }

    return new Promise((resolve, reject) => {
      return axios({
        url,
        method,
        ...data,
        timeout: 5000,
        ...options
      }).then((response) => {
        if (rawResponse) {
          resolve(response.data || {})
          return
        }
        if (response.data.err_no !== 200 && response.data.err_no !== 0) {
          reject(response.data)
        }
        resolve(response.data.data || {})
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

export const getUserInfo = () => {
  return ajax.get(urlSite('juejin', '/user_api/v1/user/get'))
}

export const getNoticeCount = () => {
  return ajax.get(urlSite('juejin', '/interact_api/v1/message/count'))
}

export const getUserId = async () => {
  const userCache = getLocalObj('juejin-user')
  if (userCache) {
    return userCache.user_id
  } else {
    const res = await getUserInfo()
    return res.user_id
  }
}

const setJuejinOrigin = async () => {
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            {
              header: 'origin',
              operation: 'set',
              value: 'https://juejin.cn'
            }
          ]
        },
        condition: {
          urlFilter: 'juejin.cn',
          resourceTypes: ['xmlhttprequest']
        }
      }
    ],
    removeRuleIds: [1]
  } as any)
}

export const getArticleList = async (page = 1) => {
  await setJuejinOrigin()
  return ajax.post(
    urlSite('juejin', '/content_api/v1/article/list_by_user'),
    {
      audit_status: null,
      keyword: '',
      page_no: page,
      page_size: 10
    },
    {
      rawResponse: true
    }
  )
}

export const getCurPower = async () => {
  await setJuejinOrigin()
  return ajax.post(
    urlSite('juejin', '/growth_api/v1/user_growth/author_jpower'),
    {
      growth_type: 2
    }
  )
}

export const getPowerList = async () => {
  await setJuejinOrigin()
  return ajax.post(
    urlSite('juejin', '/growth_api/v1/user_growth/author_jpower_detail'),
    {
      cursor: '0',
      limit: 10
    }
  )
}

export const getCardInfo = async () => {
  await setJuejinOrigin()
  const user_id = await getUserId()
  const datas = [
    'all_follower',
    'all_article_display',
    'all_article_view',
    'all_article_digg',
    'all_article_comment',
    'all_article_collect'
  ]
  return ajax.post(
    urlSite('juejin', '/content_api/v1/author_center/data/card'),
    {
      datas,
      user_id
    }
  )
}

export const getTrendData = async (dateRange: number, datas: string[]) => {
  await setJuejinOrigin()
  const user_id = await getUserId()

  return ajax.post(
    urlSite(
      'juejin',
      '/content_api/v1/author_center/data/trend?aid=2608&uuid=6896770031675213319&spider=0'
    ),
    {
      item_type: 1,
      datas,
      item_id: user_id,
      date_range: dateRange
    }
  )
}

export const getArticleTrend = async (dateRange: number, articleId: string) => {
  await setJuejinOrigin()

  return ajax.post(
    urlSite(
      'juejin',
      '/content_api/v1/author_center/data/trend?aid=2608&uuid=6896770031675213319&spider=0'
    ),
    {
      item_type: 2,
      datas: [
        'incr_article_display',
        'incr_article_view',
        'incr_article_digg',
        'incr_article_comment',
        'incr_article_collect'
      ],
      item_id: articleId,
      date_range: dateRange
    }
  )
}
