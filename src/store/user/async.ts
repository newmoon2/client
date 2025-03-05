import { RequestLoginParams, WithdrawalRecordInfo } from '@/types'
import userStore from '../user/slice'
import chatStore from '../chat/slice'
import { getUserInfo, getUserRecords, postLogin, postUserWithdrawal, putUserPassword } from '@/request/api'

// 로그인
export async function fetchLogin(params: RequestLoginParams) {
  const response = await postLogin(params)
  if (!response.code) {
    userStore.getState().login({ ...response.data })
  }
  return response
}

// 사용자 정보 얻기
export async function fetchUserInfo() {
  const response = await getUserInfo()
  if (!response.code) {
    userStore.getState().login({
      token: userStore.getState().token,
      user_info: response.data
    })
  }
  return response
}

// 사용자 비밀번호 재설정
export async function fetchUserPassword(params: RequestLoginParams) {
  const response = await putUserPassword(params)
  if (!response.code) {
    userStore.getState().logout()
	chatStore.getState().clearChats()
  }
  return response
}

// 사용자 데이터
export async function fetchUserRecords(params: {
  page: number
  page_size: number
  type: string | number
}) {
  const response = await getUserRecords({ ...params })
  if (!response.code) {
    userStore.getState().changeRecords(response.data, params.type)
  }
  return response
}

export async function fetchUserWithdrawal(params: WithdrawalRecordInfo) {
  const response = await postUserWithdrawal({ ...params })
  if (!response.code) {
	userStore.getState().changeUserCurrentAmount()
  }
  return response
}

export default {
  fetchUserInfo,
  fetchLogin,
  fetchUserPassword
}
