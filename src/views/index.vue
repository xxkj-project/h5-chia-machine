<!-- 
   首页
-->
<template>
  <div class="home">
    <!-- <headerBar /> -->
    <div class="main">
      <!-- 头部 -->
      <div class="mainTop">
        <div class="title">账户总资产折合 (XCH)</div>
        <div class="topPrice">
          {{ infoData.xchNum }}
          <!-- <span>≈ {{ infoData.convetrInto }}</span> -->
        </div>
        <div class="conversionNum">兑换券数量：{{ infoData.voucherNum }}</div>
        <div class="usdtNum">USDT数量：{{ infoData.usdtNum }}</div>
        <div class="topBtn fx-space-between">
          <van-button class="myMachine" round type="info" @click="onPushPage('MyMachine')">我的矿机</van-button>
          <van-button round type="info" color="#0069ff" @click="onPushPage('Withdraw')">提现</van-button>
        </div>
      </div>
      <!-- 收益 -->
      <div class="mainEarnings fx-space-between">
        <div :class="item.className" v-for="(item, index) in earningList" :key="index">
          <div class="topImg">
            <span class="img"></span>
          </div>
          <h4>{{ item.earningTitle }}</h4>
          <div class="earnings">{{ item.earnings }}</div>
          <!-- <p>≈{{ item.CNY }}</p> -->
        </div>
      </div>
      <!-- 售卖转卖 -->
      <div class="mainBuy">
        <van-tabs v-model="active" background="#E7EAF1" @click="onTabs" sticky :offset-top="0">
          <van-tab title="官方售卖" name="official">
            <van-tabs v-model="subActive" background="#F5F6F9" @click="onDayTabs">
              <van-tab :title="item.title" :name="item.name" v-for="(item, i) in dayTabList" :key="i">
                <van-list
                  v-if="active === item.name || !isNoData"
                  class="officList"
                  v-model="isMoreLoading"
                  :finished="isMoreFinished"
                  :error.sync="isMoreError"
                  finished-text="没有更多了"
                  :immediate-check="false"
                  @load="getMoreData"
                  :offset="30"
                >
                  <ul class="itemWrap">
                    <li class="item" v-for="(val, i) in currList" :key="i">
                      <div class="itemTop fx-align-center">
                        <span class="headImg"></span>
                        <span class="text">{{ val.name }}</span>
                        <span class="itemTopIcon fx-center">T+1</span>
                      </div>
                      <div class="progress">
                        <van-progress
                          :percentage="val.selled"
                          v-if="!isNaN(parseInt(val.selled))"
                          color="#FCD484"
                          :show-pivot="false"
                        />
                        <div class="progressMain fx-space-between">
                          <span>{{ val.soldQuota }}份/{{ val.totalQuota }}份</span>
                          <span>已售{{ val.selled }}%</span>
                        </div>
                      </div>
                      <p>1份={{ val.sharePower }}T算力</p>
                      <p class="explain">
                        每T算力收益(XCH)：<span class="greenTxt">{{ val.powerProfitRatio }}XCH</span>
                      </p>
                      <p class="miningDay">挖矿期限：{{ val.profitDuration }}天</p>
                      <van-button round :class="val.isBuy ? 'sellBuy' : 'sellOut'" @click="onPushBuyPage('Buy', val)">{{
                        active | btnTxt(val.isBuy)
                      }}</van-button>
                    </li>
                  </ul>
                </van-list>
                <noData v-else />
              </van-tab>
            </van-tabs>
          </van-tab>
          <van-tab title="个人转卖" name="oneSelf">
            <van-list
              v-if="!isNoData"
              class="officList"
              v-model="isMoreLoading"
              :finished="isMoreFinished"
              :error.sync="isMoreError"
              finished-text="没有更多了"
              :immediate-check="false"
              @load="getMoreData"
              :offset="30"
            >
              <ul class="itemWrap">
                <li class="item" v-for="(val, i) in currList" :key="i">
                  <div class="itemTop fx-align-center">
                    <span class="headImg"></span>
                    <span class="text">{{ val.name }}</span>
                    <span class="itemTopIcon fx-center">T+1</span>
                  </div>
                  <p class="sellUser">出售用户：{{ val.account }}</p>
                  <p class="sellPrice">
                    出售单价：<span class="greenTxt">{{ val.price }}USDT/份</span>
                  </p>
                  <p class="surplus">剩余份数：{{ val.totalQuota }}份</p>
                  <p class="surplusTime">剩余期限：{{ val.profitDuration }}天</p>
                  <van-button round type="info" @click="onPushBuyPage('Buy', val)">购买</van-button>
                </li>
              </ul>
            </van-list>
            <noData v-else />
          </van-tab>
        </van-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import { getMillList, getCoinAsset, getTodayEarning, getTotalEarning, getOneSelfList } from '@/api/index'
import noData from '@/components/noData/index'

export default {
  data() {
    return {
      //顶部资产信息
      infoData: {},
      //tab切换信息
      active: 'official',
      currType: 'official',
      subActive: '0', //二级tabs
      subCurrType: '0',
      //列表相关
      isMoreLoading: false,
      isMoreFinished: false,
      isMoreError: false,
      pageNum: 1, //页码
      pageSize: 10, //每页数据条数
      isNoData: false, //是否有数据
      currList: [], //遍历数据
      totalList: [], //全部数据
      //收益
      earningList: [
        { className: 'dayEarning', earnings: '', earningTitle: '今日预计收益(XCH)', CNY: '' },
        { className: 'totalEarning', earnings: '', earningTitle: '累计收益(XCH)', CNY: '' }
      ]
    }
  },
  computed: {
    dayTabList() {
      return [
        { title: '全部', name: '0' },
        { title: '180天', name: '1' },
        { title: '360天', name: '2' },
        { title: '720天', name: '3' }
      ]
    }
  },
  filters: {
    btnTxt(action, isBuy) {
      return action === 'oneSelf' ? '购买' : isBuy ? '购买算力' : '已售馨'
    }
  },
  components: { noData },
  beforeRouteLeave(to, from, next) {
    sessionStorage.setItem('type', this.active)
    next()
  },
  created() {
    const activeType = sessionStorage.getItem('type')
    this.active = activeType || 'official'
    this.currType = this.active

    this.getData()
    if (this.active === 'official') {
      this.getOfficialData()
    } else {
      this.getOneSelfData()
    }
  },
  mounted() {},
  methods: {
    onPushPage(name) {
      if (name == 'Withdraw') {
        this.$toast('暂未开放')
        return
      }
      const query = name === 'Withdraw' ? { maxNum: this.infoData.xchNum } : {}
      this.$router.push({ name, query })
    },
    onPushBuyPage(name, val) {
      if (this.active === 'official' && val.isBuy == false) return
      const query = this.getQuery(this.active, val)
      this.$router.push({ name, query })
    },
    getQuery(type, val) {
      // console.log('val', val)
      let result = {}
      const { voucherNum, usdtNum } = this.infoData
      if (type === 'official') {
        const { totalQuota, soldQuota, id, voucher } = val
        let surplus = totalQuota - soldQuota
        let scopeNum = Math.floor(voucherNum / voucher)
        result.id = id
        result.surplus = surplus
        result.voucherNum = voucherNum
        result.needNum = voucher
        result.maxNum = +surplus < scopeNum ? surplus : scopeNum
      } else {
        const { price, totalQuota, soldId, profitDuration } = val
        const num = Math.floor(usdtNum / price)
        result.usdtNum = usdtNum
        result.price = price
        result.surplus = totalQuota
        result.soldId = soldId
        result.surplusTime = profitDuration
        result.maxNum = num < +totalQuota ? num : totalQuota
      }
      return { type, ...result }
    },
    onTabs(name, title) {
      if (this.currType === name) return
      this.currType = name

      this.currList = []
      this.pageNum = 1
      this.isMoreFinished = false
      this.isNoData = false

      if (name === 'official') {
        this.subActive = '0' //0为全部 1为180 2为360 3为720
        this.subCurrType = '0'
        this.getOfficialData()
      } else {
        this.getOneSelfData()
      }
    },
    onDayTabs(name, title) {
      //TODO:从没有数据的地方切换有数据的地方进度条有bug
      if (this.subCurrType === name) return
      this.subCurrType = name
      this.$pageLoading.show('加载中...')
      setTimeout(() => {
        this.$pageLoading.hide()
      }, 200)

      this.currList = []
      this.isNoData = false
      this.getDayData()
    },
    getDayData() {
      let list = this.totalList.filter(item => item.planType == this.subActive)
      this.currList = this.subActive === '0' ? this.totalList : list
      this.isNoData = this.currList.length === 0
    },
    async getData() {
      const params = { currency: ['USDT', 'XCH', 'VOUCHER'] }
      const res = await getCoinAsset(params)
      // console.log('res', res)
      const { USDT, VOUCHER, XCH } = res.data
      this.infoData.xchNum = XCH.balance
      this.infoData.usdtNum = USDT.balance
      this.infoData.voucherNum = VOUCHER.balance

      const todayRes = await getTodayEarning()
      this.earningList[0].earnings = todayRes.data

      const totalRes = await getTotalEarning()
      this.earningList[1].earnings = totalRes.data
    },
    getOfficialData() {
      this.$pageLoading.show('加载中...')
      this.isMoreLoading = true
      getMillList()
        .then(res => {
          // console.log('official', res)
          this.isMoreLoading = false
          this.$pageLoading.hide()
          const list = res.data

          if (!list || list.length === 0) {
            this.currList = []
            this.isNoData = true
            this.isMoreFinished = true
            return
          }
          this.isNoData = false
          this.currList = list.map((item, index) => {
            item.selled = ((item.soldQuota / item.totalQuota) * 100).toFixed(3)
            item.isBuy = item.soldQuota !== item.totalQuota
            return item
          })
          // console.log('official', this.currList)
          this.totalList = this.currList
          this.isMoreFinished = true
        })
        .catch(err => {
          this.$pageLoading.hide()
          this.isMoreError = true
        })
    },
    getOneSelfData() {
      this.getMoreData(true)
    },
    getMoreData(init) {
      this.$pageLoading.show('加载中...')
      console.log('加载中...')
      this.isMoreLoading = true
      const params = { pageNum: this.pageNum, pageSize: this.pageSize }
      // console.log('params', params)
      getOneSelfList(params)
        .then(res => {
          // console.log('oneSelf', res)
          this.$pageLoading.hide()
          this.isMoreLoading = false
          const { list, total } = res.data

          if (!list || list.length === 0) {
            this.currList = []
            this.isMoreFinished = true
            this.isNoData = true
            return
          }
          this.isNoData = false
          this.isMoreFinished = false

          this.currList = init ? list : [...this.currList, ...list]

          if (this.currList.length === total) {
            this.isMoreFinished = true
            console.log('加载完成')
            return
          }
          this.pageNum++
          // console.log('oneSelf', this.currList)
        })
        .catch(err => {
          console.log(err)
          this.$pageLoading.hide()
          this.isMoreError = true
        })
    }
  }
}
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
@imgUrl: '~@/assets/images/common/';
@earningImg: '~@/assets/images/home/';
@greenColor: #56d451;
@blackColor: #222222;
.home {
  font-size: 16px;
  .main {
    width: 100%;
    padding-top: 22px;
  }
}
.mainTop {
  color: @blackColor;
  font-weight: 600;
  padding: 0 20px 16px 20px;
  .title {
    font-size: 20px;
  }
  .topPrice {
    font-size: 26px;
    font-weight: 700;
    line-height: 26px;
    padding: 16px 0 8px 0;
    span {
      font-size: 18px;
      color: #999;
      font-weight: normal;
      margin-left: 8px;
    }
  }
  .usdtNum {
    padding: 8px 0 24px 0;
  }
}
.topBtn {
  width: 100%;
  /deep/ .van-button {
    width: 48%;
    color: #0069ff;
    background-color: #e1eeff;
    border: 1px solid #e1eeff;
  }
}
.mainEarnings {
  width: 100%;
  padding: 0 20px 24px 20px;
  .dayEarning,
  .totalEarning {
    width: 162px;
    height: 197px;
    border-radius: 10px;
    padding: 24px 0 24px 15px;
    .topImg {
      width: 36px;
      height: 36px;
      margin-bottom: 24px;
      .img {
        display: inline-block;
        width: 100%;
        height: 100%;
      }
    }
    h4 {
      font-size: 14px;
      color: @blackColor;
      font-weight: 600;
    }
    .earnings {
      font-size: 20px;
      padding: 16px 0 4px 0;
    }
    p {
      color: #999;
    }
  }
  .dayEarning {
    background-color: #f7eee3;
    .img {
      background: url('@{earningImg}icon-home1.png') no-repeat center/cover;
    }
    .earnings {
      font-weight: 600;
      color: #ffb840;
    }
  }
  .totalEarning {
    background-color: #eaf9e9;
    .img {
      background: url('@{earningImg}icon-home2.png') no-repeat center/cover;
    }
    .earnings {
      color: @greenColor;
    }
  }
}
.mainBuy {
  width: 100%;
  background-color: #f5f6f9;
  border-radius: 20px;
  /deep/ .van-sticky {
    background-color: #f5f6f9;
    padding: 18px 20px;
  }

  /deep/ .van-tabs__wrap {
    height: 44px;
    border-radius: 22px;

    .van-tab--active {
      background-color: #fff;
      border-radius: 22px;
    }

    .van-tabs__line {
      display: none;
    }
  }
  /deep/ .van-tabs__content {
    padding: 0 20px;
    .van-tab {
      width: 71px;
      height: 34px;
      background-color: #e7eaf1;
      color: #9d9ea3;
      border-radius: 17px;
    }
    .van-tab {
      margin-right: 17px;
    }
    .van-tab:nth-of-type(4) {
      margin-right: 0;
    }
    .van-tab--active {
      background-color: #e1eeff;
      color: #0069ff;
    }

    .van-tabs__nav--line {
      align-items: center;
    }
    .van-tabs__content {
      padding: 0;
    }
  }
  .itemWrap {
    padding-top: 17px;
    .item {
      background-color: #fff;
      border-radius: 12px;
      padding: 24px 15px;
      margin-bottom: 16px;
      .itemTop {
        margin-bottom: 16px;
        .headImg {
          width: 44px;
          height: 44px;
          background: url('@{imgUrl}icon-sign.png') no-repeat center/cover;
        }
        .text {
          color: @blackColor;
          font-weight: 600;
          margin-left: 8px;
        }
        .itemTopIcon {
          width: 33px;
          height: 16px;
          background-color: #b9fac5;
          font-size: 10px;
          color: @greenColor;
          border-radius: 8px;
          border: 0.5px solid @greenColor;
          margin-left: 4px;
        }
      }
      .progress {
        /deep/ .van-progress {
          margin-bottom: 8px;
        }
        .progressMain {
          width: 100%;
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }
      }
      p {
        font-size: 14px;
        color: @blackColor;
        margin-bottom: 8px;
      }
      .greenTxt {
        color: @greenColor;
      }
      .miningDay,
      .surplusTime {
        margin-bottom: 16px;
      }

      /deep/ .van-button {
        width: 100%;
        &.sellBuy {
          background-color: #e1eeff;
          color: #0069ff;
        }
        &.sellOut {
          background-color: #efefef;
          color: #b8b8b8;
        }
      }
    }
  }
}
</style>
