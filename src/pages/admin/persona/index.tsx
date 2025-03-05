import { Avatar, Button, Form, Popover, Tag, message } from 'antd'
import { useRef, useState } from 'react'
import {
  delAdminPersona,
  getAdminPersonas,
  postAdminPersona,
  putAdminPersona
} from '@/request/adminApi'
import { DialogInfo, PersonaInfo } from '@/types/admin'
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormDependency,
  ProFormDigit,
  ProFormGroup,
  ProFormList,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { QuestionOutlined } from '@ant-design/icons'
import FormCard from '../components/FormCard'

function PersonaPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<PersonaInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: PersonaInfo | undefined
  }>({
    open: false,
    info: undefined
  })

  const columns: ProColumns<PersonaInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: '아바타/제목',
      width: 180,
      dataIndex: 'title',
      render: (_, data) => {
        return (
          <a
            onClick={() => {
              setEditInfoModal(() => {
                form.setFieldsValue({
                  ...data,
                  context: JSON.parse(data.context)
                })
                return {
                  open: true,
                  info: data
                }
              })
            }}
            style={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {data.avatar && <Avatar size={24} src={data.avatar} />}
            <span>{data.title}</span>
          </a>
        )
      }
    },
    {
      title: '내장된 어휘',
      dataIndex: 'context',
      render: (_, data) => {
        if (!data.context) return <span>-</span>
        const context = JSON.parse(data.context)
        return (
          <a
            onClick={() => {
              setEditInfoModal(() => {
                form.setFieldsValue({
                  ...data,
                  context: JSON.parse(data.context)
                })
                return {
                  open: true,
                  info: data
                }
              })
            }}
          >
            포함하다<span style={{ color: 'red', fontWeight: 'bold' }}> {context.length} </span>
            기본 대화
          </a>
        )
      }
    },
    {
      title: '설명하다',
      dataIndex: 'description'
    },
    {
      title: '사용자',
      dataIndex: 'user_id',
      render: (_, data) => {
        if (!data.user_id) return '-'
        return <p>{data.user?.account}</p>
      }
    },
    {
      title: '상태 값',
      width: 100,
      dataIndex: 'status',
      render: (_, data) => {
        if (data.status === 4) {
          return <Tag color="orange">검토를 기다리는 중</Tag>
        }
        return <Tag color={data.status ? 'green' : 'red'}>{data.status ? '정상' : '숨김'}</Tag>
      }
    },
    {
      title: '생성 시간',
      width: 200,
      dataIndex: 'create_time'
    },
    {
      title: '수정 시간',
      width: 200,
      dataIndex: 'update_time'
    },
    {
      title: '작동',
      width: 160,
      valueType: 'option',
      fixed: 'right',
      render: (_, data) => [
        <Button
          key="edit"
          type="link"
          onClick={() => {
            setEditInfoModal(() => {
              form.setFieldsValue({
                ...data,
                context: JSON.parse(data.context)
              })
              return {
                open: true,
                info: data
              }
            })
          }}
        >
          편집
        </Button>,
        <Button
          key="del"
          type="text"
          danger
          onClick={() => {
            delAdminPersona({
              id: data.id
            }).then((res) => {
              if (res.code) return
              message.success(res.message)
              tableActionRef.current?.reload()
            })
          }}
        >
          삭제
        </Button>
      ]
    }
  ]

  return (
    <div>
      <ProTable
        actionRef={tableActionRef}
        columns={columns}
        scroll={{
          x: 1600
        }}
        request={async (params, sorter, filter) => {
          // 양식 검색 항목은 params에서 전달되어 백엔드 인터페이스로 전달됩니다.
          const res = await getAdminPersonas({
            page: params.current || 1,
            page_size: params.pageSize || 10
          })
          return Promise.resolve({
            data: res.data.rows,
            total: res.data.count,
            success: true
          })
        }}
        toolbar={{
          actions: [
            <Button
              key="primary"
              type="primary"
              size="small"
              onClick={() => {
                setEditInfoModal(() => {
                  return {
                    open: true,
                    info: {
                      emoji: '1f970'
                    } as any
                  }
                })
              }}
            >
              새 역할 추가
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />
      <ModalForm<PersonaInfo>
        title="역할 정보"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1,
          system: 0
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
          const data = { ...values }
          if (!data.context || data.context.length <= 0) {
            message.warning('대화 데이터를 입력해주세요')
            return
          }
          const context = JSON.stringify(data.context)
          if (edidInfoModal.info?.id) {
            const res = await putAdminPersona({
              ...data,
              context,
              id: edidInfoModal.info?.id
            })
            if (res.code) {
              message.error('수정 실패')
              return false
            }
          } else {
            const res = await postAdminPersona({
              ...data,
              context
            })
            if (res.code) {
              message.error('추가하지 못했습니다.')
              return false
            }
          }
          tableActionRef.current?.reloadAndRest?.()
          message.success('제출 성공')
          return true
        }}
        size="large"
        modalProps={{
          cancelText: '취소',
          okText: '제출'
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
                <FormCard title="avatar" type="avatar">
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
                </FormCard>
              )
            }}
          </ProFormDependency>
          <ProFormText
            width="md"
            name="avatar"
            label="avatar"
            placeholder="아바타 링크"
            rules={[{ required: true, message: '아바타 링크를 입력해주세요' }]}
          />
          <ProFormText
            name="title"
            label="제목"
            placeholder="제목"
            rules={[{ required: true, message: '역할 제목을 입력하세요.' }]}
          />
        </ProFormGroup>
        <ProFormText name="description" label="설명" placeholder="설명" />
        <ProFormGroup>
          <ProFormRadio.Group
            name="status"
            label="상태"
            radioType="button"
            options={[
              {
                label: '오프라인',
                value: 0
              },
              {
                label: '온라인',
                value: 1
              },
              {
                label: '검토중',
                value: 4
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormRadio.Group
            name="system"
            label="system"
            radioType="button"
            options={[
              {
                label: '사용자',
                value: 0
              },
              {
                label: '시스템 수준',
                value: 1
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormText width="md" name="user_id" label="사용자 ID" placeholder="사용자 ID" />
        </ProFormGroup>
      </ModalForm>
    </div>
  )
}

export default PersonaPage
