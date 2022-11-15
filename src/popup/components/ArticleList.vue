<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { ElIcon, ElRadioGroup, ElRadioButton } from 'element-plus'
import { getArticleList } from '~/popup/apis'
import { Funnel, Line } from '@antv/g2plot'
import { getArticleTrend } from '~/popup/apis'
import { formatData } from './data-card/DataChart.vue'

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

const formatter = (v) => `${(v * 100).toFixed(2)}%`

const renderAnntations = (plot, data) => {
  const { chart } = plot
  const coord = chart.getCoordinate()
  const elements = chart.geometries[0].elements
  const parsePoints = []
  elements.forEach((ele, idx) => {
    const { points, nextPoints } = ele.shape.get('origin')
    if (nextPoints) {
      let p0: any = { y: (points[1].y + points[2].y) / 2 }
      if (idx > 0) {
        p0.x = parsePoints[idx - 1][1].x
      } else {
        p0.x = (points[2].x + points[1].x) / 2
      }
      let p3 = {
        x: (nextPoints[2].x + nextPoints[1].x) / 2,
        y: (nextPoints[2].y + nextPoints[1].y) / 2
      }
      parsePoints.push([p0, p3])
    }
  })
  let container = chart.getLayer('fore').findById('annotation-group')
  if (!container) {
    container = chart.getLayer('fore').addGroup({ id: 'annotation-group' })
  } else {
    container.clear()
  }
  parsePoints.forEach((point, idx) => {
    const p0 = coord.convert(point[0])
    const p3 = coord.convert(point[1])
    const path = [
      ['M', p0.x, p0.y],
      ['L', p0.x + 15, p0.y],
      ['L', p3.x + 15, p3.y - 2],
      ['L', p3.x, p3.y - 2]
    ]
    container.addShape('path', {
      attrs: {
        path,
        stroke: '#d3d3d3',
        lineWidth: 1
      }
    })
    const fontSize = 10
    const offset = 5
    container.addShape('text', {
      attrs: {
        x: (path[0][1] + path[1][1]) / 2 + offset,
        y: (path[1][2] + path[2][2] + fontSize) / 2,
        text: `转化率：${formatter(data[idx + 1].count / data[idx].count)}`,
        fontSize: 10,
        fill: '#333'
      }
    })
  })
  chart.render(true)
}

const formatFunnelData = (list: IArticleOrigin[]) => {
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
  components: {
    ElIcon,
    ElRadioGroup,
    ElRadioButton
  },
  setup() {
    const articleList = ref<IArticle[]>([])
    const total = ref(0)
    const page = ref(1)
    const showIndex = ref(-1)
    const chartMap = ref({})
    const dateRange = ref(1)
    const lineMap = ref({})

    const initArtileList = async () => {
      const res = await getArticleList(page.value)
      const { data, count } = res
      total.value = count
      articleList.value = formatFunnelData(data)
    }

    const initChart = (idx: number) => {
      if (chartMap.value[idx]) {
        chartMap.value[idx].destroy()
      }
      const item = articleList.value[idx]
      const data = [
        { stage: '展示数', count: item.display_count },
        { stage: '阅读数', count: item.view_count },
        {
          stage: '点赞+评论+收藏数',
          count: item.digg_count + item.comment_count + item.collect_count
        }
      ].map((d) => ({ ...d, _count: 1 }))

      const plot = new Funnel(`sub-chart-${idx}`, {
        data: data,
        xField: 'stage',
        yField: '_count',
        legend: false,
        conversionTag: false,
        dynamicHeight: true,
        label: {
          formatter: (text, item) => {
            return `${item._origin.stage} ${item._origin.count}`
          }
        },
        tooltip: {
          customItems: (items) => {
            return items.map((d) => ({ ...d, value: d.data.count }))
          }
        },
        funnelStyle: {
          stroke: '#fff',
          lineWidth: 3
        }
      })
      chartMap.value[idx] = plot
      // Step 3: 渲染图表
      plot.render()
      setTimeout(() => {
        renderAnntations(plot, data)
      }, 100)
    }

    const initLineChart = async (idx: number, articleId) => {
      const res = await getArticleTrend(dateRange.value, articleId)
      if (lineMap.value[idx]) {
        lineMap.value[idx].destroy()
      }

      const chart = new Line(`line-chart-${idx}`, {
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
      lineMap.value[idx] = chart
      chart.render()
    }

    onMounted(() => {
      initArtileList()
    })

    const handleRangeChange = (val: number) => {
      dateRange.value = val
      initLineChart(
        showIndex.value,
        articleList.value[showIndex.value].article_id
      )
    }

    const handleOpenItemChart = (index: number) => {
      const finalIdx = index === showIndex.value ? -1 : index
      showIndex.value = finalIdx
      if (finalIdx !== -1) {
        dateRange.value = 1
        initChart(finalIdx)
        initLineChart(index, articleList.value[index].article_id)
      }
    }

    return {
      dateRange,
      articleList,
      total,
      showIndex,
      handleOpenItemChart,
      handleRangeChange
    }
  }
})
</script>

<template>
  <div class="essay-outer">
    <div>
      <div
        v-for="(item, index) in articleList"
        :key="item.article_id"
        class="assay-box"
      >
        <div class="essay-list">
          <a
            :href="`https://juejin.cn/post/${item.article_id}`"
            target="_blank"
          >
            <div class="title">{{ item.title }}</div>
          </a>
          <div class="sub-line">
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
            <el-icon
              class="more-btn"
              color="#86909c"
              @click="handleOpenItemChart(index)"
              ><MoreFilled
            /></el-icon>
          </div>
          <div :class="showIndex === index ? 'sub-chart-show' : 'sub-chart'">
            <div :id="`sub-chart-${index}`" class="funnel-chart"></div>
            <el-radio-group
              :model-value="dateRange"
              size="small"
              @change="handleRangeChange"
            >
              <el-radio-button :label="1">最近7天</el-radio-button>
              <el-radio-button :label="2">最近14天</el-radio-button>
              <el-radio-button :label="3">最近30天</el-radio-button>
            </el-radio-group>
            <div :id="`line-chart-${index}`" class="line-chart"></div>
          </div>
        </div>
      </div>
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
  max-height: 450px;
  overflow-y: scroll;
}
.essay-list {
  box-sizing: border-box;
  width: 100%;
  padding: 8px 3px;
}
.assay-box {
  display: block;
  border-bottom: 1px solid #e5e6eb;
}
.assay-box:nth-last-child(1) {
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
.sub-line {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.more-btn {
  cursor: pointer;
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
.sub-chart {
  width: 100%;
  height: 0px;
  overflow: hidden;
}
.sub-chart-show {
  margin: 12px 0;
  width: 100%;
  height: fit-content;
  overflow: hidden;
}
.funnel-chart {
  width: 100%;
  height: 250px;
  margin-bottom: 12px;
}
.line-chart {
  width: 100%;
  height: 250px;
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
