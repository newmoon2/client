import {
	ProForm,
	ProFormDependency,
	ProFormDigit,
	ProFormSelect,
	ProFormText,
	ProFormTextArea,
	QueryFilter
  } from '@ant-design/pro-components'
  import { Button, Form, Space, Tabs, message } from 'antd'
  import { useEffect, useRef, useState } from 'react'
  import styles from './index.module.less'
  import { getAdminConfig, putAdminConfig } from '@/request/adminApi'
  import { ConfigInfo } from '@/types/admin'
  import RichEdit from '@/components/RichEdit'

  function ConfigPage() {
	const [configs, setConfigs] = useState<Array<ConfigInfo>>([])
	const [rewardForm] = Form.useForm<{
	  register_reward: number | string
	  signin_reward: number | string
	  invite_reward: number | string
	  cashback_ratio: number | string
	}>()

	const [aiCarryCountForm] = Form.useForm<{
	  ai3_carry_count: number | string
	  ai4_carry_count: number | string
	}>()

	const [aiRatioForm] = Form.useForm<{
	  ai3_ratio: number | string
	  ai4_ratio: number | string
	}>()

	const [drawPriceForm] = Form.useForm<{
	  draw_price: number | string
	}>()

	const [webSiteForm] = Form.useForm<{
	  website_title: string
	  website_description: string
	  website_keywords: string
	  website_logo: string
	  website_footer: string
	}>()

	const [cloudStorageForm] = Form.useForm<{
	  type: string
	  secret_key?: string
	  api_host?: string
	  secret_id?: string
	  bucket?: string
	  access_key_secret?: string
	  access_key_id?: string
	  region?: string
	  local_host?: string
	}>()

	const [prohibitedWordsForm] = Form.useForm<{
	  prohibited_words: string
	}>()

	const [tuputechKeyForm] = Form.useForm<{
	  tuputech_key: string
	}>()

	const [smsForm] = Form.useForm<{
	  user: string
	  password: string
	  sign: string
	  template: string
	}>()

	const [emailForm] = Form.useForm<{
	  host: string
	  port: string | number
	  user: string
	  pass: string
	  from_title: string
	  subject: string
	}>()

	const shopIntroduce = useRef<string>()
	const userIntroduce = useRef<string>()
	const inviteIntroduce = useRef<string>()

	function getConfigValue(key: string, data: Array<ConfigInfo>) {
	  const value = data.filter((c) => c.name === key)[0]
	  return value
	}

	function onRewardFormSet(data: Array<ConfigInfo>) {
	  const registerRewardInfo = getConfigValue('register_reward', data)
	  const signinRewardInfo = getConfigValue('signin_reward', data)
	  const ai3Ratio = getConfigValue('ai3_ratio', data)
	  const ai4Ratio = getConfigValue('ai4_ratio', data)
	  const drawPrice = getConfigValue('draw_price', data)

	  const cashback_ratio = getConfigValue('cashback_ratio', data)
	  const invite_reward = getConfigValue('invite_reward', data)
	  rewardForm.setFieldsValue({
		register_reward: registerRewardInfo.value,
		signin_reward: signinRewardInfo.value,
		invite_reward: invite_reward.value,
		cashback_ratio: cashback_ratio.value
	  })

	  const ai3CarryCountInfo = getConfigValue('ai3_carry_count', data)
	  const ai4CarryCountInfo = getConfigValue('ai4_carry_count', data)
	  aiCarryCountForm.setFieldsValue({
		ai3_carry_count: Number(ai3CarryCountInfo.value) || 0,
		ai4_carry_count: Number(ai4CarryCountInfo.value) || 0
	  })

	  aiRatioForm.setFieldsValue({
		ai3_ratio: Number(ai3Ratio.value),
		ai4_ratio: Number(ai4Ratio.value)
	  })
	  if (drawPrice && drawPrice.value) {
		drawPriceForm.setFieldsValue({
		  draw_price: JSON.parse(drawPrice.value)
		})
	  }

	  const website_title = getConfigValue('website_title', data)
	  const website_description = getConfigValue('website_description', data)
	  const website_keywords = getConfigValue('website_keywords', data)
	  const website_logo = getConfigValue('website_logo', data)
	  const website_footer = getConfigValue('website_footer', data)
	  webSiteForm.setFieldsValue({
		website_title: website_title.value,
		website_description: website_description.value,
		website_keywords: website_keywords.value,
		website_logo: website_logo.value,
		website_footer: website_footer.value
	  })

	  const shop_introduce = getConfigValue('shop_introduce', data)
	  if (shop_introduce && shop_introduce.value) {
		shopIntroduce.current = shop_introduce.value
	  }

	  const user_introduce = getConfigValue('user_introduce', data)
	  if (user_introduce && user_introduce.value) {
		userIntroduce.current = user_introduce.value
	  }

	  const invite_introduce = getConfigValue('invite_introduce', data)
	  if (invite_introduce && invite_introduce.value) {
		inviteIntroduce.current = invite_introduce.value
	  }

	  const prohibited_words = getConfigValue('prohibited_words', data)
	  if (prohibited_words && prohibited_words.value) {
		prohibitedWordsForm.setFieldsValue({
		  prohibited_words: prohibited_words.value
		})
	  }

	  const tuputech_key = getConfigValue('tuputech_key', data)
	  if (tuputech_key && tuputech_key.value) {
		tuputechKeyForm.setFieldsValue({
		  tuputech_key: tuputech_key.value
		})
	  }

	  const sms = getConfigValue('sms', data)
	  if (sms && sms.value) {
		const smsData = JSON.parse(sms.value)
		smsForm.setFieldsValue({
		  ...smsData
		})
	  }

	  const email = getConfigValue('email', data)
	  if (email && email.value) {
		const emailData = JSON.parse(email.value)
		emailForm.setFieldsValue({
		  ...emailData
		})
	  }

	  const cloudStorage = getConfigValue('cloud_storage', data)
	  if (cloudStorage && cloudStorage.value) {
		const cloudStorageData = JSON.parse(cloudStorage.value)
		cloudStorageForm.setFieldsValue({
		  ...cloudStorageData
		})
	  }
	}

	function onGetConfig() {
	  getAdminConfig().then((res) => {
		if (res.code) {
		  message.error('구성 오류 발생')
		  return
		}
		onRewardFormSet(res.data)
		setConfigs(res.data)
	  })
	}

	useEffect(() => {
	  onGetConfig()
	}, [])

	async function onSave(values: any) {
	  return putAdminConfig(values).then((res) => {
		if (res.code) {
		  message.error('저장 실패')
		  return
		}
		message.success('성공적으로 저장되었습니다')
		onGetConfig()
	  })
	}

	const cloudStorageFormItems: {
	  [key: string]: Array<React.ReactNode>
	} = {
	  local: [
		<ProFormText
		  key="local_host"
		  name="host"
		  label="도메인 이름 방문(http/https)"
		  // rules={[{ required: true, message: '액세스 도메인 이름을 입력하세요(/로 끝남).!' }]}
		/>
	  ],
	  tencent: [
		<ProFormText
		  key="tencent_secret_id"
		  name="secret_id"
		  label="SecretId"
		  rules={[{ required: true, message: 'SecretId 입력해주세요!' }]}
		/>,
		<ProFormText
		  key="tencent_secret_key"
		  name="secret_key"
		  label="SecretKey"
		  rules={[{ required: true, message: 'SecretKey 입력해주세요!' }]}
		/>,
		<ProFormText
		  key="tencent_bucket"
		  name="bucket"
		  label="Bucket"
		  rules={[{ required: true, message: 'Bucket 입력해주세요!' }]}
		/>,
		<ProFormText
		  key="tencent_region"
		  name="region"
		  label="Region"
		  rules={[{ required: true, message: 'Region 입력해주세요!' }]}
		/>
	  ],
	  alioss: [
		<ProFormText
		  key="alioss_access_key_id"
		  name="access_key_id"
		  label="AccessKeyId"
		  rules={[{ required: true, message: 'AccessKeyId 입력해주세요!' }]}
		/>,
		<ProFormText
		  key="alioss_access_key_secret"
		  name="access_key_secret"
		  label="AccessKeySecret"
		  rules={[{ required: true, message: 'AccessKeySecret 입력해주세요!' }]}
		/>,
		<ProFormText
		  key="alioss_bucket"
		  name="bucket"
		  label="Bucket"
		  rules={[{ required: true, message: ' Bucket 입력해주세요!' }]}
		/>,
		<ProFormText
		  key="alioss_region"
		  name="region"
		  label="Region"
		  rules={[{ required: true, message: 'Region 입력해주세요!' }]}
		/>
	  ],
	  upyun: [
		<ProFormText
		  key="tencent_bucket"
		  name="bucket"
		  label="서비스 이름"
		  rules={[{ required: true, message: 'LOGO URL 웹사이트를 입력해주세요!' }]}
		/>,
		<ProFormText
		  key="upyun_secret_id"
		  name="secret_id"
		  label="연산자"
		  rules={[{ required: true, message: '운영자 계정을 입력해주세요!' }]}
		/>,
		<ProFormText
		  key="upyun_secret_key"
		  name="secret_key"
		  label="연산자 키"
		  rules={[{ required: true, message: '연산자 키를 입력하세요!' }]}
		/>,
		<ProFormText
		  key="upyun_host"
		  name="host"
		  label="도메인 이름 방문(http/https)"
		  rules={[{ required: true, message: '액세스 도메인 이름을 입력하세요(/로 끝남).!' }]}
		/>
	  ],
	  lsky: [
		<ProFormText
		  key="lsky_api_host"
		  name="api_host"
		  label="ApiHost"
		  rules={[{ required: true, message: 'LOGO URL 웹사이트를 입력해주세요!' }]}
		/>,
		<ProFormText
		  key="lsky_secret_key"
		  name="secret_key"
		  label="SecretKey"
		  rules={[{ required: true, message: 'LOGO URL 웹사이트를 입력해주세요!' }]}
		/>
	  ]
	}

	function IntroduceSettings() {
	  return (
		<Space
		  direction="vertical"
		  style={{
			width: '100%'
		  }}
		>
		  <div className={styles.config_form}>
			<h3>쇼핑몰 페이지 공지사항 설정</h3>
			<div style={{ marginTop: 20, marginBottom: 20 }}>
			  <RichEdit
				defaultValue={shopIntroduce.current}
				value={shopIntroduce.current}
				onChange={(value) => {
				  shopIntroduce.current = value
				}}
			  />
			</div>
			<Button
			  size="large"
			  type="primary"
			  onClick={() => {
				onSave({
				  shop_introduce: shopIntroduce.current
				})
			  }}
			>
			 구하다
			</Button>
		  </div>
		  <div className={styles.config_form}>
			<h3>개인센터 페이지 공지사항 설정			</h3>
			<div style={{ marginTop: 20, marginBottom: 20 }}>
			  <RichEdit
				defaultValue={userIntroduce.current}
				value={userIntroduce.current}
				onChange={(value) => {
				  userIntroduce.current = value
				}}
			  />
			</div>
			<Button
			  size="large"
			  type="primary"
			  onClick={() => {
				onSave({
				  user_introduce: userIntroduce.current
				})
			  }}
			>
			 구하다
			</Button>
		  </div>
		  <div className={styles.config_form}>
			<h3>초대 설명 설정</h3>
			<div style={{ marginTop: 20, marginBottom: 20 }}>
			  <RichEdit
				defaultValue={inviteIntroduce.current}
				value={inviteIntroduce.current}
				onChange={(value) => {
				  inviteIntroduce.current = value
				}}
			  />
			</div>
			<Button
			  size="large"
			  type="primary"
			  onClick={() => {
				onSave({
				  invite_introduce: inviteIntroduce.current
				})
			  }}
			>
			  구하다
			</Button>
		  </div>
		</Space>
	  )
	}

	function WebSiteSettings() {
	  return (
		<Space
		  direction="vertical"
		  style={{
			width: '100%'
		  }}
		>
		  <div className={styles.config_form}>
			<h3>웹사이트 설정</h3>
			<ProForm
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={webSiteForm}
			  size="large"
			  initialValues={{}}
			  isKeyPressSubmit={false}
			  submitter={{
				searchConfig: {
				  submitText: '저장',
				  resetText: '다시 덮다'
				}
			  }}
			  onFinish={onSave}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			>
			  <ProForm.Group>
				<ProFormText
				  width="xl"
				  name="website_title"
				  label="웹사이트 제목"
				  rules={[{ required: true, message: '홈페이지 제목을 입력해주세요!' }]}
				/>
				<ProFormText
				  width="xl"
				  name="website_logo"
				  label="웹사이트LOGO"
				  rules={[{ required: true, message: 'LOGO URL 웹사이트를 입력해주세요!' }]}
				/>
			  </ProForm.Group>
			  <ProForm.Group>
				<ProFormTextArea
				  width="xl"
				  name="website_description"
				  fieldProps={{
					autoSize: {
					  minRows: 2,
					  maxRows: 2
					}
				  }}
				  label="웹사이트 설명"
				  rules={[{ required: true, message: '웹사이트 설명을 입력하세요.!' }]}
				/>
				<ProFormTextArea
				  width="xl"
				  label="웹사이트 키워드"
				  name="website_keywords"
				  fieldProps={{
					autoSize: {
					  minRows: 2,
					  maxRows: 2
					}
				  }}
				  rules={[{ required: true, message: '웹사이트 키워드를 입력하세요.!' }]}
				/>
			  </ProForm.Group>
			  <ProFormTextArea
				name="website_footer"
				label="웹사이트 바닥글"
				fieldProps={{
				  autoSize: {
					minRows: 2,
					maxRows: 6
				  }
				}}
			  />
			</ProForm>
		  </div>
		</Space>
	  )
	}

	function RewardSettings() {
	  return (
		<Space
		  direction="vertical"
		  style={{
			width: '100%'
		  }}
		>
		  <div className={styles.config_form}>
			<h3>보상 인센티브</h3>
			<QueryFilter
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={rewardForm}
			  onFinish={async (values: any) => {
				putAdminConfig(values).then((res) => {
				  if (res.code) {
					message.error('저장 실패')
					return
				  }
				  message.success('성공적으로 저장되었습니다')
				  onGetConfig()
				})
			  }}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			  size="large"
			  collapsed={false}
			  defaultCollapsed={false}
			  requiredMark={false}
			  defaultColsNumber={79}
			  searchText="저장"
			  resetText="다시 덮다"
			>
			  <ProFormDigit
				name="register_reward"
				label="가입 보너스"
				tooltip="신규 사용자 등록 시 보너스 포인트"
				min={0}
				max={100000}
			  />
			  <ProFormDigit
				name="signin_reward"
				label="로그인 보상"
				tooltip="일일 로그인에 대한 보너스 포인트 수"
				min={0}
				max={100000}
			  />
			  <ProFormDigit
				name="invite_reward"
				label="초대 보상"
				tooltip="등록하도록 초대된 각 신규 사용자에 대한 보너스 포인트"
				min={0}
				max={100000}
			  />
			  <ProFormDigit
				name="cashback_ratio"
				label="소비수수료"
				tooltip="하위 소비에 대한 수수료 비율"
				min={0}
				max={100000}
			  />
			</QueryFilter>
		  </div>
		  <div className={styles.config_form}>
			<h3>보유된 역사적 기록의 수</h3>
			<QueryFilter
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={aiCarryCountForm}
			  onFinish={onSave}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			  size="large"
			  collapsed={false}
			  defaultCollapsed={false}
			  requiredMark={false}
			  defaultColsNumber={79}
			  searchText="저장"
			  resetText="다시 덮다"
			>
			  <ProFormDigit
				name="ai3_carry_count"
				label="GPT3"
				tooltip="대화 컨텍스트는 대화 수를 전달합니다."
				min={1}
				max={100000}
			  />
			  <ProFormDigit
				name="ai4_carry_count"
				label="GPT4"
				tooltip="대화 컨텍스트는 대화 수를 전달합니다."
				min={1}
				max={100000}
			  />
			</QueryFilter>
		  </div>
		  <div className={styles.config_form}>
			<h3>대화점 감점비율</h3>
			<p>
			1포인트가 토큰 수와 동일한 수를 설정합니다. 예를 들어 1포인트 = 50토큰이면 단일 세션에서 100토큰을 소비하면 2포인트가 차감됩니다.

			</p>
			<QueryFilter
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={aiRatioForm}
			  onFinish={onSave}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			  size="large"
			  collapsed={false}
			  defaultCollapsed={false}
			  requiredMark={false}
			  defaultColsNumber={79}
			  searchText="저장"
			  resetText="다시 덮다"
			>
			  <ProFormDigit
				name="ai3_ratio"
				label="GPT3"
				tooltip="1포인트당 토큰은 몇 개인가요?"
				min={0}
				max={100000}
			  />
			  <ProFormDigit
				name="ai4_ratio"
				label="GPT4"
				tooltip="1포인트당 토큰은 몇 개인가요?"
				min={0}
				max={100000}
			  />
			</QueryFilter>
		  </div>
		  <div className={styles.config_form}>
			<h3>페인팅 포인트 차감 설정</h3>
			<p>
			그림 과금 규칙은 초당 몇 개의 포인트가 소모되는지입니다. 예를 들어 10으로 설정하고 512x512 그림을 생성하는 데 2초가 걸린다면 20점이 차감됩니다!
			</p>
			<QueryFilter
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={drawPriceForm}
			  onFinish={onSave}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			  size="large"
			  collapsed={false}
			  defaultCollapsed={false}
			  requiredMark={false}
			  defaultColsNumber={79}
			  searchText="저장"
			  resetText="다시 덮다"
			>
			  <ProFormDigit
				name="draw_price"
				label="초당 공제"
				tooltip="초당 차감되는 포인트"
				min={0}
				max={100000}
			  />
			</QueryFilter>
		  </div>
		</Space>
	  )
	}

	function ReviewProhibitedWordsSettings() {
	  return (
		<Space
		  direction="vertical"
		  style={{
			width: '100%'
		  }}
		>
		  <div className={styles.config_form}>
			<h3>文本审核</h3>
			<p>
			  开通文本审核网址：
			  <a href="https://www.kaifain.com/s/6d23ad5feb78" target="_blank" rel="noreferrer">
				https://www.kaifain.com/s/6d23ad5feb78
			  </a>
			</p>
			<p>如果配置了KEY则会优先使用当前进行审核文本内容</p>
			<QueryFilter
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={tuputechKeyForm}
			  onFinish={async (values: any) => {
				putAdminConfig(values).then((res) => {
				  if (res.code) {
					message.error('保存失败')
					return
				  }
				  message.success('保存成功')
				  onGetConfig()
				})
			  }}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			  labelWidth="auto"
			  span={12}
			  size="large"
			  collapsed={false}
			  defaultCollapsed={false}
			  requiredMark={false}
			  defaultColsNumber={79}
			  searchText="保存"
			  resetText="恢复"
			>
			  <ProFormText width="xl" name="tuputech_key" />
			</QueryFilter>
		  </div>
		  <div className={styles.config_form}>
			<h3>本地违禁词</h3>
			<p style={{ marginBottom: 12 }}>请以英文状态下的逗号(,)分隔违禁词</p>
			<ProForm
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={prohibitedWordsForm}
			  size="large"
			  initialValues={{}}
			  isKeyPressSubmit={false}
			  submitter={{
				searchConfig: {
				  submitText: '保存',
				  resetText: '恢复'
				}
			  }}
			  onFinish={onSave}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			>
			  <ProFormTextArea
				name="prohibited_words"
				fieldProps={{
				  autoSize: {
					minRows: 2,
					maxRows: 12
				  }
				}}
			  />
			</ProForm>
		  </div>
		</Space>
	  )
	}

	function SmsSettings() {
	  return (
		<Space
		  direction="vertical"
		  style={{
			width: '100%'
		  }}
		>
		  <div className={styles.config_form}>
			<h3>短信设置</h3>
			<ProForm
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={smsForm}
			  size="large"
			  initialValues={{}}
			  isKeyPressSubmit={false}
			  submitter={{
				searchConfig: {
				  submitText: '保存',
				  resetText: '恢复'
				}
			  }}
			  onFinish={(vales) => {
				return onSave({
				  sms: JSON.stringify(vales)
				})
			  }}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			>
			  <ProForm.Group>
				<ProFormText
				  width="xl"
				  name="user"
				  label="用户名"
				  rules={[{ required: true, message: '请输入短信服务商的用户名!' }]}
				/>
				<ProFormText
				  width="xl"
				  name="password"
				  label="API Key"
				  rules={[{ required: true, message: '请输入API Key!' }]}
				/>
				<ProFormText
				  width="xl"
				  name="sign"
				  label="短信签名"
				  rules={[{ required: true, message: '请输入短信签名!' }]}
				/>
				<ProFormTextArea
				  width="xl"
				  name="template"
				  fieldProps={{
					autoSize: {
					  minRows: 2,
					  maxRows: 2
					}
				  }}
				  label="SMS 템플릿"
				  rules={[{ required: true, message: 'SMS 템플릿을 입력하세요.!' }]}
				/>
				<Space direction="vertical" size="small">
				  <p>
					1. 케이스 템플릿:
					{
					  '귀하의 인증 코드는 다음과 같습니다:{code}, 유효기간{time}분, 공개하지 마십시오. 직접 수행하지 않은 경우 이 메시지를 무시하십시오. 감사해요!'
					}
				  </p>
				  <p>2. 자동으로 교체됩니다 code，time，템플릿을 직접 맞춤설정하는 경우 이 규칙을 준수하세요.。</p>
				  <p>
					3.
					최종: [Ai Home] 귀하의 인증코드는 123456이며, 10분간 유효합니다. 공개하지 마세요. 직접 수행하지 않은 경우 이 메시지를 무시하십시오. 감사해요
				  </p>
				  <p
					style={{
					  marginBottom: 20
					}}
				  >
					4. SMS 서비스 제공업체는:{' '}
					<a href="https://www.smsbao.com" target="_blank" rel="noreferrer">
					【SMS 보물】
					</a>
				  </p>
				</Space>
			  </ProForm.Group>
			</ProForm>
		  </div>
		</Space>
	  )
	}

	function EmailSettings() {
	  return (
		<Space
		  direction="vertical"
		  style={{
			width: '100%'
		  }}
		>
		  <div className={styles.config_form}>
			<h3>이메일 설정</h3>
			<ProForm
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={emailForm}
			  size="large"
			  initialValues={{}}
			  isKeyPressSubmit={false}
			  submitter={{
				searchConfig: {
				  submitText: '저장',
				  resetText: '恢复'
				}
			  }}
			  onFinish={(vales) => {
				return onSave({
				  email: JSON.stringify(vales)
				})
			  }}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			>
			  <ProForm.Group>
				<ProFormText
				  width="xl"
				  name="host"
				  label="SMTP服务器"
				  rules={[{ required: true, message: '请输入SMTP服务器!' }]}
				/>
				<ProFormText
				  width="xl"
				  name="port"
				  label="SMTP端口"
				  rules={[{ required: true, message: '请输入SMTP端口!' }]}
				/>
				<ProFormText
				  width="xl"
				  name="user"
				  label="邮箱账号"
				  rules={[{ required: true, message: '请输入短信签名!' }]}
				/>
				<ProFormText
				  width="xl"
				  name="pass"
				  label="邮箱密码"
				  rules={[{ required: true, message: '请输入短信签名!' }]}
				/>
				<ProFormText width="xl" name="from_title" label="发件用户名称" />
				<ProFormText width="xl" name="subject" label="邮件标题" />
			  </ProForm.Group>
			</ProForm>
		  </div>
		</Space>
	  )
	}

	function CloudStorageSettings() {
	  return (
		<Space
		  direction="vertical"
		  style={{
			width: '100%'
		  }}
		>
		  <div className={styles.config_form}>
			<h3>图片存储配置</h3>
			<ProForm
			  autoFocus={false}
			  autoFocusFirstInput={false}
			  form={cloudStorageForm}
			  size="large"
			  initialValues={{
				type: 'local'
			  }}
			  isKeyPressSubmit={false}
			  submitter={{
				searchConfig: {
				  submitText: '保存',
				  resetText: '恢复'
				}
			  }}
			  onFinish={(vales) => {
				return onSave({
				  cloud_storage: JSON.stringify(vales)
				})
			  }}
			  onReset={() => {
				onRewardFormSet(configs)
			  }}
			>
			  <ProFormSelect
				name="type"
				label="存储策略"
				valueEnum={{
				  local: '本地存储',
				  tencent: '腾讯云存储',
				  alioss: '阿里云存储',
				  upyun: '又拍云存储',
				  lsky: 'Lsky图床'
				}}
				placeholder="请选择存储策略！"
				rules={[{ required: true, message: '请选择存储策略！' }]}
			  />

			  <ProFormDependency name={['type']}>
				{({ type }) => {
				  return cloudStorageFormItems[type]
				}}
			  </ProFormDependency>
			</ProForm>
		  </div>
		</Space>
	  )
	}

	return (
	  <div className={styles.config}>
		<Tabs
		  defaultActiveKey="WebSiteSettings"
		  // centered
		  // type="card"
		  items={[
			{
			  label: '网站设置',
			  key: 'WebSiteSettings',
			  children: <WebSiteSettings />
			},
			{
			  label: '奖励设置',
			  key: 'RewardSettings',
			  children: <RewardSettings />
			},
			{
			  label: '页面说明设置',
			  key: 'IntroduceSettings',
			  children: <IntroduceSettings />
			},
			{
			  label: '违禁词审核设置',
			  key: 'ReviewProhibitedWordsSettings',
			  children: <ReviewProhibitedWordsSettings />
			},
			{
			  label: '短信配置',
			  key: 'SmsSettings',
			  children: <SmsSettings />
			},
			{
			  label: '邮件配置',
			  key: 'EmailSettings',
			  children: <EmailSettings />
			},
			{
			  label: '存储配置',
			  key: 'CloudStorageSettings',
			  children: <CloudStorageSettings />
			}
		  ]}
		/>
	  </div>
	)
  }
  export default ConfigPage
