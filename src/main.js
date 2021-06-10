/*
 * @Author: wangshengxian
 * @Date: 2020-04-20 15:29:40
 * @LastEditors: wangshengxian
 * @LastEditTime: 2021-02-01 18:38:22
 * @Desc:
 */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Loading from '@/plugins/loading' // 初始化加载loading
import PageLoading from '@/plugins/pageLoading' // 页面加载loading

// 全局样式
import '@/styles/index.less'
import 'normalize.css/normalize.css'
// 路由守卫
import '@/utils/routerGuards.js'
// vconsole调试工具
import '@/utils/vconsole.js'
// rem适配
import '@/utils/flexible.js'
// vant按需引入
import '@/utils/importVant.js'

Vue.use(Loading)
Vue.use(PageLoading)

Vue.config.productionTip = false

window.addEventListener(
  'popstate',
  function(e) {
    // TODO: 后面再处理
    router.isBack = true
  },
  false
)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
