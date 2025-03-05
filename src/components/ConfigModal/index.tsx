import { useLayoutEffect } from 'react'
import { ModalForm, ProFormSelect, ProFormSlider, ProFormText } from '@ant-design/pro-components'
import { Form } from 'antd'
import FormItemCard from '../FormItemCard'
import { ChatGptConfig } from '@/types'

type Props = {
  open: boolean
  onCancel: () => void
  onChange: (config: ChatGptConfig) => void
  models: Array<{
    label: string
    value: string
  }>
  data: ChatGptConfig
}

function ConfigModal(props: Props) {
  const [chatGptConfigform] = Form.useForm<ChatGptConfig>()
  const onCancel = () => {
    props.onCancel()
    chatGptConfigform.resetFields()
  }

  useLayoutEffect(() => {
    if (props.open && chatGptConfigform) {
      chatGptConfigform.setFieldsValue({
        ...props.data
      })
    }
  }, [props.open, chatGptConfigform])

  return (
    <ModalForm<ChatGptConfig>
      title="Chat 구성"
      open={props.open}
      form={chatGptConfigform}
      onOpenChange={(visible) => {
        if (visible) return
        onCancel()
      }}
      onFinish={async (values) => {
        props.onChange(values)
        return true
      }}
      size="middle"
      width={600}
      modalProps={{
        cancelText: '취소',
        okText: '확인',
        maskClosable: false,
        destroyOnClose: true
      }}
    >
      <FormItemCard title="GPT모델" describe="OpenAI에 제공된 모델 구성에 따르면">
        <ProFormSelect
          name="model"
          style={{ minWidth: '180px' }}
          options={[...props.models]}
          fieldProps={{
            clearIcon: false
          }}
        />
      </FormItemCard>
      {/* {(
        <>
          <FormItemCard title="프록시 API" describe="프록시 주소는 타사 프록시(ChatGpt)일 수 있습니다.">
            <ProFormText
              allowClear={false}
              name="api"
              placeholder="프록시 주소를 입력하세요."
              rules={[{ required: true, message: '프록시 API 주소를 입력하세요.' }]}
            />
          </FormItemCard>
          <FormItemCard title="API Key" describe="자체 OpenApiKey 또는 기타 프록시를 사용하세요.。">
            <ProFormText allowClear={false} name="api_key" placeholder="키 키를 입력해주세요" />
          </FormItemCard>
        </>
      )} */}
      {/* <FormItemCard title="전달된 기록 메시지 수" describe="각 요청에 의해 전달된 기록 메시지 수">
        <ProFormSlider name="limit_message" max={10} min={0} step={1} />
      </FormItemCard> */}
      <FormItemCard title="무작위성" describe="값이 클수록 응답이 더 무작위화됩니다. 1보다 큰 값을 사용하면 문자가 깨질 수 있습니다.">
        <ProFormSlider name="temperature" max={2} min={0} step={0.1} />
      </FormItemCard>
      <FormItemCard title="주제의 신선함" describe="값이 클수록 새로운 주제로 확장될 가능성이 높아집니다.">
        <ProFormSlider name="presence_penalty" max={2} min={-2} step={0.1} />
      </FormItemCard>
      <FormItemCard title="반복성" describe="텍스트에서 단어와 구문이 반복되는 빈도, 빈도가 높을수록 텍스트가 덜 매끄럽게 됩니다.">
        <ProFormSlider name="frequency_penalty" max={2} min={-2} step={0.1} />
      </FormItemCard>
      <FormItemCard title="단일 응답 제한" describe="단일 상호 작용에 사용되는 최대 토큰 수">
        <ProFormSlider name="max_tokens" max={3666} min={100} step={1} />
      </FormItemCard>
    </ModalForm>
  )
}

export default ConfigModal
