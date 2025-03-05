import {
  delAdminNotification,
  getAdminConfig,
  getAdminNotification,
  postAdminNotification,
  putAdminConfig,
  putAdminNotification
} from '@/request/adminApi'
import { ConfigInfo, NotificationInfo } from '@/types/admin'
import { ActionType, ProColumns } from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Button, Input, InputNumber, Modal, Radio, Space, Tag, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import FormCard from '../components/FormCard'
import RichEdit from '@/components/RichEdit'

function NotificationPage() {
  const [configs, setConfigs] = useState<Array<ConfigInfo>>([])
  const tableActionRef = useRef<ActionType>()

  const [edidInfoModal, setEditInfoModal] = useState<{
    open: boolean
    info: NotificationInfo | undefined
  }>({
    open: false,
    info: undefined
  })

  const [edidContentModal, setEdidContentModal] = useState<{
    title?: string
    open: boolean
    key: string
    content: string
  }>({
    title: '',
    open: false,
    key: '',
    content: ''
  })


  const columns: ProColumns<NotificationInfo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 180
    },
    {
      title: '제목',
      width: 180,
      dataIndex: 'title'
    },
    {
      title: '정렬',
      width: 180,
      dataIndex: 'sort',
      tooltip: '숫자가 클수록 뒤로 갈수록'
    },
    {
      title: '내용',
      dataIndex: 'content',
      ellipsis: true
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, data) => (
        <Tag color={data.status ? 'green' : 'red'}>{data.status ? '온라인' : '오프라인'}</Tag>
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
            delAdminNotification({
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
          // 양식 검색 항목은 params에서 전달되어 백엔드 인터페이스로 전달됩니다.
          const res = await getAdminNotification({
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
                      title: '',
                      content: '',
                      status: 1,
                      sort: 1
                    } as any
                  }
                })
              }}
            >
              알림 추가
            </Button>
          ]
        }}
        rowKey="id"
        search={false}
        bordered
      />

      <Modal
        title="알림 정보"
        destroyOnClose
        width={600}
        open={edidInfoModal.open}
        onOk={() => {
          const { id, title, content, status, sort } = edidInfoModal.info || {}
          if (!edidInfoModal.info || !title || !content) {
            message.warning('제목과 내용을 추가해주세요')
            return
          }
          if (id) {
            // 편집하다
            putAdminNotification(edidInfoModal.info).then((res) => {
              if (res.code) return
              setEditInfoModal(() => {
                return {
                  open: false,
                  info: {
                    title: '',
                    content: '',
                    status: 1,
                    sort: 1
                  } as any
                }
              })
              tableActionRef.current?.reload()
            })
          } else {
            postAdminNotification({
              title,
              content,
              status,
              sort
            } as any).then((res) => {
              if (res.code) return
              setEditInfoModal(() => {
                return {
                  open: false,
                  info: {
                    title: '',
                    content: '',
                    status: 1,
                    sort: 1
                  } as any
                }
              })
              tableActionRef.current?.reload()
            })
          }
        }}
        onCancel={() => {
          setEditInfoModal({ open: false, info: undefined })
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <FormCard title="제목">
              <Input
                value={edidInfoModal.info?.title}
                placeholder="알림 제목"
                onChange={(e) => {
                  setEditInfoModal((editInfo) => {
                    const info = { ...editInfo.info, title: e.target.value }
                    return {
                      ...editInfo,
                      info
                    } as any
                  })
                }}
              />
            </FormCard>
            <FormCard title="종류">
              <InputNumber
                min={1}
                max={999999}
                defaultValue={edidInfoModal.info?.sort}
                value={edidInfoModal.info?.sort}
                placeholder="종류"
                onChange={(value) => {
                  setEditInfoModal((editInfo) => {
                    const info = { ...editInfo.info, sort: value }
                    return {
                      ...editInfo,
                      info
                    } as any
                  })
                }}
              />
            </FormCard>
            <FormCard title="상태">
              <Radio.Group
                onChange={(e) => {
                  setEditInfoModal((editInfo) => {
                    const info = { ...editInfo.info, status: e.target.value }
                    return {
                      ...editInfo,
                      info
                    } as any
                  })
                }}
                defaultValue={edidInfoModal.info?.status}
                value={edidInfoModal.info?.status}
              >
                <Radio.Button value={1}>온라인</Radio.Button>
                <Radio.Button value={0}>오프라인</Radio.Button>
              </Radio.Group>
            </FormCard>
          </Space>
          <FormCard title="알림 내용">
            <RichEdit
              value={edidInfoModal.info?.content}
              onChange={(value) => {
                setEditInfoModal((editInfo) => {
                  const info = { ...editInfo.info, content: value }
                  return {
                    ...editInfo,
                    info
                  } as any
                })
              }}
            />
          </FormCard>
        </Space>
      </Modal>
    </div>
  )
}

export default NotificationPage
