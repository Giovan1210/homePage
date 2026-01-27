<template>
  <div class="page-content">
    <div class="page-header">
      <h2 class="page-title">系统设置</h2>
      <p class="page-subtitle">配置系统参数和选项</p>
    </div>

    <el-card shadow="hover">
      <template #header>
        <span>基本设置</span>
      </template>

      <el-form label-width="120px">
        <el-form-item label="网站名称">
          <el-input v-model="settings.siteName" />
        </el-form-item>

        <el-form-item label="网站描述">
          <el-input v-model="settings.siteDesc" type="textarea" />
        </el-form-item>

        <el-form-item label="维护模式">
          <el-switch v-model="settings.maintenance" />
        </el-form-item>

        <el-form-item label="允许注册">
          <el-switch v-model="settings.allowRegister" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const settings = ref({
  siteName: '我的个人网站',
  siteDesc: '分享技术、生活和想法的地方',
  maintenance: false,
  allowRegister: true
})
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
