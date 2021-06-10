<!-- 
   我的矿机
-->
<template>
  <div class="myMachine">
    <headerBar />
    <div class="main">
      <div class="tableWrap">
        <van-tabs v-model="actType" background="#E7EAF1" @click="onTabs" sticky :offset-top="offsetTop">
          <van-tab :title="item.title" :name="item.name" v-for="(item, index) in tabList" :key="index">
            <van-list
              class="officList"
              v-model="isMoreLoading"
              :finished="isMoreFinished"
              :error.sync="isMoreError"
              finished-text="没有更多了"
              :immediate-check="false"
              @load="getMoreData"
              :offset="30"
              v-if="actType === item.name && !isNoData"
            >
              <ul class="listBox">
                <li class="item" v-for="(val, index) in list" :key="index">
                  <div class="top fx-align-center">
                    <span class="icon"></span>
                    <span class="name">{{ val.name }}</span>
                  </div>
                  <div class="desc" v-if="actType === 'mining'">
                    {{ val.totalQuota }}份 {{ val.totalPower }}T算力挖矿中, 剩余{{ val.profitDuration }}天
                  </div>
                  <div class="desc" v-else>{{ val.totalQuota }}份出售中,暂停收益</div>
                  <span class="btn fx-center" @click="onSell(val)">{{ btnTxt }}</span>
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
import headerBar from '@/components/headerBar'
import noData from '@/components/noData'
import { geInMiningList, getInSellList, cancelSell } from '@/api/index'
import { remBase } from '@/const/global'
export default {
  name: '',
  data() {
    return {
      actType: 'mining',
      currActType: 'mining',
      //列表相关
      pageNum: 1,
      pageSize: 4,
      isMoreLoading: false,
      isMoreFinished: false,
      isMoreError: false,
      isNoData: false,
      list: [],
      //tab选项name以及title
      totalData: {},
      total: 0,
      tabList: [
        { title: '挖矿中', name: 'mining' },
        { title: '出售中', name: 'sell' }
      ]
    }
  },
  computed: {
    offsetTop() {
      return 41 / remBase + 'rem'
    },
    btnTxt() {
      return this.actType === 'mining' ? '转售' : '取消出售'
    }
  },
  components: { headerBar, noData },
  created() {
    // TODO: 注意，上线后分页条数改为一页 10 条
    this.getData()
  },
  mounted() {},
  methods: {
    onTabs(name, title) {
      if (this.currActType === name) return
      this.currActType = name
      this.getTabData()
    },
    getTabData() {
      console.log(this.totalData, '-curr-list-', this.totalData[this.currActType], '-total-', this.total)
      if (this.totalData[this.currActType]) {
        console.log('-加载过...-')
        this.pageNum = 1
        this.list = this.totalData[this.currActType]
        this.isNoData = this.list.length === 0
        if (this.currActType === 'mining') {
          this.isMoreFinished = true
        } else {
          this.isMoreFinished = this.list.length >= this.total
        }
        return
      }
      console.log('-初始化...-')
      this.pageNum = 1
      this.list = []
      this.isMoreFinished = false
      this.currActType === 'sell' ? this.getInSellData() : this.getData()
    },
    initData() {
      this.pageNum = 1
      this.list = []
      this.isMoreFinished = false
      this.totalData = {}
      this.total = 0
    },
    onSell(item) {
      if (this.actType === 'mining') {
        this.$router.push({ name: 'Sell', query: item })
        return
      }
      this.$dialog
        .confirm({
          title: '确认取消出售?',
          message: '取消出售后，T+1日获得收益',
          beforeClose: (action, done) => {
            if (action !== 'confirm') {
              done()
              return
            }
            this.handleCancelSell(item, done)
          }
        })
        .then(() => {})
        .catch(() => {})
    },
    handleCancelSell(item, done) {
      console.log(item)
      const params = { soldId: item.soldId }
      // console.log('-params-', params)
      cancelSell(params)
        .then(res => {
          // console.log('res', res)
          this.$toast('取消出售成功!')
          this.initData()
          this.getInSellData()
          done()
        })
        .catch(err => {
          done()
        })
    },
    getData() {
      this.isMoreLoading = true
      geInMiningList()
        .then(res => {
          console.log('-mining-res-', res)
          this.isMoreLoading = false
          const list = res.data
          if (!list || list.length === 0) {
            this.isNoData = true
            this.list = []
            this.totalData[this.actType] = []
            this.isMoreFinished = true
            return
          }
          this.isNoData = false
          this.list = list
          this.totalData[this.actType] = list
          this.isMoreFinished = true
        })
        .catch(err => {
          this.isMoreError = true
        })
    },
    getInSellData() {
      this.getMoreData(true)
    },
    getMoreData(isInit) {
      this.isMoreLoading = true
      const params = { pageNum: this.pageNum, pageSize: this.pageSize }
      console.log('-params-', params)
      getInSellList(params)
        .then(res => {
          console.log('-sell-res-', res)
          this.isMoreLoading = false
          const { total, list } = res.data
          // console.log('-total-', total, '-list-', list)
          this.total = total || 0
          if (!list || list.length === 0) {
            console.log('没有数据了...')
            this.isNoData = true
            this.list = []
            this.totalData[this.actType] = []
            this.isMoreFinished = true
            return
          }
          this.isNoData = false
          if (isInit) {
            this.list = list
            this.totalData[this.actType] = list
          } else {
            this.list = [...this.list, ...list]
          }
          if (this.list.length >= total) {
            console.log('-全部加载完成-')
            this.isMoreFinished = true
          }
          this.pageNum++
        })
        .catch(err => {
          this.isMoreError = true
        })
    }
  }
}
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
@imgUrl: '~@/assets/images/common/';
.myMachine {
  width: 100%;
  height: 100%;
  background: #f5f6f9;
  font-size: 16px;
  color: #222;

  .main {
    width: 100%;
    background-color: #f5f6f9;
    padding-bottom: 20px;
  }
}

.tableWrap {
  width: 100%;
  // padding: 18px 20px 0 20px;

  /deep/ .van-tabs {
    .van-sticky {
      background-color: #f5f6f9;
      padding: 18px 20px;
    }
    .van-tabs__wrap {
      height: 44px;
      border-radius: 24px;

      .van-tab--active {
        background: #fff;
        border-radius: 22px;
      }

      .van-tabs__line {
        display: none;
      }
    }
    .van-tabs__content {
      padding: 0 20px;
    }
  }
}

.listBox {
  width: 100%;

  .item {
    width: 100%;
    background: #fff;
    border-radius: 12px;
    padding: 24px 15px;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .top {
      .icon {
        width: 44px;
        height: 44px;
        background: url('@{imgUrl}icon-sign.png') no-repeat center / cover;
      }
      .name {
        color: #222;
        font-weight: 600;
        margin-left: 8px;
      }
    }
    .desc {
      font-size: 18px;
      padding: 16px 0;
    }
    .btn {
      width: 100%;
      height: 44px;
      background: #e1eeff;
      color: #0069ff;
      font-weight: 600;
      text-align: center;
      border-radius: 22px;
    }
  }
}
</style>
