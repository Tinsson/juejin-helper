<script lang="ts">
import { defineComponent } from 'vue'
import { ElIcon } from 'element-plus'

export default defineComponent({
  name: 'ListTab',
  components: {
    ElIcon
  },
  props: {
    tabKey: {
      type: String,
      required: true
    },
    data: {
      type: Array<{
        label: string
        value: string
        iconKey?: string
      }>,
      required: true
    },
    select: Function
  },
  setup(_props, context) {
    const handleTabClick = (val: string) => {
      context.emit('select', val)
    }

    return {
      handleTabClick
    }
  }
})
</script>

<template>
  <div class="tab-line">
    <div
      v-for="tab in data"
      :key="tab.value"
      :class="`tab-item ${tab.value === tabKey ? 'active' : ''}`"
      :data-value="tab.value"
      @click="handleTabClick(tab.value)"
    >
      <el-icon v-if="tab.iconKey === 'menu'" color="#1dd2ac" :size="16">
        <Flag />
      </el-icon>
      <el-icon v-if="tab.iconKey === 'chart'" color="#2758fd" :size="16">
        <TrendCharts />
      </el-icon>
      <span class="tab-text">{{ tab.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.tab-line {
  display: flex;
  flex-flow: row nowrap;
  margin-bottom: 12px;
}
.tab-item {
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
.tab-item:hover {
  background-color: #e3e5e6;
}
.tab-item.active {
  background-color: #dbe3fc;
  color: #2857fd;
}
.tab-text {
  margin-left: 3px;
}
</style>
