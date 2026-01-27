import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/pages/HomeView.vue'
import AboutView from '@/pages/AboutView.vue'
import WebsiteStatusView from '@/pages/WebsiteStatusView.vue'
import Admin from '@/pages/admin/AdminLayout.vue'
import GuestbookView from '@/pages/GuestbookView.vue'

// import ArticlesView from '@/pages/ArticlesView.vue'
// import PortfolioView from '@/pages/PortfolioView.vue'
// import SitesView from '@/pages/SitesView.vue'
// import SponsorView from '@/pages/SponsorView.vue'

// 定义路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: '首页'
    }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: {
      title: '关于我'
    }
  },
    {
    path: '/sites',
    name: 'sites',
    component: WebsiteStatusView,
    meta: {
      title: '网站'
    }
  },
    {
    path: '/note',
    name: 'note',
    component: GuestbookView,
    meta: {
      title: '留言板'
    }
  },
    {
    path: '/admin',
    name: 'admin',
    component: Admin,
    meta: {
      title: '后台管理'
    }
  },
  // {
  //   path: '/sponsor',
  //   name: 'sponsor',
  //   component: SponsorView,
  //   meta: {
  //     title: '赞助支持'
  //   }
  // },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: HomeView,
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

export default router
