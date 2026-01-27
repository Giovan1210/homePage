<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-50 dark:from-gray-900 dark:via-blue-900 dark:to-blue-900 relative">
    <!-- Background blur effects -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="hidden absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/10 dark:bg-pink-500/5 rounded-full blur-3xl"></div>
    </div>
    
    <!-- Content overlay -->
    <div class="relative z-10">
      <div class="guestbook-container">
        <div class="guestbook-card">
          <!-- Header -->
          <div class="header">
      
            <h1 class="title">留言板</h1>
            <p class="subtitle">在这里留下你的想法和建议，我会认真阅读每一条留言 💬。</p>
          </div>

          <!-- Message Form -->
          <div class="message-form-section">
            <h2 class="section-title">发表留言</h2>
            <form @submit.prevent="submitMessage" class="message-form">
              <div class="form-group">
                <label for="name" class="form-label">昵称 *</label>
                <input 
                  id="name"
                  v-model="formData.name"
                  type="text"
                  class="form-input"
                  placeholder="请输入你的昵称"
                  required
                />
              </div>

              <div class="form-group">
                <label for="email" class="form-label">邮箱 *</label>
                <input 
                  id="email"
                  v-model="formData.email"
                  type="email"
                  class="form-input"
                  placeholder="请输入你的邮箱"
                  required
                />
              </div>

              <div class="form-group">
                <label for="website" class="form-label">网站 (可选)</label>
                <input 
                  id="website"
                  v-model="formData.website"
                  type="url"
                  class="form-input"
                  placeholder="https://example.com"
                />
              </div>

              <div class="form-group">
                <label for="message" class="form-label">留言内容 *</label>
                <textarea 
                  id="message"
                  v-model="formData.message"
                  class="form-textarea"
                  placeholder="请输入你的留言..."
                  rows="5"
                  required
                ></textarea>
              </div>

              <button type="submit" class="submit-button">
                提交留言
              </button>
            </form>
          </div>

          <!-- Messages List -->
          <div class="messages-section">
            <h2 class="section-title">留言列表</h2>
            
            <div v-if="messages.length === 0" class="empty-state">
              <p>还没有留言，成为第一个留言的人吧！</p>
            </div>

            <div v-else class="messages-list" ref="messageListRef">
              <div 
                v-for="(message, index) in displayedMessages"
                :key="index"
                :class="['message-item', `note-color-${index % 5}`]"
              >
                <div class="message-header">
                  <div class="user-info">
                    <h3 class="user-name">{{ message.name }}</h3>
                    <span class="message-time">{{ formatDate(message.time) }}</span>
                  </div>
                  <div class="message-actions">
                    <EmojiReaction :message-id="index" />
                    <a 
                      v-if="message.website"
                      :href="message.website"
                      target="_blank"
                      class="website-link"
                      title="访问网站"
                    >
                      <ExternalLink class="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <p class="message-content">{{ message.message }}</p>
              </div>
              
              <!-- 加载更多提示 -->
              <div v-if="isLoading" class="loading-state">
                <div class="spinner"></div>
                <p>加载中...</p>
              </div>
              
              <div v-if="hasMoreMessages && !isLoading" class="load-more-hint">
                向下滑动加载更多
              </div>
              
              <div v-if="!hasMoreMessages && displayedMessages.length > 0" class="no-more-state">
                已加载全部留言
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ExternalLink } from 'lucide-vue-next'
import EmojiReaction from '@/components/EmojiReaction.vue'

interface Message {
  name: string
  email: string
  website?: string
  message: string
  time: Date
}

interface FormData {
  name: string
  email: string
  website: string
  message: string
}

// 模拟接口：获取更多留言
const mockFetchMoreMessages = async (page: number, pageSize: number = 10): Promise<Message[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allMessages = generateMockMessages()
      const start = page * pageSize
      const end = start + pageSize
      resolve(allMessages.slice(start, end))
    }, 500) // 模拟网络延迟
  })
}

// 生成所有模拟消息
const generateMockMessages = (): Message[] => {
  const names = ['测试用户', '小张', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十', '冯十一', '陈十二', '楚十三', '戴十四', '易十五', '范十六', '高十七', '郭十八', '韦十九', '何二十']
  const messages = [
    '这是一个测试留言，页面看起来很棒！',
    '很喜欢你的作品，继续加油！',
    '能否分享一下开发经验？',
    '设计得真不错，很有创意！',
    '代码质量很高，学到了很多东西。',
    '请问这个项目开源吗？很想研究一下。',
    '动画效果做得太棒了！',
    '后端处理速度很快，用户体验很好。',
    '能不能写一篇教程讲讲实现细节？',
    '我是你的忠实粉丝，期待你的新作品！',
    '响应式设计做得很完美，在手机上也很流畅。',
    '有没有考虑做成 PWA 应用？',
    '界面设计精美，交互流畅，非常赞！',
    '请问支持暗黑模式吗？我很喜欢这个功能。',
    '这个项目的技术栈是什么？想学习一下。',
    '分享一下部署的经验吧，对初学者很有帮助。',
    '性能优化做得很好，加载速度飞快！',
    '希望能看到更多案例展示。',
    '代码注释详细，易于理解，赞赞赞！',
    '能否提供源码供学习参考？'
  ]

  const result: Message[] = []
  for (let i = 0; i < 50; i++) {
    result.push({
      name: names[i % names.length],
      email: `user${i}@example.com`,
      website: i % 3 === 0 ? `https://example${i}.com` : undefined,
      message: messages[i % messages.length],
      time: new Date(Date.now() - (i % 30) * 24 * 60 * 60 * 1000)
    })
  }
  return result
}

const formData = ref<FormData>({
  name: '',
  email: '',
  website: '',
  message: ''
})

const messages = ref<Message[]>([
  {
    name: '测试用户',
    email: 'test@example.com',
    website: 'https://example.com',
    message: '这是一个测试留言，页面看起来很棒！',
    time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    name: '小张',
    email: 'zhang@example.com',
    message: '很喜欢你的作品，继续加油！',
    time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    name: '李四',
    email: 'li@example.com',
    website: 'https://blog.example.com',
    message: '能否分享一下开发经验？',
    time: new Date()
  },
  {
    name: '王五',
    email: 'wang@example.com',
    message: '设计得真不错，很有创意！',
    time: new Date(Date.now() - 3 * 60 * 60 * 1000)
  },
  {
    name: '赵六',
    email: 'zhao@example.com',
    website: 'https://portfolio.example.com',
    message: '代码质量很高，学到了很多东西。',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000)
  },
  {
    name: '孙七',
    email: 'sun@example.com',
    message: '请问这个项目开源吗？很想研究一下。',
    time: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    name: '周八',
    email: 'zhou@example.com',
    website: 'https://dev.example.com',
    message: '动画效果做得太棒了！',
    time: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    name: '吴九',
    email: 'wu@example.com',
    message: '后端处理速度很快，用户体验很好。',
    time: new Date(Date.now() - 18 * 60 * 60 * 1000)
  },
  {
    name: '郑十',
    email: 'zheng@example.com',
    website: 'https://tech.example.com',
    message: '能不能写一篇教程讲讲实现细节？',
    time: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000)
  },
  {
    name: '冯十一',
    email: 'feng@example.com',
    message: '我是你的忠实粉丝，期待你的新作品！',
    time: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000)
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = 10
const totalMessages = ref(messages.value.length)
const isLoading = ref(false)
const messageListRef = ref<HTMLElement>()

const displayedMessages = computed(() => {
  return messages.value.slice(0, currentPage.value * pageSize)
})

const hasMoreMessages = computed(() => {
  return displayedMessages.value.length < totalMessages.value
})

// 加载更多消息
const loadMoreMessages = async () => {
  if (isLoading.value || !hasMoreMessages.value) return
  
  isLoading.value = true
  try {
    const moreMessages = await mockFetchMoreMessages(currentPage.value, pageSize)
    if (moreMessages.length > 0) {
      messages.value.push(...moreMessages)
      totalMessages.value = messages.value.length
      currentPage.value++
    }
  } catch (error) {
    console.error('加载留言失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 检测滚动到底部
const handleScroll = () => {
  if (!messageListRef.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement
  // 距离底部300px时触发加载
  if (scrollHeight - scrollTop - clientHeight < 300) {
    loadMoreMessages()
  }
}

onMounted(() => {
  // 初始加载第一页数据
  totalMessages.value = generateMockMessages().length
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const submitMessage = () => {
  if (!formData.value.name || !formData.value.email || !formData.value.message) {
    alert('请填写所有必填项')
    return
  }

  messages.value.unshift({
    name: formData.value.name,
    email: formData.value.email,
    website: formData.value.website || undefined,
    message: formData.value.message,
    time: new Date()
  })
  
  totalMessages.value = messages.value.length

  // 重置表单
  formData.value = {
    name: '',
    email: '',
    website: '',
    message: ''
  }

  alert('感谢你的留言！')
}

const formatDate = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  
  if (days === 0) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours === 0) {
      const minutes = Math.floor(diff / (60 * 1000))
      return `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}
</script>

<style scoped lang="scss">
// 颜色变量
$color-primary: #3b82f6;
$color-primary-dark: #2563eb;
$color-text-dark: #1f2937;
$color-text-light: rgba(255, 255, 255, 0.95);
$color-text-gray: #6b7280;
$color-text-gray-light: #9ca3af;
$color-text-gray-dark: #4b5563;
$color-border: #e5e7eb;
$color-bg-light: #f9fafb;
$color-bg-dark: #1f2937;
$color-bg-darker: #111827;

$color-dark-border: #374151;
$color-dark-border-light: #4b5563;
$color-dark-text: #d1d5db;
$color-dark-text-light: #6b7280;
$color-dark-text-lighter: #f3f4f6;

// 便签颜色
$note-colors: (
  0: (#fef3c7, #fde68a, #92400e, #78350f),
  1: (#fce7f3, #fbcfe8, #831843, #500724),
  2: (#cffafe, #a5f3fc, #164e63, #0e3a47),
  3: (#c7d2fe, #a5b4fc, #312e81, #1e1b4b),
  4: (#d1fae5, #a7f3d0, #064e3b, #042f2e)
);

// 间距变量
$spacing-xs: 12px;
$spacing-sm: 16px;
$spacing-md: 20px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-2xl: 48px;
$spacing-3xl: 80px;

// 圆角变量
$radius-sm: 6px;
$radius-md: 8px;
$radius-lg: 12px;
$radius-xl: 16px;

// 字体大小
$font-xs: 12px;
$font-sm: 14px;
$font-base: 15px;
$font-lg: 16px;
$font-xl: 18px;
$font-2xl: 20px;
$font-3xl: 28px;
$font-4xl: 36px;

.guestbook-container {
  width: 100%;
  max-width: 56rem;
  margin: 0 auto;
  padding: $spacing-3xl $spacing-sm;

  @media (min-width: 640px) {
    padding: $spacing-3xl $spacing-lg;
  }

  @media (min-width: 1024px) {
    padding: $spacing-3xl $spacing-xl;
  }
}

.guestbook-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: $radius-xl;
  padding: $spacing-2xl;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  .dark & {
    background: rgba(17, 24, 39, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
}

.header {
  margin-bottom: $spacing-2xl;
  text-align: center;
}

.icon {
  display: flex;
  justify-content: center;
  margin-bottom: $spacing-lg;
}

.title {
  font-size: $font-4xl;
  font-weight: 700;
  color: $color-text-dark;
  margin-bottom: $spacing-xs;
  letter-spacing: -0.5px;

  .dark & {
    color: $color-text-light;
  }
}

.subtitle {
  font-size: $font-xl;
  color: $color-text-gray;
  font-weight: 400;

  .dark & {
    color: rgba(255, 255, 255, 0.6);
  }
}

.message-form-section {
  margin-bottom: $spacing-2xl;
  padding: $spacing-xl;
  background: $color-bg-light;
  border-radius: $radius-lg;
  border: 1px solid $color-border;

  .dark & {
    background: $color-bg-dark;
    border: 1px solid $color-dark-border;
  }
}

.section-title {
  font-size: $font-2xl;
  font-weight: 600;
  color: $color-text-dark;
  margin-bottom: $spacing-lg;
  padding-bottom: $spacing-xs;
  border-bottom: 2px solid $color-border;

  .dark & {
    color: white;
    border-bottom-color: $color-dark-border;
  }
}

.message-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: $font-sm;
  font-weight: 500;
  color: $color-dark-border;
  margin-bottom: $spacing-xs;

  .dark & {
    color: $color-dark-text;
  }
}

.form-input,
.form-textarea {
  padding: $spacing-xs $spacing-sm;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  font-size: $font-sm;
  background: white;
  color: $color-text-dark;
  font-family: inherit;
  transition: all 0.2s ease;

  .dark & {
    background: $color-bg-darker;
    border-color: $color-dark-border-light;
    color: $color-dark-text-lighter;
  }

  &:focus {
    outline: none;
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);

    .dark & {
      border-color: #60a5fa;
    }
  }
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.submit-button {
  padding: $spacing-xs $spacing-lg;
  background: linear-gradient(135deg, $color-primary 0%, $color-primary-dark 100%);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: $font-sm;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.messages-section {
  margin-top: $spacing-2xl;
}

.empty-state {
  text-align: center;
  padding: 40px $spacing-md;
  color: $color-text-gray-light;
  font-size: $font-lg;

  .dark & {
    color: $color-dark-text-light;
  }
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.message-item {
  background: white;
  border-radius: $radius-md;
  padding: $spacing-md;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

    .dark & {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }

  // 便签样式
  @each $index, $colors in $note-colors {
    &.note-color-#{$index} {
      $light-start: nth($colors, 1);
      $light-end: nth($colors, 2);
      $dark-start: nth($colors, 3);
      $dark-end: nth($colors, 4);

      background: linear-gradient(135deg, $light-start 0%, $light-end 100%);

      .dark & {
        background: linear-gradient(135deg, $dark-start 0%, $dark-end 100%);
      }
    }
  }
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-xs;
  gap: $spacing-xs;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.message-actions {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  flex-shrink: 0;
}

.user-name {
  font-size: $font-lg;
  font-weight: 600;
  color: $color-text-dark;
  margin: 0;

  .dark & {
    color: white;
  }
}

.message-time {
  font-size: $font-xs;
  color: $color-text-gray-light;

  .dark & {
    color: $color-dark-text-light;
  }
}

.website-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: $radius-sm;
  background: $color-bg-light;
  color: $color-dark-border;
  text-decoration: none;
  transition: all 0.2s ease;
  flex-shrink: 0;

  .dark & {
    background: $color-dark-border;
    color: $color-dark-text;
  }

  &:hover {
    background: $color-border;
    color: $color-text-dark;

    .dark & {
      background: $color-dark-border-light;
      color: $color-dark-text-lighter;
    }
  }
}

.message-content {
  color: $color-text-gray-dark;
  font-size: $font-base;
  line-height: 1.6;
  margin: 0;
  word-break: break-word;

  .dark & {
    color: $color-dark-text;
  }
}

// 加载状态样式
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-2xl $spacing-md;
  color: $color-text-gray;

  .dark & {
    color: $color-dark-text-light;
  }
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid $color-border;
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: $spacing-md;

  .dark & {
    border-color: $color-dark-border;
    border-top-color: #60a5fa;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.load-more-hint {
  text-align: center;
  padding: $spacing-lg;
  color: $color-text-gray-light;
  font-size: $font-sm;
  animation: fadeInOut 2s ease-in-out infinite;

  .dark & {
    color: $color-dark-text-light;
  }
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.no-more-state {
  text-align: center;
  padding: $spacing-lg;
  color: $color-text-gray-light;
  font-size: $font-sm;

  .dark & {
    color: $color-dark-text-light;
  }
}

@media (max-width: 768px) {
  .guestbook-card {
    padding: $spacing-xl $spacing-lg;
  }

  .title {
    font-size: $font-3xl;
  }

  .message-form-section {
    padding: $spacing-lg;
  }

  .message-header {
    flex-direction: column;
  }

  .website-link {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .guestbook-container {
    padding: $spacing-sm;
  }

  .guestbook-card {
    padding: $spacing-lg $spacing-md;
  }

  .header {
    margin-bottom: $spacing-xl;
  }

  .message-form-section {
    padding: $spacing-md;
  }

  .section-title {
    font-size: $font-xl;
  }

  .form-input,
  .form-textarea {
    font-size: $font-lg;
  }
}
</style>
