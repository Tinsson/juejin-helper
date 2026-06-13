<script lang="ts">
import { defineComponent, ref } from 'vue'
import { ElInput, ElIcon } from 'element-plus'
import { Search, Loading } from '@element-plus/icons-vue'
import type { ISearchExtraItem, ISearchParams } from '~/popup/type'
import { getDiggFollowArticles } from '~/popup/apis'
import { useLocalRef } from '../../hooks'
import dayjs from 'dayjs'

const extraConfigs: ISearchExtraItem[] = [
  {
    id: 1,
    name: '掘金点赞/收藏/发布',
    search: async (params: ISearchParams) => {
      const res = await getDiggFollowArticles(params.searchWords)
      let list = []
      if (res?.length > 0) {
        list = res.map((i) => ({
          id: i.article_id,
          title: i.article_info.title,
          url: `https://juejin.cn/post/${i.article_id}`,
          authorAvatar: i.author_user_info.avatar_large,
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
      return {
        list,
        total: list.length
      }
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
    const filterInfo = useLocalRef('super-search-filter', {
      searchWords: '',
      curConfig: extraConfigs[0]
    })
    const loading = ref(false)

    const handleSearchClick = async () => {
      loading.value = true
      const params: ISearchParams = {
        searchWords: filterInfo.value.searchWords
      }
      let searchFunc = filterInfo.value.curConfig.search
      if (typeof searchFunc !== 'function') {
        for (const config of extraConfigs) {
          if (config.name === filterInfo.value.curConfig.name) {
            searchFunc = config.search
          }
        }
      }
      const res = await searchFunc(params)
      context.emit('change', res)
      loading.value = false
    }

    const handleEnter = (e) => {
      if (e.keyCode === 13) {
        handleSearchClick()
        filterInfo.value = {
          ...filterInfo.value
        }
      }
    }

    const handleClickConfig = (config: ISearchExtraItem) => {
      context.emit('change', {
        list: [],
        total: 0
      })
      filterInfo.value = {
        ...filterInfo.value,
        curConfig: config
      }
      if (filterInfo.value.searchWords) {
        handleSearchClick()
      }
    }

    return {
      filterInfo,
      handleSearchClick,
      handleClickConfig,
      handleEnter,
      Search,
      extraConfigs,
      loading
    }
  }
})
</script>

<template>
  <div class="input-line">
    <div>
      <el-input
        v-model="filterInfo.searchWords"
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
  </div>
  <div class="search-extra">
    <div
      v-for="config in extraConfigs"
      :key="config.id"
      :class="{
        'config-item': true,
        active: config.id === filterInfo.curConfig.id
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
  justify-content: space-between;
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
