import { Button, Form, Tag, message } from 'antd'
import { useRef, useState } from 'react'
import {
  delAdminDialog,
  getAdminDialogs,
  postAdminDialog,
  putAdminDialog
} from '@/request/adminApi'
import { DialogInfo } from '@/types/admin'
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormDigit,
  ProFormGroup,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'

function DialogPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<
    DialogInfo & {
      models: Array<string>
    }
  >()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: DialogInfo | undefined
  }>({
    open: false,
    info: undefined
  })

  const columns: ProColumns<DialogInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: '질문',
      width: 180,
      dataIndex: 'issue'
    },
    {
      title: '답변',
      dataIndex: 'answer'
    },
    {
      title: '적용모델',
      width: 200,
      dataIndex: 'models',
      render: (_, data) => {
        if (!data.models) return '-'
        const modelTag = data.models.split(',').map((model) => {
          return <Tag key={model}>{model}</Tag>
        })
        return <>{modelTag}</>
      }
    },
    {
      title: '지연 시간',
      width: 120,
      dataIndex: 'delay',
      render: (_, data) => (
        <Tag>{`무작위 0-${data.delay}밀리초`}</Tag>
      )
    },
    {
      title: '상태 값',
      width: 100,
      dataIndex: 'status',
      render: (_, data) => (
        <Tag color={data.status ? 'green' : 'red'}>{data.status ? '정상' : '숨다'}</Tag>
      )
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
      title: '작동하다',
      width: 160,
      valueType: 'option',
      fixed: 'right',
      render: (_, data) => [
        <Button
          key="edit"
          type="link"
          onClick={() => {
            setEditInfoModal(() => {
              const models = data.models ? data.models.split(',') : []
              form?.setFieldsValue({
                ...data,
                models
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
            delAdminDialog({
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
          const res = await getAdminDialogs({
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
                    info: undefined
                  }
                })
              }}
            >
            새 대화 추가
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />
      <ModalForm<
        DialogInfo & {
          models: Array<string>
        }
      >
        title="제품정보"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1,
          level: 1,
          sort: 1,
          delay: 100
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
          const models = data.models.join(',')
          if (edidInfoModal.info?.id) {
            const res = await putAdminDialog({
              ...data,
              models,
              id: edidInfoModal.info?.id
            })
            if (res.code) {
              message.error('수정 실패')
              return false
            }
            tableActionRef.current?.reload?.()
          } else {
            const res = await postAdminDialog({
              ...data,
              models
            })
            if (res.code) {
              message.error('추가하지 못했습니다.')
              return false
            }
            tableActionRef.current?.reloadAndRest?.()
            message.success('제출 성공')
          }
          return true
        }}
        size="large"
        modalProps={{
          cancelText: '취소',
          okText: '제출하다'
        }}
      >
        <ProFormGroup>
          <ProFormText
            width="lg"
            name="issue"
            label="질문"
            placeholder="질문"
            rules={[{ required: true, message: '대화 질문을 입력하세요' }]}
          />
        </ProFormGroup>
        <ProFormTextArea
          name="answer"
          label="답변"
          placeholder="질문에 대한 정답을 입력하세요."
          fieldProps={{
            autoSize: {
              minRows: 2,
              maxRows: 6
            }
          }}
          rules={[{ required: true, message: '请输入答案' }]}
        />
        <ProFormGroup>
          <ProFormDigit
            label="최대 지연(밀리초)"
            name="delay"
            min={0}
            max={9999999}
            rules={[{ required: true }]}
          />
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
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormSelect
            name="models"
            label="적용모델"
            options={[
              {
                label: '모든 GPT4 유형',
                value: 'gpt-4'
              },
              {
                label: '모든 GPT3 유형',
                value: 'gpt-3'
              }
            ]}
            fieldProps={{
              mode: 'multiple'
            }}
            placeholder="현재 대화에 사용할 수 있는 AI 모델을 선택하세요."
            rules={[
              {
                required: true,
                message: '현재 대화에 사용할 수 있는 AI 모델을 선택하세요.!'
              }
            ]}
          />
        </ProFormGroup>

      </ModalForm>
    </div>
  )
}

export default DialogPage
