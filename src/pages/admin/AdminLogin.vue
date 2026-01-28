<template>
  <div class="login-wrapper">
    <div class="login-shell">
      <div class="login-hero">
        <div class="brand">Giovan Admin</div>
        <h1 class="headline">欢迎回来 👋</h1>
        <p class="subline">登录管理后台，快速查看留言、监控与运营数据。</p>
        <div class="hero-badges">
          <span>安全登录</span>
          <span>实时监控</span>
          <span>轻量管理</span>
        </div>
        <div class="hero-glow"></div>
      </div>

      <el-card class="login-card" shadow="hover">
        <div class="login-card-header">
          <div class="login-title">后台登录</div>
          <el-button
            class="back-home-btn"
            type="primary"
            link
            @click="handleBackHome"
          >
            <ArrowLeft class="back-home-icon" />
            返回首页
          </el-button>
        </div>
        <p class="login-desc">请输入管理员账号密码进入后台。</p>
        <el-form :model="form" :rules="rules" ref="formRef">
          <el-form-item label="账号" prop="username">
            <el-input v-model="form.username" placeholder="请输入账号" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">登录</el-button>
          </el-form-item>
        </el-form>

        <div class="divider">
          <span>微信小程序登录</span>
        </div>

        <div class="wechat-login">
          <div class="wechat-panel">
            <div class="wechat-panel-header">
              <span>微信小程序登录</span>
              <span class="wechat-tag">WECHAT</span>
            </div>
            <div class="wechat-qr">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=weapp-login" alt="小程序二维码" />
              <span>扫码/一键登录</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const formRef = ref<FormInstance>()
const form = ref({
  username: 'admin',
  password: 'admin',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await authStore.login(form.value.username, form.value.password)
      ElMessage.success('登录成功')
      const redirect = (route.query.redirect as string) || '/admin'
      router.replace(redirect)
    } catch (error: any) {
      ElMessage.error(error?.message || '登录失败')
    } finally {
      loading.value = false
    }
  })
}

const handleBackHome = () => {
  router.push('/')
}
</script>

<style scoped lang="scss">
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top right, #dbeafe 0%, #eef2ff 40%, #f8fafc 100%);
  padding: 24px;
}

.dark .login-wrapper {
  background: radial-gradient(circle at top right, rgba(30, 64, 175, 0.35) 0%, rgba(15, 23, 42, 0.9) 55%, #0f172a 100%);
}

.login-shell {
  width: 100%;
  max-width: 980px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: stretch;
}

.login-hero {
  position: relative;
  padding: 32px;
  border-radius: 20px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.35);
}

.dark .login-hero {
  background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%);
  box-shadow: 0 18px 40px rgba(30, 58, 138, 0.4);
}

.brand {
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.9;
  font-size: 13px;
}

.headline {
  font-size: 32px;
  margin: 16px 0 8px;
}

.subline {
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.7;
}

.hero-badges {
  display: flex;
  gap: 8px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.hero-badges span {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
}

/* 减弱装饰光晕，避免过亮 */
.hero-glow {
  position: absolute;
  width: 140px;
  height: 140px;
  right: -20px;
  bottom: -40px;
  background: rgba(255, 255, 255, 0.12);
  filter: blur(2px);
  border-radius: 50%;
}

.login-card {
  width: 100%;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.dark .login-card {
  background: rgba(15, 23, 42, 0.85);
  border-color: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

.login-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.login-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.dark .login-title {
  color: #f8fafc;
}

.login-desc {
  color: #6b7280;
  margin-bottom: 16px;
  font-size: 13px;
}

.dark .login-desc {
  color: #94a3b8;
}

.login-btn {
  width: 100%;
}

.back-home-btn {
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.back-home-icon {
  width: 16px;
  height: 16px;
}

.login-tip {
  margin: 8px 0 0;
  color: #9ca3af;
  font-size: 12px;
}

.divider {
  margin: 24px 0 16px;
  position: relative;
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
}

.dark .divider {
  color: #94a3b8;
}

.divider::before,
.divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 32%;
  height: 1px;
  background: #e5e7eb;
}

.dark .divider::before,
.dark .divider::after {
  background: rgba(148, 163, 184, 0.3);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.wechat-login {
  display: block;
}

.wechat-panel {
  background: #ecfdf3;
  border: 1px solid rgba(22, 163, 74, 0.2);
  border-radius: 16px;
  padding: 20px;
}

.dark .wechat-panel {
  background: rgba(20, 83, 45, 0.35);
  border-color: rgba(34, 197, 94, 0.3);
}

.wechat-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #166534;
  font-weight: 600;
  margin-bottom: 16px;
}

.dark .wechat-panel-header {
  color: #bbf7d0;
}

.wechat-tag {
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(22, 163, 74, 0.12);
  color: #166534;
  letter-spacing: 0.08em;
}

.dark .wechat-tag {
  background: rgba(34, 197, 94, 0.2);
  color: #bbf7d0;
}

.wechat-qr {
  background: #dcfce7;
  border-radius: 12px;
  padding: 24px 12px;
  font-size: 12px;
  color: #166534;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.dark .wechat-qr {
  background: rgba(34, 197, 94, 0.15);
  color: #bbf7d0;
}

.wechat-qr img {
  width: 140px;
  height: 140px;
  border-radius: 8px;
  background: #fff;
  padding: 6px;
}

.wechat-desc {
  margin: 12px 0;
  color: #166534;
  font-size: 12px;
  line-height: 1.6;
}

.wechat-list {
  padding-left: 16px;
  margin: 0 0 12px;
  color: #166534;
  font-size: 12px;
}

.wechat-btn {
  width: 100%;
}

@media (max-width: 900px) {
  .login-shell {
    grid-template-columns: 1fr;
  }
}

</style>