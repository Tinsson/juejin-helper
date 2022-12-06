<script lang="ts">
import { defineComponent } from 'vue'
import { ElMenu, ElMenuItem, ElIcon } from 'element-plus'
import CusHeader from './components/CusHeader.vue'
import DataCard from './components/data-card/CardIndex.vue'
import ArticleList from './components/ArticleList.vue'
import PowerLine from './components/PowerLine.vue'
import SuperSearch from './components/super-search/SuperSearch.vue'
import { useLocalRef } from './hooks'

export default defineComponent({
  components: {
    ElMenu,
    ElMenuItem,
    ElIcon,
    CusHeader,
    DataCard,
    ArticleList,
    PowerLine,
    SuperSearch
  },
  setup() {
    const tabKey = useLocalRef<string>('popup-tab-key', 'power')

    const handleMenuSelect = (newKey: string) => {
      tabKey.value = newKey
    }

    return {
      tabKey,
      handleMenuSelect
    }
  }
})
</script>

<template>
  <div class="app-root">
    <cus-header />
    <div class="center-line">
      <el-menu :default-active="tabKey" @select="handleMenuSelect">
        <el-menu-item index="power">
          <el-icon><TrendCharts /></el-icon>
          <span>掘力值</span>
        </el-menu-item>
        <el-menu-item index="card">
          <el-icon><Menu /></el-icon>
          <span>数据卡片</span>
        </el-menu-item>
        <el-menu-item index="list">
          <el-icon><document /></el-icon>
          <span>文章列表</span>
        </el-menu-item>
        <el-menu-item index="search">
          <el-icon><Search /></el-icon>
          <span>超级搜索</span>
        </el-menu-item>
      </el-menu>
      <div v-if="tabKey === 'power'" class="content-box">
        <power-line />
      </div>
      <div v-if="tabKey === 'card'" class="content-box">
        <data-card />
      </div>
      <template v-if="tabKey === 'search'">
        <super-search />
      </template>
      <template v-if="tabKey === 'list'">
        <article-list />
      </template>
    </div>
  </div>
</template>

<style>
body {
  padding: 0;
  margin: 0;
  font-size: 14px;
  --helper-font1: #252933;
  --helper-font2: #515767;
  --helper-font3: #8a919f;
  --helper-font4: #c2c8d1;
  font-family: Chinese Quote, -apple-system, BlinkMacSystemFont, Segoe UI,
    Roboto, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Helvetica Neue,
    Helvetica, Arial, sans-serif;
}
a {
  text-decoration: none;
  cursor: pointer;
}
.app-root {
  width: 600px;
  display: block;
}
.center-line {
  display: flex;
  flex-flow: row nowrap;
  min-height: 300px;
}
.content-box {
  flex: 1;
  box-sizing: border-box;
  padding: 12px;
}
.scroll-content {
  flex: 1;
  box-sizing: border-box;
  padding: 0 12px;
  min-height: 200px;
  max-height: 450px;
  overflow-y: scroll;
}
.result-title em,
.result-desc em {
  color: red;
  font-style: normal;
}
</style>
