import UserHead from '@/components/UserHead'
import {
  delAdminAmountDetails,
  getAdminAmountDetails,
  putAdminAmountDetails,
  postAdminAmountDetails
} from '@/request/adminApi'
import { AmountDetailInfo, UserInfo } from '@/types/admin'
import { SecurityScanFilled } from '@ant-design/icons'
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
import { Tag, Button, Space, message, Form, Popover, Typography } from 'antd'
import { useRef, useState } from 'react'

function UserPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<AmountDetailInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: AmountDetailInfo | undefined
  }>({
    open: false,
    info: undefined
  })
  const columns: ProColumns<AmountDetailInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: '계정',
      width: 200,
      dataIndex: 'user_id',
      render: (_, data) => {
        return (
          <Popover
            content={<Typography.Paragraph copyable>{data?.user_id}</Typography.Paragraph>}
            title="사용자 ID"
          >
            <Tag>
              <SecurityScanFilled /> {data?.user?.account || data?.user_id}
            </Tag>
          </Popover>
        )
      }
    },
    {
      title: '수정 전 금액(분)',
      dataIndex: 'original_amount',
      render: (_, data) => {
        return <a>{data.original_amount}分</a>
      }
    },
    {
      title: '운영금액(분)',
      dataIndex: 'operate_amount',
      render: (_, data) => {
        return (
          <a>{Number(data.operate_amount) > 0 ? `+${data.operate_amount}분` : `${data.operate_amount}분`}</a>
        )
      }
    },
    {
      title: '현재 금액(분)',
      dataIndex: 'current_amount',
      render: (_, data) => {
        return <a>{data.current_amount}分</a>
      }
    },
    {
      title: '작업 유형',
      dataIndex: 'type',
      render: (_, data) => {
        if (data.type === 'cashback') {
          return <Tag color="green">하위 소비 리베이트</Tag>
        }
        if (data.type === 'withdrawal') {
          return <Tag color="blue">현금 인출</Tag>
        }
        return <Tag color="red">이상</Tag>
      }
    },
    {
      title: '주목',
      dataIndex: 'remarks'
    },
    {
      title: '관련 주문 번호',
      dataIndex: 'correlation_id'
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, data) => {
        return <Tag color="green">{data.status === 1 ? '정상' : '이상'}</Tag>
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
      width: 150,
      valueType: 'option',
      fixed: 'right',
      render: (_, data) => [
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
            delAdminAmountDetails({
              id: data.id
            }).then((res) => {
              if (res.code) return
              message.success('성공적으로 삭제되었습니다')
              tableActionRef.current?.reloadAndRest?.()
            })
          }}
        >
          删除
        </Button>
      ]
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
          //양식 검색 항목은 params에서 전달되어 백엔드 인터페이스로 전달됩니다.
          const res = await getAdminAmountDetails({
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
              key="add"
              size="small"
              type="primary"
              onClick={() => {
                setEditInfoModal({
                  open: true,
                  info: undefined
                })
              }}
            >
              새 레코드 추가
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />

      <ModalForm<AmountDetailInfo>
        title="금액 세부정보"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1,
          type: 'cashback'
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
          if (edidInfoModal.info?.id) {
            const res = await putAdminAmountDetails({
              ...values,
              id: edidInfoModal.info?.id
            })
            if (res.code) {
              message.error('수정 실패')
              return false
            }
          } else {
			const res = await postAdminAmountDetails({
				...values,
			})
			if (res.code) {
				message.error('새로운 것 맞죠?')
				return false
			}
		  }
		  message.success('작업 성공')
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
          <ProFormText
            width="md"
            tooltip="사용자 이름 위에 마우스를 올려놓으면 얻을 수 있습니다."
            name="user_id"
            label="用户ID"
            rules={[{ required: true }]}
          />
          <ProFormText
            width="md"
            tooltip="결제주문번호 또는 출금주문번호 "
            name="correlation_id"
            label="관련 주문 번호"
            rules={[{ required: true }]}
          />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormDigit
            label="마지막 남은 금액(분)"
            name="original_amount"
            min={0}
            max={9999999}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            label="운영금액(분)"
            name="operate_amount"
            min={-9999999}
            max={9999999}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            label="현재 남은 금액(분)"
            name="current_amount"
            min={0}
            max={9999999}
            rules={[{ required: true }]}
          />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormRadio.Group
            name="status"
            label="상태"
            radioType="button"
            options={[
              {
                label: '이상',
                value: 0
              },
              {
                label: '정상',
                value: 1
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormRadio.Group
            name="type"
            label="작업 유형"
            radioType="button"
            options={[
              {
                label: '하위 소비 리베이트',
                value: 'cashback'
              },
              {
                label: '현금 인출',
                value: 'withdrawal'
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormText
            width="md"
            name="remarks"
            label="주목"
            rules={[{ required: true, message: '주목' }]}
          />
        </ProFormGroup>
      </ModalForm>
    </div>
  )
}

export default UserPage
