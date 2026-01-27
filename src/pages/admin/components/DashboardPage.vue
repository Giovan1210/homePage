<template>
  <div class="page-content">
    <div class="page-header">
      <h2 class="page-title">仪表板</h2>
      <p class="page-subtitle">欢迎回到管理后台</p>
    </div>

    <!-- Dashboard Stats -->
    <div class="dashboard-grid">
      <el-card class="stat-card" shadow="hover">
        <template #header>
          <div class="stat-header">
            <span>总访问</span>
            <Eye class="w-5 h-5" />
          </div>
        </template>
        <div class="stat-number">24,563</div>
        <div class="stat-trend">↑ 12% 相比上周</div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <template #header>
          <div class="stat-header">
            <span>活跃用户</span>
            <Users class="w-5 h-5" />
          </div>
        </template>
        <div class="stat-number">1,243</div>
        <div class="stat-trend">↑ 8% 相比上周</div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <template #header>
          <div class="stat-header">
            <span>留言数</span>
            <MessageSquare class="w-5 h-5" />
          </div>
        </template>
        <div class="stat-number">563</div>
        <div class="stat-trend">↑ 24% 相比上周</div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <template #header>
          <div class="stat-header">
            <span>项目数</span>
            <Briefcase class="w-5 h-5" />
          </div>
        </template>
        <div class="stat-number">45</div>
        <div class="stat-trend">↑ 5% 相比上周</div>
      </el-card>
    </div>

    <!-- Recent Activity -->
    <el-card class="activity-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>最近活动</span>
          <Clock class="w-5 h-5" />
        </div>
      </template>

      <el-table :data="recentActivity" stripe>
        <el-table-column prop="title" label="标题" width="200"></el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.type)">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="时间" width="180"></el-table-column>
        <el-table-column label="操作" width="100">
          <template #default>
            <el-button link type="primary" size="small">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Eye, Users, MessageSquare, Briefcase, Clock } from 'lucide-vue-next'

const recentActivity = ref([
  { title: '新用户注册', type: '用户', date: '2026-01-26 10:30' },
  { title: '新留言', type: '留言', date: '2026-01-26 09:45' },
  { title: '项目更新', type: '项目', date: '2026-01-26 08:20' },
  { title: '系统维护', type: '系统', date: '2026-01-25 20:00' }
])

const getTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    '用户': 'success',
    '留言': 'info',
    '项目': 'warning',
    '系统': 'danger'
  }
  return typeMap[type] || 'info'
}
</script>

<style scoped lang="scss">
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

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  width: 100%;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #1f2937;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  color: #10b981;
  font-weight: 500;
}

.activity-card {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1f2937;
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
</style>
