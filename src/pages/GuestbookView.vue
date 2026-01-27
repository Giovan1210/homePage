<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-50 dark:from-gray-900 dark:via-blue-900 dark:to-blue-900 relative"
  >
    <!-- Background blur effects -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="absolute -top-40 -right-40 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl"
      ></div>
      <div
        class="hidden absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/10 dark:bg-pink-500/5 rounded-full blur-3xl"
      ></div>
    </div>

    <!-- Content overlay -->
    <div class="relative z-10">
      <div class="guestbook-container">
        <div class="guestbook-card">
          <!-- Header -->
          <div class="header">
            <h1 class="title">留言板</h1>
            <p class="subtitle">
              在这里留下你的想法和建议，我会认真阅读每一条留言 💬。
            </p>
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
                  type="text"
                  inputmode="url"
                  class="form-input"
                  placeholder="例如：example.com 或 https://example.com"
                  autocomplete="url"
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

              <button
                type="submit"
                class="submit-button"
                :disabled="submitting"
              >
                {{ submitting ? "提交中..." : "提交留言" }}
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
                :key="message.id || index"
                :class="['message-item', `note-color-${index % 5}`]"
              >
                <div class="message-header">
                  <div class="user-info">
                    <div class="flex items-end gap-20px" >
                      <div
                        v-if="message.avatar"
                        v-html="message.avatar"
                      ></div>
                      <h3 class="user-name">{{ message.name }}</h3>
                    </div>
                    <span class="message-time">{{
                      formatDate(message.createdAt)
                    }}</span>
                  </div>
                  <div class="message-actions">
                    <EmojiReaction
                      :message-id="message.id || index"
                      :reactions="message.reactions"
                    />
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
                <p class="message-content">{{ message.content }}</p>
                <div class="message-meta">
                  <span
                    v-if="message.os || message.browser || message.deviceType"
                    class="meta-chip"
                  >
                    <component
                      v-if="getOsIcon(message.os)"
                      :is="getOsIcon(message.os)"
                      class="meta-icon"
                    />
                    {{ message.os || "未知OS" }}
                    <span class="meta-sep">·</span>
                    <component
                      v-if="getBrowserIcon(message.browser)"
                      :is="getBrowserIcon(message.browser)"
                      class="meta-icon"
                    />
                    {{ message.browser || "未知浏览器" }}
                    <template v-if="message.deviceType">
                      <span class="meta-sep">·</span>
                      <component
                        :is="getDeviceIcon(message.deviceType)"
                        class="meta-icon"
                      />
                      {{ message.deviceType }}
                    </template>
                  </span>
                  <span v-if="message.location" class="meta-chip">
                    来源：{{ formatLocation(message.location) }}
                  </span>
                </div>
              </div>

              <!-- 加载更多提示 -->
              <div v-if="isLoading" class="loading-state">
                <div class="spinner"></div>
                <p>加载中...</p>
              </div>

              <div v-if="hasMoreMessages && !isLoading" class="load-more-hint">
                向下滑动加载更多
              </div>

              <div
                v-if="!hasMoreMessages && displayedMessages.length > 0"
                class="no-more-state"
              >
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
import {
  ExternalLink,
  Apple,
  Chrome,
  Compass,
  Monitor,
  Laptop,
  Smartphone,
  Globe,
} from "lucide-vue-next";
import { ElMessage } from "element-plus";
import EmojiReaction from "@/components/EmojiReaction.vue";
import request from "@/api/request";
import { buildAvatarSvg } from "@/utils/avatarSvg";

interface MessageItem {
  id: string;
  name: string;
  email: string;
  website?: string;
  avatar?: string;
  content: string;
  createdAt: string;
  reactions?: Record<string, number>;
  status?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  referer?: string;
  language?: string;
  location?: string | null;
}

interface FormData {
  name: string;
  email: string;
  website: string;
  message: string;
}

const formData = ref<FormData>({
  name: "",
  email: "",
  website: "",
  message: "",
});

const messages = ref<MessageItem[]>([]);
const totalMessages = ref(0);
const page = ref(1);
const pageSize = 10;
const isLoading = ref(false);
const submitting = ref(false);
const messageListRef = ref<HTMLElement>();

const displayedMessages = computed(() => messages.value);
const hasMoreMessages = computed(
  () => messages.value.length < totalMessages.value,
);

const mapMessage = (item: any): MessageItem | null => {
  const id = String(item?._id ?? item?.id ?? "");
  if (!id) return null;
  const location = (() => {
    if (!item?.location) return null;
    // 如果是字符串直接返回
    if (typeof item.location === "string") return item.location;
    // 对象场景：优先“国家 省份 城市”顺序
    const country = item.location.country || item.location.countryName || "";
    const region = item.location.region || item.location.province || "";
    const city = item.location.city || "";
    const parts = [country, region, city].filter(Boolean);
    return parts.length ? parts.join(" ") : null;
  })();
  const referer = typeof item?.referer === "string" ? item.referer : "";
  return {
    id,
    name: item.name,
    email: item.email,
    website: item.website,
    avatar: item.avatar,
    content: item.content ?? item.message,
    createdAt: item.createdAt ?? item.time ?? new Date().toISOString(),
    reactions: item.reactions,
    status: item.status,
    browser: item.browser,
    os: item.os,
    deviceType: item.deviceType,
    referer,
    language: item.language,
    location,
  };
};

const svgToDataUrl = (svg: string) =>
  svg ? `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` : "";

const fetchMessages = async (reset = false) => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const targetPage = reset ? 1 : page.value;
    const res = await request.get("/messages", {
      params: { page: targetPage, pageSize, status: "approved" },
    });
    const list = (res as any)?.data ?? (res as any)?.items ?? res ?? [];
    const meta = (res as any)?.meta ?? (res as any)?.pagination ?? {};
    const mapped = Array.isArray(list)
      ? list.map(mapMessage).filter((m): m is MessageItem => Boolean(m))
      : [];

    // 为缺少头像的记录生成一个
    const mappedWithAvatar = await Promise.all(
      mapped.map(async (m) => {
        if (m.avatar) return m;
        const svg = await buildAvatarSvg();
        return { ...m, avatar: svg };
      }),
    );

    if (reset) {
      messages.value = [];
      page.value = 1;
    }

    messages.value = reset
      ? mappedWithAvatar
      : [...messages.value, ...mappedWithAvatar];
    totalMessages.value = Number(
      meta.total ?? totalMessages.value ?? messages.value.length,
    );

    if (mapped.length && !reset) {
      page.value += 1;
    } else if (reset && mapped.length) {
      page.value = 2;
    }
  } catch (error) {
    console.error("加载留言失败:", error);
    ElMessage.error("加载留言失败，请稍后再试");
  } finally {
    isLoading.value = false;
  }
};

const loadMoreMessages = () => {
  if (isLoading.value || !hasMoreMessages.value) return;
  fetchMessages();
};

const handleScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollHeight - scrollTop - clientHeight < 300) {
    loadMoreMessages();
  }
};

onMounted(async () => {
  fetchMessages(true);
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const submitMessage = async () => {
  if (
    !formData.value.name ||
    !formData.value.email ||
    !formData.value.message
  ) {
    ElMessage.warning("请填写所有必填项");
    return;
  }
  if (submitting.value) return;
  submitting.value = true;
  try {
    const websiteNormalized = normalizeWebsite(formData.value.website);
    const avatarSvg = await buildAvatarSvg();

    await request.post("/messages", {
      name: formData.value.name,
      email: formData.value.email,
      website: websiteNormalized || undefined,
      avatar:avatarSvg,
      content: formData.value.message,
    });

    formData.value = {
      name: "",
      email: "",
      website: "",
      message: "",
    };

    ElMessage.success("提交成功，待审核通过后展示");
    // 重新加载列表
    fetchMessages(true);
  } catch (error) {
    console.error("提交留言失败:", error);
    const msg =
      (error as any)?.response?.data?.message || "提交失败，请稍后再试";
    ElMessage.error(msg);
  } finally {
    submitting.value = false;
  }
};

// 规范化网站输入：自动补全协议，非法则置空
const normalizeWebsite = (url: string) => {
  if (!url) return "";
  let u = url.trim();
  if (!u) return "";
  // 已包含协议且合法
  try {
    new URL(u);
    return u;
  } catch {}
  // 缺失协议时补全 https://
  if (!/^https?:\/\//i.test(u)) {
    u = `https://${u}`;
  }
  try {
    new URL(u);
    return u;
  } catch {
    return "";
  }
};

const formatDate = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (days === 0) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours === 0) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes}分钟前`;
    }
    return `${hours}小时前`;
  } else if (days === 1) {
    return "昨天";
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString("zh-CN");
  }
};

const formatReferer = (ref: string) => {
  if (!ref) return "";
  try {
    const url = new URL(ref);
    return url.host + url.pathname.replace(/\/$/, "");
  } catch {
    return ref;
  }
};

// 格式化 location 字段为“国家 省份 城市”格式
const formatLocation = (loc: string | undefined | null) => {
  if (!loc) return "";
  // 已是格式化字符串
  if (typeof loc === "string") {
    // 若包含空格或分隔符，直接返回
    if (loc.includes("·") || loc.includes(" ")) return loc;
    return loc;
  }
  try {
    const obj = typeof loc === "string" ? JSON.parse(loc) : loc;
    if (!obj) return "";
    const country = obj.country || obj.countryName || "";
    const region = obj.region || obj.province || "";
    const city = obj.city || "";
    return [country, region, city].filter(Boolean).join(" ");
  } catch {
    return String(loc);
  }
};

const osIconMap: Record<string, any> = {
  macos: Apple,
  mac: Apple,
  windows: Laptop,
  win: Laptop,
  linux: Monitor,
};

const browserIconMap: Record<string, any> = {
  chrome: Chrome,
  safari: Compass,
  edge: Compass,
  firefox: Compass,
};

const deviceIconMap: Record<string, any> = {
  desktop: Monitor,
  laptop: Laptop,
  mobile: Smartphone,
  tablet: Smartphone,
};

const getOsIcon = (os?: string) => {
  if (!os) return null;
  const key = os.toLowerCase();
  return osIconMap[key] || Globe;
};

const getBrowserIcon = (browser?: string) => {
  if (!browser) return null;
  const key = browser.toLowerCase();
  return browserIconMap[key] || Globe;
};

const getDeviceIcon = (device?: string) => {
  if (!device) return null;
  const key = device.toLowerCase();
  return deviceIconMap[key] || Monitor;
};
</script>

<style scoped lang="scss">
@use "sass:list";
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
  0: (
    #fef3c7,
    #fde68a,
    #92400e,
    #78350f,
  ),
  1: (
    #fce7f3,
    #fbcfe8,
    #831843,
    #500724,
  ),
  2: (
    #cffafe,
    #a5f3fc,
    #164e63,
    #0e3a47,
  ),
  3: (
    #c7d2fe,
    #a5b4fc,
    #312e81,
    #1e1b4b,
  ),
  4: (
    #d1fae5,
    #a7f3d0,
    #064e3b,
    #042f2e,
  ),
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

.message-form {
  --el-fill-color-light: transparent;
  --el-border-color: #e5e7eb;
  --el-text-color-regular: $color-text-dark;
}

.dark .message-form {
  --el-border-color: #374151;
  --el-text-color-regular: #d1d5db;
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
  background: linear-gradient(
    135deg,
    $color-primary 0%,
    $color-primary-dark 100%
  );
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
      $light-start: list.nth($colors, 1);
      $light-end: list.nth($colors, 2);
      $dark-start: list.nth($colors, 3);
      $dark-end: list.nth($colors, 4);

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

.message-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: $spacing-xs;
  margin-top: $spacing-xs;
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: $font-xs;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.12);
  color: #047857;

  .dark & {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
  }
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: $font-xs;
  background: rgba(255, 255, 255, 0.6);
  color: $color-text-gray-dark;
  border: 1px solid rgba(0, 0, 0, 0.05);
  gap: 4px;

  .dark & {
    background: rgba(255, 255, 255, 0.05);
    color: $color-dark-text;
    border-color: rgba(255, 255, 255, 0.08);
  }
}

.meta-icon {
  width: 14px;
  height: 14px;
}

.meta-sep {
  opacity: 0.6;
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
  0%,
  100% {
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
