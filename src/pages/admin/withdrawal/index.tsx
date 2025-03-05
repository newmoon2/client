import UserHead from '@/components/UserHead'
import {
  delAdminWithdrawalRecord,
  putAdminWithdrawalRecord,
  getAdminWithdrawalRecords,
  putAdminWithdrawalRecordOperate
} from '@/request/adminApi'
import { WithdrawalRecordInfo } from '@/types/admin'
import { transform } from '@/utils'
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
  ProFormText,
  ProFormTextArea
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Tag, Button, Space, message, Form, Typography, Popover, Descriptions } from 'antd'
import { useRef, useState } from 'react'

function UserPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<WithdrawalRecordInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: WithdrawalRecordInfo | undefined
  }>({
    open: false,
    info: undefined
  })

  const [optionInfoModal, setOptionInfoModal] = useState<{
    open: boolean
    info: WithdrawalRecordInfo | undefined
  }>({
    open: false,
    info: undefined
  })

  function getPayType(type: string) {
    switch (type) {
      case 'wxpay':
        return 'wxpay'
      case 'qqpay':
        return 'qqpay'
      case 'alipay':
        return 'alipay'
      default:
        return '일'
    }
  }

  const columns: ProColumns<WithdrawalRecordInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: '사용자 계정',
      width: 180,
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
      title: '출금금액',
      dataIndex: 'amount',
      render: (_, data) => {
        return <Tag color="red">{data.amount}分</Tag>
      }
    },
    {
      title: '탈퇴자 정보',
      render: (_, data) => {
        const payTypeText = getPayType(data.type)
        return (
          <Space wrap direction="vertical">
            <p>
            수취인 이름:<Tag color="blue">{data.name}</Tag>
            </p>
            <p>
            연락처 정보:<Tag color="cyan">{data.contact}</Tag>
            </p>
            <p>
            결제 방법:<Tag color="green">{payTypeText}</Tag>
            </p>
            <p>
            결제계좌번호:<Tag color="gold">{data.account}</Tag>
            </p>
          </Space>
        )
      }
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, data) => {
        if (data.status === 3) {
          return <Tag color="orange">결제 검토</Tag>
        }
        if (data.status === 1) {
          return <Tag color="orange">성공적으로 출금됨</Tag>
        }
        return <Tag color="red">비정상적인 상황</Tag>
      }
    },
    {
      title: '메모/답글',
      dataIndex: 'remarks'
    },
    {
      title: '사용자 메시지',
      dataIndex: 'message'
    },
    {
      title: 'ip',
      dataIndex: 'ip',
      render: (_, data) => {
        return <Tag>{data.ip}</Tag>
      }
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
      title: '작동',
      width: 220,
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
          작동
        </Button>,
        <Button
          key="del"
          type="text"
          danger
          onClick={() => {
            delAdminWithdrawalRecord({
              id: data.id
            }).then((res) => {
              if (res.code) return
              message.success('성공적으로 삭제되었습니다')
              tableActionRef.current?.reloadAndRest?.()
            })
          }}
        >
          삭제
        </Button>,
        <Button
          key="option"
          type="text"
          danger
          disabled={data.status != 3}
          onClick={() => {
            setOptionInfoModal(() => {
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
          작동
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
          // 양식 검색 항목은 params에서 전달되어 백엔드 인터페이스로 전달됩니다.
          const res = await getAdminWithdrawalRecords({
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
      <ModalForm<WithdrawalRecordInfo>
        title="출금내역"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1,
          type: 'alipay'
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
          const res = await putAdminWithdrawalRecord({
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
          okText: '확인'
        }}
      >
        <ProFormGroup>
          <ProFormText
            tooltip="사용자 이름 위에 마우스를 올려놓으면 얻을 수 있습니다."
            name="user_id"
            label="사용자 ID"
            rules={[{ required: true }]}
          />
          <ProFormText
            name="name"
            label="사용자 이름"
            rules={[{ required: true, message: '사용자 이름을 입력하세요' }]}
          />
          <ProFormText
            name="contact"
            label="연락처 정보"
            rules={[{ required: true, message: '사용자 연락처 정보를 입력하세요.' }]}
          />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormDigit
            label="출금금액"
            name="amount"
            min={0}
            max={1000000}
            rules={[{ required: true }]}
          />
          <ProFormRadio.Group
            name="type"
            label="결제수단"
            radioType="button"
            options={[
              {
                label: 'wxpay',
                value: 'wxpay'
              },
              {
                label: 'qqpay',
                value: 'qqpay'
              },
              {
                label: 'alipay',
                value: 'alipay'
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormText name="account" label="결제계좌번호" rules={[{ required: true }]} />
        </ProFormGroup>

        <ProFormGroup>
          <ProFormRadio.Group
            name="status"
            label="상태"
            radioType="button"
            disabled
            options={[
              {
                label: '비정상적인 상황',
                value: 0
              },
              {
                label: '성공적으로 출금됨',
                value: 1
              },
              {
                label: '결제 검토',
                value: 3
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormText width="md" name="remarks" label="메모/답글" rules={[{ required: true }]} />
        </ProFormGroup>
        <ProFormTextArea
          fieldProps={{
            autoSize: {
              minRows: 2,
              maxRows: 2
            }
          }}
          name="message"
          label="사용자 메시지"
        />
      </ModalForm>
      <ModalForm<WithdrawalRecordInfo>
        title="출금작업"
        open={optionInfoModal.open}
        form={form}
        initialValues={{
          status: 1
        }}
        onOpenChange={(visible) => {
          if (!visible) {
            form.resetFields()
          }
          setOptionInfoModal((info) => {
            return {
              ...info,
              open: visible
            }
          })
        }}
        onFinish={async (values) => {
          if (!optionInfoModal.info?.id) return false
          const res = await putAdminWithdrawalRecordOperate({
            ...values,
            status: values.new_status || 0,
            id: optionInfoModal.info?.id
          })
          if (res.code) {
            message.error('작업 실패')
            return false
          }
          tableActionRef.current?.reload?.()
          return true
        }}
        size="large"
        modalProps={{
          cancelText: '취소',
          okText: '확인'
        }}
      >
        <Descriptions bordered size="small">
          <Descriptions.Item label="이름" span={2}>
            {optionInfoModal.info?.name}
          </Descriptions.Item>
          <Descriptions.Item label="연락처 정보" span={2}>
            {optionInfoModal.info?.contact}
          </Descriptions.Item>
          <Descriptions.Item label="결제수단">{optionInfoModal.info?.type}</Descriptions.Item>
          <Descriptions.Item label="결제계좌번호">{optionInfoModal.info?.account}</Descriptions.Item>
          <Descriptions.Item label="출금금액">
            {transform.centToYuan(optionInfoModal.info?.amount)}元
          </Descriptions.Item>
          <Descriptions.Item label="사용자 메시지" span={3}>
            {optionInfoModal.info?.message}
          </Descriptions.Item>
        </Descriptions>
        <ProFormGroup>
          <ProFormRadio.Group
            name="new_status"
            label="출금현황"
            radioType="button"
            tooltip="수정 후에는 변경할 수 없습니다."
            options={[
              {
                label: '비정상적인 상황',
                value: 0
              },
              {
                label: '성공적으로 출금됨',
                value: 1
              }
            ]}
            rules={[{ required: true }]}
          />
          <ProFormText width="lg" name="remarks" label="메모/답글" rules={[{ required: true }]} />
        </ProFormGroup>
      </ModalForm>
    </div>
  )
}

export default UserPage
