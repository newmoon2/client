import { getAdminOrders } from '@/request/adminApi';
import { OrderInfo } from '@/types/admin';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Modal, Tag } from 'antd';
import { useRef, useState } from 'react';
import styles from './index.module.less';

function OrderPage() {

    const tableActionRef = useRef<ActionType>();
    const [isModalOpen, setIsModalOpen] = useState({
        open: false,
        title: '',
        json: ''
    });

    const columns: ProColumns<OrderInfo>[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 180,
            fixed: 'left'
        },
        {
            title: '지불인 ID',
            dataIndex: 'trade_no',
            render: (_, data) => (
                <a onClick={() => {
                    if (data.notify_info && data.trade_no) {
                        setIsModalOpen({
                            title: '지불인 통지 매개변수',
                            json: data.notify_info,
                            open: true
                        })
                    }
                }
                }

                >{data.trade_no ? data.trade_no : '지불되지 않음'}
                </a>
            )
        },
        {
            title: '상품명',
            dataIndex: 'product_title',
            render: (_, data) => (
                <a onClick={() => {
                    setIsModalOpen({
                        title: '제품정보',
                        json: data.product_info,
                        open: true
                    })
                }}
                >{data.product_title}
                </a>
            )
        },
        {
            title: '결제 유형',
            dataIndex: 'pay_type',
            width: 120,
            render: (_, data) => {
                const type: { [key: string]: { [key: string]: string } } = {
                    alipay: {
                        color: 'blue',
                        text: '알리페이'
                    },
                    wxpay: {
                        color: 'green',
                        text: '위챗'
                    },
					qqpay: {
                        color: 'geekblue',
                        text: 'QQ 결제'
                    }
                }
                return <Tag color={type[data.pay_type].color}>{type[data.pay_type].text}</Tag>
            }
        },
        {
            title: '결제금액',
            dataIndex: 'money',
            width: 120,
            render: (_, data) => <Tag color="blue">{data.money}원</Tag>
        },
        {
            title: '주문 상태',
            dataIndex: 'trade_status',
            width: 180,
            render: (_, data) => {
                const status:{ [key: string]: { [key: string]: string } } = {
                    WAIT_BUYER_PAY: {
                        color: 'orange',
                        text: '결제 대기 중'
                    },
                    TRADE_SUCCESS: {
                        color: 'green',
                        text: '결제 성공'
                    },
                    TRADE_CLOSED: {
                        color: 'red',
                        text: '주문 마감'
                    },
                    TRADE_FINISHED: {
                        color: 'purple',
                        text: '주문 완료'
                    }
                }
                const color = status[data.trade_status].color || 'red'
                const text = status[data.trade_status].text || data.trade_status || '데이터 이상'
                return <Tag color={color}>{text}</Tag>
            }
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
            title: '결제 채널',
            dataIndex: 'channel',
            width: 120,
            render: (_, data) => (
                <a onClick={() => {
                    setIsModalOpen({
                        title: '결제채널 정보',
                        json: data.payment_info,
                        open: true
                    })
                }}
                >{data.channel}
                </a>

            )
        },
        {
            title: '결제 링크',
            dataIndex: 'pay_url',
            ellipsis: true,
            render: (_, data) => <a href={data?.pay_url || ''} target="_blank" rel="noreferrer">{data.pay_url}</a>
        },
        {
            title: '추가 매개변수',
            dataIndex: 'params',
            width: 100,
            render: (_, data) => (
                <a onClick={() => {
                    setIsModalOpen({
                        title: '추가 매개변수',
                        json: data.params,
                        open: true
                    })
                }}
                >
                    보려면 클릭하세요
                </a>
            )
        },
        {
            title: 'IP',
            dataIndex: 'ip',
        },
        {
            title: '생성 시간',
            dataIndex: 'create_time',
        },
        {
            title: '업데이트 시간',
            dataIndex: 'update_time',
        },
        // {
        //     title: '操作',
        //     width: 160,
        //     valueType: 'option',
        //     fixed: 'right',
        //     render: (_, data) => [
        //         <Button
        //             key="edit"
        //             type="link"
        //             onClick={() => {
        //                 setEditInfoModal(() => {
        //                     form?.setFieldsValue({
        //                         ...data
        //                     });
        //                     return {
        //                         open: true,
        //                         info: data
        //                     }
        //                 });
        //             }}
        //         >
        //             编辑
        //         </Button>,
        //         <Button
        //             key="del"
        //             type="text"
        //             danger
        //             onClick={() => {
        //                 delAdminProduct({
        //                     id: data.id
        //                 }).then((res) => {
        //                     if (res.code) return
        //                     message.success('删除成功')
        //                     tableActionRef.current?.reload()
        //                 })
        //             }}
        //         >
        //             删除
        //         </Button>
        //     ]
        // }
    ];

    function syntaxHighlight(json: string) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    return (
        <div>
            <ProTable
                actionRef={tableActionRef}
                columns={columns}
                scroll={{
                    x: 2000
                }}
                request={async (params, sorter, filter) => {
                    // 양식 검색 항목은 params에서 전달되어 백엔드 인터페이스로 전달됩니다.
                    const res = await getAdminOrders({
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
                    actions: []
                }}
                rowKey="id"
                search={false}
                bordered
            />

            <Modal
                title={isModalOpen.title}
                open={isModalOpen.open}
                onOk={() => {
                    setIsModalOpen(() => {
                        return {
                            title: '',
                            open: false,
                            json: ''
                        }
                    })
                }}
                onCancel={() => {
                    setIsModalOpen(() => {
                        return {
                            title: '',
                            open: false,
                            json: ''
                        }
                    })
                }}
            >
                {
                    isModalOpen.json && (
                        <pre className={styles.jsonPre} dangerouslySetInnerHTML={{
                            __html: syntaxHighlight(JSON.stringify(JSON.parse(isModalOpen.json), null, 4))
                        }}
                        />
                    )
                }
            </Modal>
        </div>
    )
}

export default OrderPage;
