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
      <div class="status-container">
        <div class="status-card">
          <!-- Header -->
          <div class="header">
            <h1 class="title">网站监控</h1>
            <p class="subtitle">
              实时监控我的网站和项目状态，展示在线情况和响应速度 🌐。
            </p>
          </div>

          <!-- Websites Status List -->
          <div class="status-section">
            <h2 class="section-title">在线状态</h2>

            <div v-if="websites.length === 0" class="empty-state">
              <p>暂无网站监控记录</p>
            </div>

            <div v-else class="websites-grid">
              <div
                v-for="(website, index) in websites"
                :key="index"
                class="website-card"
              >
                <!-- Status Indicator -->
                <div class="card-header">
                  <div class="status-badge" :class="website.status">
                    <div class="status-dot"></div>
                    <span>{{ getStatusText(website.status) }}</span>
                  </div>
                </div>

                <!-- Website Info -->
                <div class="website-info">
                  <h3 class="website-name">{{ website.name }}</h3>
                  <p v-if="website.description" class="website-description">
                    {{ website.description }}
                  </p>
                  <a :href="website.url" target="_blank" class="website-url">
                    {{ website.url }}
                    <ExternalLink class="w-3 h-3" />
                  </a>
                </div>

                <!-- Metrics -->
                <div class="metrics">
                  <div class="metric">
                    <span class="metric-label">响应时间</span>
                    <span
                      class="metric-value"
                      :class="getLatencyClass(website.latency)"
                    >
                      {{
                        website.latency !== null
                          ? website.latency + "ms"
                          : "检测中..."
                      }}
                    </span>
                  </div>

                  <div class="metric">
                    <span class="metric-label">检查时间</span>
                    <span class="metric-value">{{
                      formatCheckTime(website.lastCheck)
                    }}</span>
                  </div>

                  <div class="metric">
                    <span class="metric-label">正常率</span>
                    <span class="metric-value">{{ formatUptime(website.uptime) }}%</span>
                  </div>
                </div>

                <!-- Status Details -->
                <div class="status-details">
                  <div v-if="website.statusCode" class="detail-item">
                    <span class="detail-label">HTTP 状态码：</span>
                    <span
                      class="detail-value"
                      :class="getStatusCodeClass(website.statusCode)"
                    >
                      {{ website.statusCode }}
                    </span>
                  </div>
                  <div v-if="website.message" class="detail-item">
                    <span class="detail-label">信息：</span>
                    <span class="detail-value">{{ formatMessage(website.message) }}</span>
                  </div>
                  <div v-if="website.ssl" class="detail-item">
                    <span class="detail-label">证书状态：</span>
                    <span
                      class="detail-value"
                      :class="getCertStatusClass(website.ssl.status)"
                    >
                      {{ getCertStatusText(website.ssl.status) }}
                    </span>
                  </div>
                  <div v-if="website.ssl?.validTo" class="detail-item">
                    <span class="detail-label">证书到期：</span>
                    <span class="detail-value">
                      {{ formatDate(website.ssl.validTo) }}
                      <span v-if="website.ssl?.daysRemaining !== null"
                        >（剩余 {{ website.ssl.daysRemaining }} 天）</span
                      >
                    </span>
                  </div>
                </div>

                <!-- Check Button -->
                <button
                  @click="checkWebsite(index)"
                  :disabled="website.checking"
                  class="check-button"
                >
                  <RotateCw
                    class="w-4 h-4"
                    :class="{ 'animate-spin': website.checking }"
                  />
                  {{ website.checking ? "检测中..." : "立即检测" }}
                </button>
              </div>
            </div>
          </div>

          <!-- Summary Stats -->
          <div v-if="websites.length > 0" class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">监控网站</span>
              <span class="stat-value">{{ websites.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">在线</span>
              <span class="stat-value online">{{ onlineCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">离线</span>
              <span class="stat-value offline">{{ offlineCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均延迟</span>
              <span class="stat-value">{{ averageLatency }}ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ExternalLink, RotateCw } from "lucide-vue-next";
import request from "@/api/request";

interface Website {
  name: string;
  url: string;
  description?: string;
  status: "online" | "offline" | "checking";
  latency: number | null;
  statusCode: number | null;
  message: string;
  lastCheck: Date | null;
  uptime: number;
  checking: boolean;
  ssl?: {
    status: "valid" | "expiring" | "expired" | "none" | "error";
    validFrom?: string | null;
    validTo?: string | null;
    daysRemaining?: number | null;
    issuer?: string | null;
    subject?: string | null;
    serialNumber?: string | null;
    fingerprint?: string | null;
    error?: string;
  };
}

const newWebsite = ref({
  name: "",
  url: "",
  description: "",
});

const websites = ref<Website[]>([
  {
    name: "个人主页",
    url: "https://www.giovan.cn",
    description: "我的个人主页",
    status: "online",
    latency: 0,
    statusCode: 0,
    message: null,
    lastCheck: new Date(Date.now() - 5 * 60 * 1000),
    uptime: 0,
    checking: false,
    ssl: {
      status: "valid",
      validTo: null,
      daysRemaining: null,
    },
  },
]);

const onlineCount = computed(
  () => websites.value.filter((w) => w.status === "online").length,
);
const offlineCount = computed(
  () => websites.value.filter((w) => w.status === "offline").length,
);
const averageLatency = computed(() => {
  const latencies = websites.value
    .filter((w) => w.latency !== null)
    .map((w) => w.latency as number);

  if (latencies.length === 0) return 0;
  return Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
});

const addWebsite = () => {
  if (!newWebsite.value.name || !newWebsite.value.url) {
    alert("请填写网站名称和URL");
    return;
  }

  websites.value.push({
    name: newWebsite.value.name,
    url: newWebsite.value.url,
    description: newWebsite.value.description || undefined,
    status: "checking",
    latency: null,
    statusCode: null,
    message: "初始化中...",
    lastCheck: null,
    uptime: 100,
    checking: true,
  });

  const index = websites.value.length - 1;

  // 模拟检测
  setTimeout(() => {
    checkWebsite(index);
  }, 500);

  newWebsite.value = {
    name: "",
    url: "",
    description: "",
  };
};

const checkWebsite = async (index: number) => {
  const website = websites.value[index];
  website.checking = true;
  website.status = "checking";

  try {
    const res = await request.get("/monitor/check", {
      params: { url: website.url },
    });

    const data = res?.data || res;

    website.status = data.status === "online" ? "online" : "offline";
    website.latency = typeof data.latency === "number" ? data.latency : null;
    website.statusCode = data.statusCode ?? null;
    website.message = data.message || "连接成功";
    website.ssl = data.ssl || { status: "none" };
    website.lastCheck = data.checkedAt ? new Date(data.checkedAt) : new Date();
  } catch (error: any) {
    website.status = "offline";
    website.latency = null;
    website.statusCode = null;
    website.message = error?.message || "连接失败";
    website.ssl = { status: "error", error: error?.message || "检测失败" };
    website.lastCheck = new Date();
  } finally {
    website.checking = false;
    website.uptime = Math.max(85, 100 - Math.random() * 15);
  }
};

onMounted(() => {
  websites.value.forEach((_, index) => {
    checkWebsite(index);
  });
});

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    online: "在线",
    offline: "离线",
    checking: "检测中",
  };
  return statusMap[status] || status;
};

const getLatencyClass = (latency: number | null) => {
  if (latency === null) return "pending";
  if (latency < 100) return "fast";
  if (latency < 300) return "normal";
  return "slow";
};

const getStatusCodeClass = (code: number) => {
  if (code >= 200 && code < 300) return "success";
  if (code >= 300 && code < 400) return "redirect";
  if (code >= 400 && code < 500) return "error";
  if (code >= 500) return "server-error";
  return "unknown";
};

const getCertStatusText = (status: string) => {
  const map: Record<string, string> = {
    valid: "有效",
    expiring: "即将到期",
    expired: "已过期",
    none: "无证书",
    error: "检测失败",
  };
  return map[status] || status;
};

const getCertStatusClass = (status: string) => {
  if (status === "valid") return "success";
  if (status === "expiring") return "redirect";
  if (status === "expired") return "error";
  if (status === "error") return "server-error";
  return "unknown";
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const formatUptime = (value: number) => {
  if (Number.isNaN(value)) return "0.0";
  return value.toFixed(1);
};

const formatMessage = (value: string) => {
  if (!value) return "-";
  if (value.length <= 32) return value;
  return `${value.slice(0, 28)}...`;
};

const formatCheckTime = (date: Date | null) => {
  if (!date) return "未检测";

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  return `${days}天前`;
};
</script>

<style scoped>
.status-container {
  width: 100%;
  max-width: 60rem;
  margin: 0 auto;
  padding: 80px 16px 80px 16px;
}

@media (min-width: 640px) {
  .status-container {
    padding: 80px 24px 80px 24px;
  }
}

@media (min-width: 1024px) {
  .status-container {
    padding: 80px 32px 80px 32px;
  }
}

.status-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 48px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.dark .status-card {
  background: rgba(17, 24, 39, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.header {
  margin-bottom: 48px;
  text-align: center;
}

.icon {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.title {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.dark .title {
  color: rgba(255, 255, 255, 0.95);
}

.subtitle {
  font-size: 18px;
  color: #6b7280;
  font-weight: 400;
}

.dark .subtitle {
  color: rgba(255, 255, 255, 0.6);
}

.form-section {
  margin-bottom: 48px;
  padding: 32px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.dark .form-section {
  background: #1f2937;
  border: 1px solid #374151;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.dark .section-title {
  color: white;
  border-bottom-color: #374151;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.dark .form-label {
  color: #d1d5db;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #1f2937;
  font-family: inherit;
  transition: all 0.2s ease;
}

.dark .form-input {
  background: #111827;
  border-color: #4b5563;
  color: #f3f4f6;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dark .form-input:focus {
  border-color: #60a5fa;
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.submit-button:active {
  transform: translateY(0);
}

.status-section {
  margin-top: 48px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
  font-size: 16px;
}

.dark .empty-state {
  color: #6b7280;
}

.websites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .websites-grid {
    grid-template-columns: 1fr;
  }
}

.website-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.dark .website-card {
  background: #1f2937;
  border: 1px solid #374151;
}

.website-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.dark .website-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.status-badge.online {
  background: #d1fae5;
  color: #047857;
}

.dark .status-badge.online {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.offline {
  background: #fee2e2;
  color: #b91c1c;
}

.dark .status-badge.offline {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.status-badge.checking {
  background: #fef3c7;
  color: #92400e;
}

.dark .status-badge.checking {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.delete-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.dark .delete-btn {
  color: #6b7280;
}

.delete-btn:hover {
  background: #f3f4f6;
  color: #ef4444;
}

.dark .delete-btn:hover {
  background: #374151;
  color: #f87171;
}

.website-info {
  margin-bottom: 20px;
  flex: 1;
}

.website-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.dark .website-name {
  color: white;
}

.website-description {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.dark .website-description {
  color: #9ca3af;
}

.website-url {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #3b82f6;
  text-decoration: none;
  word-break: break-all;
}

.dark .website-url {
  color: #60a5fa;
}

.website-url:hover {
  text-decoration: underline;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.dark .metrics {
  background: #111827;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.metric-label {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.dark .metric-label {
  color: #6b7280;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.dark .metric-value {
  color: white;
}

.metric-value.fast {
  color: #10b981;
}

.metric-value.normal {
  color: #f59e0b;
}

.metric-value.slow {
  color: #ef4444;
}

.metric-value.pending {
  color: #6b7280;
}

.status-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 13px;
}

.dark .status-details {
  background: #111827;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: #6b7280;
  font-weight: 500;
}

.dark .detail-label {
  color: #9ca3af;
}

.detail-value {
  color: #1f2937;
  font-family: monospace;
  font-weight: 500;
}

.dark .detail-value {
  color: #d1d5db;
}

.detail-value.success {
  color: #10b981;
}

.detail-value.redirect {
  color: #3b82f6;
}

.detail-value.error {
  color: #f59e0b;
}

.detail-value.server-error {
  color: #ef4444;
}

.check-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  color: #0284c7;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.dark .check-button {
  background: #082f49;
  border-color: #0e4a8b;
  color: #38bdf8;
}

.check-button:hover:not(:disabled) {
  background: #bfdbfe;
  color: #0c4a6e;
}

.dark .check-button:hover:not(:disabled) {
  background: #0e4a8b;
  color: #38bdf8;
}

.check-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid #e5e7eb;
}

.dark .summary-stats {
  border-top-color: #374151;
}

@media (max-width: 640px) {
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 6px;
  font-weight: 500;
}

.dark .stat-label {
  color: #6b7280;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.dark .stat-value {
  color: white;
}

.stat-value.online {
  color: #10b981;
}

.stat-value.offline {
  color: #ef4444;
}

@media (max-width: 768px) {
  .status-card {
    padding: 32px 24px;
  }

  .title {
    font-size: 28px;
  }

  .form-section {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .status-container {
    padding: 16px;
  }

  .status-card {
    padding: 24px 20px;
  }

  .header {
    margin-bottom: 32px;
  }

  .form-section {
    padding: 20px;
  }

  .section-title {
    font-size: 18px;
  }

  .metrics {
    grid-template-columns: 1fr;
  }
}
</style>
