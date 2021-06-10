<!-- 
   提现
-->
<template>
  <div class="withdraw">
    <headerBar />
    <div class="main">
      <van-form :show-error-message="false" @submit="onSubmit">
        <div class="formItem">
          <p class="label">提币地址</p>
          <van-field
            v-model="formData.address"
            name="address"
            placeholder="请输入地址"
            :rules="rules.address"
          ></van-field>
        </div>
        <div class="formItem">
          <p class="label">数量</p>
          <van-field
            v-model="formData.amount"
            type="number"
            name="amount"
            placeholder="最小提币数量：10"
            :rules="rules.amount"
            @blur="onAmountBlur"
          >
            <template #button>
              <p class="maxBtn" @click="onMax">最大</p>
            </template>
          </van-field>
          <p class="tips">最大可用：{{ maxNum }}XCH</p>
        </div>
        <div class="formItem">
          <p class="tips">
            到账数量：<span class="green">{{ realAmount }}XCH</span>
          </p>
        </div>

        <div class="btnBox">
          <van-button round block type="info" native-type="submit">提币</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script>
import headerBar from '@/components/headerBar/index'
import jsPrecision from '@/utils/jsPrecision'
export default {
  name: '',
  data() {
    return {
      maxNum: 0,
      serviceFee: 10,
      realAmount: 0,
      formData: {
        address: '',
        amount: ''
      },
      rules: {
        address: [{ required: true, message: '请填写提币地址' }],
        amount: [{ required: true, message: '请填写数量' }]
      }
    }
  },
  computed: {},
  components: { headerBar },
  created() {
    const { maxNum } = this.$route.query
    maxNum && (this.maxNum = maxNum)
  },
  mounted() {},
  methods: {
    onAmountBlur() {
      // console.log('-blur-')
      let result = jsPrecision.sub(this.formData.amount, this.serviceFee)
      // console.log('-result-', result)
      this.realAmount = result < 0 ? 0 : result
    },
    onMax() {
      console.log('-max-')
      this.formData.amount = this.maxNum
      this.onAmountBlur()
    },
    onSubmit(value) {
      console.log('-data-', value)
      if (value.amount <= this.serviceFee) {
        this.$toast('提币数量不够，请您重新输入')
        return
      }
      this.$dialog
        .confirm({
          message: '申请提交后，请等待审核',
          beforeClose: (action, done) => {
            if (action != 'confirm') {
              done()
              return
            }
            setTimeout(() => {
              this.submitReq(value, done)
            }, 1000)
          }
        })
        .catch(action => {})
    },
    submitReq(params, done) {
      setTimeout(() => {
        this.maxNum = jsPrecision.sub(this.maxNum, params.amount)
        done()
        this.$toast({
          message: '订单已提交，请耐心等待审核！',
          duration: 2000,
          onClose: () => {
            console.log('toast关闭')
          }
        })
      }, 1000)
    }
  }
}
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
@imgUrl: '~@/assets/images/common/';
@blueColor: #0069ff;
.main {
  width: 100%;
  color: #222;
  font-size: 16px;
  line-height: 22px;
  padding: 0 20px;
}

.formItem {
  .label {
    font-weight: 600;
    padding: 24px 0 16px 0;
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
    color: @blueColor;
  }

  .tips {
    color: #999;
    padding-top: 16px;

    .green {
      color: #56d451;
    }
  }
}

.btnBox {
  padding-top: 48px;

  /deep/ .van-button--info {
    background: @blueColor;
    border: 1px solid @blueColor;
    line-height: 44px;
  }
}
</style>
