/*
 * 路由守卫
 */
import router from '@/router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import glg from './globalGuards'
import store from '@/store'
import { getToken, getRefreshToken } from '@/utils/auth'

const whiteList = ['/log']

// NProgress.configure({ showSpinner: false }) // 禁用进度环

router.beforeEach((to, from, next) => {
  // console.log('-router-before-', to, from)
  // first progress bar
  // NProgress.start()
  // 路由改变修改页面title(setDocumentTitle)
  glg.setDocumentTitle(to, from)
  const hasToken = getToken()
  // console.log('-has-token-', hasToken)
  if (!hasToken) {
    noHasToken(to, from, next)
    return
  }
  if (to.path === '/log') {
    // console.log('-log-999-')
    next({ path: '/' })
    return
  }
  next()
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

/**
 * 1、验证token是否失效，失效了再验证refreshToken，没有失效直接 next()，注意若前往的为登录页，需要重定向到首页
 * 2、验证refreshToken是否失效，失效去登录页，没有失效通过刷新token接口获取最新得token
 */

/**
 * 没有登录或者登录过期了
 */
function noHasToken(to, from, next) {
  const refreshToken = getRefreshToken()
  // console.log('-has-refresh-token-', refreshToken)
  if (!refreshToken) {
    if (whiteList.indexOf(to.path) !== -1) {
      console.log('-white-')
      next()
    } else {
      console.log('-啥都没得了还不去登录，想啥呢-')
      next('/log')
    }
  } else {
    // token不存在，refreshToken存在，必须请求刷新token接口来获取最新的token
    store
      .dispatch('user/getAgainToken')
      .then(res => {
        console.log('-to-path-', to.path)
        next(to.path)
      })
      .catch(err => {
        console.log('-router-refresh-err-', err)
        next()
      })
  }
}
