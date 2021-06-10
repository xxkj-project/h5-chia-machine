<!-- 
   购买算力
-->
<template>
  <div class="buy">
    <headerBar />
    <div class="main">
      <div class="totalTitle">
        <template v-if="buyType === 'official'">
          <p class="voucherNum">兑换卷数量：{{ infoData.voucherNum }}</p>
          <p class="needNum">每份需要兑换卷数量：{{ infoData.needNum }}</p>
        </template>
        <template v-else>
          <p class="usdtNum">USDT数量：{{ infoData.usdtNum }}</p>
          <p class="price">单价：{{ infoData.price }}USDT/份</p>
        </template>
      </div>
      <div class="inputValue">
        <van-field v-model="inputVal" type="digit" placeholder="输入购买份数(1份起购)" @keyup="onChangeVal">
          <template #button>
            <p class="maxBtn" @click="onMax">最大</p>
          </template>
        </van-field>
      </div>
      <p class="surplusTime" v-if="buyType === 'oneSelf'">剩余期限：{{ infoData.surplusTime }}天</p>
      <p class="surplus">剩余：{{ infoData.surplus }}份</p>
      <van-button round type="info" :disabled="!isBuy" @click="onBuy">购买</van-button>
    </div>
  </div>
</template>

<script>
import headerBar from '@/components/headerBar/index'
import { operaBuyMill, buyMachine } from '@/api/index'
export default {
  name: '',
  data() {
    return {
      buyType: '',
      inputVal: '',
      isBuy: false,
      infoData: {}
    }
  },
  computed: {},
  components: { headerBar },
  created() {
    const { type, ...other } = this.$route.query
    this.buyType = type
    this.infoData = other
  },
  mounted() {},
  methods: {
    onBuy() {
      if (!this.isBuy) return
      if (this.inputVal < 1) {
        this.$toast('购买份数为1份起购!')
        return
      }
      if (this.inputVal > +this.infoData.maxNum) {
        this.$toast('购买数量大于可兑换数量')
        this.inputVal = ''
        return
      }
      this.$dialog
        .confirm({
          title: '提示',
          message: '确认购买！',
          beforeClose: (action, done) => {
            if (action !== 'confirm') {
              done()
              return
            }
            this.handleConfirmBuy(done)
          }
        })
        .then(() => {})
        .catch(() => {})
    },
    handleConfirmBuy(done) {
      const { id, soldId } = this.infoData
      const quota = this.inputVal
      const params = this.buyType === 'official' ? { machineId: id, quota: quota } : { soldId, quota }
      this.buyType === 'official' ? this.officialConfirmBuy(params, done) : this.oneSelfConfirmBuy(params, done)
    },
    officialConfirmBuy(params, done) {
      operaBuyMill(params).then(res => {
        this.$toast({
          message: '购买成功!',
          duration: 1000,
          onClose: () => {
            this.$router.go(-1)
          }
        })
        done()
      })
    },
    oneSelfConfirmBuy(params, done) {
      buyMachine(params).then(res => {
        this.$toast({
          message: '购买成功!',
          duration: 1000,
          onClose: () => {
            this.$router.go(-1)
          }
        })
        done()
      })
    },
    onMax() {
      this.inputVal = this.infoData.maxNum
      this.isBuy = true
    },
    onChangeVal() {
      // console.log(this.isBuy)
      if (!this.inputVal) {
        this.isBuy = false
        return
      }
      this.isBuy = true
    }
  }
}
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
.buy {
  width: 100%;
  font-size: 16px;
  .main {
    width: 100%;
    padding: 24px 20px 0 20px;
  }
}
.totalTitle {
  color: #222;
  font-weight: 500;
  p {
    margin-bottom: 16px;
  }
  .voucherNum,
  .needNum,
  .price {
    font-weight: 700;
  }
}
.inputValue {
  width: 100%;
  position: relative;
  /deep/ .van-cell {
    padding: 0;
  }
  /deep/ .van-field {
    height: 48px;
    line-height: 48px;
    border: 1px solid #eaeaea;
    border-radius: 24px;
    padding: 0 15px;
  }
  .maxBtn {
    color: #0069ff;
    font-weight: 700;
  }
}
.surplusTime {
  padding-top: 16px;
}
.surplus {
  color: #999;
  padding: 16px 0 48px 0;
}
/deep/ .van-button {
  width: 100%;
  border: none;
}
</style>
