<template>
  <div class="admin-container">
    <!-- Main Content -->
    <div class="admin-content">
      <!-- Sidebar -->
      <aside class="admin-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <nav class="sidebar-nav">
          <div
            v-for="item in menuItems"
            :key="item.id"
            class="nav-item"
            :class="{ active: activeMenu === item.id }"
            @click="activeMenu = item.id"
          >
            <component :is="item.icon" class="nav-icon" />
            <span class="nav-label">{{ item.label }}</span>
          </div>
        </nav>
      </aside>

      <!-- Page Content -->
      <main class="admin-main">
        <div class="content-wrapper">
          <KeepAlive>
            <component :is="currentComponent" />
          </KeepAlive>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardPage from './components/DashboardPage.vue'
import UsersPage from './components/UsersPage.vue'
import MessagesPage from './components/MessagesPage.vue'
import SettingsPage from './components/SettingsPage.vue'

const sidebarCollapsed = ref(false)
const activeMenu = ref('dashboard')

const menuItems = [
  { id: 'dashboard', label: '仪表板', icon: 'Dashboard' },
  { id: 'users', label: '用户管理', icon: 'Users' },
  { id: 'messages', label: '留言管理', icon: 'MessageSquare' },
  { id: 'settings', label: '系统设置', icon: 'Settings' }
]

// 动态组件映射
const componentMap: Record<string, any> = {
  dashboard: DashboardPage,
  users: UsersPage,
  messages: MessagesPage,
  settings: SettingsPage
}

// 根据activeMenu返回对应的组件
const currentComponent = computed(() => {
  return componentMap[activeMenu.value] || DashboardPage
})
</script>

<style scoped lang="scss">
.admin-container {
  display: flex;
  min-height: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
  transition: background 0.3s ease;
}

.admin-container .admin-content {
  flex: 1;
  display: flex;
  gap: 0;
}

.admin-sidebar {
  width: 240px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  padding: 16px 0;
  transition: all 0.3s ease;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  margin: 0 8px;
  border-radius: 0 8px 8px 0;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
}

.nav-item.active {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
  border-left-color: #3b82f6;
}

.admin-sidebar.collapsed {
  width: 0;
  padding: 0;
  border-right: none;
  overflow: hidden;
}

.admin-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: transparent;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-content {
  animation: fadeIn 0.3s ease;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

:deep(.el-button.is-link) {
  color: #3b82f6;
}

:deep(.el-button.is-link):hover {
  color: #2563eb;
}

:deep(.el-button.is-link.is-danger) {
  color: #ef4444;
}

:deep(.el-button.is-link.is-danger):hover {
  color: #dc2626;
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
    &:not(.collapsed) {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 100;
      box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
    }
  }

  .admin-main {
    width: 100%;
    padding: 16px;
  }
}
</style>
