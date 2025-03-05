import {
    delAdminDrawRecord,
    putAdminDrawRecord,
    getAdminDrawRecords
} from '@/request/adminApi'
import { DrawRecordInfo } from '@/types/admin'
import {
    ActionType,
    ModalForm,
    ProColumns,
    ProFormGroup,
    ProFormRadio,
    ProFormText
} from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Tag, Button, message, Form, Popconfirm, Image } from 'antd'
import { useRef, useState } from 'react'

function DrawRecordPage() {
    const tableActionRef = useRef<ActionType>()
    const [form] = Form.useForm<DrawRecordInfo>()
    const [edidInfoModal, setEditInfoModal] = useState<{
        open: boolean
        info: DrawRecordInfo | undefined
    }>({
        open: false,
        info: undefined
    })

    const columns: ProColumns<DrawRecordInfo>[] = [
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
                if (data.status === 4) {
                    return <Tag color="orange">개인 그림</Tag>
                }
                if (data.status) {
                    return <Tag color="green">공공 회화</Tag>
                }
                return <Tag color="red">이상상태</Tag>
            }
        },
        {
            title: '그림',
            dataIndex: 'images',
            width: 140,
            render: (_, data) => {
                return <Image src={data.images?.[0]} width={100} />
            }
        },
        {
            title: '프롬프트 단어',
            dataIndex: 'prompt'
        },
        {
            title: '사용자 생성',
            dataIndex: 'user',
            render: (_, data) => {
                return <Tag>{data.user?.account}</Tag>
            }
        },
        {
            title: '패드 맵(이미 url)',
            dataIndex: 'inset_image_url',
            width: 140,
            render: (_, data) => {
                if (!data.inset_image_url) return <Tag>无垫图</Tag>
                return <Image src={data.inset_image_url} width={100} />
            }
        },
        {
            title: '소비된 시간',
            dataIndex: 'take_time',
            render: (_, data) => <Tag>{data.take_time}秒</Tag>
        },
        {
            title: '이미지 크기',
            dataIndex: 'size',
            render: (_, data) => <Tag>{data.size}</Tag>
        },
        {
            title: '그림 모델',
            dataIndex: 'model',
            render: (_, data) => <Tag>{data.model}</Tag>
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
                            delAdminDrawRecord({
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
                    const res = await getAdminDrawRecords({
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
                        
                    ]
                }}
                rowKey="id"
                search={false}
                bordered
            />

            <ModalForm<DrawRecordInfo>
                title="그림 정보"
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
                    const res = await putAdminDrawRecord({
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
                                label: '상태 이상(클라이언트에서 삭제)',
                                value: 0
                            },
                            {
                                label: '공공 회화',
                                value: 1
                            },
                            {
                                label: '개인 그림',
                                value: 4
                            }
                        ]}
                        rules={[{ required: true, message: '상태를 선택해 주세요' }]}
                    />
                </ProFormGroup>
            </ModalForm>
        </div>
    )
}

export default DrawRecordPage
