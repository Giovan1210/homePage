<template>
  <div class="page-content">
    <div class="page-header">
      <h2 class="page-title">系统设置</h2>
      <p class="page-subtitle">配置系统参数和选项</p>
    </div>

    <el-card shadow="hover">

      <el-form label-width="120px">
        <el-tabs v-model="activeTab" class="settings-tabs">
          <el-tab-pane label="个人信息" name="profile">
            <div class="tab-grid">
              <div>
                <el-form-item label="名称">
                  <el-input v-model="form.name" />
                </el-form-item>
                <el-form-item label="标题">
                  <el-input v-model="form.title" />
                </el-form-item>
                <el-form-item label="简介">
                  <el-input v-model="form.bio" type="textarea" :rows="3" />
                </el-form-item>
                <el-form-item label="头像">
                  <el-upload
                    class="avatar-uploader"
                    action="/api/upload"
                    :show-file-list="false"
                    :on-success="handleAvatarSuccess"
                  >
                    <el-image v-if="form.avatar" :src="form.avatar" class="avatar-image" fit="cover" />
                    <div v-else class="avatar-placeholder">上传头像</div>
                  </el-upload>
                </el-form-item>
              </div>
              <div>
                <el-form-item label="邮箱">
                  <el-input v-model="form.email" />
                </el-form-item>
                <el-form-item label="微信">
                  <el-input v-model="form.wechat" />
                </el-form-item>
                <el-form-item label="所在地">
                  <el-input v-model="form.location" />
                </el-form-item>
                <el-form-item label="网站">
                  <el-input v-model="form.website" />
                </el-form-item>
                <el-form-item label="社交链接">
                  <el-input v-model="socialLinksText" type="textarea" :rows="4" placeholder='JSON 数组，如 [{"platform":"GitHub","url":"...","icon":"github"}]' />
                </el-form-item>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="网站信息" name="site">
            <div class="tab-grid">
              <div>
                <el-form-item label="网站名称">
                  <el-input v-model="form.siteName" />
                </el-form-item>
                <el-form-item label="网站标题">
                  <el-input v-model="form.siteTitle" />
                </el-form-item>
              </div>
              <div>
                <el-form-item label="网站描述">
                  <el-input v-model="form.siteDescription" type="textarea" :rows="2" />
                </el-form-item>
                <el-form-item label="网站 Logo">
                  <el-input v-model="form.siteLogo" placeholder="Logo URL" />
                </el-form-item>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="备案与底部" name="footer">
            <div class="tab-grid">
              <div>
                <el-form-item label="ICP备案号">
                  <el-input v-model="form.icp" />
                </el-form-item>
                <el-form-item label="ICP备案链接">
                  <el-input v-model="form.icpLink" />
                </el-form-item>
                <el-form-item label="公安备案号">
                  <el-input v-model="form.publicSecurity" />
                </el-form-item>
                <el-form-item label="公安备案链接">
                  <el-input v-model="form.publicSecurityLink" />
                </el-form-item>
              </div>
              <div>
                <el-form-item label="底部联系邮箱">
                  <el-input v-model="form.footerContact.email" />
                </el-form-item>
                <el-form-item label="底部联系电话">
                  <el-input v-model="form.footerContact.phone" />
                </el-form-item>
                <el-form-item label="底部联系微信">
                  <el-input v-model="form.footerContact.wechat" />
                </el-form-item>
                <el-form-item label="底部地址">
                  <el-input v-model="form.footerContact.address" />
                </el-form-item>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request'

interface SiteInfoForm {
  name: string
  title: string
  bio: string
  avatar: string
  email: string
  wechat: string
  location: string
  website: string
  socialLinks: Array<{ platform: string; url: string; icon?: string }>
  siteName: string
  siteTitle: string
  siteDescription: string
  siteLogo: string
  icp: string
  icpLink: string
  publicSecurity: string
  publicSecurityLink: string
  footerContact: {
    email: string
    phone: string
    wechat: string
    address: string
  }
}

const form = ref<SiteInfoForm>({
  name: '',
  title: '',
  bio: '',
  avatar: '',
  email: '',
  wechat: '',
  location: '',
  website: '',
  socialLinks: [],
  siteName: '',
  siteTitle: '',
  siteDescription: '',
  siteLogo: '',
  icp: '',
  icpLink: '',
  publicSecurity: '',
  publicSecurityLink: '',
  footerContact: {
    email: '',
    phone: '',
    wechat: '',
    address: '',
  },
})

const socialLinksText = ref('[]')
const activeTab = ref('profile')
const saving = ref(false)

const fetchSettings = async () => {
  try {
    const res = await request.get('/admin/site-info')
    const payload = res?.data || res || {}
    const data = payload.data || payload
    form.value = {
      ...form.value,
      ...data,
      footerContact: {
        ...form.value.footerContact,
        ...(data.footerContact || {}),
      },
      socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : [],
    }
    socialLinksText.value = JSON.stringify(form.value.socialLinks || [], null, 2)
  } catch (error: any) {
    ElMessage.error(error?.message || '加载配置失败')
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    let socialLinks = [] as SiteInfoForm['socialLinks']
    if (socialLinksText.value.trim()) {
      socialLinks = JSON.parse(socialLinksText.value)
    }

    const payload = {
      ...form.value,
      socialLinks,
    }
    await request.put('/admin/site-info', payload)
    ElMessage.success('保存成功')
  } catch (error: any) {
    ElMessage.error(error?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleAvatarSuccess = (response: any) => {
  const data = response?.data || response
  if (data?.url) {
    form.value.avatar = data.url
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped lang="scss">

.settings-tabs {
  margin-bottom: 8px;
}

.tab-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 24px;
}

.avatar-uploader {
  width: 90px;
  height: 90px;
  border-radius: 12px;
  border: 1px dashed #cbd5f5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  background: #f8fafc;
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.avatar-placeholder {
  font-size: 12px;
  color: #64748b;
}

@media (max-width: 900px) {
  .tab-grid {
    grid-template-columns: 1fr;
  }
}

</style>
