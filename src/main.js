import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import App from './App.vue'
import router from './router'
import http from '@/api/http'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

// 在应用启动时，从 auth store 读取 token 并设置到 http 实例的默认 header
try {
  const authStore = useAuthStore(pinia)
  const token = authStore.token && authStore.token.value ? authStore.token.value : authStore.token
  if (token) {
    // http 是我们导出的实例，其上有 `instance` 属性
    http.instance.defaults.headers.common.Authorization = 'JWT ' + token
  }
} catch (e) {
  // ignore if store not ready
}

//注册所有icon图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
