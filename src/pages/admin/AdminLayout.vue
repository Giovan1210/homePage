<template>
  <el-container class="admin-container">
    <el-header class="admin-header">
      <div class="header-left">
        <el-button
          class="mobile-menu-btn hidden-md-and-up"
          type="primary"
          plain
          @click="mobileMenuOpen = true"
        >
          菜单
        </el-button>
        <div>
          <div class="header-title">管理后台</div>
          <div class="header-subtitle">
            欢迎回来，{{ authStore.user?.username || "admin" }}
          </div>
        </div>
      </div>
      <div class="header-actions">
        <el-button type="danger" plain size="small" @click="handleLogout"
          >退出登录</el-button
        >
      </div>
    </el-header>

    <el-container class="admin-body">
      <el-aside
        class="admin-sidebar hidden-sm-and-down"
        :width="sidebarCollapsed ? '64px' : '240px'"
      >
        <el-scrollbar class="sidebar-scroll">
          <el-menu
            class="admin-menu"
            :default-active="activeMenu"
            :collapse="sidebarCollapsed"
            @select="activeMenu = $event"
          >
            <el-menu-item
              v-for="item in menuItems"
              :key="item.id"
              :index="item.id"
            >
              <component :is="item.icon" class="nav-icon mr-10px" />
              <span class="nav-label">{{ item.label }}</span>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </el-aside>

      <el-main class="admin-main">
        <div class="content-wrapper">
          <KeepAlive>
            <component :is="currentComponent" />
          </KeepAlive>
        </div>
      </el-main>
    </el-container>

    <el-footer class="admin-footer">
      <span>© 2026 管理后台</span>
    </el-footer>

    <el-drawer
      v-model="mobileMenuOpen"
      title="菜单"
      size="70%"
      direction="ltr"
      class="hidden-md-and-up"
    >
      <el-menu
        class="admin-menu"
        :default-active="activeMenu"
        @select="handleMobileSelect"
      >
        <el-menu-item v-for="item in menuItems" :key="item.id" :index="item.id">
          <component :is="item.icon" class="nav-icon " />
          <span class="nav-label">{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-drawer>
  </el-container>
</template>

<script setup lang="ts">
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  Heart,
  Activity,
  Users,
} from "lucide-vue-next";
import DashboardPage from "./components/DashboardPage.vue";
import UsersPage from "./components/UsersPage.vue";
import MessagesPage from "./components/MessagesPage.vue";
import AccessLogsPage from "./components/AccessLogsPage.vue";
import SettingsPage from "./components/SettingsPage.vue";
import SponsorsPage from "./components/SponsorsPage.vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const sidebarCollapsed = ref(false);
const activeMenu = ref("dashboard");
const mobileMenuOpen = ref(false);
const authStore = useAuthStore();
const router = useRouter();

const menuItems = [
  { id: "dashboard", label: "仪表板", icon: LayoutDashboard },
  { id: "users", label: "用户管理", icon: Users },
  { id: "messages", label: "留言管理", icon: MessageSquare },
  { id: "accessLogs", label: "访问记录", icon: Activity },
  { id: "sponsors", label: "赞助管理", icon: Heart },
  { id: "settings", label: "系统设置", icon: Settings },
];

// 动态组件映射
const componentMap: Record<string, any> = {
  dashboard: DashboardPage,
  users: UsersPage,
  messages: MessagesPage,
  accessLogs: AccessLogsPage,
  sponsors: SponsorsPage,
  settings: SettingsPage,
};

// 根据activeMenu返回对应的组件
const currentComponent = computed(() => {
  return componentMap[activeMenu.value] || DashboardPage;
});

const handleMobileSelect = (value: string) => {
  activeMenu.value = value;
  mobileMenuOpen.value = false;
};

const handleLogout = () => {
  authStore.logout();
  router.replace("/admin/login");
};
</script>

<style scoped lang="scss">
.admin-container {
  height: 100vh;
  background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
  transition: background 0.3s ease;
}

.admin-body {
  flex: 1;
  min-height: 0;
}

.admin-sidebar {
  height: 100%;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.sidebar-scroll {
  height: 100%;
}

.admin-menu {
  height: 100%;
  border-right: none;
}

.nav-icon {
  width: 18px;
  height: 18px;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
  padding-left: 10px;
}

.admin-main {
  flex: 1;
  padding: 12px 16px 16px;
  overflow-y: auto;
  background: transparent;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  border-radius: 0;
  background: #ffffff;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.header-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-menu-btn {
  height: 34px;
  padding: 0 12px;
}

.content-wrapper {
  max-width: 100%;
  margin: 0 auto;
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.admin-footer {
  text-align: center;
  color: #6b7280;
  font-size: 12px;
  padding: 10px 16px;
  background: #ffffff;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}


:deep(.el-card) {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

:deep(.el-card):hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

:deep(.el-button.is-primary) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
}

:deep(.el-button.is-primary):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

:deep(.el-button.is-plain):hover {
  background-color: rgba(59, 130, 246, 0.1) !important;
}


:deep(.el-input .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

:deep(.el-input .el-input__wrapper):hover {
  border-color: rgba(59, 130, 246, 0.5);
}

:deep(.el-input.is-focus .el-input__wrapper) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

:deep(.el-input .el-input__inner) {
  color: #1f2937;
}

:deep(.el-input .el-input__inner::placeholder) {
  color: #9ca3af;
}

:deep(.el-table) {
  background: transparent;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background: rgba(59, 130, 246, 0.08);
  color: #1f2937;
  font-weight: 600;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

:deep(.el-table td) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  color: #374151;
}

:deep(.el-table tr):hover > td {
  background: rgba(59, 130, 246, 0.05) !important;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  color: #374151;
  font-weight: 500;
}

:deep(.el-form-item__content) {
  color: #6b7280;
}

:deep(.el-tag) {
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  border: none;
}

:deep(.el-tag.is-success) {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

:deep(.el-tag.is-info) {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

:deep(.el-tag.is-warning) {
  background: rgba(245, 158, 11, 0.1);
  color: #b45309;
}

:deep(.el-tag.is-danger) {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

:deep(.el-switch .is-checked) {
  background-color: #3b82f6;
}

@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
  }

  .admin-main {
    width: 100%;
    padding: 16px;
  }

  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
