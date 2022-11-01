<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import { getCurPower, getPowerList } from '~/popup/apis'
import { Chart } from '@antv/g2'

interface IPowerDetail {
  jpower: number
  changeNum: number
  date: string
}

const getDate = (stamp) => {
  const dateObj = new Date(stamp * 1000)
  const monthNum = dateObj.getMonth() + 1
  const month = monthNum >= 10 ? monthNum : `0${monthNum}`
  const dayNum = dateObj.getDate()
  const day = dayNum >= 10 ? dayNum : `0${dayNum}`
  return `${month}-${day}`
}

const reverseList = (list) => {
  let left = 0
  let right = list.length - 1
  while (left < right) {
    const temp = list[right]
    list[right] = list[left]
    list[left] = temp
    left++
    right--
  }
  return list
}

export default defineComponent({
  setup() {
    const jpower = ref<number>(0)
    const powerList = ref<IPowerDetail[]>([])
    const chartRef = ref(null)

    const initChart = (data) => {
      const chart = new Chart({
        container: 'jpower-chart',
        autoFit: true,
        height: 500
      })
      chartRef.value = chart
      chart.data(data)
      chart.scale({
        jpower: {
          min: 0,
          max:
            Math.floor(
              Math.max.apply(
                null,
                data.map((i) => i.jpower)
              )
            ) * 1.5
        },
        changeNum: {
          min: 0,
          max:
            Math.floor(
              Math.max.apply(
                null,
                data.map((i) => i.changeNum)
              )
            ) * 1.2
        }
      })
      chart.legend({
        custom: true,
        items: [
          {
            value: 'changeNum',
            name: '变化值',
            marker: { symbol: 'square', style: { fill: '#1e80ff', r: 5 } }
          },
          {
            value: 'jpower',
            name: '掘力总值',
            marker: {
              symbol: 'hyphen',
              style: { stroke: '#fdae6b', r: 5, lineWidth: 3 }
            }
          }
        ]
      })
      chart.axis('jpower', {
        grid: null,
        title: {
          style: {
            fill: '#fdae6b'
          },
          text: '掘力总值'
        },
        label: {
          style: {
            fill: '#fdae6b'
          }
        }
      })
      chart.axis('changeNum', {
        title: {
          text: '变化值'
        }
      })
      chart.tooltip({
        shared: true
      })
      chart.interval().position('date*changeNum').color('#1e80ff')
      chart
        .line()
        .position('date*jpower')
        .color('#fdae6b')
        .size(3)
        .shape('smooth')
      chart
        .point()
        .position('date*jpower')
        .color('#fdae6b')
        .size(3)
        .shape('circle')

      chart.interaction('active-region')
      chart.removeInteraction('legend-filter') // 自定义图例，移除默认的分类图例筛选交互
      chart.render()
    }

    onBeforeUnmount(() => {
      chartRef.value.destroy()
    })

    const initPower = async () => {
      const res1 = await getCurPower()
      let innerPower = 0
      if (res1) {
        jpower.value = res1.jpower
        innerPower = res1.jpower
      }
      const res2 = await getPowerList()
      if (res2) {
        const realList = res2.map((item) => {
          const changeNum = item.jpower
          const showList = {
            jpower: innerPower,
            changeNum,
            date: getDate(item.date)
          }
          innerPower = innerPower - changeNum
          return showList
        })
        powerList.value = realList
        initChart(reverseList(realList))
      }
    }

    onMounted(async () => {
      await initPower()
    })

    return {
      jpower,
      powerList
    }
  }
})
</script>

<template>
  <div>
    <div>
      <span>当前掘力值：</span>
      <span class="power-num">{{ jpower }}</span>
    </div>
    <div id="jpower-chart" class="chart-container"></div>
  </div>
</template>

<style scoped>
.power-num {
  font-weight: 400;
  font-size: 26px;
  color: #1e80ff;
}
.chart-container {
  width: 445px;
  height: 250px;
}
</style>
