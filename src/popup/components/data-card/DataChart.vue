<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import { ElRadioGroup, ElRadioButton } from 'element-plus'
import { Line } from '@antv/g2plot'
import { getTrendData } from '~/popup/apis'

interface ISubData {
  date: string
  cnt: number
  unixdate: number
}

// const colorList = [
//   '#1890FF',
//   '#41D9C7',
//   '#2FC25B',
//   '#FACC14',
//   '#E6965C',
//   '#223273',
//   '#7564CC'
// ]

interface IChartInfo {
  incr_article_collect?: ISubData
  incr_article_comment?: ISubData
  incr_article_digg?: ISubData
  incr_article_display?: ISubData
  incr_article_view?: ISubData
  incr_follower?: ISubData
}

const titleMap = {
  incr_article_collect: '收藏数',
  incr_article_comment: '评论数',
  incr_article_digg: '点赞数',
  incr_article_display: '展示数',
  incr_article_view: '阅读数',
  incr_follower: '关注数',
  all_follower: '关注数'
}

export const formatData = (originData: IChartInfo): any => {
  const result = []
  Object.keys(originData).forEach((keyName) => {
    const items = originData[keyName]
    const title = titleMap[keyName]
    for (const item of items) {
      result.push({
        date: item.date,
        value: item.cnt,
        category: title
      })
    }
  })
  return result
}

export default defineComponent({
  components: {
    ElRadioGroup,
    ElRadioButton
  },
  props: {
    dataKeys: {
      type: Array<string>,
      required: true
    },
    dateRange: Number,
    changeRange: Function
  },
  setup(props, context) {
    const chartRef = ref(null)

    const initChart = async (range = props.dateRange) => {
      const res = await getTrendData(range, props.dataKeys)
      if (chartRef.value) {
        chartRef.value.destroy()
      }
      const chart = new Line('trend-chart', {
        data: formatData(res.datas),
        xField: 'date',
        yField: 'value',
        seriesField: 'category',
        smooth: true,
        xAxis: {
          type: 'time'
        },
        yAxis: {
          label: {
            // 数值格式化为千分位
            formatter: (v) =>
              `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`)
          }
        }
      })
      chartRef.value = chart
      chart.render()
    }

    onMounted(() => {
      initChart()
    })

    onBeforeUnmount(() => {
      chartRef.value.destroy()
    })

    const handleRangeChange = (val: number) => {
      initChart(val)
      context.emit('changeRange', val)
    }

    return {
      handleRangeChange
    }
  }
})
</script>

<template>
  <el-radio-group
    :model-value="dateRange"
    size="small"
    @change="handleRangeChange"
  >
    <el-radio-button :label="1">最近7天</el-radio-button>
    <el-radio-button :label="2">最近14天</el-radio-button>
    <el-radio-button :label="3">最近30天</el-radio-button>
  </el-radio-group>
  <div id="trend-chart" class="chart-container"></div>
</template>

<style scoped>
.chart-box {
  display: block;
}
.chart-container {
  margin-top: 20px;
  width: 445px;
  height: 250px;
}
</style>
