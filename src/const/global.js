/**
 * 基础尺寸
 */
export const remBase = 37.5

/**
 * app下载页地址
 */
export const appDownloadUrl = (() => {
  let urls = {
    test: 'http://twww.tangseng.io/download/index.html',
    prod: 'http://down.tangseng.io/download/index.html'
  }
  return process.env.VUE_APP_SERVER_ENV === 'prod' ? urls.prod : urls.test
})()

/**
 * 唤起客户端app协议url
 */
export const protocolHead = {
  android: 'app://com.xinxin.tangseng',
  ios: 'tangsengLive://'
}

/**
 * 手机号前缀
 */
export const prefixOptions = [
  { value: '+86', text: '+86' }, // 中国大陆
  { value: '+852', text: '+852' }, // 中国香港
  { value: '+886', text: '+886' }, // 中国台湾
  { value: '+853', text: '+853' }, // 中国澳门
  { value: '+60', text: '+60' }, // 马来西亚
  { value: '+1', text: '+1' }, // 美国
  { value: '+81', text: '+81' }, // 日本
  { value: '+82', text: '+82' }, // 韩国
  { value: '+66', text: '+66' }, // 泰国
  { value: '+84', text: '+84' }, // 越南
  { value: '+62', text: '+62' }, // 印度尼西亚
  { value: '+65', text: '+65' }, // 新加坡
  { value: '+61', text: '+61' } // 澳大利亚
]
