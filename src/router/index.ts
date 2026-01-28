import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import request from '@/api/request'
// 定义路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomeView.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/pages/AboutView.vue'),
    meta: {
      title: '关于我'
    }
  },
    {
    path: '/sites',
    name: 'sites',
    component: () => import('@/pages/WebsiteStatusView.vue'),
    meta: {
      title: '网站'
    }
  },
    {
    path: '/note',
    name: 'note',
    component: () => import('@/pages/GuestbookView.vue'),
    meta: {
      title: '留言板'
    }
  },
    {
    path: '/admin',
    name: 'admin',
    component: () => import('@/pages/admin/AdminLayout.vue'),
    meta: {
        title: '后台管理',
        requiresAuth: true
    }
  },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/pages/admin/AdminLogin.vue'),
      meta: {
        title: '后台登录'
      }
    },
  {
    path: '/sponsor',
    name: 'sponsor',
    component: () => import('@/pages/SponsorView.vue'),
    meta: {
      title: '赞助支持'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/HomeView.vue'),
    meta: {
      title: '首页'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  if (to.meta?.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'admin-login', query: { redirect: to.fullPath } })
    return
  }
  next()
})

router.afterEach((to) => {
  if (to.path.startsWith('/admin')) return
  if (import.meta.env.DEV) return
  const key = `access-log:${to.path}`
  if (sessionStorage.getItem(key)) return
  sessionStorage.setItem(key, '1')
  request.post('/access-logs/ping', { path: to.fullPath, title: to.meta?.title }).catch(() => undefined)
})

export default router
