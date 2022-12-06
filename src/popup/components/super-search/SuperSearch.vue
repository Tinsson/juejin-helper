<script lang="ts">
import { defineComponent, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { ISearchItem } from '~/popup/type'
import { ElTag } from 'element-plus'
import PageIcon from './PageIcon.vue'
import SearchTrigger from './SearchTrigger.vue'

export default defineComponent({
  components: {
    PageIcon,
    SearchTrigger,
    ElTag
  },
  setup(_props, context) {
    const hasSearch = ref(false)
    const result = ref<ISearchItem[]>([])

    const handleResultChange = (res: ISearchItem[]) => {
      result.value = res
      hasSearch.value = true
    }

    return {
      handleResultChange,
      Search,
      result,
      hasSearch
    }
  }
})
</script>

<template>
  <div class="scroll-content search-outer">
    <search-trigger @change="handleResultChange"></search-trigger>
    <template v-if="hasSearch">
      <template v-if="result.length > 0">
        <div class="length-tips">为你找到约 {{ result.length }} 个结果</div>
        <div v-for="item in result" :key="item.id" class="result-box">
          <div class="result-left">
            <page-icon />
          </div>
          <div class="result-right">
            <h3 class="result-title" :title="item.title">
              <a :href="item.url" target="_blank" v-html="item.title" />
            </h3>
            <div class="result-desc" v-html="item.desc" />
            <div v-if="item.tags" class="result-tags">
              <a
                v-for="tag in item.tags"
                :key="tag.name"
                class="result-tag"
                :href="tag.url"
              >
                <el-tag size="small">
                  {{ tag.name }}
                </el-tag>
              </a>
            </div>
            <div
              :class="{
                'result-bottom': true,
                'has-tag': !!item.tags
              }"
            >
              <a v-if="item.author" :href="item.authorLink">
                <span class="result-bottom-text author-text">{{
                  item.author
                }}</span>
              </a>
              <span v-if="item.lastTime" class="result-bottom-text">{{
                item.lastTime
              }}</span>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="empty-tips">暂无结果</div>
      </template>
    </template>
    <template v-else>
      <div class="search-tips">请输入关键词后回车搜索</div>
    </template>
  </div>
</template>

<style scoped>
.search-outer {
  padding: 12px;
}
.card-box {
  background: #f7f8fa;
  border: none;
  margin-bottom: 12px;
  cursor: pointer;
}
.length-tips,
.empty-tips {
  font-size: 12px;
  color: #8a8f8d;
  line-height: 22px;
  margin-top: 5px;
}
.empty-tips {
  font-size: 12px;
  margin-top: 10px;
}
.search-tips {
  color: #8a8f8d;
  font-size: 12px;
  margin-top: 10px;
}
.result-box {
  width: 100%;
  word-break: break-all;
  padding: 10px 8px;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-flow: row nowrap;
}
.result-left {
  width: 26px;
  margin-right: 3px;
}
.result-right {
  flex: 1;
  overflow: hidden;
}
.result-title {
  font-size: 16px;
  line-height: 22px;
  font-weight: 500;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
}
.result-title a {
  color: #262626;
}
.result-title a:hover {
  color: #8a8f8d;
}
.result-desc {
  margin-top: 3px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
  line-height: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.result-bottom {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin-top: 6px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
}
.result-bottom.has-tag {
  margin-top: 1px;
}
.result-bottom-text {
  margin-right: 8px;
}
.result-tags {
  display: flex;
  flex-flow: row wrap;
  margin-top: 5px;
}
.result-tag {
  display: block;
  margin-right: 5px;
  margin-bottom: 5px;
}
.author-text {
  color: rgba(0, 0, 0, 0.7);
  font-weight: 600;
}
</style>
