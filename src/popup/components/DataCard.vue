<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { ElRow, ElCol, ElCard } from 'element-plus'
import { getCardInfo } from '~/popup/apis'

interface ISubData {
  cnt: number
  than_before: number
}

interface ICardInfo {
  all_article_collect: ISubData
  all_article_comment: ISubData
  all_article_digg: ISubData
  all_article_display: ISubData
  all_article_view: ISubData
  all_follower: ISubData
}

interface ICardItem {
  name: string
  keyName: string
}

export default defineComponent({
  components: {
    ElRow,
    ElCol,
    ElCard
  },
  setup() {
    const cardData = ref<ICardInfo>({
      all_article_collect: {
        cnt: 0,
        than_before: 0
      },
      all_article_comment: {
        cnt: 0,
        than_before: 0
      },
      all_article_digg: {
        cnt: 0,
        than_before: 0
      },
      all_article_display: {
        cnt: 0,
        than_before: 0
      },
      all_article_view: {
        cnt: 0,
        than_before: 0
      },
      all_follower: {
        cnt: 0,
        than_before: 0
      }
    })

    const cardList = ref<ICardItem[]>([
      {
        name: '总关注者数',
        keyName: 'all_follower'
      },
      {
        name: '文章展现数',
        keyName: 'all_article_display'
      },
      {
        name: '文章阅读数',
        keyName: 'all_article_view'
      },
      {
        name: '文章点赞数',
        keyName: 'all_article_digg'
      },
      {
        name: '文章评论数',
        keyName: 'all_article_comment'
      },
      {
        name: '文章收藏数',
        keyName: 'all_article_collect'
      }
    ])

    onMounted(async () => {
      const res = await getCardInfo()
      cardData.value = res.datas
    })

    return {
      cardData,
      cardList
    }
  }
})
</script>

<template>
  <div>
    <el-row :gutter="12">
      <el-col v-for="item in cardList" :key="item.keyName" :span="8">
        <el-card
          shadow="hover"
          class="card-box"
          :body-style="{
            padding: '10px 12px'
          }"
        >
          <div class="card-title">{{ item.name }}</div>
          <div class="card-data">{{ cardData[item.keyName].cnt }}</div>
          <div class="card-than">
            <span class="than-text">较前日</span>
            <img
              v-if="cardData[item.keyName].than_before === 0"
              class="than-img"
              src="https://lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/7f170698b5ca3a3b477b940de47aab0f.svg"
            />
            <img
              v-if="cardData[item.keyName].than_before > 0"
              class="than-img"
              src="https://lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/ba153bc9315679b124ced4214ea52db9.svg"
            />
            <span
              v-if="cardData[item.keyName].than_before !== 0"
              class="than-vary"
            >
              {{ cardData[item.keyName].than_before }}
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.card-box {
  background: #f7f8fa;
  border: none;
  margin-bottom: 12px;
}
.card-title {
  color: #4e5969;
  line-height: 22px;
}
.card-data {
  color: #1d2129;
  font-weight: 600;
  font-size: 26px;
  line-height: 36px;
  margin-bottom: 4px;
  white-space: nowrap;
}
.card-than {
  display: flex;
  align-items: center;
  height: 22px;
}
.than-text {
  color: #4e5969;
  font-size: 12px;
}
.than-img {
  margin-left: 8px;
}
.than-vary {
  font-size: 14px;
  margin-left: 4px;
  white-space: nowrap;
  color: #1d7dfa;
}
</style>
