<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import {
  ElIcon,
  ElAvatar,
  ElBadge,
  ElDropdown,
  ElDropdownItem
} from 'element-plus'
import { getUserInfo, getNoticeCount } from '~/popup/apis'
import { getLocalObj, setLocalObj, sendMessage } from '~/popup/utils'

interface IUser {
  avatar_large: string
  user_name: string
  power: number
  user_id: string
}

interface INotice {
  count: {
    1: number
    2: number
    3: number
    4: number
    7: number
  }
  total: number
}

export default defineComponent({
  components: {
    ElIcon,
    ElAvatar,
    ElBadge,
    ElDropdown,
    ElDropdownItem
  },
  setup() {
    const userInfo = ref<IUser>({
      avatar_large: '',
      user_name: '未知',
      power: 0,
      user_id: ''
    })
    const noticeInfo = ref<INotice>({
      count: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        7: 0
      },
      total: 0
    })

    const initUserInfo = async () => {
      const cache = getLocalObj('juejin-user')
      if (cache) {
        userInfo.value = cache
      } else {
        const res = await getUserInfo()
        const { avatar_large, user_name, power, user_id } = res
        const obj = {
          avatar_large,
          user_name,
          power,
          user_id
        }
        setLocalObj('juejin-user', obj)
        userInfo.value = obj
      }
    }

    const initCount = async () => {
      const res = await getNoticeCount()
      noticeInfo.value = res
      sendMessage('set-badge-bg', res)
    }

    onMounted(async () => {
      initUserInfo()
      initCount()
    })

    const selfPage = computed(() => {
      return `https://juejin.cn/user/${userInfo.value.user_id}`
    })

    const handleNoticeClick = (noticeType: string) => {
      let jumpLink = 'https://juejin.cn/notification'
      if (noticeType !== 'comment') {
        jumpLink += `/${noticeType}`
      }
      window.open(jumpLink)
    }

    return {
      userInfo,
      noticeInfo,
      selfPage,
      handleNoticeClick
    }
  }
})
</script>

<template>
  <div class="head-line">
    <div class="head-title">Hello，{{ userInfo.user_name }}</div>
    <div class="right-box">
      <el-dropdown trigger="hover">
        <el-badge :hidden="noticeInfo.total === 0" :value="noticeInfo.total">
          <el-icon :size="22" color="#8a919f" class="right-count">
            <BellFilled />
          </el-icon>
        </el-badge>
        <template #dropdown>
          <el-dropdown-menu class="notice-items">
            <el-dropdown-item
              class="clearfix"
              @click="handleNoticeClick('comment')"
            >
              评论
              <el-badge
                :hidden="noticeInfo.count[3] === 0"
                :value="noticeInfo.count[3]"
              />
            </el-dropdown-item>
            <el-dropdown-item
              class="clearfix"
              @click="handleNoticeClick('digg')"
            >
              点赞
              <el-badge
                :hidden="noticeInfo.count[1] === 0"
                :value="noticeInfo.count[1]"
              />
            </el-dropdown-item>
            <el-dropdown-item
              class="clearfix"
              @click="handleNoticeClick('follow')"
            >
              关注
              <el-badge
                :hidden="noticeInfo.count[2] === 0"
                :value="noticeInfo.count[2]"
              />
            </el-dropdown-item>
            <el-dropdown-item class="clearfix" @click="handleNoticeClick('im')">
              私信
              <el-badge
                :hidden="noticeInfo.count[7] === 0"
                :value="noticeInfo.count[7]"
              />
            </el-dropdown-item>
            <el-dropdown-item
              class="clearfix"
              @click="handleNoticeClick('system')"
            >
              系统消息
              <el-badge
                :hidden="noticeInfo.count[4] === 0"
                :value="noticeInfo.count[4]"
              />
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <a :href="selfPage" target="_blank">
        <el-avatar
          :size="36"
          class="right-avatar"
          :src="userInfo.avatar_large"
        />
      </a>
    </div>
  </div>
</template>

<style scoped>
.head-line {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  height: 48px;
  padding: 0 8px 0 16px;
  border-bottom: 1px solid #e5e6eb;
}
.head-title {
  color: var(--helper-font1);
}
.right-box {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: 12px;
}
.right-count {
  cursor: pointer;
}
.right-avatar {
  margin-left: 15px;
}
.notice-items {
  width: 300px;
}
</style>
