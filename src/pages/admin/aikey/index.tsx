import {
  getAdminAikeys,
  delAdminAikey,
  putAdminAikey,
  postAdminAikey,
  postAdminAikeyCheck
} from '@/request/adminApi'
import { AikeyInfo } from '@/types/admin'
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormDependency,
  ProFormGroup,
  ProFormRadio,
  ProFormSegmented,
  ProFormSelect,
  ProFormText
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Button, Form, Progress, Space, Tag, message } from 'antd'
import { useRef, useState } from 'react'

const getModels = (type: string) => {
  if (type === 'stability') {
    return [
      {
        label: 'stable-diffusion-v1-5',
        value: 'stable-diffusion-v1-5'
      }
    ]
  }
  return [
    {
      label: 'OpenAI(dall-e)그림',
      value: 'dall-e'
    },
    {
      label: 'gpt-3.5-turbo',
      value: 'gpt-3.5-turbo'
    },
    {
      label: 'gpt-3.5-turbo-16k',
      value: 'gpt-3.5-turbo-16k'
    },
    {
      label: 'gpt-3.5-turbo-0613',
      value: 'gpt-3.5-turbo-0613'
    },
    {
      label: 'gpt-3.5-turbo-16k-0613',
      value: 'gpt-3.5-turbo-16k-0613'
    },
    {
      label: 'text-davinci-003',
      value: 'text-davinci-003'
    },
    {
      label: 'code-davinci-002',
      value: 'code-davinci-002'
    },
    {
      label: 'gpt-4',
      value: 'gpt-4'
    },
    {
      label: 'gpt-4-0613',
      value: 'gpt-4-0613'
    },
    {
      label: 'gpt-4-32k',
      value: 'gpt-4-32k'
    },
    {
      label: 'gpt-4-32k-0613',
      value: 'gpt-4-32k-0613'
    }
  ]
}

function AikeyPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<
    AikeyInfo & {
      models: Array<string>
    }
  >()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: AikeyInfo | undefined
  }>({
    open: false,
    info: undefined
  })
  const columns: ProColumns<AikeyInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180,
      fixed: 'left'
    },
    {
      title: 'KEY',
      dataIndex: 'key',
      width: 200
    },
    {
      title: 'HOST',
      dataIndex: 'host',
      render: (_, data) => {
        return (
          <a href={data.host} target="_blank" rel="noreferrer">
            {data.host}
          </a>
        )
      }
    },
    {
      title: '사용 가능한 모델',
      dataIndex: 'models',
      width: 200,
      render: (_, data) => {
        if (!data.models) return '-'
        const modelTag = data.models.split(',').map((model) => {
          return <Tag key={model}>{model}</Tag>
        })
        return <>{modelTag}</>
      }
    },
    {
      title: 'AI 유형',
      dataIndex: 'type',
      render: (_, data) => <Tag>{data.type}</Tag>
    },
    {
      title: '주목',
      dataIndex: 'remarks'
    },
    {
      title: '상태',
      dataIndex: 'status',
      render: (_, data) => (
        <Space direction="vertical">
          <Tag color={data.status ? 'green' : 'red'}>{data.status ? '정상' : '이상'}</Tag>
          <Tag color={data.check ? 'green' : 'red'}>
            {data.check ? '이용 가능 여부 확인' : '가용성 확인 없음'}
          </Tag>
        </Space>
      )
    },
    {
      title: '몫',
      dataIndex: 'limit',
      width: 160,
      render: (_, data) => {
        return (
          <div>
            <p>일시금:{data.limit.toFixed(2)}</p>
            <p>사용된:{data.usage}</p>
            <p>남은 금액:{(data.limit - data.usage).toFixed(2)}</p>
            <Progress
              percent={Number(((data.usage / data.limit) * 100).toFixed(2))}
              format={() => ''}
              size="small"
            />
          </div>
        )
      }
    },
    {
      title: '생성 시간',
      dataIndex: 'create_time'
    },
    {
      title: '업데이트 시간',
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
          편집하다
        </Button>,
        <Button
          key="del"
          type="text"
          danger
          onClick={() => {
            delAdminAikey({
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

  function getUniqueHosts(arr: Array<AikeyInfo>) {
    const uniqueHosts = new Set<string>()
    uniqueHosts.add('https://api.openai.com')
    uniqueHosts.add('https://openai.api2d.net')
    uniqueHosts.add('https://api.openai-proxy.com')
    uniqueHosts.add('https://api1.openai-proxy.com')
    uniqueHosts.add('https://api2.openai-proxy.com')
    arr.forEach((obj) => uniqueHosts.add(obj.host))
    return Array.from(uniqueHosts).map((host) => ({ label: host, value: host }))
  }
  const [inputHost, setInputHost] = useState<Array<{ label: string; value: string }>>([])
  const [hostOptions, setHostOptions] = useState<Array<{ label: string; value: string }>>([])

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
          const res = await getAdminAikeys({
            page: params.current || 1,
            page_size: params.pageSize || 10
          })

          const hosts = getUniqueHosts(res.data.rows)
          setHostOptions([...hosts])

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
                postAdminAikeyCheck({ all: true }).then(() => {
                  message.success('새로고침을 성공적으로 제출했습니다. 나중에 다시 확인하세요.')
                })
              }}
            >
              비동기 새로 고침 할당량
            </Button>,
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
              새로운 Aikey
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />
      <ModalForm<
        AikeyInfo & {
          models: Array<string>
        }
      >
        title="Token정보"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1,
          type: 'openai',
		  check: 0
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
          const models = values.models.join(',')
          if (edidInfoModal.info?.id) {
            const res = await putAdminAikey({
              ...values,
              models,
              id: edidInfoModal.info?.id
            })
            if (res.code) {
              message.error('수정 실패')
              return false
            }
            tableActionRef.current?.reload?.()
          } else {
            const res = await postAdminAikey({
              ...values,
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
        <ProFormGroup size="large">
          <ProFormSegmented
            label="AI유형"
            name="type"
            fieldProps={{
              options: [],
              size: 'large',
              onChange: (value) => {
                if (value === 'stability') {
                  form.setFieldsValue({
                    host: 'https://api.stability.ai',
                    models: []
                  })
                } else {
                  form.setFieldsValue({
                    host: '',
                    models: []
                  })
                }
              }
            }}
            request={async () => [
              {
                label: 'OpenAI',
                value: 'openai'
              },
              {
                label: 'StableDiffusion',
                value: 'stability'
              }
            ]}
            rules={[{ required: true, message: 'AI유형' }]}
          />
          <ProFormRadio.Group
            name="status"
            label="상태"
            radioType="button"
            options={[
              {
                label: '선반에서 제거됨',
                value: 0
              },
              {
                label: '선반에',
                value: 1
              }
            ]}
          />
          <ProFormRadio.Group
            name="check"
            label="이용 가능 여부 확인"
            radioType="button"
            options={[
              {
                label: '확인하지 마세요  ',
                value: 0
              },
              {
                label: '조사하다',
                value: 1
              }
            ]}
          />
        </ProFormGroup>
        <ProFormDependency name={['type']}>
          {({ type }) => {
            return (
              <ProFormSelect.SearchSelect
                name="host"
                label="API 주소 또는 프록시 주소"
                placeholder="API 주소를 선택하거나 입력하세요."
                mode="single"
                disabled={type === 'stability'}
                fieldProps={{
                  labelInValue: false,
                  onSearch: (value) => {
                    if (!value) return
                    setInputHost([{ label: value, value }])
                  },
                  onChange: (value: string) => {
                    if (!value) return
                    setHostOptions((hosts) => {
                      setInputHost([])
                      const is = hosts.filter((item) => item.value === value)
                      if (is.length > 0) return [...hosts]
                      return [{ label: value, value }, ...hosts]
                    })
                  }
                }}
                options={[...inputHost, ...hostOptions]}
                rules={[
                  {
                    required: true,
                    message: '올바른 해당 호스트를 입력하세요.',
                    pattern: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*[^\/]$/i
                  }
                ]}
              />
            )
          }}
        </ProFormDependency>
        <ProFormText
          name="key"
          label="Key"
          placeholder="Key"
          rules={[{ required: true, message: 'Key 입력해주세요' }]}
        />
        <ProFormDependency name={['type']}>
          {({ type }) => {
            return (
              <ProFormSelect
                name="models"
                label="적용모델"
                options={getModels(type)}
                fieldProps={{
                  mode: 'multiple'
                }}
                placeholder="현재 토큰을 사용할 수 있는 AI 모델을 선택해주세요"
                rules={[
                  {
                    required: true,
                    message: '현재 토큰을 사용할 수 있는 AI 모델을 선택해주세요!'
                  }
                ]}
              />
            )
          }}
        </ProFormDependency>
		<ProFormText name="remarks" label="주목" placeholder="주목" />
      </ModalForm>
    </div>
  )
}

export default AikeyPage
