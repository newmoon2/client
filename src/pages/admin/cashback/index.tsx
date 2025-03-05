import UserHead from '@/components/UserHead'
import { delAdminCashback, getAdminCashback, putAdminCashback, putAdminCashbackPass } from '@/request/adminApi'
import { CashbackInfo } from '@/types/admin'
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormDatePicker,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormGroup,
  ProFormRadio,
  ProFormText
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Tag, Button, Space, message, Form, Popconfirm } from 'antd'
import { useRef, useState } from 'react'

function UserPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<CashbackInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: CashbackInfo | undefined
  }>({
    open: false,
    info: undefined
  })
  const columns: ProColumns<CashbackInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, data) => {
        if (data.status === 3) {
          return <Tag color="orange">검토를 기다리는 중</Tag>
        }
        if (data.status === 1) {
          return <Tag color="green">정규분포</Tag>
        }
        return <Tag color="red">비정상 커미션</Tag>
      }
    },
    {
      title: '주목',
      dataIndex: 'remarks',
    },
    {
      title: '소비자 사용자',
      dataIndex: 'user_id',
      width: 160,
      render: (_, data) => {
        return <Tag>{data?.user?.account || data?.user_id}</Tag>
      }
    },
    {
      title: '사용자에게 혜택을 줌',
      dataIndex: 'user_id',
      width: 160,
      render: (_, data) => {
        return <Tag>{data?.benefit?.account || data?.benefit_id}</Tag>
      }
    },
    {
      title: '소비량(분)',
      dataIndex: 'pay_amount'
    },
    {
      title: '수수료 금액(분)',
      dataIndex: 'commission_amount'
    },
    {
      title: '수수료율(%)',
      dataIndex: 'commission_rate'
    },
    {
      title: '관련 주문',
      width: 180,
      dataIndex: 'order_id'
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
      width: 220,
      valueType: 'option',
      fixed: 'right',
      render: (_, data) => {
        const buttons = [
          <Button
            key="edit"
            type="link"
            onClick={() => {
              setEditInfoModal(() => {
                form?.setFieldsValue({
                  ...data
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
              delAdminCashback({
                id: data.id
              }).then((res) => {
                if (res.code) return
                message.success('성공적으로 삭제되었습니다')
                tableActionRef.current?.reloadAndRest?.()
              })
            }}
          >
            删除
          </Button>,
        ]
        if (data.status !== 1) {
          buttons.push((
            <Popconfirm
              key="pass"
              placement="topRight"
              title="재충전의 진위 여부 판단"
              description="정상적인 충전인지 확인해주세요!！"
              onConfirm={() => {
                putAdminCashbackPass({ id: data.id }).then((res) => {
                  if (res.code) return
                  message.success('성공적으로 통과했습니다')
                  tableActionRef.current?.reloadAndRest?.()
                })
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="link"
              >
                통과하다
              </Button>
            </Popconfirm>
          ))
        }
        return [...buttons]
      }
    }
  ]

  return (
    <div>
      <ProTable
        actionRef={tableActionRef}
        columns={columns}
        params={{}}
        pagination={{}}
        scroll={{
          x: 1800
        }}
        request={async (params, sorter, filter) => {
          // 양식 검색 항목은 params에서 전달되어 백엔드 인터페이스로 전달됩니다.
          const res = await getAdminCashback({
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
          actions: []
        }}
        rowKey="id"
        search={false}
        bordered
      />
      <ModalForm<CashbackInfo>
        title="커미션 정보"
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
          if (!edidInfoModal.info?.id) return false
          const res = await putAdminCashback({
            ...values,
            id: edidInfoModal.info?.id
          })
          if (res.code) {
            message.error('수정 실패')
            return false
          }
          tableActionRef.current?.reload?.()
          return true
        }}
        size="large"
        modalProps={{
          cancelText: '취소',
          okText: '제출하다'
        }}
      >
        <ProFormGroup>
          <ProFormRadio.Group
            name="status"
            label="상태"
            radioType="button"
            options={[
              {
                label: '예외 상태',
                value: 0
              },
              {
                label: '정규분포',
                value: 1
              },
              {
                label: '검토중',
                value: 3
              }
            ]}
            rules={[{ required: true, message: '상태를 선택해 주세요' }]}
          />
          <ProFormText
            width="md"
            name="remarks"
            label="메모 알림"
            rules={[{ required: true, message: '알림 정보를 입력해주세요' }]}
          />
        </ProFormGroup>
      </ModalForm>
    </div>
  )
}

export default UserPage
