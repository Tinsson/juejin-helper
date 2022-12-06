export interface ISearchItem {
  id: string | number
  title: string
  url: string
  author?: string
  authorLink?: string
  desc?: string
  lastTime?: string
  tags?: Array<{
    name: string
    url: string
  }>
}
