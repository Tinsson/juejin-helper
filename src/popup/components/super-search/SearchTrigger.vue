<script lang="ts">
import { defineComponent, ref } from 'vue'
import { ElInput, ElIcon } from 'element-plus'
import { Search, Loading } from '@element-plus/icons-vue'
import type { ISearchItem } from '~/popup/type'
import { formatChromeHistoryItem } from '~/popup/utils'
import { getDiggFollowArticles, getNpmPackages } from '~/popup/apis'
import dayjs from 'dayjs'

interface IParams {
  searchWords: string
  ranking?: string
  timeRange?: string[]
  page?: number
  pageSize?: number
}

interface IExtraItem {
  id: number
  name: string
  search: (params: IParams) => Promise<ISearchItem[]>
}

const extraConfigs: IExtraItem[] = [
  {
    id: 1,
    name: '掘金点赞/收藏/发布',
    search: async (params: IParams) => {
      const res = await getDiggFollowArticles(params.searchWords)
      if (res?.length > 0) {
        return res.map((i) => ({
          id: i.article_id,
          title: i.article_info.title,
          url: `https://juejin.cn/post/${i.article_id}`,
          author: i.author_user_info.user_name,
          authorLink: `https://juejin.cn/user/${i.author_user_info.user_id}`,
          desc: i.article_info.content,
          lastTime: dayjs(Number(`${i.article_info.ctime}000`)).format(
            'YYYY-MM-DD HH:mm:ss'
          ),
          tags: i.tags.map((tag) => {
            return {
              name: tag.tag_name,
              url: `https://juejin.cn/tag/${tag.tag_name}`
            }
          })
        }))
      }
      return []
    }
  },
  {
    id: 2,
    name: 'npm',
    search: async (params: IParams) => {
      const res = await getNpmPackages({
        q: params.searchWords
      })
      if (res?.objects?.length > 0) {
        return res.objects.map((i) => ({
          id: i.package.name,
          title: i.package.name,
          url: `https://www.npmjs.com/package/${i.package.name}`,
          author: i.package.publisher.name,
          authorLink: `https://www.npmjs.com/~${i.package.publisher.name}`,
          desc: i.package.description,
          lastTime: i.package.date.rel,
          tags: i.package.keywords.map((tag) => {
            return {
              name: tag,
              url: `https://www.npmjs.com/search?q=keywords:${tag}`
            }
          })
        }))
      }
      return []
    }
  },
  {
    id: 3,
    name: '历史记录',
    search: async (params: IParams) => {
      const res = await chrome.history.search({
        text: params.searchWords
      })
      return formatChromeHistoryItem(params.searchWords, res)
    }
  }
]

export default defineComponent({
  components: {
    ElInput,
    ElIcon,
    Loading
  },
  props: {
    change: Function
  },
  setup(_props, context) {
    const searchWords = ref('')
    const loading = ref(false)
    const curConfig = ref<IExtraItem>(extraConfigs[0])

    const handleSearchClick = async () => {
      loading.value = true
      const res = await curConfig.value.search({
        searchWords: searchWords.value
      })
      context.emit('change', res)
      loading.value = false
    }

    const handleEnter = (e) => {
      if (e.keyCode === 13) {
        handleSearchClick()
      }
    }

    const handleClickConfig = (config: IExtraItem) => {
      context.emit('change', [])
      curConfig.value = config
      if (searchWords.value) {
        handleSearchClick()
      }
    }

    return {
      searchWords,
      handleSearchClick,
      handleClickConfig,
      handleEnter,
      Search,
      extraConfigs,
      curConfig,
      loading
    }
  }
})
</script>

<template>
  <div class="input-line">
    <el-input
      v-model="searchWords"
      class="search-input"
      placeholder="搜索"
      :prefix-icon="Search"
      clearable
      @keydown="handleEnter"
    />
    <el-icon v-if="loading" class="is-loading">
      <Loading />
    </el-icon>
  </div>
  <div class="search-extra">
    <div
      v-for="config in extraConfigs"
      :key="config.id"
      :class="{
        'config-item': true,
        active: config.id === curConfig.id
      }"
      @click="handleClickConfig(config)"
    >
      {{ config.name }}
    </div>
  </div>
</template>

<style scoped>
.input-line {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}
.search-input {
  width: 220px;
  margin-right: 10px;
}
.search-extra {
  display: flex;
  flex-flow: row wrap;
  margin-top: 10px;
}
.config-item {
  font-size: 12px;
  padding: 4px 12px;
  margin-right: 8px;
  border-radius: 5px;
  color: #333;
  cursor: pointer;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}
.config-item:hover {
  background-color: #e3e5e6;
}
.config-item.active {
  background-color: #dbe3fc;
  color: #2857fd;
}
.is-loading {
  color: #2857fd;
}
</style>
