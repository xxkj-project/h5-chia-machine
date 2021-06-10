const memberRouter = [
  {
    path: '/index',
    name: 'Index',
    component: () => import(/* webpackChunkName: 'index' */ '@/views/index'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/myMachine',
    name: 'MyMachine',
    component: () => import(/* webpackChunkName: 'myMachine' */ '@/views/myMachine'),
    meta: {
      title: '我的矿机'
    }
  },
  {
    path: '/withdraw',
    name: 'Withdraw',
    component: () => import(/* webpackChunkName: 'withdraw' */ '@/views/withdraw'),
    meta: {
      title: '提币(XCH)'
    }
  },
  {
    path: '/buy',
    name: 'Buy',
    component: () => import(/* webpackChunkName: 'buy' */ '@/views/buy'),
    meta: {
      title: '购买算力'
    }
  },
  {
    path: '/sell',
    name: 'Sell',
    component: () => import(/* webpackChunkName: 'sell' */ '@/views/sell'),
    meta: {
      title: '转售'
    }
  }
]

export default memberRouter
