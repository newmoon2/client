import { personaAsync } from '@/store/async'
import {
  Avatar,
  Badge,
  Button,
  Empty,
  Form,
  Input,
  Modal,
  Pagination,
  Popover,
  Space,
  Tag,
  message
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import styles from './index.module.less'
import personaStore from '@/store/persona/slice'
import { EyeOutlined, PlusCircleOutlined, QuestionOutlined } from '@ant-design/icons'
import { PersonaInfo } from '@/types'
import {
  ModalForm,
  ProFormDependency,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
  ProFormText
} from '@ant-design/pro-components'
import { postPersona } from '@/request/api'
import { userStore } from '@/store'
import { getEmailPre } from '@/utils'
import AppCard from '../appCard'

type Props = {
  open: boolean
  onCreateChat: (item: PersonaInfo) => void
  onCancel: () => void
}

function PersonaModal(props: Props) {
  const { personas } = personaStore()
  const { token } = userStore()
  const [search, setSearch] = useState('')

  const [form] = Form.useForm<PersonaInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: PersonaInfo | undefined
    disabled: boolean
  }>({
    open: false,
    info: undefined,
    disabled: false
  })

  useEffect(() => {
    personaAsync.fetchPersonas()
  }, [])

  const countPersonas = useMemo(() => {
    if (search) {
      const list = personas.filter((item) => item.title.includes(search))
      return [...list]
    }
    return [...personas]
  }, [personas, search])

  return (
    <div className={styles.persona}>
      <Modal title="AI역할" open={props.open} width={700} footer={null} onCancel={props.onCancel}>
        <Space size="small" direction="vertical" style={{ width: '100%' }}>
          <div className={styles.persona_operate}>
            <p>{personas.length}기본 역할 정의 정보</p>
            <Space wrap>
              <Button
                type="primary"
                disabled={!token}
                onClick={() => {
                  setEditInfoModal({
                    info: {
                      emoji: '1f970'
                    } as any,
                    open: true,
                    disabled: false
                  })
                }}
              >
                添加
              </Button>
              <Input
                placeholder="키워드 검색"
                onChange={(e) => {
                  setSearch(e.target.value)
                }}
              />
            </Space>
          </div>
          <div className={styles.persona_list}>
            {countPersonas.map((item) => {
              return (
                <AppCard
                  key={item.id}
                  {...item}
                  userInfo={item.user}
				  message={`포함하다 ${JSON.parse(item.context).length} 기본 대화`}
                  buttons={[
                    <p
                      key="duihua"
                      onClick={() => {
                        props.onCreateChat?.(item)
                      }}
                    >
                      <PlusCircleOutlined />
                      <span>대화</span>
                    </p>,
                    <p
                      key="chakan"
                      onClick={() => {
                        setEditInfoModal(() => {
                          form.setFieldsValue({
                            ...item,
                            context: JSON.parse(item.context)
                          })
                          return {
                            open: true,
                            info: item,
                            disabled: true
                          }
                        })
                      }}
                    >
                      <EyeOutlined />
                      <span>확인하다</span>
                    </p>
                  ]}
                />
              )
            })}
            <div className={styles.persona_list_empty}>
              {countPersonas.length <= 0 && (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="아직 데이터가 없습니다" />
              )}
            </div>
          </div>
        </Space>
      </Modal>
      <ModalForm<PersonaInfo>
        title="역할 정보"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1
        }}
        onOpenChange={(visible) => {
          if (!visible) {
            form.resetFields()
          }
          setEditInfoModal((info) => {
            return {
              ...info,
              open: visible
            }
          })
        }}
        onFinish={async (values) => {
          if (edidInfoModal.disabled) {
            message.warning('작동하지 않음')
            return false
          }
          const data = { ...values }
          if (!data.context || data.context.length <= 0) {
            message.warning('대화 데이터를 입력해주세요')
            return
          }
          const context = JSON.stringify(data.context)
          const res = await postPersona({
            ...data,
            context
          })
          if (res.code) {
            message.error('제출 실패')
            return false
          }
          message.success('제출이 완료되었습니다. 검토가 완료될 때까지 기다려 주시기 바랍니다.')
          return true
        }}
        size="large"
        modalProps={{
          cancelText: '취소',
          okText: '검토를 위해 제출'
        }}
      >
        <ProFormList
          name="context"
          creatorButtonProps={{
            creatorButtonText: '대사 한줄 추가'
          }}
        >
          <ProFormGroup key="group">
            <ProFormSelect
              label="역할"
              name="role"
              width="sm"
              valueEnum={{
                system: 'system',
                user: 'user',
                assistant: 'assistant'
              }}
              rules={[{ required: true }]}
            />
            <ProFormText width="lg" rules={[{ required: true }]} name="content" label="콘텐츠" />
          </ProFormGroup>
        </ProFormList>
        <ProFormGroup>
          <ProFormDependency name={['avatar']}>
            {({ avatar }) => {
              return (
                <div className={styles.emojiForm}>
                  <div className={styles.emojiForm_label}>
                    <label>화신</label>
                  </div>
                  <div className={styles.emojiForm_card}>
                    {avatar ? (
                      <img
                        src={avatar}
                        style={{
                          width: '100%'
                        }}
                      />
                    ) : (
                      <QuestionOutlined />
                    )}
                  </div>
                </div>
              )
            }}
          </ProFormDependency>
          <ProFormText
            width="md"
            name="avatar"
            label="아바타 주소"
            placeholder="아바타 링크 주소를 입력해주세요"
            rules={[{ required: true, message: '아바타 링크 주소를 입력해주세요' }]}
          />
          <ProFormText
            name="title"
            label="标题"
            placeholder="标题"
            rules={[{ required: true, message: '역할 제목을 입력하세요.' }]}
          />
        </ProFormGroup>
        <ProFormText name="description" label="설명하다" placeholder="설명하다" />
      </ModalForm>
    </div>
  )
}

export default PersonaModal
