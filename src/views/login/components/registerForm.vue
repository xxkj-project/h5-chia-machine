<!-- 
   注册
-->
<template>
  <div class="formWrap">
    <van-popup
      v-model="dialogVisible"
      :close-on-click-overlay="false"
      round
      position="bottom"
      :style="{ height: '75%' }"
    >
      <div class="formBox">
        <div class="top fx-align-center">
          <span class="leftArrow" @click="onClose"></span>
          <p class="title">登录</p>
        </div>

        <van-form ref="formRef" :show-error-message="false" @submit="onSubmit">
          <div class="formItem fx-align-center">
            <!-- <van-dropdown-menu>
              <van-dropdown-item v-model="formData.countryCode" :options="prefixList"></van-dropdown-item>
            </van-dropdown-menu> -->
            <div class="prefixWrap fx-center" @click="onOpenPrefix">
              <span class="prefixTxt">+{{ formData.countryCode }}</span>
              <span class="bottomArrow"></span>
            </div>
            <van-field
              v-model="formData.mobile"
              type="tel"
              name="mobile"
              clearable
              placeholder="请输入手机号"
              :rules="rules.mobile"
            />
          </div>
          <div class="formItem fx-align-center">
            <van-field
              class="codeItem"
              v-model="formData.smsCode"
              name="smsCode"
              center
              clearable
              placeholder="请输入短信验证码"
              :rules="rules.smsCode"
            >
              <template #button>
                <van-button
                  class="codeBtn"
                  size="small"
                  type="primary"
                  native-type="button"
                  @click.stop="onSendCode"
                  v-if="isShowBtn"
                  >{{ codeBtnTxt }}</van-button
                >
                <p class="countTime fx-center" v-else>{{ countTime }}s</p>
              </template>
            </van-field>
          </div>

          <div style="padding-top: 16px">
            <van-button class="submitBtn" round block type="info" native-type="submit">登录</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
    <van-popup
      class="prefixPopup"
      v-model="isPrefix"
      :close-on-click-overlay="false"
      round
      position="bottom"
      :style="{ height: '66%' }"
      get-container=".login"
    >
      <div class="popupTop">
        <span class="closeIcon" @click="onClosePrefix"></span>
        <p class="title">选择国家和地区</p>
      </div>
      <ul class="listBox">
        <li
          class="item fx-space-between-center b-border"
          v-for="item in prefixList"
          :key="item.code"
          @click="onItem(item)"
        >
          <span>{{ item.name }}</span>
          <span>{{ item.text }}</span>
        </li>
      </ul>
    </van-popup>
  </div>
</template>

<script>
import { getPhonePrefix, sendMsg, login } from '@/api/common'
import { setToken, setRefreshToken, setTokenTime } from '@/utils/auth'
import authTools from '@/utils/authTools'
export default {
  name: '',
  data() {
    return {
      isShowBtn: true,
      timer: '',
      countTime: 60,
      codeBtnTxt: '获取验证码',
      formData: { countryCode: 86, mobile: '', smsCode: '' },
      rules: {
        mobile: [{ required: true, message: '请填写手机号' }],
        smsCode: [{ required: true, message: '请填写短信验证码' }]
      },
      prefixList: [],
      isPrefix: false
    }
  },
  props: {
    type: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  components: {},
  created() {
    this.getPrefixData()
  },
  mounted() {},
  destroyed() {
    this.timer && clearInterval(this.timer)
  },
  methods: {
    onClose() {
      this.dialogVisible = false
      this.$refs.formRef.resetValidation()
    },
    onOpenPrefix() {
      this.isPrefix = true
    },
    onClosePrefix() {
      this.isPrefix = false
    },
    onItem(item) {
      // console.log('-item-', item)
      this.formData.countryCode = item.code
      this.isPrefix = false
    },
    onSendCode() {
      if (!this.formData.mobile) {
        this.$toast('请输入手机号')
        return
      }
      const params = { mobile: this.formData.mobile, countryCode: this.formData.countryCode }
      sendMsg(params, 'register').then(res => {
        // console.log('-res-', res)
        this.isShowBtn = false
        this.timer = setInterval(() => {
          this.countTime--
          if (this.countTime < 0) {
            clearInterval(this.timer)
            this.isShowBtn = true
            this.codeBtnTxt = '重新获取'
            this.countTime = 60
          }
        }, 1000)
      })
    },
    onSubmit(value) {
      // console.log('-submit-', value)
      const { mobile, smsCode } = value
      if (!mobile) {
        this.$toast('请输入手机号')
        return
      }
      if (!smsCode) {
        this.$toast('请输入验证码')
        return
      }
      this.$pageLoading.show()
      const params = { ...this.formData }
      console.log('-params-', params)
      login(params)
        .then(res => {
          // console.log('-res-', res)
          this.$pageLoading.hide()
          const { token, refreshToken } = res.data
          const expTime = authTools.getTokenExpTime(token)
          const duration = authTools.getRefreshTokenDuration(refreshToken)
          setTokenTime(expTime)
          setToken(token)
          setRefreshToken(refreshToken, duration)
          this.dialogVisible = false
          this.$router.go(-1)
        })
        .catch(err => {
          this.$pageLoading.hide()
        })
    },
    getPrefixData() {
      this.$loading.show()
      getPhonePrefix()
        .then(res => {
          this.$loading.hide()
          const list = res.data
          this.prefixList = list.map(val => ({ text: `+${val.code}`, ...val }))
          // console.log('-prefix-list-', this.prefixList)
        })
        .catch(err => {
          this.$loading.hide()
        })
    }
  }
}
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
@imgUrl: '~@/assets/images/common/';
/deep/ .van-overlay {
  background: rgba(0, 0, 0, 0);
}

.formBox {
  font-size: 16px;
  padding: 24px 20px 0;

  /deep/ .van-field {
    height: 48px;
    border: 1px solid #eaeaea;
    border-radius: 24px;
  }

  .top {
    margin-bottom: 40px;

    .leftArrow {
      width: 20px;
      height: 20px;
      background: url('@{imgUrl}icon-left-arrow.png') no-repeat center / cover;
    }

    .title {
      font-size: 20px;
      color: #222;
      line-height: 28px;
      margin-left: 4px;
    }
  }

  .formItem {
    margin-bottom: 24px;
  }

  .prefixWrap {
    position: relative;
    width: 110px;
    height: 48px;
    border: 1px solid #eaeaea;
    border-radius: 48px;
    margin-right: 10px;

    .prefixTxt {
      margin-right: 8px;
    }

    .bottomArrow {
      border: 4px solid;
      border-color: transparent transparent #dcdee0 #dcdee0;
      -webkit-transform: rotate(-45deg);
      transform: rotate(-45deg);
      margin-top: -5px;
    }

    // &::after {
    //   position: absolute;
    //   top: 50%;
    //   right: 8px;
    //   margin-top: -7px;
    //   border: 4px solid;
    //   border-color: transparent transparent #dcdee0 #dcdee0;
    //   -webkit-transform: rotate(-45deg);
    //   transform: rotate(-45deg);
    //   opacity: 0.8;
    //   content: '';
    // }
  }

  .codeItem {
    /deep/ &.van-cell {
      padding-right: 0;
    }

    .codeBtn {
      width: 90px;
      height: 36px;
      background: #d2e4ff;
      color: #0069ff;
      border: 1px solid #d2e4ff;
      border-radius: 18px;
      margin-right: 6px;
    }

    .countTime {
      width: 90px;
      height: 36px;
      background: #d2e4ff;
      color: #0069ff;
      border-radius: 18px;
      margin-right: 6px;
    }
  }

  .submitBtn {
    font-size: 18px;
  }
}

.prefixPopup {
  font-size: 16px;

  .popupTop {
    position: relative;
    line-height: 50px;

    .closeIcon {
      position: absolute;
      top: 16px;
      left: 16px;
      width: 18px;
      height: 18px;
      background: url('@{imgUrl}icon-cancel.png') no-repeat center;
      background-size: 100% 100%;
    }

    .title {
      text-align: center;
    }
  }

  .listBox {
    padding: 0 16px 20px;
    .item {
      line-height: 44px;
    }

    .item:last-child {
      &.b-border:before {
        height: 0;
      }
    }
  }
}

// /deep/ .van-dropdown-menu {
//     margin-right: 10px;

//     &__bar {
//       width: 80px;
//       height: 48px;
//       box-shadow: none;
//       border: 1px solid #eaeaea;
//       border-radius: 48px;
//     }

//     &__title {
//       padding: 0 20px 0 10px;
//     }

//     &__title::after {
//       right: 8px;
//     }

//     .van-dropdown-item {
//       .van-cell {
//         padding: 10px 20px;

//         &__title {
//           padding-left: 22px;
//         }
//       }
//     }
//   }
</style>
