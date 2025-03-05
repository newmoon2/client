import UserHead from '@/components/UserHead'
import { delAdminUsers, getAdminUsers, postAdminUser, putAdminUsers } from '@/request/adminApi'
import { UserInfo } from '@/types/admin'
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
import { Tag, Button, Space, message, Form } from 'antd'
import { useRef, useState } from 'react'

function UserPage() {
  const tableActionRef = useRef<ActionType>()
  const [form] = Form.useForm<UserInfo>()
  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: UserInfo | undefined
  }>({
    open: false,
    info: undefined
  })
  const columns: ProColumns<UserInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: '계정',
      width: 200,
      dataIndex: 'account'
    },
    {
      title: '완전한',
      width: 100,
      dataIndex: 'integral',
      render: (_, data) => <a>{data.integral}분</a>
    },
    {
      title: '멤버십 만료 시간',
      dataIndex: 'vip_expire_time',
      render: (_, data) => {
        const today = new Date()
        const todayTime = today.getTime()
        const userSubscribeTime = new Date(data.vip_expire_time).getTime()
        return (
          <Space wrap>
            <Tag>{data.vip_expire_time}</Tag>
            {userSubscribeTime < todayTime && <Tag color="red">만료됨</Tag>}
          </Space>
        )
      }
    },
    {
      title: '슈퍼 멤버십 만료 시간',
      dataIndex: 'svip_expire_time'
    },
    {
      title: '사용자 정보',
      dataIndex: 'user_id',
      width: 160,
      render: (_, data) => {
        return <UserHead headimgurl={data.avatar} nickname={data.nickname} />
      }
    },
    {
      title: 'ip',
      dataIndex: 'ip'
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
      title: '수정 시간',
      dataIndex: 'update_time'
    },
    {
      title: '작동',
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
          수정
        </Button>,
        <Button
          key="del"
          type="text"
          danger
          onClick={() => {
            delAdminUsers({
              id: data.id
            }).then((res) => {
              if (res.code) return
              message.success('성공적으로 삭제되었습니다')
              tableActionRef.current?.reloadAndRest?.()
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
        params={{}}
        pagination={{}}
        scroll={{
          x: 1800
        }}
        request={async (params, sorter, filter) => {
          // 양식 검색 항목은 params에서 전달되어 백엔드 인터페이스로 전달됩니다.
          const res = await getAdminUsers({
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
              새 사용자 추가
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />
      <ModalForm<UserInfo>
        title="사용자 정보"
        open={edidInfoModal.open}
        form={form}
        initialValues={{
          status: 1,
          role: 'user',
          integral: 0
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
          if (!edidInfoModal.info?.id) {
            const res = await postAdminUser({
				...values,
			})
			if (res.code) {
				message.error('추가하지 못했습니다.')
				return false
			}
          } else {
            const res = await putAdminUsers({
              ...values,
              id: edidInfoModal.info?.id
            })
            if (res.code) {
              message.error('수정 실패')
              return false
            }
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
            width="md"
            name="account"
            label="사용자 계정"
            rules={[{ required: true, message: '사용자 계정을 입력하세요' }]}
          />
          <ProFormRadio.Group
            name="role"
            label="역활"
            radioType="button"
            options={[
              {
                label: '사용자',
                value: 'user'
              },
              {
                label: '관리자',
                value: 'administrator'
              }
            ]}
            rules={[{ required: true, message: '남은 포인트를 입력해주세요' }]}
          />
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
            rules={[{ required: true, message: '남은 포인트를 입력해주세요' }]}
          />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormText
            name="nickname"
            label="nickname"
            rules={[{ required: true, message: '사용자 이름을 입력하세요' }]}
          />
          <ProFormText
            name="avatar"
            label="avatar"
            rules={[{ required: true, message: '사용자 아바타를 입력하세요.' }]}
          />
          <ProFormText name="superior_id" label="우수한 신분증" />
        </ProFormGroup>

        <ProFormGroup>
          <ProFormDigit
            label="포인트"
            name="integral"
            min={-1000000}
            max={1000000}
            rules={[{ required: true, message: '남은 포인트를 입력해주세요' }]}
          />
          <ProFormDateTimePicker
            name="vip_expire_time"
            label="회원 만료일"
            rules={[{ required: true, message: '남은 포인트를 입력해주세요' }]}
          />
          <ProFormDateTimePicker
            name="svip_expire_time"
            label="슈퍼 멤버십 마감"
            rules={[{ required: true, message: '남은 포인트를 입력해주세요' }]}
          />
        </ProFormGroup>
        {!edidInfoModal?.info?.id && (
          <ProFormText
            name="password"
            label="기본 비밀번호"
            rules={[{ required: true, message: '기본 비밀번호를 입력하세요' }]}
          />
        )}
      </ModalForm>
    </div>
  )
}

export default UserPage
