import { delAdminTurnover, getAdminTurnovers, putAdminTurnover } from '@/request/adminApi';
import { TurnoverInfo } from '@/types/admin';
import { ActionType, ModalForm, ProColumns, ProFormGroup, ProFormText } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';
import { useRef, useState } from 'react';

function TurnoverPage() {

    const tableActionRef = useRef<ActionType>();
    const [form] = Form.useForm<TurnoverInfo>();
    const [edidInfoModal, setEditInfoModal] = useState<{
        open: boolean,
        info: TurnoverInfo | undefined
    }>({
        open: false,
        info: undefined
    });

    const columns: ProColumns<TurnoverInfo>[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 180,
        },
        {
            title: '사용자 계정',
            width: 180,
            dataIndex: 'user_id',
            render: (_, data) => {
                if (!data.user_id) return '-'
                return (
                    <p>{data.user?.account}</p>
                )
            }
        },
        {
            title: '작동하다',
            dataIndex: 'describe',
        },
        {
            title: '값',
            dataIndex: 'value',
            render: (_, data) => <a>{data.value}</a>
        },
        {
            title: '생성 시간',
            dataIndex: 'create_time',
        },
        {
            title: '수정 시간',
            dataIndex: 'update_time',
        },
        {
            title: '작동',
            valueType: 'option',
            fixed: 'right',
            width: 160,
            render: (_, data) => [
                <Button key="edit" type="link" onClick={() => {
                    setEditInfoModal({
                        open: true,
                        info: data
                    })
                    form.setFieldsValue({
                        ...data
                    })
                }}
                >
                    수정
                </Button>,
                <Button key="del" type="text" danger onClick={() => {
                    delAdminTurnover({
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
            ],
        },
    ];

    return (
        <div>
            <ProTable
                actionRef={tableActionRef}
                columns={columns}
                scroll={{
                    x: 1200
                }}
                request={async (params, sorter, filter) => {
                    // 양식 검색 항목은 params에서 전달되어 백엔드 인터페이스로 전달됩니다.
                    const res = await getAdminTurnovers({
                        page: params.current || 1,
                        page_size: params.pageSize || 10,
                    });
                    return Promise.resolve({
                        data: res.data.rows,
                        total: res.data.count,
                        success: true,
                    });
                }}
                toolbar={{
                    actions: [],
                }}
                rowKey="id"
                search={false}
                bordered
            />

            <ModalForm<TurnoverInfo>
                title="사용자 소비 기록"
                open={edidInfoModal.open}
                form={form}
                initialValues={{
                    status: 1
                }}
                onOpenChange={(visible) => {
                    if (!visible) {
                        form.resetFields();
                    }
                    setEditInfoModal((info) => {
                        return {
                            ...info,
                            open: visible
                        }
                    })
                }}
                onFinish={async (values) => {
                    const res = await putAdminTurnover({
                        ...edidInfoModal.info,
                        ...values,
                    });
                    if (res.code) {
                        message.error('수정 실패')
                        return false;
                    }
                    tableActionRef.current?.reload?.();
                    return true;
                }}
                size="large"
                modalProps={{
                    cancelText: '취소',
                    okText: '확인'
                }}
            >
                <ProFormText
                    width="lg"
                    name="user_id"
                    label="사용자 ID"
                    placeholder="사용자 ID"
                    disabled
                />
                <ProFormGroup>
                    <ProFormText
                        width="lg"
                        name="describe"
                        label="설명"
                        placeholder="작업 설명"
                        rules={[{ required: true, message: '작업 설명을 입력하세요!' }]}
                    />
                    <ProFormText
                        name="value"
                        label="값"
                        placeholder="작업 해당 값!"
                        rules={[{ required: true, message: '작업에 해당하는 값을 입력해주세요!' }]}
                    />
                </ProFormGroup>

            </ModalForm>
        </div>
    )
}

export default TurnoverPage;