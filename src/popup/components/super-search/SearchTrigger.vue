<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import {
  ElInput,
  ElIcon,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem
} from 'element-plus'
import { Search, Loading, CircleCheck } from '@element-plus/icons-vue'
import type { ISearchExtraItem, ISearchParams } from '~/popup/type'
import { formatChromeHistoryItem, highlightText } from '~/popup/utils'
import { getDiggFollowArticles, getNpmPackages } from '~/popup/apis'
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
  },
  {
    id: 2,
    name: 'npm',
    otherField: {
      name: 'ranking',
      options: [
        {
          label: 'Default',
          value: ''
        },
        {
          label: 'Optimal',
          value: 'optimal'
        },
        {
          label: 'Popularity',
          value: 'popularity'
        },
        {
          label: 'Quality',
          value: 'quality'
        },
        {
          label: 'Maintenance',
          value: 'maintenance'
        }
      ]
    },
    search: async (params: ISearchParams) => {
      const res = await getNpmPackages({
        q: params.searchWords,
        ranking: params.ranking || ''
      })
      let list = []
      if (res?.objects?.length > 0) {
        list = res.objects.map((i) => ({
          id: i.package.name,
          title: highlightText(i.package.name, params.searchWords),
          url: `https://www.npmjs.com/package/${i.package.name}`,
          author: i.package.publisher.name,
          authorLink: `https://www.npmjs.com/~${i.package.publisher.name}`,
          desc: highlightText(i.package.description, params.searchWords),
          lastTime: i.package.date.rel,
          tags: i.package.keywords.map((tag) => {
            return {
              name: tag,
              url: `https://www.npmjs.com/search?q=keywords:${tag}`
            }
          })
        }))
      }
      return {
        total: res.total,
        list
      }
    }
  },
  {
    id: 3,
    name: '历史记录',
    otherField: {
      name: 'timeEarly',
      options: [
        {
          label: '默认时间',
          value: ''
        },
        {
          label: '24小时内',
          value: '1'
        },
        {
          label: '7天内',
          value: '7'
        },
        {
          label: '30天内',
          value: '30'
        },
        {
          label: '半年内',
          value: '180'
        }
      ]
    },
    search: async (params: ISearchParams) => {
      const hisParams: chrome.history.HistoryQuery = {
        text: params.searchWords,
        maxResults: 500
      }
      if (params.timeEarly) {
        const nowStamp = new Date().getTime()
        hisParams.endTime = nowStamp
        hisParams.startTime =
          nowStamp - Number(params.timeEarly) * 1000 * 24 * 60 * 60
      }
      const res = await chrome.history.search(hisParams)
      const list = formatChromeHistoryItem(params.searchWords, res)
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
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem,
    Loading
  },
  props: {
    change: Function
  },
  setup(_props, context) {
    const filterInfo = useLocalRef('super-search-filter', {
      searchWords: '',
      curConfig: extraConfigs[0],
      fieldValue: ''
    })
    const loading = ref(false)

    const handleSearchClick = async () => {
      loading.value = true
      const params: ISearchParams = {
        searchWords: filterInfo.value.searchWords
      }
      if (filterInfo.value.curConfig.otherField) {
        params[filterInfo.value.curConfig.otherField.name] =
          filterInfo.value.fieldValue
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

    const fieldShowLabel = computed(() => {
      if (filterInfo.value.curConfig.otherField) {
        for (const op of filterInfo.value.curConfig.otherField.options) {
          if (op.value === filterInfo.value.fieldValue) {
            return op.label
          }
        }
      }
      return ''
    })

    const handleFieldClick = (val: string) => {
      filterInfo.value = {
        ...filterInfo.value,
        fieldValue: val
      }
      handleSearchClick()
    }

    const handleClickConfig = (config: ISearchExtraItem) => {
      context.emit('change', {
        list: [],
        total: 0
      })
      filterInfo.value = {
        ...filterInfo.value,
        curConfig: config,
        fieldValue: ''
      }
      if (filterInfo.value.searchWords) {
        handleSearchClick()
      }
    }

    return {
      fieldShowLabel,
      filterInfo,
      handleSearchClick,
      handleClickConfig,
      handleFieldClick,
      handleEnter,
      Search,
      CircleCheck,
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
    <div v-if="!!filterInfo.curConfig.otherField">
      <el-dropdown trigger="click">
        <span class="el-dropdown-link">
          {{ fieldShowLabel
          }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="op in filterInfo.curConfig.otherField.options"
              :key="op.value"
              @click="handleFieldClick(op.value)"
              ><span
                :class="{
                  'menu-active': filterInfo.fieldValue === op.value
                }"
                >{{ op.label }}</span
              ></el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
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
.menu-active {
  color: #409eff;
}
</style>
