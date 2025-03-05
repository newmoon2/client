import {
  CarmiInfo,
  ConfigInfo,
  MessageInfo,
  NotificationInfo,
  OrderInfo,
  Paging,
  PaymentInfo,
  ProductInfo,
  RequestAddCarmi,
  SigninInfo,
  TableData,
  AikeyInfo,
  TurnoverInfo,
  UserInfo,
  InviteRecordInfo,
  CashbackInfo,
  AmountDetailInfo,
  WithdrawalRecordInfo,
  DialogInfo,
  PersonaInfo,
  PluginInfo,
  DrawRecordInfo
} from '@/types/admin'
import request from '.'

// 카드 비밀 목록 가져오기
export function getAdminCarmi(params: Paging) {
  return request.get<TableData<CarmiInfo>>('/api/admin/carmi', params)
}

// 카드 비밀번호 확인
export function getAdminCarmiCheck() {
  return request.get<TableData<CarmiInfo>>('/api/admin/carmi/check')
}

// 카드 비밀번호 삭제
export function delAdminCarmi(params: { id: string | number }) {
  return request.del(`/api/admin/carmi/${params.id}`)
}

// 카드비밀 대량생산
export function addAdminCarmis(params: RequestAddCarmi) {
  return request.post<Array<CarmiInfo>>('/api/admin/carmi', params)
}

// 사용자 목록
export function getAdminUsers(params: Paging) {
  return request.get<TableData<UserInfo>>('/api/admin/user', params)
}
// 사용자 삭제
export function delAdminUsers(params: { id: string | number }) {
  return request.del(`/api/admin/user/${params.id}`)
}
// 사용자 수정
export function putAdminUsers(params: UserInfo) {
  return request.put('/api/admin/user', params)
}
// 새 사용자 추가
export function postAdminUser(params: UserInfo) {
	return request.post('/api/admin/user', params)
}

// 사용자 소비 목록
export function getAdminTurnovers(params: Paging) {
  return request.get<TableData<TurnoverInfo>>('/api/admin/turnover', params)
}
// 사용자 소비 기록 삭제
export function delAdminTurnover(params: { id: string | number }) {
  return request.del(`/api/admin/turnover/${params.id}`)
}
// 사용자 소비 기록 수정
export function putAdminTurnover(params: TurnoverInfo) {
  return request.put('/api/admin/turnover', params)
}

// 사용자 체크인 목록
export function getAdminSignin(params: Paging) {
  return request.get<TableData<SigninInfo>>('/api/admin/signin', params)
}

// 사용자 대화 목록
export function getAdminMessages(params: Paging) {
  return request.get<TableData<MessageInfo>>('/api/admin/messages', params)
}

// 제품 목록
export function getAdminProducts(params: Paging) {
  return request.get<TableData<ProductInfo>>('/api/admin/products', params)
}
// 제품 삭제
export function delAdminProduct(params: { id: string | number }) {
  return request.del(`/api/admin/products/${params.id}`)
}
// 새 제품 추가
export function postAdminProduct(params: ProductInfo) {
  return request.post('/api/admin/products', params)
}
// 제품 수정
export function putAdminProduct(params: ProductInfo) {
  return request.put('/api/admin/products', params)
}

// 토큰 받기
export function getAdminAikeys(params: Paging) {
  return request.get<TableData<AikeyInfo>>('/api/admin/aikey', params)
}

// 삭제토큰
export function delAdminAikey(params: { id: string | number }) {
  return request.del(`/api/admin/aikey/${params.id}`)
}

// 새 토큰 추가
export function postAdminAikey(params: AikeyInfo) {
  return request.post('/api/admin/aikey', params)
}

// 토큰 수정
export function putAdminAikey(params: AikeyInfo) {
  return request.put('/api/admin/aikey', params)
}
// 토큰 확인
export function postAdminAikeyCheck(params: AikeyInfo | { all: boolean }) {
  return request.post('/api/admin/aikey/check', params)
}

// 구성 데이터 가져오기
export function getAdminConfig() {
  return request.get<Array<ConfigInfo>>('/api/admin/config')
}

// 구성 데이터 수정
export function putAdminConfig(params: { [key: string]: any }) {
  return request.put<Array<ConfigInfo>>('/api/admin/config', params)
}

// 결제 채널 확보
export function getAdminPayment(params: Paging) {
  return request.get<TableData<PaymentInfo>>('/api/admin/payment', params)
}

// 채널 삭제
export function delAdminPayment(params: { id: string | number }) {
  return request.del(`/api/admin/payment/${params.id}`)
}

// 새 채널 추가
export function addAdminPayment(params: PaymentInfo) {
  return request.post('/api/admin/payment', params)
}
// 채널 수정
export function putAdminPayment(params: PaymentInfo) {
  return request.put('/api/admin/payment', params)
}

// 주문 목록 가져오기
export function getAdminOrders(params: Paging) {
  return request.get<TableData<OrderInfo>>('/api/admin/orders', params)
}

// 얻다 Notification
export function getAdminNotification(params: Paging) {
  return request.get<TableData<NotificationInfo>>('/api/admin/notification', params)
}

// 삭제 Notification
export function delAdminNotification(params: { id: string | number }) {
  return request.del(`/api/admin/notification/${params.id}`)
}

// 새로운 Notification
export function postAdminNotification(params: NotificationInfo) {
  return request.post('/api/admin/notification', params)
}

// 편집하다 Notification
export function putAdminNotification(params: NotificationInfo) {
  return request.put('/api/admin/notification', params)
}

// 초대 기록 받기
export function getAdminInviteRecord(params: Paging) {
  return request.get<TableData<InviteRecordInfo>>('/api/admin/invite_record', params)
}

// 초대 기록 삭제
export function delAdminInviteRecord(params: { id: string | number }) {
  return request.del(`/api/admin/invite_record/${params.id}`)
}

// 초대 기록 수정
export function putAdminInviteRecord(params: InviteRecordInfo) {
  return request.put('/api/admin/invite_record', params)
}

// 초대가 통과되었습니다
export function putAdminInviteRecordPass(params?: { id: string | number }) {
  return request.put('/api/admin/invite_record/pass', params)
}

// 리베이트 기록 받기
export function getAdminCashback(params?: Paging) {
  return request.get<TableData<CashbackInfo>>('/api/admin/cashback', params)
}

// 리베이트 기록 삭제
export function delAdminCashback(params: { id: string | number }) {
  return request.del(`/api/admin/cashback/${params.id}`)
}

// 리베이트 기록 수정
export function putAdminCashback(params: CashbackInfo) {
  return request.put('/api/admin/cashback', params)
}

// 커미션을 통해
export function putAdminCashbackPass(params: { id: string | number }) {
  return request.put('/api/admin/cashback/pass', params)
}

// 금액에 대한 자세한 기록 얻기
export function getAdminAmountDetails(params?: Paging) {
  return request.get<TableData<AmountDetailInfo>>('/api/admin/amount_details', params)
}

// 금액 세부정보 삭제
export function delAdminAmountDetails(params: { id: string | number }) {
  return request.del(`/api/admin/amount_details/${params.id}`)
}

// 금액 세부정보 수정
export function putAdminAmountDetails(params: AmountDetailInfo) {
  return request.put('/api/admin/amount_details', params)
}

// 새로운 금액 세부정보
export function postAdminAmountDetails(params: AmountDetailInfo) {
  return request.post('/api/admin/amount_details', params)
}

// 출금 목록 받기
export function getAdminWithdrawalRecords(params?: Paging) {
  return request.get<TableData<WithdrawalRecordInfo>>('/api/admin/withdrawal_record', params)
}

// 출금기록 삭제
export function delAdminWithdrawalRecord(params: { id: string | number }) {
  return request.del(`/api/admin/withdrawal_record/${params.id}`)
}

// 출금 기록 수정
export function putAdminWithdrawalRecord(params: WithdrawalRecordInfo) {
  return request.put('/api/admin/withdrawal_record', params)
}

// 출금 기록 추가
export function postAdminWithdrawalRecord(params: WithdrawalRecordInfo) {
  return request.post('/api/admin/withdrawal_record', params)
}

// 작전철회현황
export function putAdminWithdrawalRecordOperate(params: WithdrawalRecordInfo) {
	return request.put('/api/admin/withdrawal_record/operate', params)
}

// 메시지 삭제
export function delAdminMessage(params: { id: string | number }) {
	return request.del(`/api/admin/messages/${params.id}`)
}

// 메시지 수정
export function putAdminMessage(params: MessageInfo) {
	return request.put('/api/admin/messages', params)
}

// 내장된 대화 가져오기
export function getAdminDialogs(params?: Paging) {
	return request.get<TableData<DialogInfo>>('/api/admin/dialog', params)
}

// 내장 대화 수정
export function putAdminDialog(params: DialogInfo) {
	return request.put('/api/admin/dialog', params)
}

// 내장 대화 추가
export function postAdminDialog(params: DialogInfo) {
	return request.post('/api/admin/dialog', params)
}

// 내장된 대화 삭제
export function delAdminDialog(params: { id: string | number }) {
	return request.del(`/api/admin/dialog/${params.id}`)
}

// 역할 데이터 가져오기
export function getAdminPersonas(params?: Paging) {
	return request.get<TableData<PersonaInfo>>('/api/admin/persona', params)
}
// 문자 데이터 편집
export function putAdminPersona(params: PersonaInfo) {
	return request.put('/api/admin/persona', params)
}
// 문자 데이터 추가
export function postAdminPersona(params: PersonaInfo) {
	return request.post('/api/admin/persona', params)
}
// 문자 데이터 삭제
export function delAdminPersona(params: { id: string | number }) {
	return request.del(`/api/admin/persona/${params.id}`)
}

// 플러그인 데이터 가져오기
export function getAdminPlugins(params?: Paging) {
	return request.get<TableData<PluginInfo>>('/api/admin/plugins', params)
}
// 플러그인 제거
export function delAdminPlugin(params: { id: string | number }) {
	return request.del(`/api/admin/plugin/${params.id}`)
}
// 플러그인 데이터 편집
export function putAdminPlugin(params: PluginInfo) {
	return request.put('/api/admin/plugin', params)
}
// 플러그인 데이터 추가
export function postAdminPlugin(params: PluginInfo) {
	return request.post('/api/admin/plugin', params)
}

// 그림 목록 받기
export function getAdminDrawRecords(params?: Paging) {
	return request.get<TableData<DrawRecordInfo>>('/api/admin/draw_record', params)
}
// 그림 데이터 삭제
export function delAdminDrawRecord(params: { id: string | number }) {
	return request.del(`/api/admin/draw_record/${params.id}`)
}

// 페인팅 데이터 수정
export function putAdminDrawRecord(params: DrawRecordInfo | { images: string }) {
	return request.put('/api/admin/draw_record', params)
}