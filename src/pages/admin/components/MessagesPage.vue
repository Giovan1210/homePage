<template>
  <div class="page-content">
    <div class="page-header">
      <h2 class="page-title">留言管理</h2>
      <p class="page-subtitle">管理所有的留言内容</p>
    </div>

    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>留言列表</span>
          <el-input v-model="searchText" placeholder="搜索留言..." style="width: 200px" />
        </div>
      </template>

      <el-table :data="messages" stripe>
        <el-table-column prop="author" label="留言者" width="120"></el-table-column>
        <el-table-column prop="content" label="内容" width="300"></el-table-column>
        <el-table-column prop="date" label="时间" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已审核' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default>
            <el-button link type="primary" size="small">查看</el-button>
            <el-button link type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchText = ref('')
const messages = ref([
  { author: '张三', content: '这是一条很棒的留言...', date: '2026-01-26 10:00', status: '已审核' },
  { author: '李四', content: '感谢分享这篇文章...', date: '2026-01-26 09:30', status: '待审核' },
  { author: '王五', content: '有个问题想请教...', date: '2026-01-26 08:45', status: '已审核' }
])
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
