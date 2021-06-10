<!-- 
   转售
-->
<template>
  <div class="sell">
    <headerBar />
    <div class="sellMain">
      <van-form @submit="onSubmit" :show-error-message="false">
        <h4>{{ formData.name }}</h4>
        <div class="formItem">
          <div class="title">出售数量：</div>
          <van-field
            v-model="formData.sellQuota"
            type="digit"
            name="sellQuota"
            placeholder="出售数量(1份起售)"
            :rules="rules.sellQuota"
            @blur="onChangeVal"
          >
            <template #button>
              <p class="maxBtn" @click="onMax">最大</p>
            </template>
          </van-field>

          <p class="own">拥有{{ formData.totalQuota }}份</p>
        </div>
        <div class="formItem">
          <div class="title">出售单价(USDT)：</div>
          <van-field
            v-model="formData.price"
            type="number"
            name="price"
            placeholder="请输入出售单价"
            :rules="rules.price"
            @blur="onChangeVal"
          />
        </div>
        <div class="totalPrice">总价：{{ totalPrice }}</div>

        <div>
          <van-button round block type="info" native-type="submit">确认出售</van-button>
        </div>
        <div class="warmPrompt">
          温馨提示：出售中的矿机不再挖矿产生收益，取消出售后按T+1的规则产生收益，出售手续费：1%
        </div>
      </van-form>
    </div>
  </div>
</template>

<script>
import headerBar from '@/components/headerBar'
import { sellMachine } from '@/api/index'
import jsPrecision from '@/utils/jsPrecision'
export default {
  name: '',
  data() {
    return {
      formData: {},

      rules: {
        sellQuota: [{ required: true, message: '出售数量不能为空' }],
        price: [{ required: true, message: '出售单价不能为空' }]
      },
      totalPrice: ''
    }
  },
  computed: {},
  components: { headerBar },
  created() {
    const { totalPower, ...other } = this.$route.query
    this.formData = { sellQuota: '', price: '', ...other }
    console.log(this.formData)
  },
  mounted() {},
  methods: {
    onSubmit(val) {
      // console.log('submit', val)
      const { sellQuota, price } = this.formData
      if (sellQuota < 1) {
        this.$toast('出售数量必须大于零')
        return
      }
      if (price < 1) {
        this.$toast('出售单价必须大于零')
        return
      }
      if (this.formData.sellQuota > +this.formData.totalQuota) {
        this.$toast('大于可出售数量')
        this.formData.sellQuota = ''
        return
      }
      this.$dialog
        .confirm({
          title: '提示',
          message: '确认出售!',
          beforeClose: (action, done) => {
            if (action !== 'confirm') {
              done()
              return
            }
            this.handleConfirmSell(done)
          }
        })
        .then(() => {})
        .catch(() => {})
    },
    handleConfirmSell(done) {
      console.log(this.formData)
      const { name, totalQuota, ...other } = this.formData
      const params = other
      sellMachine(params).then(res => {
        this.$toast({
          message: '出售成功!',
          duration: 1000,
          onClose: () => {
            this.$router.go(-1)
          }
        })
        done()
      })
    },
    onMax() {
      console.log('11')
      console.log('formData', this.formData.totalQuota)
      this.formData.sellQuota = this.formData.totalQuota
      console.log('num', this.formData.sellQuota)
    },
    onChangeVal() {
      const { sellQuota, price, totalQuota } = this.formData
      // console.log(sellQuota)

      if (price < 0) {
        this.formData.price = 0
      }

      if (sellQuota && price) {
        const tPrice = jsPrecision.mul(sellQuota, price)
        console.log('tPrice', tPrice)
        let fee = jsPrecision.mul(tPrice, 0.01)
        console.log('fee', fee)
        this.totalPrice = jsPrecision.sub(tPrice, fee) + 'USDT'
      }
    }
  }
}
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
@blackColor: '#222222';
.sell {
  .sellMain {
    padding: 22px 20px 0 20px;
  }
}

h4 {
  font-size: 18px;
  font-weight: 600;
}
.formItem {
  font-size: 16px;
  .title {
    color: @blackColor;
    padding: 15px 0 8px 0;
  }

  .van-cell:after {
    border-bottom: none;
  }

  /deep/ .van-field {
    height: 48px;
    border: 1px solid #eaeaea;
    border-radius: 48px;
  }
  .maxBtn {
    color: #0069ff;
    font-weight: 600;
  }
  .own {
    color: #999;
    padding: 16px 0 24px 0;
  }
}
.totalPrice {
  font-size: 16px;
  padding: 24px 0 48px 0;
}

.warmPrompt {
  font-size: 14px;
  line-height: 22px;
  color: #999;
  padding-top: 16px;
}
</style>
