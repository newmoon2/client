import {
	ChatsInfo,
  ConsumeRecordInfo,
  DrawRecord,
  InvitationRecordInfo,
  PersonaInfo,
  PluginInfo,
  ProductInfo,
  RequesPrepay,
  RequestChatOptions,
  RequestImagesGenerations,
  RequestLoginParams,
  ResponseConfigData,
  ResponseLoginData,
  SigninInfo,
  SubscriptionInfo,
  TurnoverInfo,
  UserInfo,
  WithdrawalRecordInfo,
  
} from '@/types'
import request from '.'
import { formatTime } from '@/utils'
import { TableData } from '@/types/admin'

// 인증 코드 받기
export function getCode(params: { source: string }) {
  //return request.get('/api/send_sms', params)
}

// 로그인
export function postLogin(params: RequestLoginParams) {

  //return request.post<ResponseLoginData>('/api/login', params)
}

// 사용자 정보 얻기
export function getUserInfo() {

  //return request.get<UserInfo>('/api/user/info')

}

// 대화를 요청하세요
//3soft
export function postChatCompletions(
  params: RequestChatOptions,
  config?: {
    headers?: { [key: string]: any }
    options?: { [key: string]: any }
  }
) {


  //return request.postStreams<Response>('http://10.196.41.204:7614/konanbot/chat/message?_method=POST', params, config)
  //return request.postStreams<Response>('http://127.0.0.1:5000/api/chat/message?_method=POST', params, config)
  return request.postStreams<Response>('http://127.0.0.1:5000/api/chat/completion', params, config)
}




export function postChatCompletion(
  params: {
    prompt: string,
    type?: string
  },
  config?: {
    headers?: { [key: string]: any }
    options?: { [key: string]: any }
  }
) {
  
  //console.log("postChatCompletion")
  return request.postStreams<Response>('/api/chat/completion', params, config)
}





// 그림을 요청하세요
export function postImagesGenerations(
  params: RequestImagesGenerations,
  headers?: { [key: string]: any },
  options?: { [key: string]: any }
) {
  const formData = new FormData()
  Object.keys(params).forEach((key) => {
    formData.append(key, params[key])
  })
  return request.post<Array<DrawRecord>>(
    '/api/images/generations',
    formData,
    {
      'Content-Type': 'multipart/form-data',
      ...headers
    },
    options
  )
}

// 제품 목록 가져오기
export function getProduct() {

  return request.get<{
    products: Array<ProductInfo>
    pay_types: Array<string>
  }>('/api/product')
}




// 제품 목록 가져오기
export function getMyDocList() {
  
  //return request.get<Array<MyDocInfo>>('http://127.0.0.1:5000/api/getMyDocList')

 
}


//3soft getUserMessages
// 메시지 목록
export function getUserMessages(){
	//return request.get<Array<ChatsInfo>>('http://127.0.0.1:5000/api/user/messages?v=1')
}



// 사용자 소비 기록 가져오기
export function getUserTurnover(params: { page: number; page_size: number }) {
  return request.get<{ count: number; rows: Array<TurnoverInfo> }>('/api/turnover', params)
}

// 주문 제출
export function postPayPrecreate(params: RequesPrepay) {
  return request.post<{
    order_id: string
    pay_url: string
    pay_key: string
    qrcode?: string
  }>('/api/pay/precreate', params)
}

// 카드코드 충전
export function postUseCarmi(params: { carmi: string }) {
  //return request.post('/api/use_carmi', params)
}

// 로그인
export function postSignin() {
  //return request.post('/api/signin')
}

// 체크인 목록 받기
export function getSigninList() {
  //return request.get<Array<SigninInfo>>('/api/signin/list')
}

// 역할 데이터 가져오기
export function getPersonas(){
	//return request.get<Array<PersonaInfo>>('/api/persona')
}

// 문자 데이터 추가
export function postPersona(params: PersonaInfo){
	//return request.post('/api/persona', params)
}

// 사용자 비밀번호 재설정
export function putUserPassword(params: RequestLoginParams) {
  //return request.put('/api/user/password', params)
}

// 구성 데이터 가져오기
export function getConfig() {
  //return request.get<ResponseConfigData>('/api/config')
}

// 사용자 기록 가져오기
export function getUserRecords(params: { page: number; page_size: number; type: string | number }) {
   
  return request.get<TableData<InvitationRecordInfo | ConsumeRecordInfo | WithdrawalRecordInfo>>(
    '/api/user/records',
    params
  )
}

// 탈퇴 신청
export function postUserWithdrawal(params: WithdrawalRecordInfo) {
  return request.post('/api/user/withdrawal', params)
}


// 사용자 대화 삭제
export function delUserMessages(params: { parent_message_id?: string | number }){
	//return request.del('/api/user/messages', params)
}

// 플러그인 데이터 가져오기
export function getPlugin(){
	//return request.get<Array<PluginInfo>>('/api/plugin')
}

// 플러그인 설치
export function putInstalledPlugin(id: string | number){
	return request.put(`/api/plugin/installed/${id}`)
}

// 플러그인 제거
export function putUninstallPlugin(id: string | number){
	return request.put(`/api/plugin/uninstall/${id}`)
}

// 그림 데이터 가져오기
export function getDrawImages(params: {
  page: number,
  page_size: number,
  type: 'gallery' | 'me' | string
}){
	return request.get<TableData<DrawRecord>>('/api/images', params)
}

// 페인팅 상태 수정
export function setDrawImages(params: {
  id?: string | number,
  status?: number
}){
	return request.put('/api/images', params)
}