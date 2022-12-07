<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'
import ListTab from './ListTab.vue'
import DataCard from './DataCard.vue'
import DataChart from './DataChart.vue'

const allDatas = [
  'all_follower',
  'incr_article_display',
  'incr_article_view',
  'incr_article_digg',
  'incr_article_comment',
  'incr_article_collect'
]

export default defineComponent({
  components: {
    ListTab,
    DataCard,
    DataChart
  },
  setup() {
    const tabKey = ref('card')
    const chartInfo = reactive({
      datas: allDatas,
      dateRange: 1
    })

    const tabData = [
      {
        label: '汇总',
        value: 'card',
        iconKey: 'menu'
      },
      {
        label: '图表',
        value: 'chart',
        iconKey: 'chart'
      }
    ]

    const handleSelectTab = (active: string) => {
      if (active === 'chart') {
        chartInfo.datas = allDatas
      }
      tabKey.value = active
    }

    const handleChangeRange = (val: number) => {
      chartInfo.dateRange = val
    }

    const handleCardDropdown = (cardKeys: string[]) => {
      console.log(cardKeys)
      chartInfo.datas = cardKeys
      tabKey.value = 'chart'
    }

    return {
      tabKey,
      tabData,
      chartInfo,
      handleSelectTab,
      handleChangeRange,
      handleCardDropdown
    }
  }
})
</script>

<template>
  <div class="card-box">
    <list-tab :tab-key="tabKey" :data="tabData" @select="handleSelectTab" />
    <div v-if="tabKey === 'card'">
      <data-card @cardClick="handleCardDropdown" />
    </div>
    <div v-if="tabKey === 'chart'">
      <data-chart
        :date-range="chartInfo.dateRange"
        :data-keys="chartInfo.datas"
        @changeRange="handleChangeRange"
      />
    </div>
  </div>
</template>

<style scoped>
.card-box {
  max-height: 350px;
  /* overflow-y: scroll; */
}
</style>
