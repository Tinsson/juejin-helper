export interface ISearchItem {
  id: string | number
  title: string
  url: string
  authorAvatar?: string
  author?: string
  authorLink?: string
  desc?: string
  lastTime?: string
  tags?: Array<{
    name: string
    url: string
  }>
}

/** 搜索函数入参 */
export interface ISearchParams {
  searchWords: string
  ranking?: string
  timeEarly?: string
  page?: number
  pageSize?: number
}

/** 搜索相关过滤配置信息 */
export interface ISearchExtraItem {
  id: number
  name: string
  search: (params: ISearchParams) => Promise<{
    list: ISearchItem[]
    total: number
  }>
  otherField?: {
    name: string
    options: Array<{
      label: string
      value: string
    }>
  }
}
