import { delAdminInviteRecord, getAdminInviteRecord, putAdminInviteRecord, putAdminInviteRecordPass } from '@/request/adminApi'
import { InviteRecordInfo } from '@/types/admin'
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormGroup,
  ProFormRadio,
  ProFormText
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Tag, Button, message, Form, Popconfirm } from 'antd'
import { useRef, useState } from 'react'

function InviteRecordPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<InviteRecordInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: InviteRecordInfo | undefined
  }>({
    open: false,
    info: undefined
  })

  const columns: ProColumns<InviteRecordInfo>[] = [
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
        if (data.status) {
          return <Tag color="green">정규분포</Tag>
        }
        return <Tag color="red">이상상태</Tag>
      }
    },
    {
      title: '메모 알림',
      dataIndex: 'remarks'
    },
    {
      title: '초대자',
      dataIndex: 'superior_id',
      width: 200,
      render: (_, data) => {
        return <Tag>{data?.superior?.account || data?.superior_id}</Tag>
      }
    },
    {
      title: '초대받은 사람',
      dataIndex: 'user_id',
      width: 200,
      render: (_, data) => {
        return <Tag>{data?.user?.account || data?.user_id }</Tag>
      }
    },
    {
      title: '초대코드',
      dataIndex: 'invite_code',
      render: (_, data) => {
        return <Tag>{data.invite_code}</Tag>
      }
    },
    {
      title: '보상',
      dataIndex: 'reward'
    },
    {
      title: 'ip',
      dataIndex: 'ip'
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
              delAdminInviteRecord({
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
        ]
        if (data.status !== 1) {
          buttons.push((
            <Popconfirm
              placement="topRight"
              title="진위심판에의 초대"
              description="일반 초대인지 확인해주세요. 한번 통과되면 보상을 철회할 수 없습니다.！"
              onConfirm={() => {
                putAdminInviteRecordPass({ id: data.id }).then((res) => {
                  if (res.code) return
                  message.success('성공적으로 통과했습니다')
                  tableActionRef.current?.reloadAndRest?.()
                })
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button
                key="pass"
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
          //양식 검색 항목은 params에서 전달되어 백엔드 인터페이스로 전달됩니다.

          const res = await getAdminInviteRecord({
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
            <Button key="allPass" size="small" danger onClick={() => {
              putAdminInviteRecordPass().then((res) => {
                if (res.code) return
                message.success('모두 성공적으로 통과했습니다')
                tableActionRef.current?.reloadAndRest?.()
              })
            }}
            >
              모두 합격
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />
      <ModalForm<InviteRecordInfo>
        title="초대정보"
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
          const res = await putAdminInviteRecord({
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
                label: '이상상태',
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

export default InviteRecordPage
