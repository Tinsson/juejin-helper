<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { getArticleList } from '~/popup/apis'

interface IArticleOrigin {
  article_id: string
  article_info: IArticle
}

interface IArticle {
  article_id: string
  display_count: number
  view_count: number
  digg_count: number
  comment_count: number
  collect_count: number
  title: string
}

const formatData = (list: IArticleOrigin[]) => {
  return list.map((i) => ({
    article_id: i.article_id,
    display_count: i.article_info.display_count,
    view_count: i.article_info.view_count,
    digg_count: i.article_info.digg_count,
    comment_count: i.article_info.comment_count,
    collect_count: i.article_info.collect_count,
    title: i.article_info.title
  }))
}

export default defineComponent({
  setup() {
    const articleList = ref<IArticle[]>([])
    const total = ref(0)
    const page = ref(1)

    const initArtileList = async () => {
      const res = await getArticleList(page.value)
      const { data, count } = res
      total.value = count
      articleList.value = formatData(data)
    }

    onMounted(() => {
      initArtileList()
    })

    return {
      articleList,
      total
    }
  }
})
</script>

<template>
  <div class="essay-outer">
    <div>
      <a
        v-for="item in articleList"
        :key="item.article_id"
        :href="`https://juejin.cn/post/${item.article_id}`"
        class="assay-link"
      >
        <div class="essay-list">
          <div class="title">{{ item.title }}</div>
          <div class="infos">
            <span>{{ item.display_count }}展现</span>
            <span class="dot">·</span>
            <span>{{ item.view_count }}阅读</span>
            <span class="dot">·</span>
            <span>{{ item.digg_count }}点赞</span>
            <span class="dot">·</span>
            <span>{{ item.comment_count }}评论</span>
            <span class="dot">·</span>
            <span>{{ item.collect_count }}收藏</span>
          </div>
        </div>
      </a>
    </div>
    <a
      href="https://juejin.cn/creator/content/article/essays?status=all"
      target="_blank"
      class="check-more"
    >
      <span>查看更多</span>
    </a>
  </div>
</template>

<style scoped>
.essay-outer {
  flex: 1;
  box-sizing: border-box;
  padding: 0 12px;
  min-height: 200px;
  max-height: 320px;
  overflow-y: scroll;
}
.essay-list {
  box-sizing: border-box;
  width: 100%;
  padding: 8px 3px;
}
.assay-link {
  display: block;
  border-bottom: 1px solid #e5e6eb;
}
.assay-link:nth-last-child(1) {
  border-bottom: none;
}
.essay-list:hover {
  background-color: #fafafa;
}
.title {
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;
  color: #1d2129;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.infos {
  font-weight: 400;
  font-size: 14px;
  height: 20px;
  line-height: 20px;
  display: flex;
  align-items: center;
  color: #86909c;
}
.dot {
  margin: 0 6px;
}
.check-more {
  font-size: 14px;
  line-height: 24px;
  padding: 8px 0;
  color: #86909c;
  display: flex;
  align-items: center;
  cursor: pointer;
  justify-content: center;
}
</style>
