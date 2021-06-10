/**
 * 单独的某个项目api
 */
import request from '@/utils/request'

import Qs from 'qs'
const root = '/blockchain'

/**
 ** 首页API
 */

/**
 * 查询所有矿机
 */

export function getMillList() {
  return request({
    url: root + '/mining-machine',
    method: 'get',
    data: {}
  })
}

/**
 * 查询会员货币资产信息
 */

export function getCoinAsset(data) {
  return request({
    url: root + `/asset/currency?${Qs.stringify(data, { arrayFormat: 'repeat' })}`,
    method: 'get'
  })
}

/**
 * 今日预计收益
 */

export function getTodayEarning() {
  return request({
    url: root + '/machine-profit/expected',
    method: 'get',
    data: {}
  })
}

/**
 * 累计收益
 */

export function getTotalEarning() {
  return request({
    url: root + '/machine-profit/total',
    method: 'get',
    data: {}
  })
}

/**
 * 个人转卖
 */

export function getOneSelfList(data) {
  return request({
    url: root + `/member-sell?${Qs.stringify(data)}`,
    method: 'get'
  })
}

/**
 * 官方购买算力
 */
export function operaBuyMill({ machineId, ...other }) {
  return request({
    url: root + `/member-machine/buy/${machineId}?${Qs.stringify(other)}`,
    method: 'post'
  })
}

/**
 * 个人转卖购买算力
 */
export function buyMachine({ soldId, ...other }) {
  return request({
    url: root + `/member-sell/buy/${soldId}?${Qs.stringify(other)}`,
    method: 'post'
  })
}

/**
 * *我的矿机API
 */

// const myMachine = {
//   mining: root + '/member-machine',
//   sell: root + '/member-sell/selling'
// }

// /**
//  * 我的矿机
//  */
// export function getMyMachineData(type, data) {
//   let url = type === 'sell' ? `${myMachine[type]}?${Qs.stringify(data)}` : myMachine[type]
//   console.log('-url-', url)
//   return request({
//     url,
//     method: 'get',
//     data: {}
//   })
// }

/**
 * 我的矿机信息 - 挖矿中
 */
export function geInMiningList() {
  return request({
    url: root + '/member-machine',
    method: 'get',
    data: {}
  })
}

/**
 * 我出售的 - 出售中
 */
export function getInSellList(data) {
  return request({
    url: root + '/member-sell/selling' + '?' + Qs.stringify(data),
    method: 'get',
    data: {}
  })
}

/**
 * 取消出售
 */
export function cancelSell({ soldId }) {
  return request({
    url: root + `/member-sell/cancel/${soldId}`,
    method: 'post'
  })
}

/**
 * 出售矿机
 */
export function sellMachine(data) {
  return request({
    url: root + `/member-sell/sell?${Qs.stringify(data)}`,
    method: 'post',
    data
  })
}
