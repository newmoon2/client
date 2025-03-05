import {
  getAdminPlugins,
  delAdminPlugin,
  postAdminPlugin,
  putAdminPlugin
} from '@/request/adminApi'
import { PluginInfo } from '@/types/admin'
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormDependency,
  ProFormDigit,
  ProFormGroup,
  ProFormList,
  ProFormRadio,
  ProFormText
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Avatar, Button, Form, Space, Tag, Tooltip, message } from 'antd'
import { useRef, useState } from 'react'
import FormCard from '../components/FormCard'
import { QuestionOutlined } from '@ant-design/icons'
import CodeEditor from '@/components/CodeEditor'

const functionJson = `{
	"name": "fun_name",
	"description": "fun_name description",
	"parameters": {
		"type": "object",
		"properties": {
			"ip": {
				"type": "string",
				"description": "ip address, eg:1.1.1.1"
			}
		},
		"required": [
			"ip"
		]
	}
}
`

const functionScript = `function fun_name(params) {
	const { ip } = params;
	console.log(ip);
}
`

function PluginPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<PluginInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: PluginInfo | undefined
  }>({
    open: false,
    info: undefined
  })

  const columns: ProColumns<PluginInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180,
      render: (_, data) => <a>{data.id}</a>
    },
    {
      title: 'name',
      dataIndex: 'name',
      render: (_, data) => {
        return (
          <Space>
            <img
              src={data.avatar}
              style={{
                width: 32
              }}
            />
            <span>{data.name}</span>
          </Space>
        )
      }
    },
    {
      title: '설명',
      dataIndex: 'description'
    },
    {
      title: '상태',
      dataIndex: 'status',
      render: (_, data) => {
        if (data.status === 4) {
          return <Tag color="orange">검토를 기다리는 중</Tag>
        }
        return <Tag color={data.status ? 'green' : 'red'}>{data.status ? '온라인' : '오프라인'}</Tag>
      }
    },
    {
      title: '사용자id',
      dataIndex: 'user_id',
      render: (_, data) => <a>{data.user?.account}</a>
    },
    {
      title: '생성 시간',
      dataIndex: 'create_time'
    },
    {
      title: '수정시간',
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
              form?.setFieldsValue({
                ...data,
                variables: data.variables ? JSON.parse(data.variables) : []
              })
              return {
                open: true,
                info: data
              }
            })
          }}
        >
          수정
        </Button>,
        <Button
          key="del"
          type="text"
          danger
          onClick={() => {
            delAdminPlugin({
              id: data.id
            }).then((res) => {
              if (res.code) return
              message.success('성공적으로 삭제되었습니다')
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
          //양식 검색 항목은 params에서 전달되어 백엔드 인터페이스로 전달됩니다.
          const res = await getAdminPlugins({
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
              새 플러그인 추가
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />
      <ModalForm<PluginInfo>
        title="플러그인 정보"
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
          if (!edidInfoModal.info?.script || !edidInfoModal.info?.function) {
            message.warning('필수 매개변수가 누락되었습니다.')
            return false
          }
          const data = {
            ...values,
            id: edidInfoModal.info?.id,
            script: edidInfoModal.info?.script,
            function: edidInfoModal.info?.function,
            variables: values.variables ? JSON.stringify(values.variables) : undefined
          }

          if (data?.id) {
            const res = await putAdminPlugin({
              ...data
            })
            if (res.code) {
              message.error('수정 실패')
              return false
            }
            tableActionRef.current?.reload?.()
          } else {
            const res = await postAdminPlugin(data)
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
          okText: '확인',
          style: {
            top: 10
          }
        }}
      >
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
            label="아바타 링크"
            placeholder="플러그인 아바타 링크"
            rules={[{ required: true, message: '플러그인 아바타 링크를 입력하세요' }]}
          />
          <ProFormText
            name="name"
            label="이름"
            placeholder="플러그인 이름"
            rules={[{ required: true, message: '플러그인 이름을 입력해주세요' }]}
          />
        </ProFormGroup>
        <ProFormText
          name="description"
          label="설명하다"
          placeholder="플러그인 설명"
          rules={[{ required: true, message: '플러그인 설명을 입력해주세요' }]}
        />
        <ProFormList
          name="variables"
          label="환경 변수"
          creatorButtonProps={{
            creatorButtonText: '환경 변수 추가'
          }}
        >
          <ProFormGroup key="group">
            <ProFormText name="label" label="변수 이름" rules={[{ required: true }]} />
            <ProFormText name="value" label="변수 값" rules={[{ required: true }]} />
          </ProFormGroup>
        </ProFormList>
        <FormCard title="플러그인 기능 설명">
          <CodeEditor
            value={edidInfoModal.info?.function}
            defaultValue={functionJson}
            placeholder="JSON 형식을 입력하세요."
            mode="json"
            onChange={(v) => {
              setEditInfoModal((modalInfo) => {
                const info = {
                  ...modalInfo.info,
                  function: v
                }
                return {
                  ...modalInfo,
                  info
                } as any
              })
            }}
          />
        </FormCard>
        <FormCard title="플러그인 기능 스크립트">
          <CodeEditor
            value={edidInfoModal.info?.script}
            defaultValue={functionScript}
            placeholder="자바스크립트 형식 코드를 입력하세요."
            mode="javascript"
            onChange={(v) => {
              setEditInfoModal((modalInfo) => {
                const info = {
                  ...modalInfo.info,
                  script: v
                }
                return {
                  ...modalInfo,
                  info
                } as any
              })
            }}
          />
        </FormCard>
        <ProFormGroup>
          <ProFormText name="user_id" label="사용자 ID" placeholder="플러그인 업로더의 ID" />
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
          />
        </ProFormGroup>
      </ModalForm>
    </div>
  )
}

export default PluginPage
