import {
  getAdminPayment,
  delAdminPayment,
  addAdminPayment,
  putAdminPayment
} from '@/request/adminApi'
import { AlipayInfo, HpjPayInfo, JsPayInfo, PaymentInfo, YipayInfo } from '@/types/admin'
import {
  ActionType,
  BetaSchemaForm,
  ModalForm,
  ProColumns,
  ProFormCheckbox,
  ProFormColumnsType,
  ProFormDependency,
  ProFormGroup,
  ProFormSegmented,
  ProFormText
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Button, Form, Space, Tag, message } from 'antd'
import { useRef, useState } from 'react'

type MIXInfo = PaymentInfo & AlipayInfo & YipayInfo & JsPayInfo & HpjPayInfo

function PaymentPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<MIXInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: PaymentInfo | undefined
  }>({
    open: false,
    info: undefined
  })

  const columns: ProColumns<PaymentInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: '이름',
      dataIndex: 'name'
    },
    {
      title: '채널 코드',
      dataIndex: 'channel',
      render: (_, data) => <Tag>{data.channel}</Tag>
    },
    {
      title: '사용 가능한 채널',
      dataIndex: 'types',
      width: 250,
      render: (_, data) => {
        const typesDom = data.types.split(',').map((type) => {
          return <Tag key={type}>{type}</Tag>
        })
        return <Space>{typesDom}</Space>
      }
    },
    {
      title: '상태 값',
      dataIndex: 'status',
      render: (_, data) => (
        <Tag color={data.status ? 'green' : 'red'}>{data.status ? '온라인' : '오프라인'}</Tag>
      )
    },
    {
      title: '생성 시간',
      dataIndex: 'create_time'
    },
    {
      title: '수정 시간',
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
              const json = JSON.parse(data.params)
              const types = data.types.split(',')
              form?.setFieldsValue({
                ...data,
                ...json,
                types
              })
              return {
                open: true,
                info: {
                  ...data,
                  ...json,
                  types
                }
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
            delAdminPayment({
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

  const payKeyColumns: { [key: string]: Array<ProFormColumnsType> } = {
    alipay: [
      {
        title: 'Alipay 페이 직접 구성',
        valueType: 'group',
        columns: [
          {
            title: '애플리케이션ID appId',
            dataIndex: 'appId',
            width: 'lg',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '이 항목은 필수입니다'
                }
              ]
            }
          },
          {
            title: '암호화 유형 keyType',
            dataIndex: 'keyType',
            valueType: 'select',
            width: 's',
            request: async () => [
              {
                label: 'PKCS8',
                value: 'PKCS8'
              },
              {
                label: 'PKCS1',
                value: 'PKCS1'
              }
            ],
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '이 항목은 필수입니다'
                }
              ]
            }
          }
        ]
      },
      {
        title: '개인 키 적용 privateKey',
        dataIndex: 'privateKey',
        valueType: 'textarea',
        fieldProps: {
          autoSize: {
            minRows: 2,
            maxRows: 5
          }
        },
        formItemProps: {
          rules: [
            {
              required: true,
              message: '이 항목은 필수입니다'
            }
          ]
        }
      },
      {
        title: '알리페이 공개키 alipayPublicKey',
        dataIndex: 'alipayPublicKey',
        valueType: 'textarea',
        fieldProps: {
          autoSize: {
            minRows: 2,
            maxRows: 5
          }
        },
        formItemProps: {
          rules: [
            {
              required: true,
              message: '이 항목은 필수입니다'
            }
          ]
        }
      }
    ],
    yipay: [
      {
        title: '간편결제 구성',
        valueType: 'group',
        columns: [
          {
            title: '商户号ID',
            dataIndex: 'pid',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '이 항목은 필수입니다'
                }
              ]
            },
            width: 'md'
          },
          {
            title: '판매자 키',
            dataIndex: 'key',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '이 항목은 필수입니다'
                }
              ]
            },
            width: 'md'
          },
          {
            title: '인터페이스 주소',
            dataIndex: 'api',
            width: 'lg',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '이 항목은 필수입니다'
                }
              ]
            }
          },
          {
            title: '  return_url',
            dataIndex: 'return_url',
            width: 'sm'
          }
        ]
      }
    ],
    jspay: [
      {
        title: 'PayJS 구성',
        valueType: 'group',
        columns: [
          {
            title: '판매자 ID',
            dataIndex: 'mchid',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '이 항목은 필수입니다'
                }
              ]
            },
            width: 'md'
          },
          {
            title: '판매자 키',
            dataIndex: 'key',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '이 항목은 필수입니다'
                }
              ]
            },
            width: 'md'
          },
          {
            title: '인터페이스 주소',
            dataIndex: 'api',
            width: 'lg',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '이 항목은 필수입니다'
                }
              ]
            }
          },
          {
            title: '  return_url',
            dataIndex: 'return_url',
            width: 'sm'
          }
        ]
      }
    ],
    hpjpay: [
      {
        title: '후피자오 결제 구성',
        valueType: 'group',
        columns: [
          {
            title: '판매자 ID',
            dataIndex: 'appid',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '이 항목은 필수입니다'
                }
              ]
            },
            width: 'md'
          },
          {
            title: '판매자 키',
            dataIndex: 'key',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '이 항목은 필수입니다'
                }
              ]
            },
            width: 'md'
          },
          {
            title: '인터페이스 주소',
            dataIndex: 'api',
            width: 'lg',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '다음과 같은 도메인 이름을 입력하세요.：https://pay.wx.com',
                  pattern: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*[^\/]$/i
                }
              ]
            }
          },
          {
            title: 'Return Url ',
            dataIndex: 'return_url',
            width: 'sm'
          },
        ]
      }
    ]
  }

  function changeUpdateData(obj: MIXInfo) {
    const data = {
      name: obj.name,
      status: obj.status,
      channel: obj.channel,
      types: (obj.types as unknown as Array<string>).join(',')
    }
    if (obj.channel === 'alipay') {
      return {
        ...data,
        params: JSON.stringify({
          appId: obj?.appId,
          keyType: obj?.keyType,
          alipayPublicKey: obj?.alipayPublicKey,
          privateKey: obj?.privateKey
        })
      }
    } else if (obj.channel === 'yipay') {
      return {
        ...data,
        params: JSON.stringify({
          pid: obj?.pid,
          key: obj?.key,
          api: obj?.api,
          return_url: obj?.return_url
        })
      }
    } else if (obj.channel === 'jspay') {
      return {
        ...data,
        params: JSON.stringify({
          mchid: obj?.mchid,
          key: obj?.key,
          api: obj?.api,
          return_url: obj?.return_url
        })
      }
    } else if (obj.channel === 'hpjpay') {
      return {
        ...data,
        params: JSON.stringify({
          appid: obj?.appid,
          key: obj?.key,
          api: obj?.api,
          return_url: obj?.return_url
        })
      }
    } else {
      return false
    }
  }

  return (
    <div>
      <ProTable
        actionRef={tableActionRef}
        columns={columns}
        scroll={{
          x: 1400
        }}
        request={async (params, sorter, filter) => {
          // 양식 검색 항목은 params에서 전달되어 백엔드 인터페이스로 전달됩니다.
          const res = await getAdminPayment({
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
              새로운 결제 채널 추가
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />

      <ModalForm<MIXInfo>
        title="결제 채널"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1,
          channel: 'alipay'
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
          const data = changeUpdateData(values)
          if (!data) return false

          if (edidInfoModal.info?.id) {
            const res = await putAdminPayment({
              ...data,
              id: edidInfoModal.info?.id
            } as PaymentInfo)
            if (res.code) {
              message.error('수정 실패')
              return false
            }
            tableActionRef.current?.reload?.()
          } else {
            const res = await addAdminPayment(data as PaymentInfo)
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
        <ProFormText
          name="name"
          label="채널 이름"
          rules={[{ required: true, message: '채널 이름을 입력해주세요' }]}
        />
        <ProFormGroup>
          <ProFormCheckbox.Group
            name="types"
            label="사용 가능한 채널"
            options={[
              {
                label: 'alipay',
                value: 'alipay'
              },
              {
                label: 'wxpay',
                value: 'wxpay'
              },
              {
                label: 'QQ',
                value: 'qqpay'
              }
            ]}
            rules={[{ required: true, message: '사용 가능한 채널을 선택하세요.' }]}
            tooltip="WeChat Pay 및 PayPay 옵션"
          />
          <ProFormSegmented
            name="status"
            label="상태"
            request={async () => [
              {
                label: '온라인',
                value: 1
              },
              {
                label: '오프라인',
                value: 0
              }
            ]}
            rules={[{ required: true, message: '상태를 선택해 주세요' }]}
          />
          <ProFormSegmented
            name="channel"
            label="페이 공식"
            request={async () => [
              {
                label: 'alipay ',
                value: 'alipay'
              },
              {
                label: 'yipay',
                value: 'yipay'
              },
              {
                label: 'PayJS',
                value: 'jspay'
              },
              {
                label: 'hpjpay',
                value: 'hpjpay'
              }
            ]}
            rules={[{ required: true, message: '상태를 선택해 주세요' }]}
          />
        </ProFormGroup>
        <ProFormDependency name={['channel']}>
          {({ channel }) => {
            return <BetaSchemaForm layoutType="Embed" columns={payKeyColumns[channel]} />
          }}
        </ProFormDependency>
      </ModalForm>
    </div>
  )
}

export default PaymentPage
